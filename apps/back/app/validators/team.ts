import vine from '@vinejs/vine'

export const createTeamsValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
    quantity: vine.number().min(1).max(4),
  })
)

export const joinTeamValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
    team_id: vine.string().trim().uuid(),
  })
)

export const leaveTeamValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
    team_id: vine.string().trim().uuid(),
  })
)

export const randomTeamsValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
  })
)
