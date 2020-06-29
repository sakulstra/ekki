import { Provider } from 'next-auth/client'
import { baseUrl } from '@utils/constants'

export default ({ Component, pageProps }) => {
  const { session } = pageProps
  return (
    <Provider options={{ site: baseUrl }} session={session}>
      <Component {...pageProps} />
    </Provider>
  )
}
