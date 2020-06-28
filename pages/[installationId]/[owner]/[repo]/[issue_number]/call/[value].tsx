import { getSession, useSession, signin } from 'next-auth/client'
import { APP_EVENTS } from '@api/app-webhooks'
import { ClientInput } from '@utils/handler/types'

export async function getServerSideProps({ req, params }) {
  const session = await getSession({ req })
  let data = {}
  if (session) {
    data = await fetch(
      `${process.env.VERCEL_URL || process.env.BASE_URL}/api/app-webhooks`,
      {
        method: 'POST',
        body: JSON.stringify({
          type: APP_EVENTS.pokerCall,
          params: {
            ...params,
            userId: session.user.id,
          },
        } as ClientInput),
      }
    ).then((res) => res.json())
  }

  return {
    props: { data }, // will be passed to the page component as props
  }
}

const Post = ({ data }) => {
  const [session, loading] = useSession()
  if (!session && !loading) signin('github')

  const redirect = () => {
    if (data?.nextUrl && typeof window !== 'undefined') {
      window.location.href = data.nextUrl
    }
    return true
  }

  return (
    <>
      {session?.user && redirect && (
        <p>Thank you for voting {session.user.email}</p>
      )}
      {!session && <p>Signing in...</p>}
    </>
  )
}

export default Post
