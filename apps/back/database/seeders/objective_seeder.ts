import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Objective from '#models/objective'

export default class extends BaseSeeder {
  async run() {
    await Objective.createMany([
      {
        description: 'building_look_like_face',
        category_id: 1,
      },
      {
        description: 'hide_animal_background',
        category_id: 1,
      },
      {
        description: 'ridiculously_small_huge_door',
        category_id: 1,
      },
      {
        description: 'strange_statue',
        category_id: 1,
      },
      {
        description: 'whole_thing_tilts_dangerously',
        category_id: 1,
      },
      {
        description: 'character_ridiculous_accessory',
        category_id: 2,
      },
      {
        description: 'element_pop_culture',
        category_id: 2,
      },
      {
        description: 'look_sad',
        category_id: 2,
      },
      {
        description: 'overly_large_moustache',
        category_id: 2,
      },
      {
        description: 'tatoo_secret_symbol_body',
        category_id: 2,
      },
      {
        description: 'creature_look_famous_people',
        category_id: 3,
      },
      {
        description: 'creature_sunglasses',
        category_id: 3,
      },
      {
        description: 'element_out_of_context',
        category_id: 3,
      },
      {
        description: 'excessively_long_tail',
        category_id: 3,
      },
      {
        description: 'ten_eyes',
        category_id: 3,
      },
      {
        description: 'machine_expressive_face',
        category_id: 4,
      },
      {
        description: 'machine_look_like_animal',
        category_id: 4,
      },
      {
        description: 'many_wheels',
        category_id: 4,
      },
      {
        description: 'red_button',
        category_id: 4,
      },
      {
        description: 'unnecessary_element',
        category_id: 4,
      },
      {
        description: 'detail_human_face',
        category_id: 5,
      },
      {
        description: 'hide_object_out_context',
        category_id: 5,
      },
      {
        description: 'modern_anachronistic_element',
        category_id: 5,
      },
      {
        description: 'something_look_sad_scared',
        category_id: 5,
      },
      {
        description: 'tiny_creature_background',
        category_id: 5,
      },
    ])
  }
}
