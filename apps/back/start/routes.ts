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
  })
  .prefix('api/parties')
