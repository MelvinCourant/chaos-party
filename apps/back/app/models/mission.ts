import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import Mode from '#models/mode'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Category from '#models/category'

export default class Mission extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare description: string

  @column()
  declare category_id: number

  @belongsTo(() => Category)
  declare category: BelongsTo<typeof Category>

  @column()
  declare mode_id: number | null

  @belongsTo(() => Mode)
  declare mode: BelongsTo<typeof Mode>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
