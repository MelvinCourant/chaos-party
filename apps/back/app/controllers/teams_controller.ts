import type { HttpContext } from '@adonisjs/core/http'
import {
  createTeamsValidator,
  joinTeamValidator,
  leaveTeamValidator,
  randomTeamsValidator,
  showDrawingValidator,
  updateNumberTeamsValidator,
} from '#validators/team'
import Ws from '#services/Ws'
import Party from '#models/party'
import Team from '#models/team'
import User from '#models/user'
import Mission from '#models/mission'
import Objective from '#models/objective'

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

  public async leave({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(leaveTeamValidator)
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

    user.team_id = ''
    await user.save()

    Ws.io?.to(party.id).emit('leave-team', team, user)

    return response.json({
      team: team,
      user: user,
    })
  }

  public async random({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(randomTeamsValidator)
    const userId = payload.user_id
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

    const user = await User.query().where('id', userId).select('role', 'party_id').firstOrFail()
    const party = await Party.query().where('id', partyId).select('id').firstOrFail()

    if (user.role !== 'host' || party.id !== user.party_id) {
      return response.unauthorized({
        message: i18n.t('messages.forbidden'),
      })
    }

    const teams = await Team.query().where('party_id', party.id).select('id')
    const players = await User.query().where('party_id', party.id)
    const maxPlayersInTeam = Math.floor(players.length / teams.length)

    // Shuffle users
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[players[i], players[j]] = [players[j], players[i]]
    }

    // Distribute users to teams
    let teamIndex = 0
    for (const player of players) {
      player.team_id = teams[teamIndex].id
      await player.save()

      teamIndex = (teamIndex + 1) % teams.length
    }

    const teamsWithPlayers = teams.map((team) => {
      return {
        id: team.id,
        players: players.filter((player) => player.team_id === team.id),
      }
    })

    Ws.io?.to(party.id).emit('random-teams', teamsWithPlayers)

    return response.json({
      teams: teamsWithPlayers,
    })
  }

  public async updateNumberTeams({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(updateNumberTeamsValidator)
    const userId = payload.user_id
    const partyId = payload.party_id
    const quantity = payload.quantity
    const socketId = payload.socket_id

    if (!Ws.io?.sockets.adapter.rooms.has(partyId)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    } else {
      // @ts-ignore
      if (!Ws.io?.sockets.adapter.rooms.get(partyId).has(socketId)) {
        return response.status(403).json({ message: i18n.t('messages.forbidden') })
      }
    }

    const user = await User.query().where('id', userId).select('role', 'party_id').firstOrFail()
    const party = await Party.query().where('id', partyId).select('id').firstOrFail()

    if (user.role !== 'host' || party.id !== user.party_id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const teams = await Team.query().where('party_id', party.id).select('id').orderBy('id', 'desc')

    if (teams.length > quantity) {
      const teamsToDelete = teams.slice(0, teams.length - quantity)
      const teamIdsToDelete = teamsToDelete.map((team) => team.id)

      await User.query().whereIn('team_id', teamIdsToDelete).update({ team_id: '' })

      await Team.query().whereIn('id', teamIdsToDelete).delete()
    } else {
      await Team.createMany(
        Array.from({ length: quantity - teams.length }, () => ({
          party_id: party.id,
        }))
      )
    }

    const newTeams = await Team.query().where('party_id', party.id).select('id')
    const teamsWithPlayers = newTeams.map((team) => {
      return {
        id: team.id,
        players: [],
      }
    })

    Ws.io?.to(party.id).emit('update-number-teams', teamsWithPlayers)

    return response.json({
      teams: teamsWithPlayers,
    })
  }

  public async showDrawing({ i18n, request, response }: HttpContext) {
    const payload = await request.validateUsing(showDrawingValidator)
    const userId = payload.user_id

    const user = await User.query()
      .where('id', userId)
      .select('id', 'pseudo', 'party_id', 'team_id', 'role', 'is_saboteur', 'objective_id')
      .firstOrFail()
    const team = await Team.query()
      .where('id', user.team_id)
      .select('id', 'party_id', 'mission_id')
      .firstOrFail()

    if (!Ws.io?.sockets.adapter.rooms.has(team.id)) {
      return response.status(404).json({ message: i18n.t('messages.party_not_found') })
    }

    const party = await Party.query()
      .where('id', team.party_id)
      .select('id', 'drawing_time')
      .firstOrFail()

    if (user.party_id !== team.party_id) {
      return response.status(403).json({ message: i18n.t('messages.forbidden') })
    }

    const mission = await Mission.query()
      .where('id', team.mission_id)
      .select('description')
      .firstOrFail()
    const othersPlayersInTeam = await User.query()
      .where('team_id', team.id)
      .andWhere('id', '!=', user.id)
      .select('pseudo', 'socket_id', 'color')

    if (user.is_saboteur) {
      return response.json({
        drawing_time: party.drawing_time,
        team_id: team.id,
        mission: i18n.t(`messages.missions.${mission.description}`),
        sabotage: i18n.t('messages.sabotage'),
        players: othersPlayersInTeam,
      })
    }

    const objective = await Objective.query()
      .where('id', user.objective_id)
      .select('description')
      .firstOrFail()

    return response.json({
      drawing_time: party.drawing_time,
      team_id: team.id,
      mission: i18n.t(`messages.missions.${mission.description}`),
      objective: i18n.t(`messages.objectives.${objective.description}`),
      players: othersPlayersInTeam,
    })
  }
}
