import { Route } from '../models/Route'
import { KlkPostController } from '../controllers/KlkPostController'

export const Routes = (klkPostController: KlkPostController): Route[] => [
  ['get', '/klk-posts', klkPostController.listAll],
]
