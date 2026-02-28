'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signUp, useSession } from '@/lib/auth-client'
import { useToast } from '@/components/ui/toast'
import { ChefHat, Building2, Upload, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { CUISINE_OPTIONS, EVENT_TYPE_OPTIONS, cn } from '@/lib/utils'
import Link from 'next/link'

const STEPS = [
  { num: '01', label: 'Personal Info' },
  { num: '02', label: 'Experience'    },
  { num: '03', label: 'Portfolio'     },
  { num: '04', label: 'Review'        },
]

interface FormData {
  applicant_type: 'individual' | 'company'
  company_name: string
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

const fieldCls =
  'w-full bg-transparent border-0 border-b border-stone-200 pb-2 pt-1 text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none focus:border-amber-500 transition-colors duration-200'

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400 mb-2">
      {children}{required && <span className="text-amber-500 ml-1">*</span>}
    </p>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required}>{label}</Label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4 py-1.5 border-b border-stone-50 last:border-0">
      <span className="text-xs text-stone-400 shrink-0">{label}</span>
      <span className="text-sm text-stone-800 font-medium text-right">{value}</span>
    </div>
  )
}

export default function ApplyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<FormData>({
    applicant_type: 'individual',
    company_name: '',
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
      return { ...prev, [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] }
    })
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (data.portfolio_images.length + files.length > 5) {
      toast({ title: 'Maximum 5 images allowed', variant: 'error' })
      return
    }
    setData((prev) => ({ ...prev, portfolio_images: [...prev.portfolio_images, ...files] }))
    setPreviewUrls((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))])
  }

  function removeImage(index: number) {
    setData((prev) => ({ ...prev, portfolio_images: prev.portfolio_images.filter((_, i) => i !== index) }))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  function validateStep(): boolean {
    if (step === 0) {
      if (!data.first_name || !data.last_name || !data.email || !data.phone) {
        toast({ title: 'Please fill in all required fields', variant: 'error' })
        return false
      }
      if (data.applicant_type === 'company' && !data.company_name) {
        toast({ title: 'Please enter your company name', variant: 'error' })
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

    // Sign up the user (if not already logged in)
    const { error: signUpError } = await signUp.email({
      email: data.email,
      password: Math.random().toString(36).slice(-12) + 'Aa1!',
      name: `${data.first_name} ${data.last_name}`,
    })

    if (signUpError) {
      toast({ title: 'Failed to create account', description: signUpError.message, variant: 'error' })
      setLoading(false)
      return
    }

    // Convert images to base64 for the API (simplified — real app would use separate upload)
    const imageUrls: string[] = []
    for (const file of data.portfolio_images) {
      imageUrls.push(URL.createObjectURL(file))
    }

    const social_links: Record<string, string> = {}
    if (data.instagram) social_links.instagram = data.instagram
    if (data.linkedin) social_links.linkedin = data.linkedin
    if (data.website) social_links.website = data.website

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        applicant_type: data.applicant_type,
        company_name: data.applicant_type === 'company' ? data.company_name : null,
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
      }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      toast({ title: 'Submission failed', description: body.error || 'Unknown error', variant: 'error' })
      setLoading(false)
      return
    }

    toast({ title: 'Application submitted!', description: "We'll be in touch within 3–5 business days.", variant: 'success' })
    router.push('/dashboard/chef')
  }

  return (
    <>
      <style>{`
        @keyframes applyIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .apply-step { animation: applyIn 0.25s ease forwards; }
      `}</style>

      <div className="w-full max-w-lg">

        {/* ── HEADER ── */}
        <div className="mb-8">
          {/* Step counter */}
          <div className="flex items-center gap-3 mb-5">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all duration-300 shrink-0',
                    i === step ? 'bg-amber-500 text-white shadow-sm shadow-amber-200' :
                    i < step  ? 'bg-stone-800 text-white' :
                                'bg-stone-100 text-stone-400'
                  )}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={cn(
                    'text-[10px] font-semibold tracking-widest uppercase transition-colors duration-300 hidden sm:block',
                    i === step ? 'text-amber-600' : i < step ? 'text-stone-500' : 'text-stone-300'
                  )}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('w-6 h-px transition-colors duration-500', i < step ? 'bg-stone-600' : 'bg-stone-200')} />
                )}
              </div>
            ))}
          </div>

          {/* Step heading */}
          <div key={`h-${step}`} className="apply-step">
            <div className="flex items-baseline gap-3">
              <span
                style={{ fontFamily: 'var(--font-cormorant)', fontSize: '2.5rem', fontWeight: 600, lineHeight: 1, color: '#1c1917' }}
              >
                {STEPS[step].label}
              </span>
              <span className="text-stone-300 text-sm font-light">{STEPS[step].num}</span>
            </div>
          </div>
        </div>

        {/* ── FORM STEPS ── */}
        <div key={step} className="apply-step space-y-6">

          {/* STEP 0 — Personal Info */}
          {step === 0 && (
            <>
              <Field label="Applying as" required>
                <div className="grid grid-cols-2 gap-2.5 mt-1">
                  {([
                    { val: 'individual' as const, Icon: ChefHat,   label: 'Individual Chef',  sub: 'Solo professional' },
                    { val: 'company'    as const, Icon: Building2, label: 'Catering Company', sub: 'Business or team' },
                  ] as const).map(({ val, Icon, label, sub }) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => update('applicant_type', val)}
                      className={cn(
                        'p-3.5 rounded-xl border text-left transition-all duration-200',
                        data.applicant_type === val
                          ? 'border-amber-400 bg-amber-50/70 shadow-sm'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      )}
                    >
                      <Icon className={cn('h-4 w-4 mb-2 transition-colors', data.applicant_type === val ? 'text-amber-500' : 'text-stone-300')} />
                      <div className={cn('text-xs font-semibold leading-tight', data.applicant_type === val ? 'text-stone-800' : 'text-stone-600')}>{label}</div>
                      <div className="text-[10px] text-stone-400 mt-0.5">{sub}</div>
                    </button>
                  ))}
                </div>
              </Field>

              {data.applicant_type === 'company' && (
                <Field label="Company name" required>
                  <input className={fieldCls} value={data.company_name} onChange={(e) => update('company_name', e.target.value)} placeholder="e.g. Rossi Catering Co." />
                </Field>
              )}

              <div className="grid grid-cols-2 gap-5">
                <Field label={data.applicant_type === 'company' ? 'Contact first name' : 'First name'} required>
                  <input className={fieldCls} value={data.first_name} onChange={(e) => update('first_name', e.target.value)} />
                </Field>
                <Field label={data.applicant_type === 'company' ? 'Contact last name' : 'Last name'} required>
                  <input className={fieldCls} value={data.last_name} onChange={(e) => update('last_name', e.target.value)} />
                </Field>
              </div>

              <Field label="Email address" required>
                <input className={fieldCls} type="email" value={data.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" />
              </Field>

              <Field label="Phone number" required>
                <input className={fieldCls} type="tel" value={data.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
              </Field>
            </>
          )}

          {/* STEP 1 — Experience */}
          {step === 1 && (
            <>
              <Field label="Years of professional experience" required>
                <input className={fieldCls} type="number" min="0" max="50" value={data.years_experience} onChange={(e) => update('years_experience', e.target.value)} placeholder="e.g. 8" />
              </Field>

              <Field label="Cuisine Specialties" required>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CUISINE_OPTIONS.map((c) => (
                    <button
                      key={c} type="button"
                      onClick={() => toggleSpecialty('cuisine_specialties', c)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                        data.cuisine_specialties.includes(c)
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Event Specialties">
                <div className="flex flex-wrap gap-2 mt-1">
                  {EVENT_TYPE_OPTIONS.map((e) => (
                    <button
                      key={e} type="button"
                      onClick={() => toggleSpecialty('event_specialties', e)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150',
                        data.event_specialties.includes(e)
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white text-stone-500 border-stone-200 hover:border-amber-300'
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Short bio" required>
                <textarea
                  className={cn(fieldCls, 'resize-none min-h-[96px] leading-relaxed')}
                  value={data.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  placeholder="Tell us about your culinary journey, training, signature style, and what makes your cooking unique..."
                  rows={4}
                />
              </Field>

              <div>
                <Label>Social Links <span className="normal-case font-normal text-stone-300">(optional)</span></Label>
                {([
                  { key: 'instagram' as const, placeholder: 'Instagram URL' },
                  { key: 'linkedin'  as const, placeholder: 'LinkedIn URL' },
                  { key: 'website'   as const, placeholder: 'Website URL' },
                ] as const).map(({ key, placeholder }) => (
                  <div key={key} className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-stone-300 w-16 shrink-0 font-semibold">{key}</span>
                    <input className={fieldCls} placeholder={placeholder} value={data[key]} onChange={(e) => update(key, e.target.value)} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* STEP 2 — Portfolio */}
          {step === 2 && (
            <>
              <p className="text-sm text-stone-500 leading-relaxed">
                Upload 3–5 high-quality photos of your work. These will be the first impression clients have of your cooking.
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {previewUrls.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group shadow-sm">
                    <img src={url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {data.portfolio_images.length < 5 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200">
                    <Upload className="h-5 w-5 text-stone-300 mb-1.5" />
                    <span className="text-[10px] text-stone-400 font-medium tracking-wide">Add photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                  </label>
                )}
              </div>

              <div className="flex items-center gap-2">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className={cn(
                    'h-1 rounded-full transition-all duration-300',
                    i < data.portfolio_images.length ? 'w-7 bg-amber-500' : 'w-3 bg-stone-200'
                  )} />
                ))}
                <span className="text-[11px] text-stone-400 ml-1">
                  {data.portfolio_images.length}/5{data.portfolio_images.length < 3 && ' · 3 required'}
                </span>
              </div>
            </>
          )}

          {/* STEP 3 — Review */}
          {step === 3 && (
            <>
              <div className="rounded-2xl bg-white border border-stone-100 shadow-sm overflow-hidden">
                <div className="px-5 py-3 bg-stone-50/80 border-b border-stone-100">
                  <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-stone-400">Application Summary</span>
                </div>
                <div className="px-5 py-4">
                  <SummaryRow label="Type" value={data.applicant_type === 'company' ? 'Catering Company' : 'Individual Chef'} />
                  {data.company_name && <SummaryRow label="Company" value={data.company_name} />}
                  <SummaryRow label="Name" value={`${data.first_name} ${data.last_name}`} />
                  <SummaryRow label="Email" value={data.email} />
                  <SummaryRow label="Phone" value={data.phone} />
                  <SummaryRow label="Experience" value={`${data.years_experience} years`} />
                  <div className="py-2 border-b border-stone-50">
                    <span className="text-xs text-stone-400">Cuisine Specialties</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {data.cuisine_specialties.map((c) => (
                        <span key={c} className="bg-stone-100 text-stone-700 text-xs px-2.5 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                  {data.event_specialties.length > 0 && (
                    <div className="py-2 border-b border-stone-50">
                      <span className="text-xs text-stone-400">Event Specialties</span>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {data.event_specialties.map((e) => (
                          <span key={e} className="bg-amber-50 text-amber-700 text-xs px-2.5 py-0.5 rounded-full">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <span className="text-xs text-stone-400">Bio</span>
                    <p className="text-sm text-stone-700 mt-1 leading-relaxed">{data.bio}</p>
                  </div>
                  {previewUrls.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs text-stone-400">Portfolio</span>
                      <div className="flex gap-2 mt-1.5">
                        {previewUrls.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-10 h-10 rounded-lg object-cover border border-stone-100" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">What happens next</p>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Our team reviews your application within 3–5 business days. If approved, we&apos;ll schedule a brief video interview through the platform.
                </p>
              </div>
            </>
          )}

        </div>

        {/* ── NAVIGATION ── */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-stone-100">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          ) : (
            <Link href="/" className="flex items-center gap-1.5 text-sm text-stone-300 hover:text-stone-500 transition-colors duration-200">
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => { if (validateStep()) setStep(step + 1) }}
              className="flex items-center gap-2 bg-stone-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-stone-800 active:scale-[0.98] transition-all duration-150"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2 bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-700 active:scale-[0.98] transition-all duration-150 disabled:opacity-60 min-w-[160px] justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>Submit Application <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          )}
        </div>

        {/* Sign-in hint */}
        <p className="text-center text-xs text-stone-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-amber-600 hover:text-amber-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </>
  )
}
