import mongoose, { Connection } from 'mongoose'

mongoose.plugin(require('@meanie/mongoose-to-json'))

type GlobalWithMongoose = typeof globalThis & {
  mongoose: {
    conn: Connection | null
    promise: Promise<Connection | typeof import('mongoose')> | null
  }
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */

let cached = (global as GlobalWithMongoose).mongoose

if (!cached)
  cached = (global as GlobalWithMongoose).mongoose = {
    conn: null,
    promise: null,
  }

async function dbConnect(mongoDBUri?: string) {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  const uri = mongoDBUri ?? process.env.MONGODB_URI
  if (!uri) throw new Error('no MONGODB_URI')
  if (cached.conn) return cached.conn

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(uri, opts).then(mongoose => {
      return mongoose
    })
  }
  cached.conn = (await cached.promise) as Connection

  return cached.conn
}

export default dbConnect
