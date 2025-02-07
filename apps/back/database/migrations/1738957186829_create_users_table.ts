import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('socket_id').notNullable()
      table.string('pseudo').notNullable()
      table.string('image').nullable()
      table.uuid('party_id').references('id').inTable('parties').onDelete('CASCADE')
      table.enum('role', ['host', 'player']).notNullable().defaultTo('player')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
