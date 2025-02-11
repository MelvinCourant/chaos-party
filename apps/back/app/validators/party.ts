import vine from '@vinejs/vine'

export const createPartyValidator = vine.compile(
  vine.object({
    user_id: vine.string().trim().uuid().nullable(),
    pseudo: vine.string().trim().minLength(3).maxLength(15),
    image: vine.string().trim().nullable(),
  })
)

export const joinPartyValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid().nullable(),
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

export const updateModeValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
    mode_id: vine.number().min(1),
  })
)

export const defaultValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
  })
)

export const updateConfigurationValidator = vine.compile(
  vine.object({
    socket_id: vine.string().trim(),
    user_id: vine.string().trim().uuid(),
    party_id: vine.string().trim().uuid(),
  })
)
