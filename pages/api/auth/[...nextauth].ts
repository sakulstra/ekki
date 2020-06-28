import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

// For more information on options, go to
// https://next-auth.js.org/configuration/options
const options = {
  site: process.env.VERCEL_URL || process.env.BASE_URL,
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  secret: process.env.SECRET,

  session: {
    jwt: true,
  },

  pages: {},

  callbacks: {
    session: (session, token) => {
      session.user.id = token.account.id
      return Promise.resolve(session)
    },
  },
  events: {},
  debug: false,
}

export default (req, res) => NextAuth(req, res, options)
