'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  partyId: string
  hasKakaoPayLink: boolean
}

export default function ClosePartyButton({ partyId, hasKakaoPayLink }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClose() {
    if (!confirm('파티를 마감하고 주문 완료로 처리할까요?')) return
    setLoading(true)

    const supabase = createClient()
    await supabase.from('parties').update({ status: 'ordered' }).eq('id', partyId)
    router.refresh()
  }

  return (
    <div className="flex gap-2 pt-2 border-t border-gray-100">
      <button
        onClick={handleClose}
        disabled={loading}
        className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading ? '처리 중...' : '주문 완료 처리'}
      </button>
      {!hasKakaoPayLink && (
        <p className="text-xs text-gray-400 self-center">카카오페이 링크를 등록하면 파티원에게 정산 버튼이 보여요</p>
      )}
    </div>
  )
}
