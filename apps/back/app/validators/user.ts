import vine from '@vinejs/vine'

export const updateHostValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    receiver_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
  })
)
