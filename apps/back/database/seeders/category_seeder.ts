import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    await Category.createMany([
      {
        id: 1,
        name: 'buildings_cities',
      },
      {
        id: 2,
        name: 'characters_heroes',
      },
      {
        id: 3,
        name: 'creatures_monsters',
      },
      {
        id: 4,
        name: 'machines_inventions',
      },
      {
        id: 5,
        name: 'nature_landscapes',
      },
    ])
  }
}
