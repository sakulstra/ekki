import { RequestInterface } from '@octokit/auth-app/dist-types/types'
import { Webhooks } from '@octokit/webhooks'
import { APP_EVENTS } from '../app-webhooks'

type ClientInputParams = {
  owner: string
  repo: string
  // eslint-disable-next-line camelcase
  issue_number: string
  installationId: string
  userId: number
  value: string
}

export type ClientInput = {
  type: APP_EVENTS
  params: ClientInputParams
}

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

export type ClientContext = WebhookContext & {
  params: ClientInputParams & {
    login: string
  }
}

export enum HIDDEN {
  storeStart = '<!-- ekki:store:start ',
  storeStop = ' ekki:store:stop -->',
}