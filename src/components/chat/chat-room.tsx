'use client'

import { ChatPanel } from './chat-panel'
import { VideoCallOverlay } from './video-call-overlay'
import { useWebRTC } from './use-webrtc'

interface ChatRoomProps {
  bookingId: string
  currentUserId: string
  otherUserName: string
}

export function ChatRoom({ bookingId, currentUserId, otherUserName }: ChatRoomProps) {
  const webrtc = useWebRTC({ bookingId, currentUserId })

  return (
    <>
      <ChatPanel
        bookingId={bookingId}
        currentUserId={currentUserId}
        otherUserName={otherUserName}
        onCallStart={(video) => webrtc.startCall(video)}
      />
      <VideoCallOverlay
        callState={webrtc.callState}
        localStream={webrtc.localStream}
        remoteStream={webrtc.remoteStream}
        isAudioMuted={webrtc.isAudioMuted}
        isVideoOff={webrtc.isVideoOff}
        withVideo={webrtc.withVideo}
        otherUserName={otherUserName}
        onAccept={webrtc.acceptCall}
        onReject={webrtc.rejectCall}
        onEnd={webrtc.endCall}
        onToggleAudio={webrtc.toggleAudio}
        onToggleVideo={webrtc.toggleVideo}
      />
    </>
  )
}
