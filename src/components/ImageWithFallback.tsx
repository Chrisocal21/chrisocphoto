import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  fallbackSrc = '/images/placeholder/image-placeholder.jpg',
  alt,
  ...rest
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  return (
    <>
      {error ? (
        <div 
          className="w-full h-full bg-gray-800 flex items-center justify-center text-center p-4" 
          style={{ aspectRatio: rest.width && rest.height ? `${rest.width}/${rest.height}` : 'auto' }}
        >
          <p className="text-gray-400">{alt || 'Image not available'}</p>
        </div>
      ) : (
        <Image
          {...rest}
          src={imgSrc}
          alt={alt || ''}
          onError={() => {
            setImgSrc(fallbackSrc);
            if (imgSrc === fallbackSrc) {
              setError(true);
            }
          }}
        />
      )}
    </>
  );
}
