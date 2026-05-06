import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LogoutButton from './LogoutButton'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-900">
          <span className="text-xl">🍔</span>
          <span>배달파티</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/new"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-full transition-colors"
              >
                + 파티 만들기
              </Link>
              <Link href="/my" className="text-sm text-gray-600 hover:text-gray-900">
                내 파티
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-orange-500 hover:text-orange-600"
            >
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
