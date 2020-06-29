import { Provider } from 'next-auth/client'

export default ({ Component, pageProps }) => {
  const { session } = pageProps
  return (
    <Provider
      options={{ site: process.env.VERCEL_URL || process.env.BASE_URL }}
      session={session}
    >
      <Component {...pageProps} />
    </Provider>
  )
}
