import vine from '@vinejs/vine'

export const createTeamsValidator = vine.compile(
  vine.object({
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
    quantity: vine.number().min(1).max(4),
  })
)
