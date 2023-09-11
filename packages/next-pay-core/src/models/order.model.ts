import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

import {
  type SupportedCurrenciesType,
  SupportedCurrencies,
} from '../constants/supported-currencies'
import { NextPayOrderStatus } from '../types/pay-order-status.type'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrderClass extends Base {} // have the interface to add the types of "Base" to the class

@modelOptions({ options: { customName: 'Orders' } })
export class OrderClass extends TimeStamps {
  @prop()
  public externalId!: string
  @prop()
  public serviceName!: string

  @prop({ enum: SupportedCurrencies, type: String })
  public currency!: SupportedCurrenciesType

  @prop()
  public amount!: string

  @prop({
    enum: NextPayOrderStatus,
    default: NextPayOrderStatus.PENDING,
    type: String,
  })
  public status!: NextPayOrderStatus

  @prop({ required: false })
  public clientName?: string

  @prop({ required: true })
  public referenceId!: string
}

export const OrderModel = getModelForClass(OrderClass)
