import { APP_EVENTS } from '../pages/api/app-webhooks'
import { ClientInput } from '../pages/api/handler/types'

export const postAppWebhook = async (type: APP_EVENTS, params: ClientInput) => {
  const res = await fetch(
    `${process.env.VERCEL_URL || process.env.BASE_URL}/api/app-webhooks`,
    {
      method: 'POST',
      body: JSON.stringify({
        type,
        params,
      }),
    }
  )

  return res.json()
}
