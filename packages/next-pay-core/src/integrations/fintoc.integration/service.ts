import axios from 'axios'
import { Logger } from '../../services/logger.service'
import { Inject, Service } from 'typedi'
import { wrapWithLogger } from './wrapWithLogger'

const url = 'https://api.fintoc.com/v1/payment_intents'

@Service()
export class FintocService {
  @Inject()
  loggerService!: Logger
  getRecipientAccount = () => {
    // hardcoded test account
    return {
      type: 'checking_account',
      number: '422159212',
      holder_id: '415792638',
      institution_id: 'cl_banco_bci',
    }
  }

  private _createPayment = async ({
    amount,
    currency,
    secretKey,
    orderId,
  }: {
    secretKey: string
    amount: number
    orderId: string
    currency: string
  }) => {
    const headers = {
      Authorization: secretKey,
      'Content-Type': 'application/json',
    }
    const data = {
      amount,
      currency,
      metadata: { orderId },
      // recipient_account: this.getRecipientAccount(),
    }

    const response = await axios.post(url, data, { headers })

    return response.data
  }
  createPayment = ({
    amount,
    currency,
    secretKey,
    orderId,
  }: {
    secretKey: string
    amount: number
    orderId: string
    currency: string
  }) =>
    wrapWithLogger(
      this.loggerService,
      this._createPayment,
    )({
      amount,
      currency,
      secretKey,
      orderId,
    })
}
