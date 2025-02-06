import type { HttpContext } from '@adonisjs/core/http'
import { randomUUID } from "node:crypto"
import Ws from "#services/Ws"

export default class PartiesController {
  public async create({ request, response }: HttpContext) {
    const pseudo = request.input('pseudo')
    const image = request.input('image')
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
