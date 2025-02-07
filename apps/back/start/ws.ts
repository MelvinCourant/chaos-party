import app from '@adonisjs/core/services/app'
import Ws from '#services/Ws'
import User from '#models/user'

app.ready(() => {
  Ws.boot()
  const io = Ws.io

  io?.on('connection', (socket) => {
    console.log(`Connexion : ${socket.id}`)

    Ws.sockets.set(socket.id, socket)

    socket.on('disconnect', async () => {
      console.log(`Déconnexion : ${socket.id}`)

      const disconnectedUser = await User.query().where('socketId', socket.id).first()

      if(disconnectedUser) {
        disconnectedUser.socketId = ""
        await disconnectedUser.save()

        if(disconnectedUser.partyId) {
          io.to(disconnectedUser.partyId).emit('leave', disconnectedUser)
        }
      }

      Ws.sockets.delete(socket.id)
    })
  })
})
