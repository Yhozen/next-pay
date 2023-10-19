import { Service } from 'typedi'

import type { PrismaClient } from '@prisma/client'
import type { ITXClientDenyList } from '@prisma/client/runtime/library'

import {
  CreateOrderParams,
  Data,
  DataService,
  Order,
  SupportedCurrenciesType,
  SupportedCurrencies,
  WithTransactionCallback,
  NextPayOrderStatusType,
  NextPayOrderStatus,
} from 'next-pay-data-service'

const isSupportedCurrency = (
  currency: string,
): currency is SupportedCurrenciesType => {
  return SupportedCurrencies.hasOwnProperty(currency)
}

const isNextPayOrderStatus = (
  status: string,
): status is NextPayOrderStatusType => {
  return NextPayOrderStatus.hasOwnProperty(status)
}

type PrismaTransaction = Omit<PrismaClient, ITXClientDenyList>

export const prismaAdapter = (p: PrismaClient): DataService => {
  @Service()
  class DataService extends Data<PrismaTransaction> {
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
      session: PrismaTransaction,
    ) {
      if (!isSupportedCurrency(currency))
        throw new Error('Unsupported currency')
      const order = await (session ?? p).nextPayOrder.create({
        data: {
          externalId,
          serviceName,
          currency,
          clientName,
          referenceId,
          amount,
        },
      })

      if (!order) throw new Error("couldn't create order")
      const finalStatus = order.status
      const finalCurrency = order.currency
      if (
        !isSupportedCurrency(finalCurrency) ||
        !isNextPayOrderStatus(finalStatus)
      )
        throw new Error('Unsupported currency or unsupported status')

      return {
        ...order,
        status: finalStatus,
        currency: finalCurrency,
        clientName: order.clientName ?? undefined,
      }
    }

    public async callWithCtx<T>(
      callback: WithTransactionCallback<T, PrismaTransaction>,
    ): Promise<T> {
      return p.$transaction(callback)
    }

    async updateOrder(
      find: Partial<Order>,
      update: Partial<Order>,
      session?: PrismaTransaction,
    ) {
      const order = (await (session ?? p).nextPayOrder.update({
        data: update,
        where: find as any,
      })) as Order

      if (!order) throw new Error("couldn't update order")
      return order
    }

    async getOrderByExternalId(externalId: string) {
      const order = (await p.nextPayOrder.findFirstOrThrow({
        where: { externalId },
      })) as Order

      return order
    }

    async getOrderById(id: string) {
      const order = (await p.nextPayOrder.findUniqueOrThrow({
        where: { id },
      })) as Order

      return order
    }
  }

  return DataService
}
