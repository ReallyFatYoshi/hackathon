'use client'

import { useWebRTC } from '@/components/chat/use-webrtc'
import { VideoCallOverlay } from '@/components/chat/video-call-overlay'
import { Button } from '@/components/ui/button'
import { Video, Phone } from 'lucide-react'

interface InterviewCallProps {
  roomId: string
  currentUserId: string
  participantName: string
}

export function InterviewCall({ roomId, currentUserId, participantName }: InterviewCallProps) {
  const webrtc = useWebRTC({
    bookingId: roomId,
    currentUserId,
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      {webrtc.callState === 'idle' && (
        <div className="text-center space-y-4">
          <p className="text-stone-500">Ready to start the interview with <strong>{participantName}</strong></p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => webrtc.startCall(true)} size="lg">
              <Video className="h-4 w-4 mr-2" />
              Start Video Call
            </Button>
            <Button onClick={() => webrtc.startCall(false)} variant="outline" size="lg">
              <Phone className="h-4 w-4 mr-2" />
              Audio Only
            </Button>
          </div>
        </div>
      )}

      {webrtc.callState === 'calling' && (
        <div className="text-center space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
            <Phone className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-stone-600 font-medium">Calling {participantName}...</p>
          <p className="text-stone-400 text-sm">Waiting for them to join</p>
          <Button variant="destructive" onClick={webrtc.endCall} size="sm">Cancel</Button>
        </div>
      )}

      {(webrtc.callState === 'connected' || webrtc.callState === 'incoming') && (
        <VideoCallOverlay
          localStream={webrtc.localStream}
          remoteStream={webrtc.remoteStream}
          callState={webrtc.callState}
          isAudioMuted={webrtc.isAudioMuted}
          isVideoOff={webrtc.isVideoOff}
          withVideo={webrtc.withVideo}
          otherUserName={participantName}
          onToggleAudio={webrtc.toggleAudio}
          onToggleVideo={webrtc.toggleVideo}
          onEnd={webrtc.endCall}
          onAccept={webrtc.acceptCall}
          onReject={webrtc.rejectCall}
        />
      )}

      {webrtc.callState === 'ended' && (
        <div className="text-center space-y-3">
          <p className="text-stone-500">Call ended</p>
          <Button onClick={() => webrtc.startCall(true)}>Call Again</Button>
        </div>
      )}
    </div>
  )
}
