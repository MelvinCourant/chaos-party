import type { HttpContext } from '@adonisjs/core/http'
import Ws from '#services/Ws'
import {
  createPartyValidator,
  joinPartyValidator,
  showConfigurationsValidator,
  showPartyValidator,
  updateConfigurationsValidator,
  updateModeValidator,
} from '#validators/party'
import User from '#models/user'
import Party from '#models/party'
import Mode from '#models/mode'
import Team from '#models/team'

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPartyValidator)
    const userId = payload.user_id
    const pseudo = payload.pseudo
    const image = payload.image

    const party = await Party.create({
      step: 'lobby',
      mode_id: 1,
      drawing_time: 3,
      voting_time: 1,
      defilement: 'auto',
    })

    const socket = Ws.sockets.values().next().value
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
      const party = await Party.query().where('id', partyId).select('id', 'step').firstOrFail()
      if (!Ws.io?.sockets.adapter.rooms.has(party.id)) {
        return response.status(404).json({ message: i18n.t('messages.party_not_found') })
      }

      const playersInParty = await User.query().where('party_id', party.id).select('id')

      if (playersInParty.length === 16) {
        return response.status(403).json({ message: i18n.t('messages.maximum_players_reached') })
      }

      socket.join(party.id)

      if (userId) {
        const userExist = await User.find(userId)

        if (userExist) {
          userExist.socket_id = socket.id
          userExist.pseudo = pseudo
          userExist.image = image
          userExist.party_id = party.id
          userExist.role = 'player'
          await userExist.save()

          Ws?.io?.to(partyId).emit('join', userExist)

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
    const socketId = payload.socket_id

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const party = await Party.findOrFail(partyId)

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
    const payload = await request.validateUsing(showConfigurationsValidator)
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

    await User.findOrFail(userId)

    const configurations = await Party.query()
      .where('id', partyId)
      .select('drawing_time', 'voting_time', 'defilement')
      .firstOrFail()
    const teams = await Team.query().where('party_id', partyId).select('id')
    const playersInTeams = await User.query()
      .where('party_id', partyId)
      .andWhere('team_id', '!=', '')
    const teamsWithPlayers = teams.map((team) => {
      return {
        id: team.id,
        players: playersInTeams.filter((player) => player.team_id === team.id),
      }
    })

    return response.json({
      configurations: configurations,
      teams: teamsWithPlayers,
    })
  }

  public async updateConfiguration({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateConfigurationsValidator)
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
      party.drawing_time = drawingTime
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
}
