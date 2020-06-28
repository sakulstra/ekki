import { createAppAuth } from '@octokit/auth-app'
import { request as baseRequest } from '@octokit/request'
import { Webhooks } from '@octokit/webhooks'
import numToWords from 'number-to-words'
import { IssueContext, HIDDEN, ClientContext } from './types'

export const base64decode = (data: string | undefined) => {
  if (!data) throw new Error("can't decode undefined base64")
  const buff = Buffer.from(data, 'base64')
  return buff.toString('ascii')
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
      issue_number: webhook.issue.number,
    },
  }
}

export const numberToWord = (input: number) => numToWords.toWords(input)

export class MarkdownText {
  content: string = ''
  public get = () => this.content.trim()

  constructor(firstLine?: string) {
    if (firstLine) this.addLine(firstLine)
  }

  public addLine = (line: string) => {
    this.content += `${line}\n\n`
    return this
  }
}

export const markdownUrl = (title: string, url: string) => {
  return `[${title}](${url})`
}

export const closestInArray = (needle: number, haystack: number[]) => {
  return haystack.reduce((a, b) => {
    const aDiff = Math.abs(a - needle)
    const bDiff = Math.abs(b - needle)

    if (aDiff === bDiff) {
      return a > b ? a : b
    } else {
      return bDiff < aDiff ? b : a
    }
  })
}

export const average = (values: number[]) =>
  values.reduce((pre, acc) => pre + acc) / values.length

export const median = (values: number[]) => {
  if (values.length === 0) return 0

  values.sort(function (a, b) {
    return a - b
  })

  const half = Math.floor(values.length / 2)

  if (values.length % 2) return values[half]

  return (values[half - 1] + values[half]) / 2.0
}

export const getEstimations = (
  pokerMap: Map<string, number>,
  allowed: number[]
) => {
  const avg = average(Array.from(pokerMap.values()))
  return {
    avg,
    median: median(Array.from(pokerMap.values())),
    near: closestInArray(avg, allowed),
  }
}

export const getComment = (
  { request, issue }: IssueContext | ClientContext,
  commentId: number
) => {
  return request('GET /repos/:owner/:repo/issues/comments/:comment_id', {
    ...issue,
    comment_id: commentId,
  })
}

export const getAllComments = ({ request, issue }: IssueContext) => {
  return request('GET /repos/:owner/:repo/issues/:issue_number/comments', {
    ...issue,
  }).then((response) => response.data)
}

export const getIssue = ({ issue, request }: IssueContext | ClientContext) => {
  return request('GET /repos/:owner/:repo/issues/:issue_number', {
    ...issue,
  })
}

export const updateIssue = (
  { issue, request }: IssueContext | ClientContext,
  body: string
) => {
  return request('PATCH /repos/:owner/:repo/issues/:issue_number', {
    ...issue,
    body,
  })
}

export const deleteComment = (
  { issue, payload, request }: IssueContext,
  commentId?: number
) => {
  return request('DELETE /repos/:owner/:repo/issues/comments/:comment_id', {
    ...issue,
    comment_id: commentId || payload.comment.id,
  })
}

export const replaceComment = (
  { issue, request }: IssueContext | ClientContext,
  body: string,
  // eslint-disable-next-line camelcase
  comment_id: number
) => {
  return request('PATCH /repos/:owner/:repo/issues/comments/:comment_id', {
    ...issue,
    comment_id,
    body,
  })
}

export const deleteCommentsBulk = async (
  context: IssueContext,
  findWords: string[]
) => {
  const comments = await getAllComments(context)
  return Promise.all(
    comments.map((comment: any) => {
      if (findWords.some((v) => comment.body.includes(v))) {
        return deleteComment(context, comment.id)
      }
    })
  )
}

export const comment = ({ issue, request }: IssueContext, body: string) => {
  return request('POST /repos/:owner/:repo/issues/:issue_number/comments', {
    ...issue,
    body,
  })
}

export const saveStore = async (
  context: IssueContext | ClientContext,
  store: Map<string, string | number>
) => {
  const currentIssue = await getIssue(context)
  let resultBody = currentIssue.data.body
  const before = resultBody.split(HIDDEN.storeStart)[0] || ''
  const after = resultBody.split(HIDDEN.storeStop)[1] || ''
  resultBody =
    before.trim() +
    '\n\n' +
    HIDDEN.storeStart +
    JSON.stringify(Array.from(store)) +
    HIDDEN.storeStop +
    '\n\n' +
    after.trim()
  return updateIssue(context, resultBody.trim())
}

export const saveToStore = async (
  context: IssueContext | ClientContext,
  { key, value }: { key: string; value: string | number }
) => {
  const currentStore = await getStore(context)
  currentStore.set(key, value)
  return saveStore(context, currentStore)
}

export const getStore = async (context: IssueContext | ClientContext) => {
  const currentIssue = await getIssue(context)
  const resultBody = currentIssue.data.body
  if (!resultBody.includes(HIDDEN.storeStart))
    return new Map<string, string | number>()
  const rawStore = resultBody
    .split(HIDDEN.storeStart)[1]
    .split(HIDDEN.storeStop)[0]
    .trim()
  return new Map<string, string | number>(JSON.parse(rawStore))
}

export const collapsible = (input: string, title: string) => {
  return `<details>\n<summary>${title}</summary>\n\n${input}\n\n</details>`
}
