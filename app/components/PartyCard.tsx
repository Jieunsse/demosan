import { Party } from '@/types/database'
import Link from 'next/link'

function getTimeLeft(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return '마감됨'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  if (h > 0) return `${h}시간 ${m}분 남음`
  return `${m}분 남음`
}

interface Props {
  party: Party
}

export default function PartyCard({ party }: Props) {
  const progress = Math.min(100, Math.round((party.current_amount / party.min_order_amount) * 100))
  const isFull = party.current_amount >= party.min_order_amount
  const memberCount = party.party_members?.length ?? 0

  return (
    <Link href={`/${party.id}`}>
      <div className="bg-white rounded-2xl border border-gray-200 p-4 hover:border-orange-300 hover:shadow-sm transition-all space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{party.restaurant_name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">📍 {party.pickup_location}</p>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            isFull ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {isFull ? '달성!' : getTimeLeft(party.deadline)}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-gray-500">
            <span>현재 {party.current_amount.toLocaleString()}원</span>
            <span>목표 {party.min_order_amount.toLocaleString()}원</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isFull ? 'bg-green-500' : 'bg-orange-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>👥 {memberCount}명 참여 중</span>
          {party.host && <span>{party.host.name}</span>}
        </div>
      </div>
    </Link>
  )
}
