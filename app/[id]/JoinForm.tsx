'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  partyId: string
}

export default function JoinForm({ partyId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: err } = await supabase
      .from('party_members')
      .insert({
        party_id: partyId,
        user_id: user.id,
        menu_note: (data.get('menu_note') as string) || null,
        amount: Number(data.get('amount')),
      })

    if (err) {
      setError('참여에 실패했어요. 다시 시도해 주세요.')
      setLoading(false)
      return
    }

    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="font-semibold text-gray-900">파티 참여하기</h3>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">주문 메뉴 (선택)</label>
        <input
          name="menu_note"
          placeholder="예) 빅맥 세트, 후라이드 치킨 1마리"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">내 금액 *</label>
        <div className="relative">
          <input
            name="amount"
            type="number"
            required
            min="1000"
            step="1000"
            placeholder="8000"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? '참여 중...' : '파티 참여하기'}
      </button>
    </form>
  )
}
