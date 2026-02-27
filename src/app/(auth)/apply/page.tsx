'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/components/ui/toast'
import { ChefHat, Upload, X, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { CUISINE_OPTIONS, EVENT_TYPE_OPTIONS, cn } from '@/lib/utils'
import Link from 'next/link'
import { Navbar } from '@/components/shared/navbar'

const STEPS = ['Personal Info', 'Experience', 'Portfolio', 'Review & Submit']

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  years_experience: string
  cuisine_specialties: string[]
  event_specialties: string[]
  bio: string
  portfolio_images: File[]
  instagram: string
  linkedin: string
  website: string
}

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    years_experience: '',
    cuisine_specialties: [],
    event_specialties: [],
    bio: '',
    portfolio_images: [],
    instagram: '',
    linkedin: '',
    website: '',
  })
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  function update(field: keyof FormData, value: string) {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  function toggleSpecialty(field: 'cuisine_specialties' | 'event_specialties', val: string) {
    setData((prev) => {
      const arr = prev[field] as string[]
      return {
        ...prev,
        [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val],
      }
    })
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const total = data.portfolio_images.length + files.length
    if (total > 5) {
      toast({ title: 'Maximum 5 images allowed', variant: 'error' })
      return
    }
    const newPreviews = files.map((f) => URL.createObjectURL(f))
    setData((prev) => ({ ...prev, portfolio_images: [...prev.portfolio_images, ...files] }))
    setPreviewUrls((prev) => [...prev, ...newPreviews])
  }

  function removeImage(index: number) {
    setData((prev) => ({
      ...prev,
      portfolio_images: prev.portfolio_images.filter((_, i) => i !== index),
    }))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!data.first_name || !data.last_name || !data.email || !data.phone) {
        toast({ title: 'Please fill in all required fields', variant: 'error' })
        return false
      }
    }
    if (step === 1) {
      if (!data.years_experience || data.cuisine_specialties.length === 0 || !data.bio) {
        toast({ title: 'Please fill in all required fields and select at least one cuisine', variant: 'error' })
        return false
      }
    }
    if (step === 2) {
      if (data.portfolio_images.length < 3) {
        toast({ title: 'Please upload at least 3 portfolio images', variant: 'error' })
        return false
      }
    }
    return true
  }

  async function handleSubmit() {
    setLoading(true)
    const supabase = createClient()

    // Get or create user
    const { data: { user } } = await supabase.auth.getUser()

    let userId: string
    if (!user) {
      // Auto-create chef account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
        options: {
          data: {
            full_name: `${data.first_name} ${data.last_name}`,
            role: 'chef',
          },
        },
      })
      if (authError || !authData.user) {
        toast({ title: 'Failed to create account', description: authError?.message, variant: 'error' })
        setLoading(false)
        return
      }
      userId = authData.user.id
    } else {
      userId = user.id
      // Update role to chef if needed
      await supabase.from('profiles').update({ role: 'chef' }).eq('id', userId)
    }

    // Upload images
    const imageUrls: string[] = []
    for (const file of data.portfolio_images) {
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(-6)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('chef-portfolio')
        .upload(path, file)
      if (uploadError) {
        toast({ title: 'Image upload failed', description: uploadError.message, variant: 'error' })
        setLoading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('chef-portfolio').getPublicUrl(path)
      imageUrls.push(urlData.publicUrl)
    }

    // Submit application
    const social_links: Record<string, string> = {}
    if (data.instagram) social_links.instagram = data.instagram
    if (data.linkedin) social_links.linkedin = data.linkedin
    if (data.website) social_links.website = data.website

    const { error: appError } = await supabase.from('chef_applications').insert({
      user_id: userId,
      status: 'pending_review',
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      years_experience: parseInt(data.years_experience),
      cuisine_specialties: data.cuisine_specialties,
      event_specialties: data.event_specialties,
      bio: data.bio,
      portfolio_images: imageUrls,
      social_links,
    })

    if (appError) {
      toast({ title: 'Submission failed', description: appError.message, variant: 'error' })
      setLoading(false)
      return
    }

    toast({
      title: 'Application submitted!',
      description: 'We\'ll review your application and be in touch within 3-5 business days.',
      variant: 'success',
    })
    router.push('/dashboard/chef')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-stone-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <ChefHat className="h-8 w-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-stone-900">Apply as a Chef</h1>
            <p className="text-stone-500 mt-2">Join our vetted network of professional culinary experts</p>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-2 mb-8">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0',
                  i < step ? 'bg-amber-600 text-white' :
                  i === step ? 'bg-amber-600 text-white ring-4 ring-amber-100' :
                  'bg-stone-200 text-stone-500'
                )}>
                  {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn(
                  'text-xs font-medium hidden sm:block',
                  i === step ? 'text-amber-600' : 'text-stone-400'
                )}>{s}</span>
                {i < STEPS.length - 1 && (
                  <div className={cn('flex-1 h-0.5', i < step ? 'bg-amber-600' : 'bg-stone-200')} />
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{STEPS[step]}</CardTitle>
              <CardDescription>
                {step === 0 && 'Tell us about yourself'}
                {step === 1 && 'Share your culinary background'}
                {step === 2 && 'Show us your best work (3–5 photos required)'}
                {step === 3 && 'Review your application before submitting'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="First name" value={data.first_name} onChange={(e) => update('first_name', e.target.value)} required />
                    <Input label="Last name" value={data.last_name} onChange={(e) => update('last_name', e.target.value)} required />
                  </div>
                  <Input label="Email address" type="email" value={data.email} onChange={(e) => update('email', e.target.value)} required />
                  <Input label="Phone number" type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" required />
                </div>
              )}

              {/* Step 1: Experience */}
              {step === 1 && (
                <div className="space-y-6">
                  <Input
                    label="Years of professional experience"
                    type="number"
                    min="0"
                    max="50"
                    value={data.years_experience}
                    onChange={(e) => update('years_experience', e.target.value)}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Cuisine Specialties <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CUISINE_OPTIONS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleSpecialty('cuisine_specialties', c)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                            data.cuisine_specialties.includes(c)
                              ? 'bg-amber-600 text-white border-amber-600'
                              : 'bg-white text-stone-600 border-stone-300 hover:border-amber-400'
                          )}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">Event Specialties</label>
                    <div className="flex flex-wrap gap-2">
                      {EVENT_TYPE_OPTIONS.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => toggleSpecialty('event_specialties', e)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                            data.event_specialties.includes(e)
                              ? 'bg-stone-800 text-white border-stone-800'
                              : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
                          )}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    label="Short bio"
                    value={data.bio}
                    onChange={(e) => update('bio', e.target.value)}
                    placeholder="Tell us about your culinary journey, training, signature style, and what makes your cooking unique..."
                    required
                    className="min-h-[120px]"
                  />
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-stone-700">Social Links (optional)</label>
                    <Input label="" placeholder="Instagram URL" value={data.instagram} onChange={(e) => update('instagram', e.target.value)} />
                    <Input label="" placeholder="LinkedIn URL" value={data.linkedin} onChange={(e) => update('linkedin', e.target.value)} />
                    <Input label="" placeholder="Website URL" value={data.website} onChange={(e) => update('website', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Step 2: Portfolio */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    {previewUrls.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-stone-200 bg-stone-100">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    {data.portfolio_images.length < 5 && (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-stone-300 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                        <Upload className="h-6 w-6 text-stone-400 mb-1" />
                        <span className="text-xs text-stone-500">Add photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">
                    {data.portfolio_images.length}/5 images uploaded
                    {data.portfolio_images.length < 3 && ' (minimum 3 required)'}
                  </p>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="bg-stone-50 rounded-xl p-4 space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-stone-500">Name</span>
                        <p className="font-medium text-stone-900">{data.first_name} {data.last_name}</p>
                      </div>
                      <div>
                        <span className="text-stone-500">Email</span>
                        <p className="font-medium text-stone-900">{data.email}</p>
                      </div>
                      <div>
                        <span className="text-stone-500">Phone</span>
                        <p className="font-medium text-stone-900">{data.phone}</p>
                      </div>
                      <div>
                        <span className="text-stone-500">Experience</span>
                        <p className="font-medium text-stone-900">{data.years_experience} years</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-stone-500">Cuisine Specialties</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.cuisine_specialties.map((c) => (
                          <span key={c} className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                        ))}
                      </div>
                    </div>
                    {data.event_specialties.length > 0 && (
                      <div>
                        <span className="text-stone-500">Event Specialties</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {data.event_specialties.map((e) => (
                            <span key={e} className="bg-stone-200 text-stone-700 text-xs px-2 py-0.5 rounded-full">{e}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-stone-500">Bio</span>
                      <p className="font-medium text-stone-900 mt-1 leading-relaxed">{data.bio}</p>
                    </div>
                    <div>
                      <span className="text-stone-500">Portfolio Images</span>
                      <p className="font-medium text-stone-900">{data.portfolio_images.length} images uploaded</p>
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    <strong>What happens next:</strong> Our team will review your application within 3–5 business days. If approved, we&apos;ll schedule a brief video interview through the platform.
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t border-stone-100">
                {step > 0 ? (
                  <Button variant="outline" onClick={() => setStep(step - 1)}>
                    <ChevronLeft className="h-4 w-4" /> Back
                  </Button>
                ) : (
                  <div />
                )}
                {step < STEPS.length - 1 ? (
                  <Button onClick={() => { if (validateStep()) setStep(step + 1) }}>
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} loading={loading} className="min-w-[140px]">
                    Submit Application
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-stone-500 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-amber-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
