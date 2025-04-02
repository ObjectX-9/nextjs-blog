'use client'

import { useSiteStore } from "@/store/site"
import Image from 'next/image'

export default function HomeHeader() {
  const { site } = useSiteStore()

  return (
    <div className="relative w-full">
      {/* Background Image */}
      <div className="w-[80%] h-[25vh] rounded-xl overflow-hidden relative mx-auto">
        <Image
          src={site?.backgroundImage || '/images/background.jpg'}
          alt="Background"
          fill
          className="object-cover object-[center_12%]"
          priority
        />
      </div>

      {/* Avatar */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-16">
        <div className="w-32 h-32 rounded-full bg-white p-2 shadow-lg">
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={site?.author?.avatar || '/avatar.png'}
              alt="Avatar"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
