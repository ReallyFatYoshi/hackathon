import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { pusherServer } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.text()
  const params = new URLSearchParams(body)
  const socketId = params.get('socket_id')!
  const channel = params.get('channel_name')!

  const authResponse = pusherServer.authorizeChannel(socketId, channel)
  return NextResponse.json(authResponse)
}
