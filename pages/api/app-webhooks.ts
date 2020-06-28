import { NextApiRequest, NextApiResponse } from 'next'
import { handleClientAction } from './handler/clientActionHandler'
import { ClientInput } from './handler/types'

export enum APP_EVENTS {
  pokerCall = 'poker_call',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    console.log(req.body)
    const body = JSON.parse(req.body)
    console.log(body)
    // eslint-disable-next-line @typescript-eslint/camelcase
    const { repo, owner, issue_number } = body.params
    const isValidWebhook = Object.values(APP_EVENTS).includes(body.type)
    if (isValidWebhook) {
      res.statusCode = 200
      await handleClientAction(body)
      // eslint-disable-next-line @typescript-eslint/camelcase
      res.json({
        status: 'ok',
        // eslint-disable-next-line @typescript-eslint/camelcase
        nextUrl: `https://github.com/${owner}/${repo}/issues/${issue_number}`,
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
    console.error('could not verify webhook:', e)
    res.statusCode = 502
    res.json({ status: 'internal server error' })
  }
}

export default handler
