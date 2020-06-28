import { NextApiRequest, NextApiResponse } from 'next'
import { report } from 'utils/logger'
import { handleClientAction } from '@api/handler/clientActionHandler'
import { ClientInput } from '@api/handler/types'

export enum APP_EVENTS {
  pokerCall = 'poker_call',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = JSON.parse(req.body) as ClientInput
    // eslint-disable-next-line @typescript-eslint/camelcase
    const { repo, owner, issue_number } = body.params
    const isValidWebhook = Object.values(APP_EVENTS).includes(body.type)
    if (isValidWebhook) {
      res.statusCode = 200
      const result = await handleClientAction(body)
      // eslint-disable-next-line @typescript-eslint/camelcase
      res.json({
        status: 'ok',
        // eslint-disable-next-line @typescript-eslint/camelcase
        nextUrl: result.data.html_url,
      })
    } else {
      res.statusCode = 401
      res.json({
        status: 'not authorized',
        // eslint-disable-next-line @typescript-eslint/camelcase
        nextUrl: `https://github.com/${owner}/${repo}/issues/${issue_number}`,
      })
    }
  } catch (e) {
    report('could not verify webhook:', e)
    res.statusCode = 502
    res.json({ status: 'internal server error' })
  }
}

export default handler
