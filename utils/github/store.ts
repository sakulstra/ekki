import { ClientContext, HIDDEN } from '@utils/handler/types'
import { IssueContext } from './context'
import { getIssue, updateIssue } from './issue'

export const saveStore = async (
  context: IssueContext | ClientContext,
  store: Map<string, string | number>
) => {
  const currentIssue = await getIssue(context)
  let resultBody = currentIssue.data.body
  const before =
    resultBody.split(HIDDEN.storeStart(context.installationId))[0] || ''
  const after =
    resultBody.split(HIDDEN.storeStop(context.installationId))[1] || ''
  resultBody =
    before.trim() +
    '\n\n' +
    HIDDEN.storeStart(context.installationId) +
    JSON.stringify(Array.from(store)) +
    HIDDEN.storeStop(context.installationId) +
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
  if (!resultBody.includes(HIDDEN.storeStart(context.installationId)))
    return new Map<string, string | number>()
  const rawStore = resultBody
    .split(HIDDEN.storeStart(context.installationId))[1]
    .split(HIDDEN.storeStop(context.installationId))[0]
    .trim()
  return new Map<string, string | number>(JSON.parse(rawStore))
}
