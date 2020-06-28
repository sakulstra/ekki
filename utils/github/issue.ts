import { ClientContext } from '@utils/handler/types'
import { IssueContext } from './context'

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
