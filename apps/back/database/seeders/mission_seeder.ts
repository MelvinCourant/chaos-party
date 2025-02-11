import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Mission from '#models/mission'

export default class extends BaseSeeder {
  async run() {
    await Mission.createMany([
      {
        description: 'missions.building_future',
        category_id: 1,
      },
      {
        description: 'missions.cyberpunk_district',
        category_id: 1,
      },
      {
        description: 'missions.floating_city_sky',
        category_id: 1,
      },
      {
        description: 'missions.hidden_temple',
        category_id: 1,
      },
      {
        description: 'missions.impregnable_fortress',
        category_id: 1,
      },
      {
        description: 'missions.king_queen_fantasy',
        category_id: 2,
      },
      {
        description: 'missions.legendary_pirate',
        category_id: 2,
      },
      {
        description: 'missions.mad_scientist',
        category_id: 2,
      },
      {
        description: 'missions.superhero_never_seen',
        category_id: 2,
      },
      {
        description: 'missions.warrior_parallel',
        category_id: 2,
      },
      {
        description: 'missions.alien_unknown_planet',
        category_id: 3,
      },
      {
        description: 'missions.cute_animal_strange',
        category_id: 3,
      },
      {
        description: 'missions.dragon_never_seen',
        category_id: 3,
      },
      {
        description: 'missions.half_human_animal',
        category_id: 3,
      },
      {
        description: 'missions.terrifying_monster_abyss',
        category_id: 3,
      },
      {
        description: 'missions.desert_island_paradise',
        category_id: 5,
      },
      {
        description: 'missions.distant_unknown_planet',
        category_id: 5,
      },
      {
        description: 'missions.enchanted_forest',
        category_id: 5,
      },
      {
        description: 'missions.giant_mushroom_civilisation',
        category_id: 5,
      },
      {
        description: 'missions.volcano_full_eruption',
        category_id: 5,
      },
      {
        description: 'missions.everyday_robot_assistant',
        category_id: 4,
      },
      {
        description: 'missions.machine_flying_space',
        category_id: 4,
      },
      {
        description: 'missions.machine_turns_food',
        category_id: 4,
      },
      {
        description: 'missions.secret_weapon',
        category_id: 4,
      },
      {
        description: 'missions.vehicle_future',
        category_id: 4,
      },
    ])
  }
}
