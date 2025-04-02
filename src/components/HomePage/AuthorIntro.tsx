'use client'

import { useSiteStore } from "@/store/site"

export default function AuthorIntro() {
  const { site } = useSiteStore()

  return (
    <p className="text-gray-600 mt-4">
      你好 👋，我是{" "}
      <span className="bg-[#e8f5e9] px-2 py-0.5 rounded">
        {site?.author?.name || 'ObjectX'}
      </span>
      ，
      {site?.author?.description || '一个热爱生活和分享技术的前端工程师'}
    </p>
  )
}
