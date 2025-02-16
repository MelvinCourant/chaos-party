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

        const party = await Party.find(disconnectedUser.party_id)

        if (disconnectedUser.party_id) {
          io.to(disconnectedUser.party_id).emit('leave-party', disconnectedUser)

          if (party && party.step === 'creating-teams' && disconnectedUser.team_id) {
            disconnectedUser.team_id = ''
          }
        }

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

    socket.on('get-state', (data) => {
      io?.to(data.team_id).emit('get-state')
    })

    socket.on('player-state', (data) => {
      io?.to(data.team_id).emit('player-state', {
        x: data.x,
        y: data.y,
        socket_id: data.socket_id,
      })
    })

    socket.on('canvas-state', (data) => {
      io?.to(data.team_id).emit('canvas-state', {
        socket_id: data.socket_id,
        canvas: data.canvas,
      })
    })

    socket.on('player-move', (data) => {
      io?.to(data.team_id).emit('player-move', {
        x: data.x,
        y: data.y,
        socket_id: data.socket_id,
      })
    })

    socket.on('start-drawing', (data) => {
      io?.to(data.team_id).emit('start-drawing', {
        x: data.x,
        y: data.y,
        global_alpha: data.global_alpha,
        stroke_style: data.stroke_style,
        line_width: data.line_width,
        socket_id: data.socket_id,
      })
    })

    socket.on('draw-point', (data) => {
      io?.to(data.team_id).emit('draw-point', {
        x: data.x,
        y: data.y,
        global_alpha: data.global_alpha,
        stroke_style: data.stroke_style,
        line_width: data.line_width,
        socket_id: data.socket_id,
      })
    })

    socket.on('draw', (data) => {
      io?.to(data.team_id).emit('draw', {
        x: data.x,
        y: data.y,
        socket_id: data.socket_id,
      })
    })

    socket.on('stop-drawing', (data) => {
      io?.to(data.team_id).emit('stop-drawing', {
        x: data.x,
        y: data.y,
        socket_id: data.socket_id,
      })
    })
  })
})
