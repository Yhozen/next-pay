import type { Connection, FilterQuery, UpdateQuery } from 'mongoose'
import { Service } from 'typedi'

import dbConnect from '../db/mongo'
import { ClientSession, withTransaction } from '../db/withTransaction'
import { PreMethodsHook } from '../decorators/pre-methods-hook.decorator'
import { getValueFrom } from '../helpers/integration.helpers'
import { OrderModel } from '../models/order.model'

import {
  CreateOrderParams,
  Data,
  DataService,
  Order,
  WithTransactionCallback,
} from '../services/data.service'

export const connectMongo = dbConnect

type GetConnection = () => Connection | Promise<Connection>

type MongoAdapterConfig = {
  connection: Connection | GetConnection
}

export const mongoAdapter = (config: MongoAdapterConfig): DataService => {
  const connection = getValueFrom(config.connection, [])

  async function preDataService() {
    await connection
  }

  @PreMethodsHook(() => preDataService())
  @Service()
  class DataService extends Data<ClientSession> {
    // eslint-disable-next-line max-params
    async createOrder(
      {
        serviceName,
        externalId,
        currency,
        clientName,
        referenceId,
        amount,
      }: CreateOrderParams,
      session: ClientSession,
    ) {
      const [order] = await OrderModel.create(
        [
          {
            externalId,
            serviceName,
            currency,
            clientName,
            referenceId,
            amount,
          },
        ],
        {
          session,
        },
      )

      if (!order) throw new Error("couldn't create order")

      return order
    }

    public async callWithCtx<T>(
      callback: WithTransactionCallback<T, ClientSession>,
    ): Promise<T> {
      const value = await withTransaction(async session => callback(session))
      return value
    }

    async updateOrder(
      find: FilterQuery<Order>,
      update: UpdateQuery<Order>,
      session?: ClientSession,
    ) {
      const order = await OrderModel.findOneAndUpdate(find, update, {
        session,
      }).lean()

      if (!order) throw new Error("couldn't update order")
      return order
    }

    async getOrderByExternalId(externalId: string) {
      const order = await OrderModel.findOne({ externalId }).lean()

      return order
    }

    async getOrderById(id: string) {
      const order = await OrderModel.findOne({ _id: id }).lean()

      return order
    }
  }

  return DataService
}
