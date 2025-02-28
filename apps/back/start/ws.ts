import app from '@adonisjs/core/services/app'
import Ws from '#services/Ws'
import User from '#models/user'
import Party from '#models/party'
import Team from '#models/team'
import fs from 'node:fs'
import { cuid } from '@adonisjs/core/helpers'
import path from 'node:path'
import Category from '#models/category'
import i18nManager from '@adonisjs/i18n/services/main'
import Mission from '#models/mission'

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
        io?.to(data.team_id).emit('redirect')

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

        const teams = await Team.query().where('party_id', party.id).select('id', 'draw')

        if (teams.every((t) => t.draw)) {
          io?.to(data.party_id).emit('all-draws-saved')
        }
      }

      if (party.step === 'drawing') {
        party.step = 'voting'
        await party.save()
      }
    })

    socket.on('voting-player-ready', async (data) => {
      socket.data.status = 'ready'

      const partyId = data.party_id
      const partySockets = Array.from(Ws.sockets.values()).filter(
        (s) => s.data.party_id === partyId
      )

      const allReady = partySockets.every((s) => s.data.status === 'ready')

      if (allReady) {
        io?.to(partyId).emit('voting-start')
      }
    })

    socket.on('next-step', async (data) => {
      io?.to(data.party_id).emit('next-step', {
        socket_id: data.socket_id,
      })
    })

    socket.on('step-voting', async (data) => {
      const i18n = i18nManager.locale(data.locale)
      const team = await Team.query()
        .where('id', data.team_id)
        .select('id', 'mission_id')
        .firstOrFail()

      if (data.step === 'mission') {
        const mission = await Mission.query()
          .where('id', team.mission_id)
          .select('category_id')
          .firstOrFail()
        const category = await Category.query()
          .where('id', mission.category_id)
          .select('id', 'name')
          .firstOrFail()

        const notes = [
          {
            note: 0,
            quantity: 0,
          },
          {
            note: 1,
            quantity: 0,
          },
          {
            note: 2,
            quantity: 0,
          },
          {
            note: 3,
            quantity: 0,
          },
        ]

        io?.to(data.party_id).emit('votes', {
          votes: [
            {
              id: 1,
              title: i18n.t(`messages.voting.${category.name}`),
              notes,
            },
            {
              id: 2,
              title: i18n.t('messages.voting.originality_creativity'),
              notes,
            },
          ],
        })

        io?.to(data.party_id).emit('start-timer')
      } else if (data.step === 'sabotage') {
        const player = await User.query()
          .where('socket_id', data.socket_id)
          .select('id', 'team_id', 'score', 'is_saboteur')
          .firstOrFail()

        if (player.team_id === team.id) {
          let score = 0
          let scoreSaboteur = 0

          for (let vote of data.votes) {
            let maxQuantity = 0
            let maxNotes = []

            for (let note of vote.notes) {
              if (note.quantity > maxQuantity) {
                maxQuantity = note.quantity
                maxNotes = [note.note]
              } else if (note.quantity === maxQuantity) {
                maxNotes.push(note.note)
              }
            }

            if (maxNotes.length === 1) {
              score += maxNotes[0]
              scoreSaboteur += 3 - maxNotes[0]
            } else {
              score += maxNotes.reduce((a, b) => a + b, 0) / maxNotes.length
              scoreSaboteur += (3 - maxNotes.reduce((a, b) => a + b, 0) / maxNotes.length) * 3
            }
          }

          if (player.is_saboteur) {
            socket.data.score += score
            player.score = score
          } else {
            socket.data.score += scoreSaboteur
            player.score = scoreSaboteur
          }

          await player.save()
        }

        io?.to(data.party_id).emit('player-sabotage', {
          title: i18n.t('messages.voting.sabotage'),
          type: 'sabotage',
        })

        io?.to(data.party_id).emit('start-timer')
      }
    })

    socket.on('player-vote', async (data) => {
      const { vote_id, note } = data
      const previousNote = socket.data.votes?.[vote_id] || null

      if (!socket.data.votes) {
        socket.data.votes = {}
      }

      socket.data.votes[vote_id] = note

      io?.to(data.party_id).emit('player-vote', {
        socket_id: data.socket_id,
        vote_id,
        previous_note: Number.parseInt(previousNote),
        new_note: Number.parseInt(note),
      })
    })

    socket.on('player-vote-saboteur', async (data) => {
      io?.to(data.party_id).emit('player-vote-saboteur', {
        party_id: data.party_id,
        socket_id: data.socket_id,
        player_id: data.player_id,
        user_id: data.user_id,
        user_image: data.user_image,
      })
    })
  })
})
