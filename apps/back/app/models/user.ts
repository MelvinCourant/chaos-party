import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column } from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Objective from '#models/objective'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static async assignUuid(user: User) {
    user.id = uuidv4()
  }

  @column()
  declare socket_id: string

  @column()
  declare pseudo: string

  @column()
  declare image: string | null

  @column()
  declare party_id: string | null

  @column()
  declare team_id: string | null

  @column()
  declare role: 'host' | 'player' | 'saboteur'

  @column()
  declare objective_id: string | null

  @belongsTo(() => Objective)
  declare objective: BelongsTo<typeof Objective>

  @column()
  declare color: 'blue' | 'red' | 'dark-green' | 'orange' | 'pink' | 'purple' | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
