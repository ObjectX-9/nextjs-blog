'use client'

import { useSiteStore } from '@/store/site'
import { useEffect, useState } from 'react'
import { Heart, Eye, Timer } from "lucide-react"

const VISIT_KEY = 'site_visited_date'
const LIKE_KEY = 'site_liked'

export const WebRunInfo = () => {
  const { site, updateVisitCount, updateLikeCount } = useSiteStore();
  const [runningTime, setRunningTime] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)

  useEffect(() => {
    try {
      // 从 localStorage 读取点赞状态
      const likedStatus = localStorage.getItem(LIKE_KEY) === 'true'
      setHasLiked(likedStatus)
    } catch (error) {
      console.error('Error getting liked status:', error)
    }
  }, [])

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

  // 记录访问量（每天只记录一次）
  useEffect(() => {
    const checkAndUpdateVisit = async () => {
      try {
        const lastVisitData = localStorage.getItem(VISIT_KEY)
        const now = new Date()
        const today = now.toDateString()
        const currentTime = now.getTime()

        let shouldUpdate = false
        
        if (!lastVisitData) {
          shouldUpdate = true
        } else {
          try {
            const { date, timestamp } = JSON.parse(lastVisitData)
            // 如果是新的一天，或者距离上次访问超过12小时
            if (date !== today || (currentTime - timestamp) > 12 * 60 * 60 * 1000) {
              shouldUpdate = true
            }
          } catch {
            // 如果解析失败，说明是旧格式的数据，直接更新
            shouldUpdate = true
          }
        }

        if (shouldUpdate) {
          await updateVisitCount()
          localStorage.setItem(VISIT_KEY, JSON.stringify({
            date: today,
            timestamp: currentTime
          }))
        }
      } catch (error) {
        console.error('访问统计更新失败:', error instanceof Error ? error.message : '未知错误')
      }
    }

    const timeoutId = setTimeout(checkAndUpdateVisit, 1000) // 延迟1秒执行，避免立即加载时的并发请求
    return () => clearTimeout(timeoutId)
  }, [updateVisitCount])

  // 处理点赞
  const handleLike = async () => {
    if (isLiking || hasLiked) return
    setIsLiking(true)
    try {
      await updateLikeCount()
      localStorage.setItem(LIKE_KEY, 'true')
      setHasLiked(true)
    } catch (error) {
      console.error('Error liking site:', error)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <div 
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 ${
          hasLiked 
            ? 'bg-gray-200 cursor-not-allowed' 
            : 'bg-[#ff7e95]/20 cursor-pointer hover:bg-[#ff7e95]/30 hover:scale-105'
        } transition-all duration-200`}
        onClick={handleLike}
        title={hasLiked ? "您已经点过赞啦" : "点赞支持一下"}
      >
        <Heart 
          className={`w-4 h-4 ${hasLiked ? 'fill-[#ff7e95] text-[#ff7e95]' : 'text-[#ff7e95]'}`} 
        />
        <span className="text-sm">喜欢本站</span>
        <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm min-w-[2rem] text-center">
          {site?.likeCount || 0}
        </span>
      </div>

      <span className="text-gray-300 flex items-center">|</span>

      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 bg-[#48bfaf]/20">
        <Eye className="w-4 h-4 text-[#48bfaf]" />
        <span className="text-sm">访问量</span>
        <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm min-w-[2rem] text-center">
          {site?.visitCount || 0}
        </span>
      </div>

      <span className="text-gray-300 flex items-center">|</span>

      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 bg-gray-500/20">
        <Timer className="w-4 h-4 text-gray-500" />
        <span className="text-sm">运行时间</span>
        <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm">
          {runningTime}
        </span>
      </div>
    </div>
  )
}
