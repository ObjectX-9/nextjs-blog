'use client'

import { useSiteStore } from '@/store/site'
import { useEffect } from 'react'
import { registerComponents } from '../customMdRender/registerComponents'

export default function SiteProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchSite } = useSiteStore()

  useEffect(() => {
    fetchSite()
    registerComponents();
  }, [fetchSite])

  return <>{children}</>
}
