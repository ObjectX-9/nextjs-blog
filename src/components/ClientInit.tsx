'use client';

import { useEffect } from 'react';
import { registerComponents } from '@/components/customMdRender/registerComponents';

export function ClientInit() {
  useEffect(() => {
    registerComponents();
  }, []);

  return null;
}
