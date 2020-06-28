export {}

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: 'test' | 'development' | 'production'
      GITHUB_APP_ID: string
      GITHUB_CLIENT_ID: string
      GITHUB_CLIENT_SECRET: string
      GITHUB_WEBHOOK_SECRET: string
      GITHUB_APP_PRIVATE_KEY_BASE64: string
      SMEE_WEBHOOK_URL: string
      BASE_URL: string
      VERCEL_URL: string
    }
  }
}
