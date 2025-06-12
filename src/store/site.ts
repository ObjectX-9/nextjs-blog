import { create } from 'zustand'
import { ISite } from '@/app/model/site'
import { request } from '@/utils/request'

interface SiteStore {
  site: ISite | null
  loading: boolean
  error: string | null
  fetchSite: () => Promise<void>
  updateVisitCount: () => Promise<void>
  updateLikeCount: () => Promise<void>
}

export const useSiteStore = create<SiteStore>((set) => ({
  site: null,
  loading: false,
  error: null,

  fetchSite: async () => {
    try {
      set({ loading: true, error: null })
      const response = await request.get<{ success: boolean, site: ISite, error?: string }>('site', {}, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });

      const data = response.data;
      if (data.success) {
        set({ site: data.site })
      } else {
        set({ error: data.error || '获取站点信息失败' })
      }
    } catch (error) {
      set({ error: '获取站点信息失败' })
    } finally {
      set({ loading: false })
    }
  },

  updateVisitCount: async () => {
    try {
      const response = await request.patch<{ success: boolean, site: ISite }>('site', { type: 'visit' });
      const data = response.data;
      if (data.success) {
        set({ site: data.site })
      }
    } catch (error) {
      console.error('更新访问量失败:', error)
    }
  },

  updateLikeCount: async () => {
    try {
      const response = await request.patch<{ success: boolean, site: ISite }>('site', { type: 'like' });
      const data = response.data;
      if (data.success) {
        set({ site: data.site })
      }
    } catch (error) {
      console.error('更新点赞数失败:', error)
    }
  },
}))
