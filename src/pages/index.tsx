import Layout from '@/components/Layout'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { FEATURED_IMAGES } from '@/data/photos'

export default function Home() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % FEATURED_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
        {FEATURED_IMAGES.map((image, index) => (
          <div
            key={image.title}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <Image
              src={image.url}
              alt={image.title}
              fill
              style={{ objectFit: 'cover' }}
              quality={90}
            />
            <div className="absolute inset-0 bg-black/30"></div>
          </div>
        ))}
        <div className="relative z-10 flex flex-col items-center justify-center h-screen text-center px-4">
          <h1 className="neo-text text-6xl sm:text-7xl lg:text-8xl font-bold mb-8 pulse-subtle">
            CHRISOC
          </h1>
          <p className="text-2xl sm:text-3xl font-light text-white/70">
            Professional Photography
          </p>
        </div>
      </div>
    </Layout>
  )
}
