import { APP_EVENTS } from '../../pages/api/app-webhooks'
import { WebhookContext } from '@utils/github/context'

export type ClientInputParams = {
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

export type ClientContext = WebhookContext & {
  params: ClientInputParams & {
    login: string
  }
}

export const HIDDEN = {
  storeStart: (installationId: string) =>
    `<!-- ekki:${installationId}:store:start `,
  storeStop: (installationId: string) =>
    ` ekki:${installationId}:store:stop -->`,
}
