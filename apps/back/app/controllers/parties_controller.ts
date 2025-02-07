import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Ws from '#services/Ws'
import { createPartyValidator, joinPartyValidator } from '#validators/party'
import User from '#models/user'
import Party from "#models/party";

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPartyValidator)
    const pseudo = payload.pseudo
    const image = payload.image

    const party = await Party.create({
      drawTime: 3,
      voteTime: 1,
      defilement: 'auto',
    })
    let user = {}

    const socket = Ws.sockets.values().next().value
    if (socket) {
      socket.join(party.id)

      user = await User.create({
        socketId: socket.id,
        pseudo: pseudo,
        image: image,
        partyId: party.id,
        role: 'host',
      })
    }

    return response.json({
      id: party.id,
      user: user,
    })
  }

  public async join({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(joinPartyValidator)
    const pseudo = payload.pseudo
    const image = payload.image
    const partyId = payload.partyId
    let user = {}

    const socket = Ws.sockets.values().next().value
    if (socket) {
      if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
        return response.status(404).json({ message: i18n.t('party_not_found') })
      }

      socket.join(partyId)

      user = await User.create({
        socketId: socket.id,
        pseudo: pseudo,
        image: image,
        partyId: partyId,
        role: 'host',
      })

      Ws?.io?.to(partyId).emit('join', user)
    }

    const party = {
      id: partyId,
      user: user,
    }

    return response.json(party)
  }

  public async show({ i18n, params, response }: HttpContext) {
    const partyId = params.id
    const socket = Ws.sockets.values().next().value

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('party_not_found') })
    } else if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socket.id)) {
      return response.status(403).json({ message: i18n.t('forbidden') })
    }

    const players = await User.query().where('partyId', partyId).exec()

    return response.json({ players: players })
  }
}
