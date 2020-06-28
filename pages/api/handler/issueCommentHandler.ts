import { Webhooks } from '@octokit/webhooks'
import { log } from '../../../utils/logger'
import { getIssueContext } from './utils'
import { startPoker, endPoker, estimate } from './poker'

export enum COMMAND {
  poker = '/poker',
  show = '/show',
  estimate = '/estimate',
}

enum ACTION {
  created = 'created',
  edited = 'edited',
  deleted = 'deleted',
}

export const handleIssueComment = (
  content: Webhooks.WebhookPayloadIssueComment
) => {
  const command = content.comment.body.trim().split(' ')[0] as COMMAND
  const action = content.action as ACTION
  const params = content.comment.body.trim().split(' ')
  params.shift()

  if (
    Object.values(ACTION).includes(action) &&
    Object.values(COMMAND).includes(command)
  ) {
    const context = getIssueContext(content)

    if (action === ACTION.created && command === COMMAND.poker)
      return startPoker(context)

    if (action === ACTION.created && command === COMMAND.show)
      return endPoker(context)

    if (action === ACTION.created && command === COMMAND.estimate)
      return estimate(context, params)

    log('unhandled issue comment', action, command)
  }
}
