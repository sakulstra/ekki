import { getSession } from 'next-auth/client'
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
  if (typeof window !== 'undefined') {
    window.location.href = data.nextUrl
  }
  return (
    <p>
      nothing to see here yet <pre>{JSON.stringify(data)}</pre>
    </p>
  )
}

export default Post
