import { ClientContext } from '@utils/handler/types'
import { report } from '@utils/logger'
import { IssueContext } from './context'

export const getComment = (
  { request, issue }: IssueContext | ClientContext,
  commentId: number
) => {
  return request('GET /repos/:owner/:repo/issues/comments/:comment_id', {
    ...issue,
    // eslint-disable-next-line @typescript-eslint/camelcase
    comment_id: commentId,
  })
}

export const getAllComments = ({ request, issue }: IssueContext) => {
  return request('GET /repos/:owner/:repo/issues/:issue_number/comments', {
    ...issue,
  }).then((response) => response.data)
}

export const deleteComment = (
  { issue, payload, request }: IssueContext,
  commentId?: number
) => {
  return request('DELETE /repos/:owner/:repo/issues/comments/:comment_id', {
    ...issue,
    // eslint-disable-next-line @typescript-eslint/camelcase
    comment_id: commentId || payload.comment.id,
  }).catch((err) => {
    if (err.status === 404) {
      report('can not delete inexistent comment')
      return
    }
    throw err
  })
}

export const hideComment = async (
  context: IssueContext,
  commentId?: number
) => {
  const comment = await getComment(context, commentId)
  return context
    .request('POST /graphql', {
      query: `mutation MinimizeComment($input: MinimizeCommentInput!) {
      minimizeComment(input: $input) {
        minimizedComment {
          isMinimized
        }
      }
    }`,
      variables: {
        input: {
          subjectId: comment.data.node_id,
          classifier: 'OUTDATED',
        },
      },
    })
    .catch((err) => {
      if (err.status === 404) {
        report('can not hide inexistent comment')
        return
      }
      throw err
    })
    .then((res) => {
      if ((res as any).data.errors) {
        throw new Error((res as any).data)
      }
      return res
    })
}
export const replaceComment = (
  { issue, request }: IssueContext | ClientContext,
  body: string,
  // eslint-disable-next-line camelcase
  // eslint-disable-next-line @typescript-eslint/camelcase
  comment_id: number
) => {
  return request('PATCH /repos/:owner/:repo/issues/comments/:comment_id', {
    ...issue,
    // eslint-disable-next-line @typescript-eslint/camelcase
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
