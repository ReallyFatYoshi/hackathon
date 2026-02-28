import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from './auth'

export async function getSession() {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  return session
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) redirect('/login')
  return session
}

export async function requireRole(role: string | string[]) {
  const session = await requireAuth()
  const roles = Array.isArray(role) ? role : [role]
  const userRole = (session.user as any).role as string
  if (!roles.includes(userRole)) redirect('/dashboard')
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}
