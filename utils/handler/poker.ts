import { COMMAND } from '@utils/handler/issueCommentHandler'
import { ClientContext } from '@utils/handler/types'
import { IssueContext } from '@utils/github/context'
import { saveToStore, getStore } from '@utils/github/store'
import {
  deleteCommentsBulk,
  deleteComment,
  comment,
  getComment,
  replaceComment,
  hideComment,
} from '@utils/github/comment'
import { MarkdownText, markdownUrl, collapsible } from '@utils/text'
import { numberToWord, getEstimations } from '@utils/math'
import { debug } from '@utils/logger'
import { baseUrl } from '@utils/constants'

const allowedPokerValues = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89]

export enum SAVE_KEYS {
  POKER_RESULT_MAP = 'POKER_RESULT_MAP',
  POKER_COMMENT_ID = 'POKER_COMMENT_ID',
}

const POKER_HIDDENTEXT = {
  deleteReset: (installationId: string) =>
    `<!-- ekki:${installationId}:deleteResetPoker -->`,
  pokerResultStart: (installationId: string) =>
    `<!-- ekki:${installationId}:pokerResult:start -->`,
  pokerResultEnd: (installationId: string) =>
    `<!-- ekki:${installationId}:pokerResult:end -->`,
}

const savePokerMap = (
  context: IssueContext | ClientContext,
  pokerMap: Map<string, number>
) => {
  return saveToStore(context, {
    key: SAVE_KEYS.POKER_RESULT_MAP,
    value: JSON.stringify(Array.from(pokerMap)),
  })
}

const getPokerMapFromString = (pokermapString: string) =>
  new Map<string, number>(JSON.parse(pokermapString))

const resetPoker = (context: IssueContext) => {
  return Promise.all([
    // remove all poker-related comments
    deleteCommentsBulk(context, [
      POKER_HIDDENTEXT.deleteReset(context.installationId),
    ]),
    // overwrite the poker results map
    savePokerMap(context, new Map<string, number>()),
  ])
}

export const startPoker = async (context: IssueContext) => {
  const { issue, installationId } = context
  await resetPoker(context)
  await deleteComment(context)
  const body = new MarkdownText(`### poker round started`)
    .addLine(
      '- klick on one of these links to call: ' +
        `**${allowedPokerValues
          .map((fibo) =>
            markdownUrl(
              fibo.toString(),
              `${baseUrl}/${installationId}/${issue.owner}/${issue.repo}/${issue.issue_number}/call/${fibo}`
            )
          )
          .join(', ')}**`
    )
    .addLine(`- comment \`${COMMAND.show}\` to end the round`)
    .addLine(POKER_HIDDENTEXT.deleteReset(context.installationId))
    .addLine(
      POKER_HIDDENTEXT.pokerResultStart(installationId) +
        POKER_HIDDENTEXT.pokerResultEnd(installationId)
    )
    .get()
  const result = await comment(context, body)
  await saveToStore(context, {
    key: SAVE_KEYS.POKER_COMMENT_ID,
    value: result.data.id,
  })
}

export const getPokerMap = async (context: IssueContext | ClientContext) => {
  const currentStore = await getStore(context)
  return (
    getPokerMapFromString(
      currentStore.get(SAVE_KEYS.POKER_RESULT_MAP) as string
    ) || new Map<string, number>()
  )
}

export const call = async (context: ClientContext) => {
  debug('received a call')
  // get state
  const currentStore = await getStore(context)
  const pokerMap = await getPokerMap(context)
  // modify state
  pokerMap.set(context.params.login, parseInt(context.params.value))
  debug(pokerMap)
  await savePokerMap(context, pokerMap)

  const pokerComment = await getComment(
    context,
    currentStore.get(SAVE_KEYS.POKER_COMMENT_ID) as number
  )
  const userVotedString = `- **${numberToWord(pokerMap.size)}** user${
    pokerMap.size > 1 ? 's' : ''
  } already voted: @${Array.from(pokerMap.keys()).join(', @')}`
  debug(userVotedString)
  const before = POKER_HIDDENTEXT.pokerResultStart(context.installationId)
  const after = POKER_HIDDENTEXT.pokerResultEnd(context.installationId)
  const newBody = pokerComment.data.body.replace(
    new RegExp(before + '\n*(.*)\n*' + after),
    before + '\n' + userVotedString + '\n' + after
  )
  debug(newBody)
  return replaceComment(
    context,
    newBody,
    currentStore.get(SAVE_KEYS.POKER_COMMENT_ID) as number
  )
}

export const endPoker = async (context: IssueContext) => {
  // first delete the comment
  await deleteComment(context)
  // get store values
  const currentStore = await getStore(context)
  const pokerMap = await getPokerMap(context)
  // calculate
  const { avg, median, near } = getEstimations(pokerMap, allowedPokerValues)

  // generate the table to be shown in details
  let table = Array.from(pokerMap).map((entry) => {
    return `|${entry[0]}|${entry[1]}|`
  })
  table = ['|user|call|', '|---|---|'].concat(table).concat()

  // assemble the body
  const newBody = new MarkdownText()
    .addLine('# **results are in!** :tada:')
    .addLine(
      `- **${numberToWord(pokerMap.size)}** user${
        pokerMap.size > 1 ? 's' : ''
      } voted **${avg}** on *average*`
    )
    .addLine(`- **${near}** is the *nearest* allowed value`)
    .addLine(`- **${median}** is the *median* vote`)
    .addLine(`- enter \`/estimate\` to log the *median*`)
    .addLine(`- enter \`/estimate <value>\` to log a custom value`)
    .addLine(collapsible(table.join('\n'), 'details'))
    .addLine(POKER_HIDDENTEXT.deleteReset(context.installationId))
    .get()

  await replaceComment(
    context,
    newBody,
    currentStore.get(SAVE_KEYS.POKER_COMMENT_ID) as number
  )
}

export const estimate = async (context: IssueContext, params: string[]) => {
  // cleanup
  await deleteComment(context)
  const currentStore = await getStore(context)
  await hideComment(
    context,
    currentStore.get(SAVE_KEYS.POKER_COMMENT_ID) as number
  )

  // set estimation labels
  const setEstimation = async (value: number) => {
    await context.request(
      'POST /repos/:owner/:repo/issues/:issue_number/labels',
      {
        ...context.issue,
        labels: [`est:${value}`, 'est'],
      }
    )
  }

  // find fitting value for estimation
  if (params.length === 0) {
    const pokerMap = await getPokerMap(context)
    const { median } = getEstimations(pokerMap, allowedPokerValues)
    await setEstimation(median)
  } else {
    await setEstimation(parseInt(params[0]))
  }
}
