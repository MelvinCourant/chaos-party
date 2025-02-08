import vine from '@vinejs/vine'

export const createPartyValidator = vine.compile(
  vine.object({
    userId: vine.string().trim().uuid().nullable(),
    pseudo: vine.string().trim().minLength(3).maxLength(15),
    image: vine.string().trim().nullable(),
  })
)

export const joinPartyValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    userId: vine.string().trim().uuid().nullable(),
    pseudo: vine.string().trim().minLength(3).maxLength(15),
    image: vine.string().trim().nullable(),
    party_id: vine.string().trim().uuid(),
  })
)

export const showPartyValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    party_id: vine.string().trim().uuid(),
  })
)
