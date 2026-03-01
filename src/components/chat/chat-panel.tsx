'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { getPusherClient } from '@/lib/pusher-client'
import { csrfFetch } from '@/lib/csrf'
import type { Message } from '@/types'
import { Send, Phone, Video } from 'lucide-react'

interface ChatPanelProps {
  bookingId: string
  currentUserId: string
  otherUserName: string
  onCallStart?: (video: boolean) => void
  embedded?: boolean
}

function getInitials(name: string) {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

function formatTime(dateStr: string, yesterdayLabel: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const isYesterday = d.toDateString() === yesterday.toDateString()

  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (isToday) return time
  if (isYesterday) return `${yesterdayLabel} ${time}`
  return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${time}`
}

export function ChatPanel({ bookingId, currentUserId, otherUserName, onCallStart, embedded }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const t = useTranslations('chat')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // Load existing messages
  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/chat?booking_id=${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
      setLoading(false)
    }
    load()
  }, [bookingId])

  // Subscribe to realtime via Pusher
  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`chat-${bookingId}`)

    channel.bind('new-message', (newMsg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })
    })

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`chat-${bookingId}`)
    }
  }, [bookingId])

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    setSending(true)
    setInput('')

    // Optimistic insert
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      booking_id: bookingId,
      sender_id: currentUserId,
      content: text,
      type: 'text',
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    const res = await csrfFetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: bookingId, content: text }),
    })

    if (res.ok) {
      const real = await res.json()
      // Replace optimistic with real
      setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? real : m)))
    } else {
      // Remove optimistic on error
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
    }
    setSending(false)
    inputRef.current?.focus()
  }

  return (
    <div className={`flex flex-col h-full overflow-hidden ${embedded ? '' : 'rounded-2xl border'}`} style={embedded ? { background: 'white' } : { borderColor: 'var(--border)', background: 'white' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'var(--ink)' }}
          >
            {getInitials(otherUserName)}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink)' }}>{otherUserName}</p>
            <p className="text-xs" style={{ color: 'var(--muted)' }}>{t('bookingChat')}</p>
          </div>
        </div>
        {onCallStart && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onCallStart(false)}
              className="p-2 rounded-lg transition-colors hover:bg-stone-50"
              title={t('voiceCall')}
              style={{ color: 'var(--warm-stone)' }}
            >
              <Phone className="h-4 w-4" />
            </button>
            <button
              onClick={() => onCallStart(true)}
              className="p-2 rounded-lg transition-colors hover:bg-stone-50"
              title={t('videoCall')}
              style={{ color: 'var(--warm-stone)' }}
            >
              <Video className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3" style={{ background: 'var(--canvas)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>{t('loadingMessages')}</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--parchment)' }}>
              <Send className="h-6 w-6" style={{ color: 'var(--muted)' }} />
            </div>
            <p className="font-display text-lg font-semibold mb-1" style={{ color: 'var(--ink)' }}>{t('startConversation')}</p>
            <p className="text-xs max-w-xs" style={{ color: 'var(--warm-stone)' }}>
              {t('discussWith', { name: otherUserName })}
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isMe = msg.sender_id === currentUserId
              const isSystem = msg.type === 'system' || msg.type === 'call_started' || msg.type === 'call_ended'
              const showTimestamp =
                i === 0 ||
                new Date(msg.created_at).getTime() - new Date(messages[i - 1].created_at).getTime() > 300_000

              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <div className="text-center my-3">
                      <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ color: 'var(--muted)', background: 'var(--parchment)' }}>
                        {formatTime(msg.created_at, t('yesterday'))}
                      </span>
                    </div>
                  )}
                  {isSystem ? (
                    <div className="text-center">
                      <span className="text-xs italic" style={{ color: 'var(--muted)' }}>{msg.content}</span>
                    </div>
                  ) : (
                    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                          isMe
                            ? 'rounded-br-md'
                            : 'rounded-bl-md'
                        }`}
                        style={
                          isMe
                            ? { background: 'var(--ink)', color: 'white' }
                            : { background: 'white', color: 'var(--ink)', border: '1px solid var(--border)' }
                        }
                      >
                        {msg.content}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 px-4 py-3 border-t" style={{ borderColor: 'var(--border)', background: 'white' }}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('typePlaceholder')}
          className="flex-1 text-sm px-4 py-2.5 rounded-xl border outline-none transition-colors focus:border-[#C8892A]"
          style={{ borderColor: 'var(--border)', background: 'var(--canvas)', color: 'var(--ink)' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
          style={{ background: 'var(--ink)', color: 'white' }}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
