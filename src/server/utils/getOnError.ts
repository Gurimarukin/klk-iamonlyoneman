import { date, io } from 'fp-ts'
import { flow, pipe } from 'fp-ts/function'

import type { NotUsed } from '../../shared/utils/fp'
import { Either, toNotUsed } from '../../shared/utils/fp'

import { consoleLogFormat } from '../models/logger/LoggerGetter'
import { LoggerType } from '../models/logger/LoggerType'
import { utilInspect } from './utilInspect'

export const getOnError =
  (logger: LoggerType) =>
  (e: Error): io.IO<NotUsed> =>
    pipe(
      logger.error(e),
      io.chain(
        Either.fold(
          () =>
            pipe(
              date.now,
              io.map(
                flow(
                  d => new Date(d),
                  consoleLogFormat('LogUtils', 'error', utilInspect(e)),
                  console.error,
                  toNotUsed,
                ),
              ),
            ),
          io.of,
        ),
      ),
    )
