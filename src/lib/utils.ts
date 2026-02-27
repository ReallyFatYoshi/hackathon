import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const CUISINE_OPTIONS = [
  'American', 'Italian', 'French', 'Mediterranean', 'Asian Fusion',
  'Japanese', 'Chinese', 'Indian', 'Mexican', 'Middle Eastern',
  'Caribbean', 'African', 'Vegan/Plant-Based', 'Seafood', 'BBQ/Grill',
  'Pastry/Desserts', 'Farm-to-Table', 'Latin American',
]

export const EVENT_TYPE_OPTIONS = [
  'Wedding', 'Corporate Event', 'Private Dinner', 'Cocktail Party',
  'Birthday Celebration', 'Holiday Party', 'Graduation', 'Baby/Bridal Shower',
  'Fundraiser', 'Catering Service', 'Cooking Class', 'Other',
]

export const COMMISSION_PCT = 15
