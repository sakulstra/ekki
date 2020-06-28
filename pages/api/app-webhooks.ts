import { NextApiRequest, NextApiResponse } from 'next'
import { handleClientAction } from './handler/clientActionHandler'
import { ClientInput } from './handler/types'

export enum APP_EVENTS {
  pokerCall = 'poker_call',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = JSON.parse(req.body) as ClientInput
    const isValidWebhook = Object.values(APP_EVENTS).includes(body.type)
    if (isValidWebhook) {
      res.statusCode = 200
      await handleClientAction(body)
      // eslint-disable-next-line @typescript-eslint/camelcase
      const { repo, owner, issue_number } = body.params
      res.end(
        JSON.stringify(
          // eslint-disable-next-line @typescript-eslint/camelcase
          `https://github.com/${owner}/${repo}/issues/${issue_number}`
        )
      )
    } else {
      res.statusCode = 401
      res.end()
    }
  } catch (e) {
    res.statusCode = 502
    console.error('could not verify webhook:', e)
    res.end()
  }
}

export default handler
