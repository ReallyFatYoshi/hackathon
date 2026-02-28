'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { getPusherClient } from '@/lib/pusher-client'
import type { CallSignal } from '@/types'
import type { Channel } from 'pusher-js'

export type CallState = 'idle' | 'calling' | 'incoming' | 'connected' | 'ended'

interface UseWebRTCOptions {
  bookingId: string
  currentUserId: string
  onCallStateChange?: (state: CallState) => void
}

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export function useWebRTC({ bookingId, currentUserId, onCallStateChange }: UseWebRTCOptions) {
  const [callState, setCallState] = useState<CallState>('idle')
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [isAudioMuted, setIsAudioMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [withVideo, setWithVideo] = useState(false)

  const pcRef = useRef<RTCPeerConnection | null>(null)
  const channelRef = useRef<Channel | null>(null)
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([])

  const updateState = useCallback((state: CallState) => {
    setCallState(state)
    onCallStateChange?.(state)
  }, [onCallStateChange])

  // Send signaling message via Pusher client events
  const sendSignal = useCallback((signal: CallSignal) => {
    channelRef.current?.trigger('client-webrtc', signal)
  }, [])

  // Create peer connection
  const createPC = useCallback(() => {
    const pc = new RTCPeerConnection(ICE_SERVERS)
    pcRef.current = pc

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        sendSignal({
          type: 'ice-candidate',
          sender_id: currentUserId,
          payload: { candidate: e.candidate.toJSON() },
        })
      }
    }

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0] || null)
    }

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        endCall()
      }
    }

    return pc
  }, [currentUserId, sendSignal])

  // Get user media
  const getMedia = useCallback(async (video: boolean) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: video ? { width: 640, height: 480 } : false,
    })
    setLocalStream(stream)
    return stream
  }, [])

  // Start a call (initiator)
  const startCall = useCallback(async (video: boolean) => {
    setWithVideo(video)
    updateState('calling')

    sendSignal({
      type: 'call-request',
      sender_id: currentUserId,
      payload: { video },
    })
  }, [currentUserId, sendSignal, updateState])

  // Accept incoming call
  const acceptCall = useCallback(async () => {
    updateState('connected')

    const pc = createPC()
    const stream = await getMedia(withVideo)
    stream.getTracks().forEach((track) => pc.addTrack(track, stream))

    sendSignal({
      type: 'call-accept',
      sender_id: currentUserId,
      payload: { video: withVideo },
    })
  }, [createPC, currentUserId, getMedia, sendSignal, updateState, withVideo])

  // Reject incoming call
  const rejectCall = useCallback(() => {
    sendSignal({
      type: 'call-reject',
      sender_id: currentUserId,
      payload: {},
    })
    updateState('idle')
  }, [currentUserId, sendSignal, updateState])

  // End call
  const endCall = useCallback(() => {
    sendSignal({
      type: 'call-end',
      sender_id: currentUserId,
      payload: {},
    })
    cleanup()
    updateState('idle')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserId, sendSignal, updateState])

  const cleanup = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop())
    setLocalStream(null)
    setRemoteStream(null)
    pcRef.current?.close()
    pcRef.current = null
    pendingCandidates.current = []
  }, [localStream])

  // Toggle audio
  const toggleAudio = useCallback(() => {
    localStream?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled })
    setIsAudioMuted((prev) => !prev)
  }, [localStream])

  // Toggle video
  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled })
    setIsVideoOff((prev) => !prev)
  }, [localStream])

  // Handle signaling messages
  const handleSignal = useCallback(async (signal: CallSignal) => {
    if (signal.sender_id === currentUserId) return

    switch (signal.type) {
      case 'call-request': {
        setWithVideo(!!(signal.payload as any).video)
        updateState('incoming')
        break
      }

      case 'call-accept': {
        const pc = createPC()
        const video = !!(signal.payload as any).video
        const stream = await getMedia(video)
        stream.getTracks().forEach((track) => pc.addTrack(track, stream))

        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        sendSignal({
          type: 'offer',
          sender_id: currentUserId,
          payload: { sdp: offer },
        })
        updateState('connected')
        break
      }

      case 'call-reject': {
        cleanup()
        updateState('idle')
        break
      }

      case 'call-end': {
        cleanup()
        updateState('idle')
        break
      }

      case 'offer': {
        const pc = pcRef.current
        if (!pc) break
        const sdp = (signal.payload as any).sdp as RTCSessionDescriptionInit
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))

        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c))
        }
        pendingCandidates.current = []

        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)

        sendSignal({
          type: 'answer',
          sender_id: currentUserId,
          payload: { sdp: answer },
        })
        break
      }

      case 'answer': {
        const pc = pcRef.current
        if (!pc) break
        const sdp = (signal.payload as any).sdp as RTCSessionDescriptionInit
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))

        for (const c of pendingCandidates.current) {
          await pc.addIceCandidate(new RTCIceCandidate(c))
        }
        pendingCandidates.current = []
        break
      }

      case 'ice-candidate': {
        const pc = pcRef.current
        const candidate = (signal.payload as any).candidate as RTCIceCandidateInit
        if (pc?.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate))
        } else {
          pendingCandidates.current.push(candidate)
        }
        break
      }
    }
  }, [cleanup, createPC, currentUserId, getMedia, sendSignal, updateState])

  // Subscribe to Pusher channel for signaling
  useEffect(() => {
    const pusher = getPusherClient()
    const channel = pusher.subscribe(`call-${bookingId}`)

    channel.bind('client-webrtc', (data: CallSignal) => {
      handleSignal(data)
    })

    channelRef.current = channel

    return () => {
      channel.unbind_all()
      pusher.unsubscribe(`call-${bookingId}`)
      cleanup()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  return {
    callState,
    localStream,
    remoteStream,
    isAudioMuted,
    isVideoOff,
    withVideo,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
  }
}
