import mongoose from 'mongoose'

import dbConnect from './mongo'

export type ClientSession = mongoose.ClientSession

async function _withTransaction(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (session: ClientSession) => Promise<any>,
  existingSession?: ClientSession,
): Promise<void> {
  await dbConnect()

  if (existingSession) {
    if (existingSession.inTransaction()) return fn(existingSession)

    return mongoose.connection.transaction(fn)
  }

  const session = await mongoose.startSession()

  try {
    await mongoose.connection.transaction(fn)
  } finally {
    session.endSession()
  }
}

export type WithTransactionCallback<T> = (session: ClientSession) => Promise<T>

export const withTransaction = async <T>(
  fn: WithTransactionCallback<T>,
  existingSession?: ClientSession,
): Promise<T> => {
  return new Promise((res, rej) => {
    _withTransaction(async session => {
      const value = await fn(session)

      res(value)
    }, existingSession).catch(rej)
  })
}
