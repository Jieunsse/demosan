'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewPartyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)

    const deadlineInput = data.get('deadline') as string
    const deadline = new Date(deadlineInput).toISOString()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login?next=/new')
      return
    }

    const { data: party, error: err } = await supabase
      .from('parties')
      .insert({
        host_id: user.id,
        restaurant_name: data.get('restaurant_name'),
        order_url: data.get('order_url') || null,
        min_order_amount: Number(data.get('min_order_amount')),
        deadline,
        pickup_location: data.get('pickup_location'),
        kakao_pay_link: data.get('kakao_pay_link') || null,
      })
      .select()
      .single()

    if (err) {
      setError('파티 생성에 실패했어요. 다시 시도해 주세요.')
      setLoading(false)
      return
    }

    router.push(`/${party.id}`)
  }

  const now = new Date()
  now.setMinutes(now.getMinutes() + 30)
  const defaultDeadline = now.toISOString().slice(0, 16)

  return (
    <main className="max-w-2xl mx-auto px-4 py-6">
      <div className="space-y-1 mb-6">
        <h1 className="text-xl font-bold text-gray-900">파티 만들기</h1>
        <p className="text-sm text-gray-500">같이 시킬 파티원을 모집해요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">가게 이름 *</label>
          <input
            name="restaurant_name"
            required
            placeholder="예) 맥도날드, BBQ 치킨"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">주문 링크 (선택)</label>
          <input
            name="order_url"
            type="url"
            placeholder="배달의민족, 쿠팡이츠 링크"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">최소 주문 금액 *</label>
          <div className="relative">
            <input
              name="min_order_amount"
              type="number"
              required
              min="1000"
              step="1000"
              placeholder="15000"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 pr-10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">모집 마감 시간 *</label>
          <input
            name="deadline"
            type="datetime-local"
            required
            defaultValue={defaultDeadline}
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">수령 장소 *</label>
          <input
            name="pickup_location"
            required
            placeholder="예) 1동 현관 앞, 2동 로비"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">카카오페이 링크 (선택)</label>
          <input
            name="kakao_pay_link"
            type="url"
            placeholder="정산용 카카오페이 링크"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {loading ? '파티 만드는 중...' : '파티 만들기'}
        </button>
      </form>
    </main>
  )
}
