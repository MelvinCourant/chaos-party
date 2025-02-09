import type { HttpContext } from '@adonisjs/core/http'
import { createTeamsValidator } from '#validators/team'
import Ws from '#services/Ws'
import Party from '#models/party'
import Team from '#models/team'
import User from '#models/user'

export default class TeamsController {
  public async create({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(createTeamsValidator)
    const userId = payload.user_id
    const partyId = payload.party_id
    const quantity = payload.quantity

    const party = await Party.query().where('id', partyId).select('id', 'step').firstOrFail()
    const user = await User.query().where('id', userId).select('role', 'party_id').firstOrFail()

    if (user.role !== 'host' || party.id !== user.party_id) {
      return response.unauthorized({
        message: i18n.t('messages.forbidden'),
      })
    }

    await Team.createMany(
      Array.from({ length: quantity }, () => ({
        party_id: party.id,
      }))
    )

    party.step = 'creating-teams'
    await party.save()

    Ws.io?.to(party.id).emit('new-step', 'creating-teams')

    return response.json({
      message: i18n.t('messages.teams_created', { quantity: quantity }),
    })
  }
}
