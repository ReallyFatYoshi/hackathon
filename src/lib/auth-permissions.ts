import { createAccessControl } from 'better-auth/plugins/access'
import {
  defaultStatements,
  adminAc,
} from 'better-auth/plugins/admin/access'

/**
 * OWASP A01 – Broken Access Control
 * Define fine-grained RBAC for every role in the application.
 */
export const statement = {
  ...defaultStatements,
  chef: ['view', 'apply', 'manage'],
  event: ['create', 'view', 'update', 'delete'],
  booking: ['create', 'view', 'update', 'cancel'],
  review: ['create', 'view'],
} as const

export const ac = createAccessControl(statement)

/** Regular client: can create events, bookings, and reviews */
export const client = ac.newRole({
  event: ['create', 'view', 'update', 'delete'],
  booking: ['create', 'view', 'cancel'],
  review: ['create', 'view'],
  chef: ['view'],
})

/** Chef: can manage their own profile, view events and bookings */
export const chef = ac.newRole({
  chef: ['view', 'manage'],
  event: ['view'],
  booking: ['view', 'update'],
  review: ['view'],
})

/** Admin: full control (inherits default admin permissions + app resources) */
export const admin = ac.newRole({
  ...adminAc.statements,
  chef: ['view', 'apply', 'manage'],
  event: ['create', 'view', 'update', 'delete'],
  booking: ['create', 'view', 'update', 'cancel'],
  review: ['create', 'view'],
})
