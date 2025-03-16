import Head from 'next/head';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Image from 'next/image';
import Link from 'next/link';
import { FEATURED_IMAGES } from '@/data/photos';

export default function Home() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % FEATURED_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Layout title="Chris OC Photography">
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-gray-900 to-black">
        <div className="relative z-10 flex flex-col items-center text-center px-4 pt-12 sm:pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16">
          <h1 className="neo-text text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 sm:mb-6 md:mb-8 pulse-subtle">
            <div>CHRIS OC</div>
            <div>P H O T O</div>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-light text-white/70 mb-8 sm:mb-10 md:mb-12">
          </p>
          
          {/* Featured Image Frame */}
          <div className="w-full max-w-5xl sm:max-w-5xl md:max-w-6xl mx-auto">
            <div className="relative aspect-[16/9] rounded-xl sm:rounded-2xl overflow-hidden 
                border-2 border-white/20 shadow-2xl neo-glow">
              {/* Image Slider */}
              <div className="relative w-full h-full">
                {FEATURED_IMAGES.map((image, index) => (
                  <div
                    key={image.title}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                      Image: {image.title}
                    </div>
                  </div>
                ))}
                
                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-xs sm:text-sm">
                      Limited Edition Print
                    </span>
                    <button className="neo-button text-xs sm:text-sm py-1 sm:py-2 px-2 sm:px-4">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Image Navigation Dots */}
            <div className="flex justify-center mt-3 sm:mt-4 md:mt-6 gap-1 sm:gap-2">
              {FEATURED_IMAGES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                    current === index ? 'bg-white scale-110' : 'bg-white/30 hover:bg-white/50'
                  }`}
                  aria-label={`View image ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Portfolio Button */}
            <div className="mt-6 sm:mt-8 md:mt-10 mb-8 sm:mb-12 md:mb-16 lg:mb-20 text-center">
              <Link href="/portfolio">
                <button className="neo-button py-2 sm:py-3 px-6 sm:px-8 text-base sm:text-lg font-medium hover:scale-105 transition-transform">
                  Enjoy the views
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
