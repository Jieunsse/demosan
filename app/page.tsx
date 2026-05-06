import { createClient } from '@/lib/supabase/server'
import PartyCard from './components/PartyCard'
import Link from 'next/link'
import { Party } from '@/types/database'

interface SearchParams {
  dorm?: string
}

export default async function HomePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { dorm } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('parties')
    .select(`
      *,
      host:profiles!host_id(id, name, avatar_url, dorm_building),
      party_members(id, user_id, amount, menu_note, joined_at, profile:profiles(name))
    `)
    .eq('status', 'open')
    .gt('deadline', new Date().toISOString())
    .order('deadline', { ascending: true })

  if (dorm) {
    query = query.eq('pickup_location', dorm)
  }

  const { data: parties } = await query

  const dormOptions = ['1동', '2동', '3동', '4동', '5동', '6동', '국제관']

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">지금 모집 중인 파티</h1>
          <p className="text-sm text-gray-500 mt-0.5">같이 시키면 최소 금액 걱정 없어요</p>
        </div>
        <Link
          href="/new"
          className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors"
        >
          + 파티 만들기
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href="/"
          className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
            !dorm ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
          }`}
        >
          전체
        </Link>
        {dormOptions.map((d) => (
          <Link
            key={d}
            href={`/?dorm=${encodeURIComponent(d)}`}
            className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
              dorm === d ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            {d}
          </Link>
        ))}
      </div>

      {!parties || parties.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <div className="text-4xl">🛵</div>
          <p className="text-gray-500 text-sm">아직 모집 중인 파티가 없어요</p>
          <Link href="/new" className="inline-block text-sm text-orange-500 font-medium underline">
            첫 파티를 만들어 보세요
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(parties as Party[]).map((party) => (
            <PartyCard key={party.id} party={party} />
          ))}
        </div>
      )}
    </main>
  )
}
