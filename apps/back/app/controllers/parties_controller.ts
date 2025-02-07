import type { HttpContext } from '@adonisjs/core/http'
import Ws from '#services/Ws'
import { createPartyValidator, joinPartyValidator } from '#validators/party'
import User from '#models/user'
import Party from "#models/party";

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPartyValidator)
    const userId = payload.userId
    const pseudo = payload.pseudo
    const image = payload.image

    const party = await Party.create({
      drawTime: 3,
      voteTime: 1,
      defilement: 'auto',
    })

    const socket = Ws.sockets.values().next().value
    if (socket) {
      socket.join(party.id)

      if(userId) {
        const userExist = await User.find(userId)

        if (userExist) {
          userExist.socketId = socket.id
          userExist.pseudo = pseudo
          userExist.image = image
          userExist.partyId = party.id
          userExist.role = 'host'
          await userExist.save()

          return response.json({
            id: party.id,
            user: userExist,
          })
        }
      }

      const newUser = await User.create({
        socketId: socket.id,
        pseudo: pseudo,
        image: image,
        partyId: party.id,
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
    const userId = payload.userId
    const pseudo = payload.pseudo
    const image = payload.image
    const partyId = payload.partyId

    const socket = Ws.sockets.values().next().value
    if (socket) {
      if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
        return response.status(404).json({ message: i18n.t('messages.party_not_found') })
      }

      socket.join(partyId)

      if(userId) {
        const userExist = await User.find(userId)

        if (userExist) {
          userExist.socketId = socket.id
          userExist.pseudo = pseudo
          userExist.image = image
          userExist.partyId = partyId
          userExist.role = 'host'
          await userExist.save()

          Ws?.io?.to(partyId).emit('join', userExist)

          return response.json({
            id: partyId,
            user: userExist,
          })
        }
      }

      const newUser = await User.create({
        socketId: socket.id,
        pseudo: pseudo,
        image: image,
        partyId: partyId,
        role: 'host',
      })

      Ws?.io?.to(partyId).emit('join', newUser)

      return response.json({
        id: partyId,
        user: newUser,
      })
    }
  }

  public async show({ i18n, params, response }: HttpContext) {
    const partyId = params.id
    const socket = Ws.sockets.values().next().value

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socket.id)) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const players = await User.query().where('partyId', partyId).exec()

    return response.json({ players: players })
  }
}
