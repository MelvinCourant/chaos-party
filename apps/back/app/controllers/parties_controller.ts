import type { HttpContext } from '@adonisjs/core/http'
import Ws from '#services/Ws'
import {
  createPartyValidator,
  joinPartyValidator,
  showPartyValidator,
  updateModeValidator,
} from '#validators/party'
import User from '#models/user'
import Party from '#models/party'
import Mode from '#models/mode'

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPartyValidator)
    const userId = payload.user_id
    const pseudo = payload.pseudo
    const image = payload.image

    const party = await Party.create({
      mode_id: 1,
      draw_time: 3,
      vote_time: 1,
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
      const party = await Party.find(partyId)
      if (!Ws.io?.sockets.adapter.rooms.has(partyId) || !party) {
        return response.status(404).json({ message: i18n.t('messages.party_not_found') })
      }

      const playersInParty = await User.query().where('party_id', partyId).select('id')

      if (playersInParty.length === 12) {
        return response.status(403).json({ message: i18n.t('messages.maximum_players_reached') })
      }

      socket.join(partyId)

      if (userId) {
        const userExist = await User.find(userId)

        if (userExist) {
          userExist.socket_id = socket.id
          userExist.pseudo = pseudo
          userExist.image = image
          userExist.party_id = partyId
          userExist.role = 'player'
          await userExist.save()

          Ws?.io?.to(partyId).emit('join', userExist)

          return response.json({
            id: partyId,
            user: userExist,
          })
        }
      }

      const newUser = await User.create({
        socket_id: socket.id,
        pseudo: pseudo,
        image: image,
        party_id: partyId,
        role: 'player',
      })

      Ws?.io?.to(partyId).emit('join', newUser)

      return response.json({
        id: partyId,
        user: newUser,
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

    const players = await User.query()
      .where('party_id', partyId)
      .orderBy('updated_at', 'asc')
      .exec()

    const mode = await Mode.query().where('id', party.mode_id).firstOrFail()

    return response.json({
      players: players,
      mode: mode,
    })
  }

  public async updateMode({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateModeValidator)
    const userId = payload.user_id
    const partyId = payload.party_id
    const modeId = payload.mode_id

    const user = await User.query().where('id', userId).select('role').firstOrFail()
    const party = await Party.findOrFail(partyId)

    if (user.role !== 'host' || party.mode_id === modeId) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const mode = await Mode.query().where('id', modeId).firstOrFail()

    party.mode_id = modeId
    await party.save()
    Ws?.io?.to(partyId).emit('update-mode', mode)

    return response.json({ message: i18n.t('messages.mode_updated') })
  }
}
