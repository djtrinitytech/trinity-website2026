import { useEffect, useState } from 'react';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { displayImageUrl, imageSrcSet } from '../data/imageUrls';
import ParallaxColumnsGallery from './ParallaxColumnsGallery';

async function fetchAlbums() {
  const response = await fetch('/api/albums');
  if (!response.ok) throw new Error('The gallery could not be loaded. Please try again.');
  return (await response.json()).albums;
}

function Lightbox({ photos, activeIndex, onClose, onChange }) {
  const photo = photos[activeIndex];
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onChange((activeIndex + 1) % photos.length);
      if (event.key === 'ArrowLeft') onChange((activeIndex - 1 + photos.length) % photos.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, onChange, onClose, photos.length]);

  let touchStartX = null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-2 backdrop-blur-xl sm:p-5" onClick={onClose}>
      <button onClick={onClose} aria-label="Close photo viewer" className="touch-target absolute right-3 top-3 z-20 rounded-full border border-white/20 bg-black/70 p-3 text-white sm:right-5 sm:top-5">
        <X className="h-5 w-5" />
      </button>
      {photos.length > 1 && <button onClick={event => { event.stopPropagation(); onChange((activeIndex - 1 + photos.length) % photos.length); }} aria-label="Previous photo" className="touch-target absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/65 p-3 text-white sm:left-5"><ChevronLeft /></button>}
      <div className="flex max-h-full w-full max-w-6xl flex-col items-center justify-center gap-3" onClick={event => event.stopPropagation()} onTouchStart={event => { touchStartX = event.touches[0].clientX; }} onTouchEnd={event => {
        if (touchStartX === null || photos.length < 2) return;
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 50) onChange((activeIndex + (delta < 0 ? 1 : -1) + photos.length) % photos.length);
        touchStartX = null;
      }}>
        <img
          src={displayImageUrl(photo)}
          srcSet={imageSrcSet(photo, 'display')}
          sizes="(max-width: 768px) 96vw, 80vw"
          alt={photo.title}
          className="max-h-[82vh] max-w-full rounded-md object-contain"
          fetchpriority="high"
          onError={event => {
            event.currentTarget.classList.add('hidden');
            event.currentTarget.parentElement.querySelector('[data-image-fallback]')?.classList.remove('hidden');
          }}
        />
        <div data-image-fallback className="hidden min-h-40 flex items-center justify-center gap-2 rounded-md border border-white/10 px-6 text-sm text-parchment-dim"><Camera className="h-5 w-5 text-gold-antique" /> Photograph unavailable</div>
        <div className="max-w-2xl px-10 text-center">
          <h2 className="font-cinzel text-sm font-semibold text-parchment-light sm:text-lg">{photo.title}</h2>
          {photo.description && <p className="mt-1 text-xs leading-relaxed text-parchment-dim sm:text-sm">{photo.description}</p>}
          <p className="mt-2 font-cinzel text-[10px] uppercase tracking-widest text-gold-antique">{activeIndex + 1} / {photos.length}</p>
        </div>
      </div>
      {photos.length > 1 && <button onClick={event => { event.stopPropagation(); onChange((activeIndex + 1) % photos.length); }} aria-label="Next photo" className="touch-target absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-black/65 p-3 text-white sm:right-5"><ChevronRight /></button>}
    </div>
  );
}

export default function PublicGallery() {
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('all');
  const [activePhotoIndex, setActivePhotoIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setIsLoading(true);
    setError('');
    try {
      const records = await fetchAlbums();
      setAlbums(records);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);
  const visibleAlbums = selectedAlbumId === 'all' ? albums : albums.filter(album => album.id === selectedAlbumId);
  const photos = visibleAlbums.flatMap(album => album.photos.map(photo => ({ ...photo, albumTitle: album.title })));

  return (
    <>
      <ParallaxColumnsGallery
        photos={photos}
        albums={albums}
        selectedAlbumId={selectedAlbumId}
        onSelectAlbum={setSelectedAlbumId}
        onSelectPhoto={photo => setActivePhotoIndex(photos.findIndex(item => item.id === photo.id))}
        isLoading={isLoading}
        error={error}
        onRetry={load}
      />
      {!isLoading && !error && activePhotoIndex !== null && activePhotoIndex >= 0 && <Lightbox photos={photos} activeIndex={activePhotoIndex} onClose={() => setActivePhotoIndex(null)} onChange={setActivePhotoIndex} />}
    </>
  );
}