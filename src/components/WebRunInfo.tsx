'use client'

import { useSiteStore } from '@/store/site'
import { useEffect, useState } from 'react'

export const WebRunInfo = () => {
  const { site } = useSiteStore();
  const [runningTime, setRunningTime] = useState('')

  useEffect(() => {
    const calculateRunningTime = () => {
      const now = new Date()
      const createdAt = site?.createdAt ? new Date(site.createdAt) : new Date('2024-01-01')
      const diff = now.getTime() - createdAt.getTime()

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      setRunningTime(`${days}天${hours}小时${minutes}分钟`)
    }

    calculateRunningTime()
    const timer = setInterval(calculateRunningTime, 60000) // 每分钟更新一次

    return () => clearInterval(timer)
  }, [site?.createdAt])

  return (
    <div className="flex flex-wrap gap-1">
      <div className="flex items-center gap-1 px-2 py-1 rounded text-gray-600 bg-[#ff7e95]/20">
        <span>喜欢本站</span>
        <span className="bg-white/30 px-1.5 py-0.5 rounded text-sm">
          {site?.likeCount || 0}
        </span>
      </div>

      <span className="text-gray-300 flex items-center">|</span>

      <div className="flex items-center gap-1 px-2 py-1 rounded text-gray-600 bg-[#48bfaf]/20">
        <span>访问量</span>
        <span className="bg-white/30 px-1.5 py-0.5 rounded text-sm">
          {site?.visitCount || 0}
        </span>
      </div>

      <span className="text-gray-300 flex items-center">|</span>

      <div className="flex items-center gap-1 px-2 py-1 rounded text-gray-600 bg-gray-500/20">
        <span>运行时间</span>
        <span className="bg-white/30 px-1.5 py-0.5 rounded text-sm">
          {runningTime}
        </span>
      </div>
    </div>
  )
}
