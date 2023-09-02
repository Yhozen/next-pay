import { FilterQuery, UpdateQuery } from 'mongoose'
import Container, { Service, Token } from 'typedi'

import { SupportedCurrenciesType } from '../constants/supported-currencies'
import type { NextPayOrderStatus } from '../types/pay-order-status.type'
export type CreateOrderParams = {
  serviceName: string
  externalId: string
  currency: SupportedCurrenciesType
  referenceId: string
  amount: string
  clientName?: string
}

export class Order {
  public id!: string
  public externalId!: string
  public serviceName!: string
  public currency!: SupportedCurrenciesType
  public amount!: string
  public status!: NextPayOrderStatus
  public clientName?: string
  public referenceId!: string
}

export type WithTransactionCallback<T, Ctx> = (ctx: Ctx) => Promise<T>

type PlaceholderCTX = { __type: 'PlaceholderCTX' }

@Service()
export abstract class Data<CTX = PlaceholderCTX> {
  public abstract callWithCtx<T>(
    callback: WithTransactionCallback<T, CTX>,
  ): Promise<T>
  async startTransaction<T>(
    callback: WithTransactionCallback<T, CTX>,
  ): Promise<T> {
    return this.callWithCtx(callback)
  }

  static create() {
    return Container.get(this as Token<Data<any>>)
  }

  async createOrder(value: CreateOrderParams, ctx: CTX): Promise<Order> {
    throw new Error('you must implement createOrder')

    return {} as Order
  }

  async updateOrder(
    find: FilterQuery<Order>,
    update: UpdateQuery<Order>,
    ctx?: CTX,
  ): Promise<Order> {
    throw new Error('you must implement createOrder')

    return {} as Order
  }

  async getOrderByExternalId(value: string): Promise<Order | null> {
    throw new Error('you must implement getOrderByExternalId')

    return {} as Order
  }
  async getOrderById(value: string): Promise<Order | null> {
    throw new Error('you must implement getOrderByExternalId')

    return {} as Order
  }
}

export type DataService = typeof Data<any>
