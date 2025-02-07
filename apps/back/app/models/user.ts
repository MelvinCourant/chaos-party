import { DateTime } from 'luxon'
import {BaseModel, beforeCreate, column} from '@adonisjs/lucid/orm'
import { v4 as uuidv4 } from 'uuid'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static async assignUuid(user: User) {
    user.id = uuidv4()
  }

  @column()
  declare socketId: string

  @column()
  declare pseudo: string

  @column()
  declare image: string | null

  @column()
  declare partyId: string | null

  @column()
  declare role: 'host' | 'player'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
