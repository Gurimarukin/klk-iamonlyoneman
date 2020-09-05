import { IndexSpecification as MongoIndexSpec } from 'mongodb'

export interface IndexSpecification<A> extends MongoIndexSpec {
  key: {
    [B in keyof A]?: 1 | -1 | 'text'
  }
}
