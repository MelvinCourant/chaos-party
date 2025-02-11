import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column, belongsTo } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import Party from '#models/party'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Mission from '#models/mission'

export default class Team extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static async assignUuid(team: Team) {
    team.id = uuidv4()
  }

  @column()
  declare party_id: string

  @belongsTo(() => Party)
  declare party: BelongsTo<typeof Party>

  @column()
  declare mission_id: number | null

  @belongsTo(() => Mission)
  declare mission: BelongsTo<typeof Mission>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
