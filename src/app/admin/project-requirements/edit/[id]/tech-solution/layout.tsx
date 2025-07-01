import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '编辑技术方案',
  description: '编辑项目需求的技术方案详情',
}

export default function TechSolutionLayout({
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