'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import type { ChefApplication, Interview } from '@/types'

interface ApplicationActionsProps {
  application: ChefApplication
  interview: Interview | null
}

export function ApplicationActions({ application, interview }: ApplicationActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')
  const { toast } = useToast()
  const router = useRouter()

  async function performAction(action: string, extra?: Record<string, string>) {
    setLoading(action)
    const res = await fetch(`/api/applications/${application.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Action failed', description: data.error, variant: 'error' })
    } else {
      toast({ title: data.message || 'Done', variant: 'success' })
      router.refresh()
      setShowSchedule(false)
    }
    setLoading(null)
  }

  const status = application.status

  return (
    <Card>
      <CardHeader><CardTitle>Admin Actions</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {/* Reject */}
        {(status === 'pending_review' || status === 'interview_scheduled') && (
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="destructive"
              loading={loading === 'reject'}
              onClick={() => performAction('reject')}
            >
              Reject Application
            </Button>
            {status === 'pending_review' && !showSchedule && (
              <Button onClick={() => setShowSchedule(true)}>
                Schedule Interview
              </Button>
            )}
          </div>
        )}

        {/* Schedule interview form */}
        {showSchedule && status === 'pending_review' && (
          <div className="border border-stone-200 rounded-xl p-4 space-y-3 bg-stone-50">
            <h4 className="font-semibold text-stone-900 text-sm">Schedule Interview</h4>
            <Input
              label="Interview date & time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
              <Button
                loading={loading === 'schedule_interview'}
                onClick={() => performAction('schedule_interview', { scheduled_at: scheduledAt })}
              >
                Create & Notify Chef
              </Button>
            </div>
          </div>
        )}

        {/* After interview actions */}
        {status === 'interview_scheduled' && interview && (
          <div className="flex gap-3 flex-wrap">
            <a href={interview.daily_room_url} target="_blank" rel="noreferrer">
              <Button variant="outline">Join Interview Room</Button>
            </a>
            <Button
              variant="success"
              loading={loading === 'approve'}
              onClick={() => performAction('approve')}
            >
              Approve Chef
            </Button>
            <Button
              variant="destructive"
              loading={loading === 'no_show'}
              onClick={() => performAction('no_show')}
            >
              Mark No Show
            </Button>
          </div>
        )}

        {status === 'interview_completed' && (
          <div className="flex gap-3 flex-wrap">
            <Button
              variant="success"
              loading={loading === 'approve'}
              onClick={() => performAction('approve')}
            >
              Approve Chef
            </Button>
            <Button
              variant="destructive"
              loading={loading === 'reject'}
              onClick={() => performAction('reject')}
            >
              Reject
            </Button>
          </div>
        )}

        {(status === 'approved' || status === 'rejected' || status === 'no_show') && (
          <div className="bg-stone-50 rounded-xl p-3 text-sm text-stone-500">
            Application is <strong className="capitalize">{status.replace(/_/g, ' ')}</strong>. No further actions available.
          </div>
        )}

        {/* Admin notes */}
        <div className="pt-2 border-t border-stone-100">
          <Textarea
            label="Admin notes (internal)"
            value={notes || application.admin_notes || ''}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes about this applicant..."
            className="min-h-[80px]"
          />
          <Button
            size="sm"
            variant="outline"
            className="mt-2"
            loading={loading === 'save_notes'}
            onClick={() => performAction('save_notes', { notes })}
          >
            Save Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
