import { useSession, signin, getSession } from 'next-auth/client'
import { APP_EVENTS } from '@api/app-webhooks'
import { ClientInput } from '@utils/handler/types'
import { FunctionComponent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { baseUrl } from '@utils/constants'

type ResultComponentProps = {
  query: any
  session: any
}

const postVote = async (query, session) => {
  return (
    await fetch(baseUrl + `/api/app-webhooks`, {
      method: 'POST',
      body: JSON.stringify({
        type: APP_EVENTS.pokerCall,
        params: {
          ...query,
          userId: session.user.id,
        },
      } as ClientInput),
    })
  ).json()
}

export const Result: FunctionComponent<ResultComponentProps> = ({
  query,
  session,
}) => {
  const [nextUrl, setNextUrl] = useState<string>()

  useEffect(() => {
    postVote(query, session).then(async ({ nextUrl }) => {
      setNextUrl(nextUrl)
      window.location.replace(nextUrl)
    })
  }, [])

  return (
    <>
      {!nextUrl && <p>sending poker result</p>}
      {nextUrl && <pre>redirecting to: {nextUrl}</pre>}
    </>
  )
}

const Post = () => {
  const [session, loading] = useSession()
  if (!session && !loading) signin('github')
  const { query } = useRouter()
  return (
    <>
      {!session && <p>not authenticated</p>}
      {session && <Result query={query} session={session} />}
    </>
  )
}

Post.getInitialProps = async (context) => {
  const { res, query } = context
  const session = await getSession(context)
  if (session && res) {
    const { nextUrl } = await postVote(query, session)
    if (nextUrl) {
      res.writeHead(301, { Location: nextUrl })
      res.end()
    }
  }
  return {}
}

export default Post
