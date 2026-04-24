import { useMemo, useState } from 'react'

type ImageSliderProps = {
  images: string[]
  alt: string
  className?: string
}

export function ImageSlider({ images, alt, className }: ImageSliderProps) {
  const safeImages = useMemo(() => {
    if (images.length > 0) {
      return images
    }

    return ['https://images.unsplash.com/photo-1512820790803-83ca734da794']
  }, [images])

  const [currentIndex, setCurrentIndex] = useState(0)

  const goTo = (nextIndex: number) => {
    setCurrentIndex((nextIndex + safeImages.length) % safeImages.length)
  }

  return (
    <div className={className}>
      <div className="relative h-full w-full overflow-hidden rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <img
          key={safeImages[currentIndex]}
          src={safeImages[currentIndex]}
          alt={alt}
          className="h-full w-full object-cover"
        />

        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => goTo(currentIndex - 1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => goTo(currentIndex + 1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 px-3 py-2 text-sm font-bold text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
              aria-label="Next image"
            >
              →
            </button>
          </>
        ) : null}
      </div>

      {safeImages.length > 1 ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {safeImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => goTo(index)}
              className={`h-2.5 rounded-full transition ${
                index === currentIndex ? 'w-8 bg-amber-500' : 'w-2.5 bg-amber-200 hover:bg-amber-300'
              }`}
              aria-label={`Open image ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
