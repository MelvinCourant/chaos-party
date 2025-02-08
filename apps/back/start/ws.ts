import app from '@adonisjs/core/services/app'
import Ws from '#services/Ws'
import User from '#models/user'
import Party from '#models/party'

app.ready(() => {
  Ws.boot()
  const io = Ws.io

  io?.on('connection', (socket) => {
    console.log(`Connexion : ${socket.id}`)

    Ws.sockets.set(socket.id, socket)

    socket.on('disconnect', async () => {
      console.log(`Déconnexion : ${socket.id}`)

      const disconnectedUser = await User.query().where('socket_id', socket.id).first()

      if (disconnectedUser) {
        disconnectedUser.socket_id = ''

        if (disconnectedUser.party_id) {
          io.to(disconnectedUser.party_id).emit('leave', disconnectedUser)
        }

        const party = await Party.find(disconnectedUser.party_id)

        if (party && !party.in_progress) {
          disconnectedUser.party_id = ''
        }

        if (party && disconnectedUser.role === 'host') {
          const remainingUsers = await User.query()
            .where('party_id', party.id)
            .where('id', '!=', disconnectedUser.id)

          if (remainingUsers.length) {
            const newHost = remainingUsers[0]
            newHost.role = 'host'
            await newHost.save()

            io.to(party.id).emit('new-host', newHost)
          } else {
            await party.delete()
          }
        }

        await disconnectedUser.save()
      }

      Ws.sockets.delete(socket.id)
    })
  })
})
