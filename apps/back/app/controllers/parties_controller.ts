import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from 'node:crypto'
import Ws from '#services/Ws'
import { createPartyValidator, joinPartyValidator } from '#validators/party'
import i18n from '#config/i18n'

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
    }

    return response.json(party)
  }

  public async join({ request, response }: HttpContext) {
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
        // @ts-ignore
        return response.status(404).json({ message: i18n.t('party_not_found') })
      }

      socket.join(partyId)
      Ws?.io?.to(partyId).emit('join', user)
    }

    const party = {
      id: partyId,
      user: user,
    }

    return response.json(party)
  }
}
