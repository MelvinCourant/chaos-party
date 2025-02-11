import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('socket_id').notNullable()
      table.string('pseudo').notNullable()
      table.string('image').nullable()
      table.uuid('party_id').nullable()
      table.uuid('team_id').nullable()
      table.enum('role', ['host', 'player', 'saboteur']).notNullable().defaultTo('player')
      table.integer('objective_id').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
