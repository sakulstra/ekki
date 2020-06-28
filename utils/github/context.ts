import { createAppAuth } from '@octokit/auth-app'
import { request as baseRequest } from '@octokit/request'
import { Webhooks } from '@octokit/webhooks'
import { base64decode } from '@utils/common'
import { RequestInterface } from '@octokit/auth-app/dist-types/types'

export type WebhookContext = {
  request: RequestInterface
  installationId: string
  issue: {
    owner: string
    repo: string
    // eslint-disable-next-line camelcase
    issue_number: number
  }
}

export type IssueContext = WebhookContext & {
  payload: Webhooks.WebhookPayloadIssueComment
}

export const getIssueContext = (
  webhook: Webhooks.WebhookPayloadIssueComment
): IssueContext => {
  const privateKey = base64decode(process.env.GITHUB_APP_PRIVATE_KEY_BASE64)
  const auth = createAppAuth({
    id: parseInt(process.env.GITHUB_APP_ID as string),
    privateKey,
    installationId: (webhook as any).installation.id,
  })

  const requestWithAuth = baseRequest.defaults({
    request: {
      hook: auth.hook,
    },
    mediaType: {
      previews: ['machine-man'],
    },
  })

  return {
    request: requestWithAuth,
    payload: webhook,
    installationId: (webhook as any).installation.id,
    issue: {
      owner: webhook.repository.owner.login,
      repo: webhook.repository.name,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: webhook.issue.number,
    },
  }
}
