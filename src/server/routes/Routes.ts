import { KlkPostController } from '../controllers/KlkPostController'
import { Route } from '../models/Route'

export const Routes = (klkPostController: KlkPostController): Route[] => [
  ['get', '/api/klk-posts', klkPostController.listAll],
]
