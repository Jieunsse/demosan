import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import JoinForm from './JoinForm'
import ClosePartyButton from './ClosePartyButton'
import { Party } from '@/types/database'

function getTimeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return '마감됨'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}시간 ${m}분 남음`
  return `${m}분 남음`
}

export default async function PartyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: party } = await supabase
    .from('parties')
    .select(`
      *,
      host:profiles!host_id(id, name, avatar_url, dorm_building),
      party_members(id, user_id, amount, menu_note, joined_at, profile:profiles(name, avatar_url))
    `)
    .eq('id', id)
    .single()

  if (!party) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const p = party as Party
  const isHost = user?.id === p.host_id
  const isExpired = new Date(p.deadline) < new Date()
  const isClosed = p.status !== 'open'
  const alreadyJoined = p.party_members?.some((m) => m.user_id === user?.id)
  const progress = Math.min(100, Math.round((p.current_amount / p.min_order_amount) * 100))
  const isFull = p.current_amount >= p.min_order_amount

  const statusLabel: Record<string, string> = {
    open: '모집 중',
    closed: '마감',
    ordered: '주문 완료',
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{p.restaurant_name}</h1>
            <p className="text-sm text-gray-500 mt-1">📍 {p.pickup_location}</p>
          </div>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
            isClosed ? 'bg-gray-100 text-gray-500' :
            isFull ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {isClosed ? statusLabel[p.status] : getTimeLeft(p.deadline)}
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">현재 금액</span>
            <span className="font-semibold">{p.current_amount.toLocaleString()}원 / {p.min_order_amount.toLocaleString()}원</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isFull ? 'bg-green-500' : 'bg-orange-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 text-right">{progress}% 달성</p>
        </div>

        <div className="flex gap-4 text-sm text-gray-500 pt-1 border-t border-gray-100">
          <span>주최자: <span className="text-gray-700 font-medium">{p.host?.name}</span></span>
          <span>마감: <span className="text-gray-700">{new Date(p.deadline).toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></span>
        </div>

        {p.order_url && (
          <a
            href={p.order_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-500 hover:text-blue-600 underline"
          >
            🔗 주문 링크 바로가기
          </a>
        )}

        {isHost && !isClosed && (
          <ClosePartyButton partyId={p.id} hasKakaoPayLink={!!p.kakao_pay_link} />
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">파티원 목록 ({p.party_members?.length ?? 0}명)</h2>

        {p.party_members && p.party_members.length > 0 ? (
          <ul className="space-y-2">
            {p.party_members.map((member) => (
              <li key={member.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-xs font-medium text-orange-700">
                    {member.profile?.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{member.profile?.name}</span>
                    {member.menu_note && (
                      <p className="text-xs text-gray-400">{member.menu_note}</p>
                    )}
                  </div>
                </div>
                <span className="font-semibold text-gray-700">{member.amount.toLocaleString()}원</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">아직 참여한 파티원이 없어요</p>
        )}
      </div>

      {!isClosed && !isExpired && !isHost && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          {alreadyJoined ? (
            <p className="text-sm text-gray-500 text-center">이미 참여한 파티예요</p>
          ) : user ? (
            <JoinForm partyId={p.id} />
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-500">참여하려면 로그인이 필요해요</p>
              <a href={`/auth/login?next=/${p.id}`} className="text-sm text-orange-500 font-medium underline">
                로그인하기
              </a>
            </div>
          )}
        </div>
      )}

      {p.kakao_pay_link && isClosed && (
        <a
          href={p.kakao_pay_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold py-3 rounded-xl transition-colors"
        >
          💛 카카오페이로 정산하기
        </a>
      )}
    </main>
  )
}
