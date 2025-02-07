import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from "node:crypto"
import Ws from "#services/Ws"
import { createPartyValidator } from "#validators/party";

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const payload = await request.validateUsing(createPartyValidator)
    const pseudo = payload.pseudo
    const image = payload.image
    const player = {
      id: randomUUID(),
      pseudo: pseudo,
      image: image,
    }
    const party = {
      id: randomUUID(),
      players: [player],
    }

    const socket = Ws.sockets.values().next().value
    if (socket) {
      socket.join(party.id)
    }

    return response.json(party)
  }
}
