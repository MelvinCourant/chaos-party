/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import PartiesController from '#controllers/parties_controller'
import ModesController from '#controllers/modes_controller'

router
  .group(() => {
    const partiesController = new PartiesController()

    router.post('/create-party', async (data) => {
      return partiesController.create(data)
    })

    router.post('/join-party', async (data) => {
      return partiesController.join(data)
    })

    router.post('/party-details', async (data) => {
      return partiesController.show(data)
    })

    router.patch('/update-mode', async (data) => {
      return partiesController.updateMode(data)
    })
  })
  .prefix('api/parties')

router
  .group(() => {
    const modesController = new ModesController()

    router.get('/', async (data) => {
      return modesController.index(data)
    })
  })
  .prefix('api/modes')
