import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '编辑反思笔记',
  description: '编辑项目需求的反思笔记和总结',
}

export default function ReflectionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 bg-white">
      {children}
    </div>
  )
} 