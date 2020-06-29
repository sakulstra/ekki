import { useSession, signin } from 'next-auth/client'
import { APP_EVENTS } from '@api/app-webhooks'
import { ClientInput } from '@utils/handler/types'
import { FunctionComponent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

type ResultComponentProps = {
  query: any
  session: any
}

export const Result: FunctionComponent<ResultComponentProps> = ({
  query,
  session,
}) => {
  const [data, setData] = useState({
    nextUrl: null,
  })

  useEffect(() => {
    fetch(`/api/app-webhooks`, {
      method: 'POST',
      body: JSON.stringify({
        type: APP_EVENTS.pokerCall,
        params: {
          ...query,
          userId: session.user.id,
        },
      } as ClientInput),
    }).then(async (res) => {
      setData(await res.json())
    })
  }, [])

  return (
    <>
      {!data.nextUrl && <p>sending poker result</p>}
      {data.nextUrl && <pre>{JSON.stringify(data)}</pre>}
      {typeof window !== 'undefined' &&
        data.nextUrl &&
        window.location.replace(data.nextUrl)}
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

export default Post
