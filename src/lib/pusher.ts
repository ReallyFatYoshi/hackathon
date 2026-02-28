import Pusher from 'pusher'

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  host: process.env.PUSHER_HOST || 'localhost',
  port: process.env.PUSHER_PORT || '6001',
  useTLS: process.env.NODE_ENV === 'production',
})
