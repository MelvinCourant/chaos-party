import type { HttpContext } from '@adonisjs/core/http'
import { createTeamsValidator, joinTeamValidator } from '#validators/team'
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

  public async join({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(joinTeamValidator)
    const userId = payload.user_id
    const partyId = payload.party_id
    const teamId = payload.team_id
    const socketId = payload.socket_id

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const party = await Party.query().where('id', partyId).select('id').firstOrFail()
    const user = await User.findOrFail(userId)
    const team = await Team.findOrFail(teamId)

    if (user.party_id !== party.id || team.party_id !== party.id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    user.team_id = team.id
    await user.save()

    Ws.io?.to(party.id).emit('join-team', team, user)

    return response.json({
      team: team,
      user: user,
    })
  }
}
