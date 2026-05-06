import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PartyCard from '../components/PartyCard'
import { Party } from '@/types/database'

export default async function MyPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login?next=/my')

  const [{ data: hosted }, { data: joined }] = await Promise.all([
    supabase
      .from('parties')
      .select(`
        *,
        host:profiles!host_id(id, name, avatar_url),
        party_members(id, user_id, amount, menu_note, joined_at, profile:profiles(name))
      `)
      .eq('host_id', user.id)
      .order('created_at', { ascending: false }),

    supabase
      .from('party_members')
      .select(`
        party:parties(
          *,
          host:profiles!host_id(id, name, avatar_url),
          party_members(id, user_id, amount, menu_note, joined_at, profile:profiles(name))
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false }),
  ])

  const joinedParties = (joined ?? [])
    .map((m) => m.party as unknown as Party)
    .filter((p) => p && p.host_id !== user.id)

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      <section className="space-y-3">
        <h2 className="font-bold text-gray-900">내가 만든 파티 ({hosted?.length ?? 0})</h2>
        {!hosted || hosted.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">아직 만든 파티가 없어요</p>
        ) : (
          <div className="space-y-3">
            {(hosted as Party[]).map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-bold text-gray-900">참여 중인 파티 ({joinedParties.length})</h2>
        {joinedParties.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">참여한 파티가 없어요</p>
        ) : (
          <div className="space-y-3">
            {joinedParties.map((party) => (
              <PartyCard key={party.id} party={party} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
