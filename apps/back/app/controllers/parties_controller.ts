import type { HttpContext } from '@adonisjs/core/http'
import Ws from '#services/Ws'
import {
  createPartyValidator,
  joinPartyValidator,
  defaultValidator,
  showPartyValidator,
  updateConfigurationValidator,
  updateModeValidator,
  votingValidator,
} from '#validators/party'
import User from '#models/user'
import Party from '#models/party'
import Mode from '#models/mode'
import Team from '#models/team'
import Mission from '#models/mission'
import Category from '#models/category'
import Objective from '#models/objective'
import config from '../../../../cp-config.json' assert { type: 'json' }

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPartyValidator)
    const userId = payload.user_id
    const socketId = payload.socket_id
    const pseudo = payload.pseudo
    const image = payload.image

    const party = await Party.create({
      step: 'lobby',
    })

    const socket = Ws.sockets.get(socketId)
    if (socket) {
      socket.join(party.id)

      if (userId) {
        const userExist = await User.find(userId)

        if (userExist) {
          userExist.socket_id = socket.id
          userExist.pseudo = pseudo
          userExist.image = image
          userExist.party_id = party.id
          userExist.role = 'host'
          userExist.score = 0
          await userExist.save()

          return response.json({
            id: party.id,
            user: userExist,
          })
        }
      }

      const newUser = await User.create({
        socket_id: socket.id,
        pseudo: pseudo,
        image: image,
        party_id: party.id,
        role: 'host',
      })

      return response.json({
        id: party.id,
        user: newUser,
      })
    }
  }

  public async join({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(joinPartyValidator)
    const userId = payload.user_id
    const pseudo = payload.pseudo
    const image = payload.image
    const partyId = payload.party_id
    const socketId = payload.socket_id

    const socket = Ws.sockets.get(socketId)
    if (socket) {
      const party = await Party.query()
        .where('id', partyId)
        .select('id', 'step', 'in_progress')
        .first()

      if (!party) {
        return response.status(404).json({ message: i18n.t('messages.party_not_found') })
      }

      if (!Ws.io?.sockets.adapter.rooms.has(party.id)) {
        return response.status(404).json({ message: i18n.t('messages.party_not_found') })
      }

      const playersInParty = await User.query().where('party_id', party.id).select('id')

      if (playersInParty.length === config.max_players) {
        return response.status(403).json({ message: i18n.t('messages.maximum_players_reached') })
      }

      socket.join(party.id)

      if (userId) {
        const userExist = await User.find(userId)

        if (userExist) {
          userExist.socket_id = socket.id
          userExist.pseudo = pseudo
          userExist.image = image

          if (party.in_progress) {
            const playerExistInParty = await User.query().where('party_id', party.id).first()

            if (!playerExistInParty) {
              response.status(403).json({ message: i18n.t('messages.forbidden') })
            }

            const team = await Team.query()
              .where('id', userExist.team_id)
              .select('id', 'party_id')
              .first()

            if (team && userExist.party_id === team.party_id) {
              socket.join(team.id)
            }
          } else {
            userExist.party_id = party.id
            userExist.role = 'player'
            userExist.objective_id = null
            userExist.team_id = null
            userExist.score = 0
          }

          await userExist.save()

          Ws?.io?.to(partyId).emit('join', userExist)

          return response.json({
            id: party.id,
            user: userExist,
            step: party.step,
          })
        }
      }

      const newUser = await User.create({
        socket_id: socket.id,
        pseudo: pseudo,
        image: image,
        party_id: party.id,
        role: 'player',
      })

      Ws?.io?.to(partyId).emit('join', newUser)

      return response.json({
        id: party.id,
        user: newUser,
        step: party.step,
      })
    }
  }

  public async show({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(showPartyValidator)
    const partyId = payload.party_id
    const userId = payload.user_id
    const socketId = payload.socket_id

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const user = await User.query().where('id', userId).select('party_id').firstOrFail()
    const party = await Party.query().where('id', partyId).select('id', 'mode_id').firstOrFail()

    if (user.party_id !== party.id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const players = await User.query().where('party_id', partyId).orderBy('updated_at', 'asc')

    const mode = await Mode.findOrFail(party.mode_id)

    return response.json({
      players: players,
      mode: mode,
    })
  }

  public async updateMode({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateModeValidator)
    const socketId = payload.socket_id
    const userId = payload.user_id
    const partyId = payload.party_id
    const modeId = payload.mode_id

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const user = await User.query().where('id', userId).select('role').firstOrFail()
    const party = await Party.findOrFail(partyId)

    if (user.role !== 'host' || party.mode_id === modeId) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const mode = await Mode.findOrFail(modeId)

    party.mode_id = modeId
    await party.save()
    Ws?.io?.to(partyId).emit('update-mode', mode)

    return response.json({ message: i18n.t('messages.mode_updated') })
  }

  public async showConfigurations({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(defaultValidator)
    const partyId = payload.party_id
    const socketId = payload.socket_id
    const userId = payload.user_id

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const user = await User.query().where('id', userId).select('party_id').firstOrFail()
    const party = await Party.query().where('id', partyId).select('id').firstOrFail()

    if (user.party_id !== party.id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const configurations = await Party.query()
      .where('id', party.id)
      .select('drawing_time', 'voting_time', 'defilement')
      .firstOrFail()
    const teams = await Team.query().where('party_id', party.id).select('id')
    const playersInTeams = await User.query()
      .where('party_id', party.id)
      .andWhere('team_id', '!=', '')
    const teamsWithPlayers = teams.map((team) => {
      return {
        id: team.id,
        players: playersInTeams.filter((player) => player.team_id === team.id),
      }
    })

    return response.json({
      configurations: {
        drawing_time: configurations.drawing_time,
        voting_time: configurations.voting_time,
        defilement: configurations.defilement,
      },
      teams: teamsWithPlayers,
    })
  }

  public async updateConfiguration({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateConfigurationValidator)
    const socketId = payload.socket_id
    const userId = payload.user_id
    const partyId = payload.party_id
    const drawingTime = request.input('drawing_time')
    const votingTime = request.input('voting_time')
    const defilement = request.input('defilement')

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const user = await User.query().where('id', userId).select('role', 'party_id').firstOrFail()
    const party = await Party.findOrFail(partyId)

    if (user.role !== 'host' || user.party_id !== party.id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    let newConfiguration = {}

    if (drawingTime) {
      party.drawing_time = drawingTime.toString()
      newConfiguration = { drawing_time: drawingTime }
    } else if (votingTime) {
      party.voting_time = votingTime
      newConfiguration = { voting_time: votingTime }
    } else if (defilement) {
      party.defilement = defilement
      newConfiguration = { defilement: defilement }
    } else {
      return response.status(400).json({ message: i18n.t('messages.bad_request') })
    }

    await party.save()

    Ws?.io?.to(partyId).emit('update-configuration', newConfiguration)

    return response.json({ configuration: newConfiguration })
  }

  public async start({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(defaultValidator)
    const partyId = payload.party_id
    const socketId = payload.socket_id
    const userId = payload.user_id

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const user = await User.query().where('id', userId).select('role', 'party_id').firstOrFail()
    const party = await Party.findOrFail(partyId)

    if (user.role !== 'host' || user.party_id !== party.id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const players = await User.query()
      .where('party_id', party.id)
      .select('id', 'team_id', 'socket_id', 'is_saboteur')
    const playersWithoutTeam = players.filter((player) => !player.team_id)

    if (playersWithoutTeam.length > 0) {
      return response.status(400).json({ message: i18n.t('messages.players_without_team') })
    }

    if (players.length < config.minimum_players) {
      return response.status(400).json({
        message: i18n.t('messages.minimum_players_required', { quantity: config.minimum_players }),
      })
    }

    party.step = 'drawing'
    party.in_progress = true
    await party.save()

    const teams = await Team.query().where('party_id', party.id).select('id', 'mission_id')
    let missions: string | any[] = []

    if (party.mode_id === 1) {
      missions = await Mission.query()
        .where('mode_id', party.mode_id)
        .orWhereNull('mode_id')
        .select('id', 'category_id')

      for (const team of teams) {
        const playersInTeam = players.filter((player) => player.team_id === team.id)

        if (playersInTeam.length === 0) {
          await team.delete()
          continue
        }

        const missionSelected = missions[Math.floor(Math.random() * missions.length)]
        team.mission_id = missionSelected.id
        await team.save()

        const category = await Category.query()
          .where('id', missionSelected.category_id)
          .select('id')
          .firstOrFail()

        if (playersInTeam.length > 0) {
          const saboteurIndex = Math.floor(Math.random() * playersInTeam.length)
          playersInTeam[saboteurIndex].is_saboteur = true
          await playersInTeam[saboteurIndex].save()

          const objectives = await Objective.query().where('category_id', category.id).select('id')

          for (const [i, player] of playersInTeam.entries()) {
            if (i !== saboteurIndex) {
              const randomObjective = objectives[Math.floor(Math.random() * objectives.length)]

              player.objective_id = randomObjective.id
              await player.save()
            }
          }
        }

        let colors = ['dark-blue', 'red', 'dark-green', 'orange', 'pink', 'purple']

        for (const player of playersInTeam) {
          const playerSocket = Ws.sockets.get(player.socket_id)
          if (playerSocket) {
            playerSocket.join(team.id)
            player.color = colors.shift()
            await player.save()
          }
        }
      }
    }

    Ws?.io?.to(partyId).emit('new-step', party.step)

    return response.json({ message: i18n.t('messages.party_started') })
  }

  public async voting({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(votingValidator)
    const partyId = payload.party_id
    const socketId = payload.socket_id
    const userId = payload.user_id
    const numberTeam = payload.number_team

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const user = await User.query().where('id', userId).select('role', 'party_id').firstOrFail()
    const party = await Party.findOrFail(partyId)

    if (user.party_id !== party.id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const teams = await Team.query()
      .where('party_id', party.id)
      .select('id', 'mission_id', 'draw')
      .orderBy('updated_at', 'asc')
    const team = teams[numberTeam - 1]
    const mission = await Mission.query()
      .where('id', team.mission_id)
      .select('description', 'category_id')
      .firstOrFail()
    const playersInTeam = await User.query()
      .where('team_id', team.id)
      .select('id', 'pseudo', 'image', 'socket_id')

    return response.json({
      team: {
        id: team.id,
        draw: team.draw,
        players: playersInTeam,
      },
      party: {
        voting_time: party.voting_time,
        defilement: party.defilement,
      },
      mission: i18n.t(`messages.${mission.description}`),
      teams_length: teams.length,
    })
  }
}
