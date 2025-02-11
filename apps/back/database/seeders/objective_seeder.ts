import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Objective from '#models/objective'

export default class extends BaseSeeder {
  async run() {
    await Objective.createMany([
      {
        description: 'objectives.building_look_like_face',
        category_id: 1,
      },
      {
        description: 'objectives.hide_animal_background',
        category_id: 1,
      },
      {
        description: 'objectives.strange_statue',
        category_id: 1,
      },
      {
        description: 'objectives.ridiculously_small_huge_door',
        category_id: 1,
      },
      {
        description: 'objectives.whole_thing_tilts_dangerously',
        category_id: 1,
      },
      {
        description: 'objectives.overly_large_moustache',
        category_id: 2,
      },
      {
        description: 'objectives.character_ridiculous_accessory',
        category_id: 2,
      },
      {
        description: 'objectives.tatoo_secret_symbol_body',
        category_id: 2,
      },
      {
        description: 'objectives.look_sad',
        category_id: 2,
      },
      {
        description: 'objectives.element_pop_culture',
        category_id: 2,
      },
      {
        description: 'objectives.creature_sunglasses',
        category_id: 3,
      },
      {
        description: 'objectives.excessively_long_tail',
        category_id: 3,
      },
      {
        description: 'objectives.element_out_of_context',
        category_id: 3,
      },
      {
        description: 'objectives.creature_look_famous_people',
        category_id: 3,
      },
      {
        description: 'objectives.ten_eyes',
        category_id: 3,
      },
      {
        description: 'objectives.many_wheels',
        category_id: 4,
      },
      {
        description: 'objectives.machine_expressive_face',
        category_id: 4,
      },
      {
        description: 'objectives.unnecessary_element',
        category_id: 4,
      },
      {
        description: 'objectives.machine_look_like_animal',
        category_id: 4,
      },
      {
        description: 'objectives.red_button',
        category_id: 4,
      },
      {
        description: 'objectives.tiny_creature_background',
        category_id: 5,
      },
      {
        description: 'objectives.something_look_sad_scared',
        category_id: 5,
      },
      {
        description: 'objectives.hide_object_out_context',
        category_id: 5,
      },
      {
        description: 'objectives.modern_anachronistic_element',
        category_id: 5,
      },
      {
        description: 'objectives.detail_human_face',
        category_id: 5,
      },
    ])
  }
}
