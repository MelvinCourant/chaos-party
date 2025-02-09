import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Mode from '#models/mode'

export default class extends BaseSeeder {
  async run() {
    await Mode.createMany([
      {
        name: 'chaos.name',
        description: 'chaos.description',
        image: 'chaos',
        per_team: true,
      },
      {
        name: 'total_chaos.name',
        description: 'total_chaos.description',
        image: 'total_chaos',
        per_team: true,
      },
      {
        name: 'undercover.name',
        description: 'undercover.description',
        image: 'undercover',
        per_team: false,
      },
    ])
  }
}
