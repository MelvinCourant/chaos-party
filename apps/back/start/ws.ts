import app from '@adonisjs/core/services/app'
import Ws from '#services/Ws'
import User from '#models/user'
import Party from '#models/party'
import Team from '#models/team'
import fs from 'node:fs'
import { cuid } from '@adonisjs/core/helpers'
import path from 'node:path'

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

    socket.on('team-state', (data) => {
      io?.to(data.team_id).emit('team-state')
    })

    socket.on('party-state', (data) => {
      io?.to(data.party_id).emit('party-state')
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
        history: data.history,
        history_index: data.history_index,
      })
    })

    socket.on('timer-state', (data) => {
      io?.to(data.party_id).emit('timer-state', {
        socket_id: data.socket_id,
        timer: data.timer,
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
        global_composite_operation: data.global_composite_operation,
        global_alpha: data.global_alpha,
        color: data.color,
        line_width: data.line_width,
        socket_id: data.socket_id,
        tool: data.tool,
      })
    })

    socket.on('start-drawing-shape', (data) => {
      io?.to(data.team_id).emit('start-drawing-shape', {
        first_point_x: data.first_point_x,
        first_point_y: data.first_point_y,
        global_alpha: data.global_alpha,
        color: data.color,
        line_width: data.line_width,
        socket_id: data.socket_id,
        tool: data.tool,
      })
    })

    socket.on('draw', (data) => {
      io?.to(data.team_id).emit('draw', {
        x: data.x,
        y: data.y,
        global_alpha: data.global_alpha,
        color: data.color,
        socket_id: data.socket_id,
        tool: data.tool,
      })
    })

    socket.on('stop-drawing', (data) => {
      io?.to(data.team_id).emit('stop-drawing', {
        x: data.x,
        y: data.y,
        global_alpha: data.global_alpha,
        color: data.color,
        socket_id: data.socket_id,
        tool: data.tool,
      })
    })

    socket.on('undo', (data) => {
      io?.to(data.team_id).emit('undo', {
        socket_id: data.socket_id,
        history_index: data.history_index,
      })
    })

    socket.on('redo', (data) => {
      io?.to(data.team_id).emit('redo', {
        socket_id: data.socket_id,
        history_index: data.history_index,
      })
    })

    socket.on('player-ready', async (data) => {
      socket.data.status = 'ready'

      const partyId = data.party_id
      const partySockets = Array.from(Ws.sockets.values()).filter(
        (s) => s.data.party_id === partyId
      )

      const allReady = partySockets.every((s) => s.data.status === 'ready')

      if (allReady) {
        io?.to(partyId).emit('start-timer')
      }
    })

    socket.on('timer-finished', (data) => {
      io?.to(data.party_id).emit('timer-finished')
    })

    socket.on('final-draw', async (data) => {
      const team = await Team.query().where('id', data.team_id).select('id', 'draw').firstOrFail()
      const party = await Party.query()
        .where('id', data.party_id)
        .select('id', 'step')
        .firstOrFail()
      const draw = data.draw

      io?.to(data.team_id).emit('on-saving-draw')

      if (draw.startsWith('data:image')) {
        const uploadsDir = app.makePath('uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }

        const filename = `${cuid()}.png`
        const filePath = path.join(uploadsDir, filename)

        const base64Data = draw.replace(/^data:image\/\w+;base64,/, '')
        const buffer = Buffer.from(base64Data, 'base64')
        fs.writeFileSync(filePath, buffer)

        team.draw = filename
        await team.save()
      }

      if (party.step === 'drawing') {
        party.step = 'voting'
        await party.save()
      }

      io?.to(data.team_id).emit('redirect')
    })
  })
})
