import { DateTime } from 'luxon'
import {BaseModel, beforeCreate, column} from '@adonisjs/lucid/orm'
import {v4 as uuidv4} from "uuid";

export default class Party extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @beforeCreate()
  static async assignUuid(party: Party) {
    party.id = uuidv4()
  }

  @column()
  declare drawTime: 3 | 2 | 1

  @column()
  declare voteTime: 1.5 | 1 | 0.5

  @column()
  declare defilement: 'auto' | 'manual'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
