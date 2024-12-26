'use client'

import { useSiteStore } from '@/store/site'
import { useEffect } from 'react'

export default function SiteProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { fetchSite } = useSiteStore()

  useEffect(() => {
    fetchSite()
  }, [fetchSite])

  return <>{children}</>
}
