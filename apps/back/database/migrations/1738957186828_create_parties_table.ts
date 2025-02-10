import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'parties'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table
        .integer('mode_id')
        .unsigned()
        .references('id')
        .inTable('modes')
        .notNullable()
        .defaultTo(1)
      table
        .enum('step', ['lobby', 'creating-teams', 'drawing', 'voting', 'results'])
        .notNullable()
        .defaultTo('lobby')
      table.enu('drawing_time', [3, 2, 1]).notNullable().defaultTo(3)
      table.enu('voting_time', [1.5, 1, 0.5]).notNullable().defaultTo(1)
      table.enum('defilement', ['auto', 'manual']).notNullable().defaultTo('auto')
      table.boolean('in_progress').notNullable().defaultTo(false)

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
