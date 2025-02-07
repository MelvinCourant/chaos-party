import vine from '@vinejs/vine'

export const createPartyValidator = vine.compile(
  vine.object({
    pseudo: vine.string().trim().minLength(3).maxLength(15),
    image: vine.string().trim().nullable(),
  })
)
