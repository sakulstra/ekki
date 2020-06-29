import { NextApiRequest, NextApiResponse } from 'next'
import { report, log } from 'utils/logger'
import { handleClientAction } from '@utils/handler/clientActionHandler'
import { ClientInput } from '@utils/handler/types'

export enum APP_EVENTS {
  pokerCall = 'poker_call',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const body = JSON.parse(req.body) as ClientInput
    log(body)
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
    }

    if (!isValidWebhook) {
      res.statusCode = 400
      report('could not verify webhook:', body)
      res.json({
        status: 'unknown operation',
        type: body.type,
        // eslint-disable-next-line @typescript-eslint/camelcase
        nextUrl: `https://github.com/${owner}/${repo}/issues/${issue_number}`,
      })
    }
  } catch (e) {
    res.statusCode = 500
    report('could not perform operation', e)
    res.json({ status: 'internal server error' })
  }
}

export default handler
