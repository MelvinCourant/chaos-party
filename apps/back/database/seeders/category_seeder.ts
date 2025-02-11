import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Category from '#models/category'

export default class extends BaseSeeder {
  async run() {
    await Category.createMany([
      {
        id: 1,
        name: 'categories.buildings_cities',
      },
      {
        id: 2,
        name: 'categories.characters_heroes',
      },
      {
        id: 3,
        name: 'categories.creatures_monsters',
      },
      {
        id: 4,
        name: 'categories.machines_inventions',
      },
      {
        id: 5,
        name: 'categories.nature_landscapes',
      },
    ])
  }
}
