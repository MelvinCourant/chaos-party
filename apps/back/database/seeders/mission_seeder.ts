import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Mission from '#models/mission'

export default class extends BaseSeeder {
  async run() {
    await Mission.createMany([
      {
        description: 'building_future',
        category_id: 1,
      },
      {
        description: 'cyberpunk_district',
        category_id: 1,
      },
      {
        description: 'floating_city_sky',
        category_id: 1,
      },
      {
        description: 'hidden_temple',
        category_id: 1,
      },
      {
        description: 'impregnable_fortress',
        category_id: 1,
      },
      {
        description: 'king_queen_fantasy',
        category_id: 2,
      },
      {
        description: 'legendary_pirate',
        category_id: 2,
      },
      {
        description: 'mad_scientist',
        category_id: 2,
      },
      {
        description: 'superhero_never_seen',
        category_id: 2,
      },
      {
        description: 'warrior_parallel',
        category_id: 2,
      },
      {
        description: 'alien_unknown_planet',
        category_id: 3,
      },
      {
        description: 'cute_animal_strange',
        category_id: 3,
      },
      {
        description: 'dragon_never_seen',
        category_id: 3,
      },
      {
        description: 'half_human_animal',
        category_id: 3,
      },
      {
        description: 'terrifying_monster_abyss',
        category_id: 3,
      },
      {
        description: 'everyday_robot_assistant',
        category_id: 4,
      },
      {
        description: 'machine_flying_space',
        category_id: 4,
      },
      {
        description: 'machine_turns_food',
        category_id: 4,
      },
      {
        description: 'secret_weapon',
        category_id: 4,
      },
      {
        description: 'vehicle_future',
        category_id: 4,
      },
      {
        description: 'desert_island_paradise',
        category_id: 5,
      },
      {
        description: 'distant_unknown_planet',
        category_id: 5,
      },
      {
        description: 'enchanted_forest',
        category_id: 5,
      },
      {
        description: 'giant_mushroom_civilisation',
        category_id: 5,
      },
      {
        description: 'volcano_full_eruption',
        category_id: 5,
      },
    ])
  }
}
