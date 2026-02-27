import { Navbar } from '@/components/shared/navbar'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        {children}
      </main>
    </div>
  )
}
