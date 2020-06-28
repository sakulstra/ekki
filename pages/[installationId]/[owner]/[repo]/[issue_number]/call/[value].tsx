import { getSession, useSession, signin } from 'next-auth/client'

import { APP_EVENTS } from '../../../../../api/app-webhooks'
import { postAppWebhook } from '../../../../../../utils/app-webhook-client'

export async function getServerSideProps(context) {
  const { query } = context
  const session = await getSession(context)
  const data = await postAppWebhook(APP_EVENTS.pokerCall, {
    ...query,
    userId: session.user.id,
  })
  return { props: { data } }
}

const Post = ({ data }) => {
  const [session, loading] = useSession()

  if (!session && !loading) signin('github')

  if (data?.nextUrl && typeof window !== 'undefined') {
    window.location.href = data.nextUrl
  }

  return (
    <>
      {session && <p>Signed in as {session.user.email}</p>}
      {!session && <p>Signing in...</p>}
      {data?.nextUrl}
    </>
  )
}

export default Post
