import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Party from '#models/party'
import { updateHostValidator } from '#validators/user'
import Ws from '#services/Ws'

export default class UsersController {
  public static async updateHost({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateHostValidator)
    const partyId = payload.party_id
    const socketId = payload.socket_id
    const userId = payload.user_id
    const receiverId = payload.receiver_id
    const receiver = await User.query()
      .where('id', receiverId)
      .select('id', 'pseudo', 'role', 'socket_id')
      .firstOrFail()

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }

      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(receiver.socket_id)) {
        return response.status(404).json({ message: i18n.t('messages.selected_user_not_present') })
      }
    }

    const user = await User.query()
      .where('id', userId)
      .select('id', 'role', 'party_id')
      .firstOrFail()
    const party = await Party.findOrFail(partyId)

    if (user.role !== 'host' || user.party_id !== party.id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    receiver.role = 'host'
    await receiver.save()
    user.role = 'player'
    await user.save()

    Ws?.io?.to(partyId).emit('new-host', {
      id: receiver.id,
      pseudo: receiver.pseudo,
      role: receiver.role,
    })

    return response.status(200).json({
      message: i18n.t('messages.became_host', { pseudo: receiver.pseudo }),
    })
  }
}
