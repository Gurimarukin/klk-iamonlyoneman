import { Tuple3 } from '../../../shared/utils/fp'
import { EndedMiddleware } from '../../models/EndedMiddleware'

type Method = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head'
type Path = string

export type Route = Tuple3<Method, Path, EndedMiddleware>
