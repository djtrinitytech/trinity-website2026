import { useEffect, useMemo, useState } from 'react';
import { Maximize2, Pause, Play, Zap, Wind } from 'lucide-react';
import { imageSrcSet, thumbnailImageUrl } from '../data/imageUrls';

function preferredColumns(width) {
  if (width < 768) return 2;
  if (width < 1024) return 3;
  if (width < 1280) return 4;
  return 5;
}

export default function ParallaxColumnsGallery({ photos, albums, selectedAlbumId, onSelectAlbum, onSelectPhoto, isLoading, error, onRetry }) {
  const [columnCount, setColumnCount] = useState(() => preferredColumns(window.innerWidth));
  const [isPaused, setIsPaused] = useState(false);
  const [isFast, setIsFast] = useState(false);

  useEffect(() => {
    const updateColumns = () => setColumnCount(preferredColumns(window.innerWidth));
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  const columns = useMemo(() => {
    if (!photos.length) return [];
    const count = Math.min(columnCount, photos.length);
    const nextColumns = Array.from({ length: count }, () => []);
    photos.forEach((photo, index) => nextColumns[index % count].push(photo));
    return nextColumns;
  }, [columnCount, photos]);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-transparent text-white">
      <header className="absolute inset-x-0 top-0 z-30 border-b border-gold-antique/20 bg-obsidian-950/70 backdrop-blur-md">
        <div className="mx-auto flex min-h-16 max-w-[1800px] items-center justify-between gap-3 px-3 py-2.5 sm:px-5 lg:px-8">
          <a href="/gallery" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold-antique/50 bg-gold-antique/10 font-devanagari text-2xl text-gold-pale">अ</span>
            <span className="min-w-0">
              <span className="block font-devanagari text-base font-bold leading-tight text-gold-pale">अनुगाथा</span>
              <span className="hidden truncate font-cinzel text-[9px] uppercase tracking-[0.18em] text-parchment-dim sm:block sm:text-[10px]">Cultural Event Gallery</span>
            </span>
          </a>
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <label className="sr-only" htmlFor="gallery-album-filter">Filter photos by event album</label>
            <select
              id="gallery-album-filter"
              value={selectedAlbumId}
              onChange={event => onSelectAlbum(event.target.value)}
              className="h-11 max-w-[42vw] rounded-md border border-gold-antique/30 bg-obsidian-950 px-2 text-xs text-parchment-light outline-none focus:border-gold-pale sm:max-w-64 sm:px-3"
            >
              <option value="all">All event albums</option>
              {albums.map(album => <option key={album.id} value={album.id}>{album.title}</option>)}
            </select>
            <span className="hidden shrink-0 items-center gap-1.5 font-cinzel text-[10px] uppercase tracking-wider text-parchment-dim sm:flex">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold-pale" />
              {photos.length} photos
            </span>
          </div>
        </div>
      </header>

      <main className="absolute inset-0 px-2 pb-20 pt-[4.75rem] sm:px-3 sm:pb-20 sm:pt-[5.25rem]" aria-label="Continuously scrolling event photographs">
        {isLoading && <div className="grid h-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" aria-label="Loading photographs">
          {Array.from({ length: columnCount }, (_, index) => <div key={index} className="h-full animate-pulse rounded-xl bg-white/[0.035]" />)}
        </div>}
        {!isLoading && error && <div role="alert" className="flex h-full flex-col items-center justify-center text-center">
          <p className="text-sm text-red-200">{error}</p>
          <button onClick={onRetry} className="mt-4 min-h-11 rounded-md border border-red-200/30 px-4 text-sm text-red-100">Try again</button>
        </div>}
        {!isLoading && !error && photos.length === 0 && <div className="flex h-full flex-col items-center justify-center text-center">
          <p className="font-cinzel text-sm uppercase tracking-wider text-gold-pale">No published photographs yet</p>
          <p className="mt-2 text-xs text-parchment-dim">Published event albums will appear here.</p>
        </div>}
        {!isLoading && !error && photos.length > 0 && <div className="grid h-full grid-cols-2 gap-1.5 sm:gap-2" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((columnPhotos, columnIndex) => <div
            key={`${selectedAlbumId}-${columnIndex}`}
            className={`parallax-column relative h-full overflow-hidden ${columnIndex % 2 === 1 ? 'parallax-column-reverse' : ''}`}
            onMouseEnter={event => event.currentTarget.classList.add('is-hovered')}
            onMouseLeave={event => event.currentTarget.classList.remove('is-hovered')}
            onFocusCapture={event => event.currentTarget.classList.add('is-hovered')}
            onBlurCapture={event => event.currentTarget.classList.remove('is-hovered')}
          >
            <div
              className={`parallax-track ${isPaused ? 'is-paused' : ''}`}
              style={{ '--track-duration': `${isFast ? 38 + columnIndex * 3 : 66 + columnIndex * 5}s`, '--track-delay': `${-columnIndex * 7}s` }}
            >
              {[0, 1].map(copy => <div key={copy} className="parallax-photo-stack" aria-hidden={copy === 1}>
                {columnPhotos.map((photo, itemIndex) => <button
                  key={`${photo.id}-${copy}`}
                  type="button"
                  tabIndex={copy === 1 ? -1 : 0}
                  onClick={() => onSelectPhoto(photo)}
                  className="parallax-photo-card group relative mb-1.5 block w-full aspect-[16/10] overflow-hidden rounded-lg border border-white/10 bg-obsidian-900 text-left shadow-xl sm:mb-2"
                >
                  <img
                    src={thumbnailImageUrl(photo)}
                    srcSet={imageSrcSet(photo, 'thumbnail')}
                    sizes="(max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, 20vw"
                    alt={photo.title || photo.eventName}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover brightness-90 transition duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-105"
                    onError={event => {
                      event.currentTarget.classList.add('hidden');
                      event.currentTarget.parentElement.querySelector('[data-image-fallback]')?.classList.remove('hidden');
                    }}
                  />
                  <div data-image-fallback className="absolute inset-0 hidden items-center justify-center bg-obsidian-900 px-3 text-center font-cinzel text-xs text-parchment-dim">Photograph unavailable</div>
                  <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/15" />
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-5 w-5 text-gold-pale drop-shadow-md" />
                  </span>
                </button>)}
              </div>)}
            </div>
          </div>)}
        </div>}
      </main>

      <div className="absolute bottom-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-gold-antique/25 bg-obsidian-950/80 p-1.5 shadow-2xl backdrop-blur-xl sm:bottom-5 sm:gap-2 sm:p-2">
        <button onClick={() => setIsPaused(value => !value)} className="touch-target gap-1.5 rounded-full px-3 text-xs font-cinzel uppercase tracking-wider text-white hover:bg-white/10" aria-label={isPaused ? 'Resume continuous scrolling' : 'Pause continuous scrolling'} title={isPaused ? 'Resume scrolling' : 'Pause scrolling'}>
          {isPaused ? <Play className="h-4 w-4 text-gold-pale" /> : <Pause className="h-4 w-4 text-gold-pale" />}
          <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
        </button>
        <span className="h-6 w-px bg-white/15" />
        <button onClick={() => setIsFast(value => !value)} className="touch-target gap-1.5 rounded-full px-3 text-xs font-cinzel uppercase tracking-wider text-white hover:bg-white/10" aria-label={isFast ? 'Set scrolling to relaxed speed' : 'Speed up continuous scrolling'} title={isFast ? 'Relaxed speed' : 'Speed up'}>
          {isFast ? <Zap className="h-4 w-4 text-gold-pale" /> : <Wind className="h-4 w-4 text-gold-pale" />}
          <span className="hidden sm:inline">{isFast ? 'Fast' : 'Relaxed'}</span>
        </button>
      </div>
    </div>
  );
}