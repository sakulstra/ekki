import { getSession } from 'next-auth/client'
import { APP_EVENTS } from '../../../../../api/app-webhooks'

export async function getServerSideProps(context) {
  const { query } = context
  const session = await getSession(context)

  const res = await fetch(
    `${process.env.VERCEL_URL || process.env.BASE_URL}/api/app-webhooks`,
    {
      method: 'POST',
      body: JSON.stringify({
        type: APP_EVENTS.pokerCall,
        params: { ...query, userId: session.user.id },
      }),
    }
  )

  const data = await res.json()

  return { props: { data } }
}

const Post = ({ data }) => {
  return <p>Post: {data}</p>
}

export default Post
