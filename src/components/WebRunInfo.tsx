'use client'

import { useSiteStore } from '@/store/site'
import { useEffect, useState, useRef, useMemo } from 'react'
import { Heart, Eye, Timer, QrCode } from "lucide-react"
import Image from 'next/image'

const VISIT_KEY = 'site_visited_date'
const LIKE_KEY = 'site_liked'

// Web端二维码展示组件
const QrcodePopover = ({ site, onClose }: { site: any, onClose: () => void }) => {
  return (
    <div className="fixed md:absolute bottom-full right-0 mb-2 bg-white rounded-xl shadow-2xl z-[100]">
      <div className="relative p-4">
        <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white transform rotate-45" />
        <div className="flex gap-6">
          {site?.qrcode && (
            <div className="text-center" key="wechat">
              <div className="relative w-20 h-20">
                <Image
                  src={site.qrcode}
                  alt="二维码"
                  fill
                  sizes="80px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">微信</div>
            </div>
          )}
          {site?.appreciationCode && (
            <div className="text-center" key="appreciation">
              <div className="relative w-20 h-20">
                <Image
                  src={site.appreciationCode}
                  alt="赞赏码"
                  fill
                  sizes="80px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">赞赏</div>
            </div>
          )}
          {site?.wechatGroup && (
            <div className="text-center" key="group">
              <div className="relative w-20 h-20">
                <Image
                  src={site.wechatGroup}
                  alt="微信公众号"
                  fill
                  sizes="80px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">公众号</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 移动端二维码展示组件
const QrcodeModal = ({ site, onClose }: { site: any, onClose: () => void }) => {
  const handleModalClick = (e: React.MouseEvent) => {
    // 点击背景时关闭
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleCloseClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={handleModalClick}>
      <div className="relative bg-white rounded-xl w-[90%] max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div 
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 cursor-pointer"
          onClick={handleCloseClick}
        >
          <span className="text-gray-500 text-lg">&times;</span>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {site?.qrcode && (
            <div className="text-center" key="wechat">
              <div className="relative w-28 h-28 mx-auto">
                <Image
                  src={site.qrcode}
                  alt="二维码"
                  fill
                  sizes="112px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">微信</div>
            </div>
          )}
          {site?.appreciationCode && (
            <div className="text-center" key="appreciation">
              <div className="relative w-28 h-28 mx-auto">
                <Image
                  src={site.appreciationCode}
                  alt="赞赏码"
                  fill
                  sizes="112px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">赞赏</div>
            </div>
          )}
          {site?.wechatGroup && (
            <div className="text-center" key="group">
              <div className="relative w-28 h-28 mx-auto">
                <Image
                  src={site.wechatGroup}
                  alt="微信公众号"
                  fill
                  sizes="112px"
                  className="object-contain rounded-lg"
                  priority
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">公众号</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export const WebRunInfo = () => {
  const { site, updateVisitCount, updateLikeCount } = useSiteStore();
  const [runningTime, setRunningTime] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [hasLiked, setHasLiked] = useState(false)
  const [showQrcode, setShowQrcode] = useState(false)
  const qrcodeRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    try {
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

      setRunningTime(`${days}天${hours}时${minutes}分`)
    }

    calculateRunningTime()
    const timer = setInterval(calculateRunningTime, 60000)
    return () => clearInterval(timer)
  }, [site?.createdAt])

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
            if (date !== today || (currentTime - timestamp) > 12 * 60 * 60 * 1000) {
              shouldUpdate = true
            }
          } catch {
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

    const timeoutId = setTimeout(checkAndUpdateVisit, 1000)
    return () => clearTimeout(timeoutId)
  }, [updateVisitCount])

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

  const handleMouseEnter = () => {
    if (!isMobile) setShowQrcode(true)
  }

  const handleMouseLeave = () => {
    if (!isMobile) setShowQrcode(false)
  }

  const handleQrcodeClick = (e: React.MouseEvent) => {
    e.stopPropagation() // 阻止事件冒泡
    if (isMobile) setShowQrcode(true)
  }

  useEffect(() => {
    if (!isMobile) {
      const handleClickOutside = (event: MouseEvent) => {
        if (qrcodeRef.current && !qrcodeRef.current.contains(event.target as Node)) {
          setShowQrcode(false)
        }
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobile])

  const qrcodeCount = useMemo(() => {
    return [site?.qrcode, site?.appreciationCode, site?.wechatGroup].filter(Boolean).length
  }, [site?.qrcode, site?.appreciationCode, site?.wechatGroup])

  const hasAnyQrcode = qrcodeCount > 0

  return (
    <div className="flex flex-wrap md:flex-nowrap items-center gap-2 md:overflow-visible py-1">
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 ${hasLiked
          ? 'bg-gray-200 cursor-not-allowed'
          : 'bg-[#ff7e95]/20 cursor-pointer hover:bg-[#ff7e95]/30 hover:scale-105'
          } transition-all duration-200`}
        onClick={handleLike}
        title={hasLiked ? "您已经点过赞啦" : "点赞支持一下"}
      >
        <Heart
          className={`w-4 h-4 ${hasLiked ? 'fill-[#ff7e95] text-[#ff7e95]' : 'text-[#ff7e95]'} translate-y-[1px]`}
        />
        <span className="text-sm whitespace-nowrap">喜欢本站</span>
        <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm min-w-[2rem] text-center">
          {site?.likeCount || 0}
        </span>
      </div>

      <span className="text-gray-300 flex items-center">|</span>

      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 bg-[#48bfaf]/20">
        <Eye className="w-4 h-4 text-[#48bfaf] translate-y-[1px]" />
        <span className="text-sm whitespace-nowrap">访问量</span>
        <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm min-w-[2rem] text-center">
          {site?.visitCount || 0}
        </span>
      </div>

      <span className="text-gray-300 flex items-center">|</span>

      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 bg-gray-500/20">
        <Timer className="w-4 h-4 text-gray-500 translate-y-[1px]" />
        <span className="text-sm whitespace-nowrap">运行时间</span>
        <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm whitespace-nowrap">
          {runningTime}
        </span>
      </div>

      <span className="text-gray-300 flex items-center">|</span>

      {hasAnyQrcode && (
        <div
          className="relative"
          ref={qrcodeRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleQrcodeClick}
          style={{ zIndex: 50 }}
        >
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-gray-600 bg-purple-500/20 cursor-pointer hover:bg-purple-500/30 hover:scale-105 transition-all duration-200"
          >
            <QrCode className="w-4 h-4 text-purple-500 translate-y-[1px]" />
            <span className="text-sm whitespace-nowrap">关注我</span>
            <span className="bg-white/50 px-1.5 py-0.5 rounded text-sm min-w-[2rem] text-center">
              {qrcodeCount}
            </span>
          </div>

          {showQrcode && (
            isMobile ? (
              <QrcodeModal site={site} onClose={() => setShowQrcode(false)} />
            ) : (
              <QrcodePopover site={site} onClose={() => setShowQrcode(false)} />
            )
          )}
        </div>
      )}
    </div>
  )
}
