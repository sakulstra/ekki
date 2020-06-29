import { useSession } from 'next-auth/client'

export const Home = (): JSX.Element => {
  const [session] = useSession()

  return (
    <p>
      {process.env.VERCEL_URL || 'fart'}
      {!session && (
        <>
          Not signed in <br />
          <a href="/api/auth/signin">Sign in</a>
        </>
      )}
      {session && (
        <>
          Signed in as {session.user.email} ({session.user.id}) <br />
          <a href="/api/auth/signout">Sign out</a>
        </>
      )}
    </p>
  )
}

export default Home
