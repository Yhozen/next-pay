import axios from 'axios'

const url = 'https://api.fintoc.com/v1/payment_intents'

const getRecipientAccount = () => {
  // hardcoded test account
  return {
    type: 'checking_account',
    number: '5233137377',
    holder_id: '416148503',
    institution_id: 'cl_banco_de_chile',
  }
}

export const createPayment = async ({
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
    recipient_account: getRecipientAccount(),
  }

  const response = await axios.post(url, data, { headers })

  return response.data
}
