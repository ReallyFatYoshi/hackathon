'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { ChatPanel } from './chat-panel'
import { getPusherClient } from '@/lib/pusher-client'
import type { Message } from '@/types'
import {
  MessageSquare,
  ChefHat,
  User,
  ArrowLeft,
  Search,
  Circle,
} from 'lucide-react'

export interface Conversation {
  bookingId: string
  otherName: string
  otherImage?: string | null
  otherInitial: string
  eventTitle: string
  eventDate: string
  lastMessage?: string | null
  lastMessageAt?: string | null
  isFromMe: boolean
  status: string
}

interface MessagesViewProps {
  conversations: Conversation[]
  currentUserId: string
  role: 'client' | 'chef'
}

function getInitials(name: string) {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export function MessagesView({ conversations: initialConversations, currentUserId, role }: MessagesViewProps) {
  const t = useTranslations('chatView')
  const [conversations, setConversations] = useState(initialConversations)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [mobileShowChat, setMobileShowChat] = useState(false)

  const activeConv = conversations.find((c) => c.bookingId === activeId) ?? null

  // Listen for new messages across all conversations to update previews
  useEffect(() => {
    const pusher = getPusherClient()
    const channels = conversations.map((conv) => {
      const ch = pusher.subscribe(`chat-${conv.bookingId}`)
      ch.bind('new-message', (msg: Message) => {
        setConversations((prev) =>
          prev.map((c) =>
            c.bookingId === conv.bookingId
              ? {
                  ...c,
                  lastMessage: msg.content,
                  lastMessageAt: msg.created_at,
                  isFromMe: msg.sender_id === currentUserId,
                }
              : c
          )
        )
      })
      return ch
    })

    return () => {
      channels.forEach((ch) => {
        ch.unbind_all()
        pusher.unsubscribe(ch.name)
      })
    }
  }, [conversations.length, currentUserId])

  const selectConversation = useCallback((bookingId: string) => {
    setActiveId(bookingId)
    setMobileShowChat(true)
  }, [])

  const goBack = useCallback(() => {
    setMobileShowChat(false)
  }, [])

  const filtered = search.trim()
    ? conversations.filter(
        (c) =>
          c.otherName.toLowerCase().includes(search.toLowerCase()) ||
          c.eventTitle.toLowerCase().includes(search.toLowerCase())
      )
    : conversations

  // Sort by most recent message
  const sorted = [...filtered].sort((a, b) => {
    const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0
    const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0
    return bTime - aTime
  })

  return (
    <div
      className="flex -mx-6 -mt-6 -mb-6 h-[calc(100vh-8rem)] md:h-[calc(100vh-1rem)] rounded-none md:m-0 md:rounded-2xl md:h-[calc(100vh-2.5rem)] overflow-hidden border"
      style={{ borderColor: 'var(--border)', background: 'white' }}
    >
      {/* ── Conversation Sidebar ── */}
      <div
        className={`
          w-full md:w-[340px] lg:w-[380px] md:flex flex-col shrink-0 border-r
          ${mobileShowChat ? 'hidden' : 'flex'}
        `}
        style={{ borderColor: 'var(--border)', background: 'white' }}
      >
        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-3">
          <h2
            className="font-display text-xl font-semibold mb-3"
            style={{ color: 'var(--ink)' }}
          >
            {t('title')}
          </h2>
          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
              style={{ color: 'var(--muted)' }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full text-sm pl-10 pr-4 py-2.5 rounded-xl border outline-none transition-colors focus:border-[#C8892A]"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--canvas)',
                color: 'var(--ink)',
              }}
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'var(--parchment)' }}
              >
                <MessageSquare className="h-6 w-6" style={{ color: 'var(--muted)' }} />
              </div>
              <p className="font-display text-base font-semibold mb-1" style={{ color: 'var(--ink)' }}>
                {search ? t('noResults') : t('empty')}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                {search ? t('noResultsDesc') : t('emptyDesc')}
              </p>
            </div>
          ) : (
            sorted.map((conv) => {
              const isActive = conv.bookingId === activeId
              const AvatarIcon = role === 'client' ? ChefHat : User

              return (
                <button
                  key={conv.bookingId}
                  onClick={() => selectConversation(conv.bookingId)}
                  className="w-full flex items-center gap-3.5 px-5 py-3.5 text-left transition-all relative"
                  style={{
                    background: isActive ? '#C8892A08' : 'transparent',
                    borderLeft: isActive ? '3px solid #C8892A' : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'var(--canvas)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent'
                  }}
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <div
                      className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center"
                      style={{
                        background: isActive
                          ? 'linear-gradient(135deg, #C8892A 0%, #E8B86A 100%)'
                          : 'var(--parchment)',
                      }}
                    >
                      {conv.otherImage ? (
                        <img src={conv.otherImage} alt="" className="w-full h-full object-cover" />
                      ) : isActive ? (
                        <span className="text-white text-sm font-bold">
                          {getInitials(conv.otherName)}
                        </span>
                      ) : (
                        <AvatarIcon className="h-5 w-5" style={{ color: 'var(--muted)' }} />
                      )}
                    </div>
                    {conv.status === 'confirmed' && (
                      <Circle
                        className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 fill-emerald-400 stroke-white stroke-2"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: isActive ? '#C8892A' : 'var(--ink)' }}
                      >
                        {conv.otherName}
                      </p>
                      {conv.lastMessageAt && (
                        <span
                          className="text-[11px] shrink-0 tabular-nums"
                          style={{ color: 'var(--muted)' }}
                        >
                          {formatRelativeTime(conv.lastMessageAt)}
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{ color: 'var(--warm-stone)' }}
                    >
                      {conv.eventTitle}
                    </p>
                    {conv.lastMessage ? (
                      <p className="text-[13px] truncate mt-0.5" style={{ color: 'var(--muted)' }}>
                        {conv.isFromMe && (
                          <span style={{ color: 'var(--warm-stone)' }}>{t('you')} </span>
                        )}
                        {conv.lastMessage}
                      </p>
                    ) : (
                      <p className="text-[13px] italic mt-0.5" style={{ color: 'var(--muted)' }}>
                        {t('noMessages')}
                      </p>
                    )}
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Chat Panel ── */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          ${mobileShowChat ? 'flex' : 'hidden md:flex'}
        `}
      >
        {activeConv ? (
          <ActiveChat
            key={activeConv.bookingId}
            conv={activeConv}
            currentUserId={currentUserId}
            onBack={goBack}
            role={role}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <div
              className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
              style={{
                background: 'linear-gradient(135deg, #C8892A12 0%, #C8892A08 100%)',
                border: '1px solid #C8892A20',
              }}
            >
              <MessageSquare className="h-8 w-8" style={{ color: '#C8892A' }} />
            </div>
            <h3
              className="font-display text-xl font-semibold mb-2"
              style={{ color: 'var(--ink)' }}
            >
              {t('selectChat')}
            </h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--muted)' }}>
              {t('selectChatDesc')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Active Chat with WebRTC ── */
function ActiveChat({
  conv,
  currentUserId,
  onBack,
  role,
}: {
  conv: Conversation
  currentUserId: string
  onBack: () => void
  role: 'client' | 'chef'
}) {

  return (
    <div className="flex flex-col h-full">
      {/* Mobile back header */}
      <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={onBack}
          className="p-1.5 -ml-1.5 rounded-lg transition-colors hover:bg-stone-50"
          style={{ color: 'var(--warm-stone)' }}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #C8892A 0%, #E8B86A 100%)' }}
          >
            {conv.otherImage ? (
              <img src={conv.otherImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white text-[11px] font-bold">{getInitials(conv.otherName)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--ink)' }}>{conv.otherName}</p>
            <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>{conv.eventTitle}</p>
          </div>
        </div>
      </div>

      {/* Chat panel fills remaining space */}
      <div className="flex-1 min-h-0">
        <ChatPanel
          bookingId={conv.bookingId}
          currentUserId={currentUserId}
          otherUserName={conv.otherName}
          embedded
        />
      </div>
    </div>
  )
}
