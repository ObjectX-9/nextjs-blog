'use client';

import { usePathname } from 'next/navigation';
import SidePanel from './SidePanel';

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidePanel = !pathname?.includes('/verify');

  return (
    <div className="min-h-screen bg-white lg:flex">
      {showSidePanel && <SidePanel />}
      <div className="flex flex-1">{children}</div>
    </div>
  );
}
