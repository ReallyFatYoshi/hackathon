// TourGuideStep type (matching @sjmc11/tourguidejs)
export interface TourGuideStep {
  title?: string
  content: string | HTMLElement | Element
  target?: HTMLElement | Element | HTMLInputElement | string | null
  fixed?: boolean
  order?: number
  group?: string
  propagateEvents?: boolean
  beforeEnter?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>
  afterEnter?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>
  beforeLeave?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>
  afterLeave?: (currentStep: TourGuideStep, nextStep: TourGuideStep) => void | Promise<unknown>
}

export interface TourDefinition {
  id: string
  titleKey: string
  descKey: string
  icon: string
  /** Which roles can see this tour */
  roles: ('client' | 'chef' | 'admin')[]
  /** The dashboard path where this tour should start */
  startPath: string
  steps: TourGuideStep[]
}

// Helper to target data-tour attributes
const t = (id: string) => `[data-tour="${id}"]`

export const tours: TourDefinition[] = [
  // ── Navigation Tour (all roles) ──
  {
    id: 'navigation',
    titleKey: 'tours.navigation.title',
    descKey: 'tours.navigation.desc',
    icon: 'Compass',
    roles: ['client', 'chef', 'admin'],
    startPath: '',
    steps: [
      {
        title: '',
        content: '',
        target: t('sidebar'),
        order: 0,
      },
      {
        title: '',
        content: '',
        target: t('sidebar-logo'),
        order: 1,
      },
      {
        title: '',
        content: '',
        target: t('sidebar-nav'),
        order: 2,
      },
      {
        title: '',
        content: '',
        target: t('sidebar-user'),
        order: 3,
      },
      {
        title: '',
        content: '',
        target: t('main-content'),
        order: 4,
      },
    ],
  },

  // ── Client Dashboard Tour ──
  {
    id: 'client-overview',
    titleKey: 'tours.clientOverview.title',
    descKey: 'tours.clientOverview.desc',
    icon: 'Home',
    roles: ['client'],
    startPath: '/dashboard/client',
    steps: [
      {
        title: '',
        content: '',
        target: t('page-header'),
        order: 0,
      },
      {
        title: '',
        content: '',
        target: t('post-event-btn'),
        order: 1,
      },
      {
        title: '',
        content: '',
        target: t('stats-grid'),
        order: 2,
      },
      {
        title: '',
        content: '',
        target: t('recent-events'),
        order: 3,
      },
      {
        title: '',
        content: '',
        target: t('recent-bookings'),
        order: 4,
      },
    ],
  },

  // ── Find Chefs Tour ──
  {
    id: 'client-chefs',
    titleKey: 'tours.clientChefs.title',
    descKey: 'tours.clientChefs.desc',
    icon: 'ChefHat',
    roles: ['client'],
    startPath: '/dashboard/client/chefs',
    steps: [
      {
        title: '',
        content: '',
        target: t('page-header'),
        order: 0,
      },
      {
        title: '',
        content: '',
        target: t('nav-chefhat'),
        order: 1,
      },
    ],
  },

  // ── Events Tour (client) ──
  {
    id: 'client-events',
    titleKey: 'tours.clientEvents.title',
    descKey: 'tours.clientEvents.desc',
    icon: 'Calendar',
    roles: ['client'],
    startPath: '/dashboard/client/events',
    steps: [
      {
        title: '',
        content: '',
        target: t('page-header'),
        order: 0,
      },
      {
        title: '',
        content: '',
        target: t('post-event-btn'),
        order: 1,
      },
      {
        title: '',
        content: '',
        target: t('nav-bookopen'),
        order: 2,
      },
    ],
  },

  // ── Messages Tour ──
  {
    id: 'messages',
    titleKey: 'tours.messages.title',
    descKey: 'tours.messages.desc',
    icon: 'MessageSquare',
    roles: ['client', 'chef'],
    startPath: '',
    steps: [
      {
        title: '',
        content: '',
        target: t('nav-messagesquare'),
        order: 0,
      },
    ],
  },

  // ── Chef Dashboard Tour ──
  {
    id: 'chef-overview',
    titleKey: 'tours.chefOverview.title',
    descKey: 'tours.chefOverview.desc',
    icon: 'Home',
    roles: ['chef'],
    startPath: '/dashboard/chef',
    steps: [
      {
        title: '',
        content: '',
        target: t('page-header'),
        order: 0,
      },
      {
        title: '',
        content: '',
        target: t('chef-status'),
        order: 1,
      },
      {
        title: '',
        content: '',
        target: t('stats-grid'),
        order: 2,
      },
    ],
  },

  // ── Chef Profile Tour ──
  {
    id: 'chef-profile',
    titleKey: 'tours.chefProfile.title',
    descKey: 'tours.chefProfile.desc',
    icon: 'User',
    roles: ['chef'],
    startPath: '/dashboard/chef/profile',
    steps: [
      {
        title: '',
        content: '',
        target: t('nav-user'),
        order: 0,
      },
    ],
  },

  // ── Security Tour ──
  {
    id: 'security',
    titleKey: 'tours.security.title',
    descKey: 'tours.security.desc',
    icon: 'Shield',
    roles: ['client', 'chef', 'admin'],
    startPath: '/dashboard/settings',
    steps: [
      {
        title: '',
        content: '',
        target: t('nav-shield'),
        order: 0,
      },
    ],
  },

  // ── Install App Tour ──
  {
    id: 'install-app',
    titleKey: 'tours.installApp.title',
    descKey: 'tours.installApp.desc',
    icon: 'Download',
    roles: ['client', 'chef', 'admin'],
    startPath: '/dashboard/install',
    steps: [
      {
        title: '',
        content: '',
        target: t('nav-download'),
        order: 0,
      },
    ],
  },
]

export function getToursForRole(role: 'client' | 'chef' | 'admin') {
  return tours.filter((tour) => tour.roles.includes(role))
}
