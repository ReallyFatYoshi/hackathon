'use client'

import { useEffect, useRef } from 'react'
import { Mic, MicOff, VideoIcon, VideoOff, PhoneOff, Phone } from 'lucide-react'
import type { CallState } from './use-webrtc'

interface VideoCallOverlayProps {
  callState: CallState
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  isAudioMuted: boolean
  isVideoOff: boolean
  withVideo: boolean
  otherUserName: string
  onAccept: () => void
  onReject: () => void
  onEnd: () => void
  onToggleAudio: () => void
  onToggleVideo: () => void
}

function VideoElement({ stream, muted, className }: { stream: MediaStream | null; muted?: boolean; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream
    }
  }, [stream])

  if (!stream) return null

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
    />
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(' ')
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0]?.slice(0, 2).toUpperCase() || '?'
}

export function VideoCallOverlay({
  callState,
  localStream,
  remoteStream,
  isAudioMuted,
  isVideoOff,
  withVideo,
  otherUserName,
  onAccept,
  onReject,
  onEnd,
  onToggleAudio,
  onToggleVideo,
}: VideoCallOverlayProps) {
  if (callState === 'idle' || callState === 'ended') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'var(--ink)' }}>
      {/* Background radial */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,_#3d1f0044,_transparent)]" />

      {/* Remote video (full screen) */}
      {callState === 'connected' && withVideo && remoteStream && (
        <VideoElement
          stream={remoteStream}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Audio-only connected state */}
      {callState === 'connected' && !withVideo && (
        <div className="relative z-10 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4"
            style={{ background: 'rgba(200,137,42,0.15)', color: 'var(--gold)' }}
          >
            {getInitials(otherUserName)}
          </div>
          <p className="font-display text-2xl font-light text-white mb-1">{otherUserName}</p>
          <p className="text-sm animate-pulse" style={{ color: 'var(--gold)' }}>Voice call connected</p>
        </div>
      )}

      {/* Audio-only connected with remote audio (invisible) */}
      {callState === 'connected' && !withVideo && remoteStream && (
        <VideoElement stream={remoteStream} className="hidden" />
      )}

      {/* Local video (picture-in-picture) */}
      {callState === 'connected' && withVideo && localStream && (
        <div className="absolute bottom-24 right-5 w-36 h-28 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl z-20">
          <VideoElement
            stream={localStream}
            muted
            className="w-full h-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--ink)' }}>
              <VideoOff className="h-6 w-6 text-white/50" />
            </div>
          )}
        </div>
      )}

      {/* Calling state */}
      {callState === 'calling' && (
        <div className="relative z-10 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4 animate-pulse"
            style={{ background: 'rgba(200,137,42,0.15)', color: 'var(--gold)' }}
          >
            {getInitials(otherUserName)}
          </div>
          <p className="font-display text-2xl font-light text-white mb-1">{otherUserName}</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {withVideo ? 'Video' : 'Voice'} calling…
          </p>
        </div>
      )}

      {/* Incoming call state */}
      {callState === 'incoming' && (
        <div className="relative z-10 text-center">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold mx-auto mb-6"
            style={{ background: 'rgba(200,137,42,0.2)', color: 'var(--gold)' }}
          >
            {getInitials(otherUserName)}
          </div>
          <p className="font-display text-3xl font-light text-white mb-1">{otherUserName}</p>
          <p className="text-sm mb-10" style={{ color: 'var(--muted)' }}>
            Incoming {withVideo ? 'video' : 'voice'} call…
          </p>
          <div className="flex items-center justify-center gap-8">
            <button
              onClick={onReject}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 transition-colors text-white shadow-lg"
            >
              <PhoneOff className="h-6 w-6" />
            </button>
            <button
              onClick={onAccept}
              className="w-16 h-16 rounded-full flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 transition-colors text-white shadow-lg animate-pulse"
            >
              <Phone className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Controls (calling + connected) */}
      {(callState === 'calling' || callState === 'connected') && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20">
          <button
            onClick={onToggleAudio}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              isAudioMuted ? 'bg-red-500 text-white' : 'bg-white/15 text-white hover:bg-white/25'
            }`}
          >
            {isAudioMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          {withVideo && (
            <button
              onClick={onToggleVideo}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isVideoOff ? 'bg-red-500 text-white' : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {isVideoOff ? <VideoOff className="h-5 w-5" /> : <VideoIcon className="h-5 w-5" />}
            </button>
          )}
          <button
            onClick={onEnd}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white transition-colors"
          >
            <PhoneOff className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}
