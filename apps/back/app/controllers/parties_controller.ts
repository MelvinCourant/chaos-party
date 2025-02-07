import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Ws from '#services/Ws'
import { createPartyValidator, joinPartyValidator } from '#validators/party'
let players: {
  id: `${string}-${string}-${string}-${string}-${string}`
  pseudo: string
  image: string | null
  role: string
}[] = []

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPartyValidator)
    const pseudo = payload.pseudo
    const image = payload.image
    const user = {
      id: randomUUID(),
      pseudo: pseudo,
      image: image,
      role: 'host',
    }
    const party = {
      id: randomUUID(),
      user: user,
    }

    const socket = Ws.sockets.values().next().value
    if (socket) {
      socket.join(party.id)
      players.push(user)
    }

    return response.json(party)
  }

  public async join({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(joinPartyValidator)
    const pseudo = payload.pseudo
    const image = payload.image
    const user = {
      id: randomUUID(),
      pseudo: pseudo,
      image: image,
      role: 'player',
    }
    const partyId = payload.partyId

    const socket = Ws.sockets.values().next().value
    if (socket) {
      if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
        return response.status(404).json({ message: i18n.t('party_not_found') })
      }

      socket.join(partyId)
      players.push(user)
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

    return response.json({ players: players })
  }
}
