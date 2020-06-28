import { Webhooks } from '@octokit/webhooks'
import { NextApiRequest, NextApiResponse } from 'next'
import { report } from '@utils/logger'
import { handleIssueComment } from '@utils/handler/issueCommentHandler'

const webhooks = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET as string,
})

enum GITHUB_EVENTS {
  issueComment = 'issue_comment',
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const isValidWebhook = webhooks.verify(
      req.body,
      req.headers['x-hub-signature'] as string
    )
    const eventName = req.headers['x-github-event']
    if (isValidWebhook) {
      res.statusCode = 200
      if (eventName === GITHUB_EVENTS.issueComment)
        await handleIssueComment(req.body)
      res.json({ status: 'ok' })
    } else {
      res.statusCode = 401
      res.json({ status: 'not authorized' })
    }
  } catch (e) {
    report('could not verify webhook:', e)
    res.statusCode = 502
    res.json({ status: 'internal server error' })
  }
}

export default handler
