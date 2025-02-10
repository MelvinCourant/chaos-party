import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import Mode from '#models/mode'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Party extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static async assignUuid(party: Party) {
    party.id = uuidv4()
  }

  @column()
  declare mode_id: number

  @column()
  declare step: 'lobby' | 'creating-teams' | 'drawing' | 'voting' | 'results'

  @column()
  declare drawing_time: 3 | 2 | 1

  @column()
  declare voting_time: 1.5 | 1 | 0.5

  @column()
  declare defilement: 'auto' | 'manual'

  @column()
  declare in_progress: boolean

  @belongsTo(() => Mode)
  declare mode: BelongsTo<typeof Mode>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
