import { FilterQuery, UpdateQuery } from 'mongoose'
import { Service } from 'typedi'

import dbConnect from '../db/mongo'
import {
  ClientSession,
  withTransaction,
  WithTransactionCallback,
} from '../db/withTransaction'
import { OrderClass, OrderModel } from '../models/order.model'

import { PaymentRequest } from '../types/payment-request.type'
import { PreMethodsHook } from '../decorators/pre-methods-hook.decorator'
import { SupportedCurrenciesType } from '../constants/supported-currencies'

async function preDataService() {
  await dbConnect()
}

type CreateOrderParams = {
  serviceName: string
  externalId: string
  currency: SupportedCurrenciesType
  referenceId: string
  amount: string
  clientName?: string
  session?: ClientSession
}

@PreMethodsHook(() => preDataService())
@Service()
export class DataService {
  async startTransaction<T>(callback: WithTransactionCallback<T>) {
    return withTransaction(callback)
  }

  async createOther(paymentRequest: PaymentRequest) {
    console.log({ paymentRequest })
  }

  // eslint-disable-next-line max-params
  async createOrder({
    serviceName,
    externalId,
    currency,
    clientName,
    referenceId,
    session,
    amount,
  }: CreateOrderParams) {
    const [order] = await OrderModel.create(
      [{ externalId, serviceName, currency, clientName, referenceId, amount }],
      {
        session,
      },
    )

    return order
  }

  async updateOrder(
    find: FilterQuery<OrderClass>,
    update: UpdateQuery<OrderClass>,
    session?: ClientSession,
  ) {
    const order = await OrderModel.findOneAndUpdate(find, update, {
      session,
    }).lean()

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
