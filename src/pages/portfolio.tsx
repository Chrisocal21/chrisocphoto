import Layout from '@/components/Layout'
import { GALLERY_IMAGES } from '@/data/photos'
import Image from 'next/image'
import { useState } from 'react'
import Head from 'next/head';
import Link from 'next/link';

interface LatestImage {
  url: string;
  title: string;
  categoryName: string;
  categoryIndex: number;
}

export default function Portfolio() {
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; } | null>(null)
  const [currentCategory, setCurrentCategory] = useState(0)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'categories' | 'latest'>('categories')
  
  // Function to get the latest images across all categories
  const getLatestImages = (): LatestImage[] => {
    // In a real implementation, you would sort by date
    // Here we're simply taking the first few images from each category
    return GALLERY_IMAGES.flatMap(category => 
      category.images.slice(0, 2).map(image => ({
        ...image,
        categoryName: category.category,
        categoryIndex: GALLERY_IMAGES.findIndex(c => c.category === category.category)
      }))
    ).slice(0, 9); // Limit to 9 most recent images
  }
  
  const latestImages = getLatestImages();
  
  const openImageViewer = (categoryIndex: number, imageIndex: number) => {
    setCurrentCategory(categoryIndex)
    setCurrentImageIndex(imageIndex)
    setSelectedImage(GALLERY_IMAGES[categoryIndex].images[imageIndex])
  }
  
  // Open image from the latest section
  const openLatestImage = (image: LatestImage) => {
    const categoryIndex = image.categoryIndex;
    const imageIndex = GALLERY_IMAGES[categoryIndex].images.findIndex(img => img.url === image.url);
    if (imageIndex >= 0) {
      openImageViewer(categoryIndex, imageIndex);
    }
  }
  
  const closeImageViewer = () => {
    setSelectedImage(null)
  }
  
  const navigateImage = (direction: number) => {
    const categoryImages = GALLERY_IMAGES[currentCategory].images
    let newIndex = currentImageIndex + direction
    
    if (newIndex < 0) newIndex = categoryImages.length - 1
    if (newIndex >= categoryImages.length) newIndex = 0
    
    setCurrentImageIndex(newIndex)
    setSelectedImage(categoryImages[newIndex])
  }

  return (
    <Layout title="Portfolio - ChrisOC Photo">
      <div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Navigation menu */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button 
              onClick={() => setViewMode('latest')}
              className={`px-4 py-2 text-sm font-medium rounded-l-lg ${viewMode === 'latest' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              aria-current={viewMode === 'latest' ? 'page' : undefined}
            >
              Latest
            </button>
            <button 
              onClick={() => setViewMode('categories')}
              className={`px-4 py-2 text-sm font-medium rounded-r-lg ${viewMode === 'categories' 
                ? 'bg-blue-600 text-white' 
                : 'bg-white text-gray-900 hover:bg-gray-100'}`}
              aria-current={viewMode === 'categories' ? 'page' : undefined}
            >
              Categories
            </button>
          </div>
        </div>
        
        {/* Latest images section */}
        {viewMode === 'latest' && (
          <div className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">Latest Images</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {latestImages.map((image, index) => (
                <div 
                  key={`latest-${index}`} 
                  className="relative aspect-[4/3] overflow-hidden rounded-lg neo-card cursor-pointer"
                  onClick={() => openLatestImage(image)}
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    quality={80}
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-white text-sm">{image.categoryName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Categories section */}
        {viewMode === 'categories' && GALLERY_IMAGES.map((category, categoryIndex) => (
          <div key={category.category} className="mb-12">
            <h2 className="text-3xl font-semibold mb-6">{category.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {category.images.map((image, imageIndex) => (
                <div 
                  key={image.title} 
                  className="relative aspect-[4/3] overflow-hidden rounded-lg neo-card cursor-pointer"
                  onClick={() => openImageViewer(categoryIndex, imageIndex)}
                >
                  <Image
                    src={image.url}
                    alt={image.title}
                    fill
                    style={{ objectFit: 'cover' }}
                    quality={80}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl">
            {/* Close button */}
            <button 
              onClick={closeImageViewer}
              className="absolute top-4 right-4 z-10 bg-black/30 hover:bg-black/50 rounded-full p-2 text-white"
              aria-label="Close image viewer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image container */}
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl neo-glow">
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                fill
                style={{ objectFit: 'contain' }}
                quality={90}
              />
              
              {/* Image Info Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-xl font-medium text-white">{selectedImage.title}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-white/70 text-sm">{GALLERY_IMAGES[currentCategory].category}</span>
                </div>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between px-4">
              <button 
                onClick={() => navigateImage(-1)}
                className="bg-black/30 hover:bg-black/50 rounded-full p-3 text-white"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={() => navigateImage(1)}
                className="bg-black/30 hover:bg-black/50 rounded-full p-3 text-white"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
