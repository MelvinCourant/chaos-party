import type { HttpContext } from '@adonisjs/core/http'
import Mode from '#models/mode'

export default class ModesController {
  public async index({ i18n, response }: HttpContext) {
    const modes = await Mode.all()

    modes.forEach((mode) => {
      mode.name = i18n.t(`messages.modes.${mode.name}`)
      mode.description = i18n.t(`messages.modes.${mode.description}`)
    })

    return response.json(modes)
  }
}
