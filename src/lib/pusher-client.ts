import PusherClient from 'pusher-js'

let pusherInstance: PusherClient | null = null

export function getPusherClient() {
  if (!pusherInstance) {
    pusherInstance = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      wsHost: process.env.NEXT_PUBLIC_PUSHER_HOST || 'localhost',
      wsPort: Number(process.env.NEXT_PUBLIC_PUSHER_PORT) || 6001,
      forceTLS: false,
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
      cluster: '',
    })
  }
  return pusherInstance
}
