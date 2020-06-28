import { createAppAuth } from '@octokit/auth-app'
import { request as baseRequest } from '@octokit/request'
import { APP_EVENTS } from '@api/app-webhooks'
import { base64decode } from '@api/handler/utils'
import { ClientInput, ClientContext } from '@api/handler/types'
import { call } from '@api/handler/poker'

const getClientContext = async (
  clientInput: ClientInput
): Promise<ClientContext> => {
  const privateKey = base64decode(process.env.GITHUB_APP_PRIVATE_KEY_BASE64)
  const auth = createAppAuth({
    id: parseInt(process.env.GITHUB_APP_ID as string),
    privateKey,
    installationId: parseInt(clientInput.params.installationId as string),
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
    params: {
      ...clientInput.params,
      // using the undocumented /user endpoint to get a user from an ID
      login: await requestWithAuth('GET /user/:userId', {
        userId: clientInput.params.userId,
      }).then((res) => res.data.login),
    },
    installationId: clientInput.params.installationId,
    issue: {
      ...clientInput.params,
      // eslint-disable-next-line @typescript-eslint/camelcase
      issue_number: parseInt(clientInput.params.issue_number),
    },
  }
}

export const handleClientAction = async (input: ClientInput) => {
  const type = input.type
  const context = await getClientContext(input)
  if (type === APP_EVENTS.pokerCall) return call(context)
}
