import { useEffect, useState } from 'react';
import { AlertCircle, ArrowUpRight, Camera, Check, Eye, EyeOff, Images, LoaderCircle, LogOut, Plus, Trash2, UploadCloud } from 'lucide-react';
import { imageSrcSet, thumbnailImageUrl } from '../data/imageUrls';

async function apiRequest(url, options = {}) {
  const response = await fetch(url, { credentials: 'include', ...options });
  if (response.status === 204) return null;
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The request could not be completed.');
  return body;
}

function UploadProgress({ value }) {
  return <div className="mt-3" aria-live="polite">
    <div className="mb-1 flex justify-between text-xs text-parchment-dim"><span>{value < 100 ? 'Sending images' : 'Optimizing images on server'}</span><span>{value}%</span></div>
    <div className="h-2 overflow-hidden rounded-full bg-black/60"><div className="h-full rounded-full bg-gold-antique transition-[width] duration-200" style={{ width: `${value}%` }} /></div>
  </div>;
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onLogin(username, password);
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  };

  return <main className="flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
    <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-gold-antique/25 bg-obsidian-900/85 p-5 shadow-2xl backdrop-blur-md sm:p-8">
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-gold-antique/50 bg-gold-antique/10 font-devanagari text-2xl text-gold-pale">अ</div>
        <div><p className="font-cinzel text-[10px] uppercase tracking-[0.2em] text-gold-antique">Anugatha archive</p><h1 className="font-cinzel text-lg text-parchment-light">Administrator sign in</h1></div>
      </div>
      {error && <p role="alert" className="mb-4 flex gap-2 rounded-md border border-red-400/30 bg-red-950/20 p-3 text-sm text-red-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
      <label className="mb-4 block text-xs font-cinzel uppercase tracking-wider text-parchment-dim">Username
        <input autoComplete="username" required value={username} onChange={event => setUsername(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-pale" />
      </label>
      <label className="mb-6 block text-xs font-cinzel uppercase tracking-wider text-parchment-dim">Password
        <input type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm normal-case tracking-normal text-white outline-none focus:border-gold-pale" />
      </label>
      <button disabled={busy} className="admin-button flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 font-cinzel text-xs uppercase tracking-wider">
        {busy && <LoaderCircle className="h-4 w-4 animate-spin" />}{busy ? 'Signing in' : 'Sign in'}
      </button>
      <a href="/gallery" className="mt-5 flex items-center justify-center gap-1 text-xs text-parchment-dim hover:text-gold-pale">Return to public gallery <ArrowUpRight className="h-3 w-3" /></a>
    </form>
  </main>;
}

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTitle, setEditingTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [publishOnCreate, setPublishOnCreate] = useState(false);
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const selectedAlbum = albums.find(album => album.id === selectedAlbumId);

  const refreshAlbums = async () => {
    const response = await apiRequest('/api/admin/albums');
    setAlbums(response.albums);
    setSelectedAlbumId(current => current || response.albums[0]?.id || '');
  };

  useEffect(() => {
    let cancelled = false;
    apiRequest('/api/admin/session').then(async result => {
      if (cancelled) return;
      setAuthenticated(result.authenticated);
      if (result.authenticated) await refreshAlbums();
    }).catch(loadError => {
      if (!cancelled) setError(loadError.message);
    }).finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    setEditingTitle(selectedAlbum?.title || '');
    setEditingDescription(selectedAlbum?.description || '');
  }, [selectedAlbum?.id, selectedAlbum?.title, selectedAlbum?.description]);

  const login = async (username, password) => {
    await apiRequest('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
    setAuthenticated(true);
    await refreshAlbums();
  };

  const logout = async () => {
    await apiRequest('/api/admin/logout', { method: 'POST' });
    setAuthenticated(false);
    setAlbums([]);
    setSelectedAlbumId('');
  };

  const createAlbum = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await apiRequest('/api/admin/albums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, published: publishOnCreate }) });
      setTitle('');
      setDescription('');
      setSelectedAlbumId(result.album.id);
      await refreshAlbums();
      setSelectedAlbumId(result.album.id);
      setMessage('Album created.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const uploadPhotos = event => {
    event.preventDefault();
    if (!selectedAlbumId || !files.length) return;
    setBusy(true);
    setError('');
    setMessage('');
    setProgress(0);
    const formData = new FormData();
    [...files].forEach(file => formData.append('images', file));
    const request = new XMLHttpRequest();
    request.open('POST', `/api/admin/albums/${encodeURIComponent(selectedAlbumId)}/photos`);
    request.withCredentials = true;
    request.upload.addEventListener('progress', event => {
      if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
    });
    request.addEventListener('load', async () => {
      const result = (() => { try { return JSON.parse(request.responseText); } catch { return {}; } })();
      if (request.status < 200 || request.status >= 300) setError(result.error || 'Upload failed.');
      else {
        setFiles([]);
        setMessage(`${result.count} ${result.count === 1 ? 'photo' : 'photos'} uploaded and optimized.`);
        try { await refreshAlbums(); } catch (refreshError) { setError(refreshError.message); }
      }
      setBusy(false);
      setProgress(null);
    });
    request.addEventListener('error', () => {
      setError('Upload interrupted. Check your connection and try again.');
      setBusy(false);
      setProgress(null);
    });
    request.send(formData);
  };

  const updateAlbum = async (album, changes) => {
    setError('');
    try {
      await apiRequest(`/api/admin/albums/${encodeURIComponent(album.id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(changes) });
      await refreshAlbums();
      setMessage(changes.published === undefined ? 'Album updated.' : changes.published ? 'Album published.' : 'Album unpublished.');
    } catch (requestError) { setError(requestError.message); }
  };

  const deleteAlbum = async album => {
    if (!window.confirm(`Delete “${album.title}” and all ${album.photoCount} photos? This cannot be undone.`)) return;
    setError('');
    try {
      await apiRequest(`/api/admin/albums/${encodeURIComponent(album.id)}`, { method: 'DELETE' });
      setAlbums(current => current.filter(item => item.id !== album.id));
      setSelectedAlbumId(current => current === album.id ? '' : current);
      setMessage('Album deleted.');
    } catch (requestError) { setError(requestError.message); }
  };

  const deletePhoto = async photo => {
    if (!window.confirm(`Remove “${photo.title}” from this album?`)) return;
    setError('');
    try {
      await apiRequest(`/api/admin/albums/${encodeURIComponent(selectedAlbumId)}/photos/${encodeURIComponent(photo.id)}`, { method: 'DELETE' });
      await refreshAlbums();
      setMessage('Photo removed.');
    } catch (requestError) { setError(requestError.message); }
  };

  if (isLoading) return <main className="flex min-h-screen items-center justify-center text-gold-pale"><LoaderCircle className="h-6 w-6 animate-spin" /></main>;
  if (!authenticated) return <div className="min-h-screen bg-transparent text-parchment-light"><header className="border-b border-gold-antique/20 bg-obsidian-950/65 px-4 py-3 backdrop-blur-md"><a href="/gallery" className="font-devanagari text-lg font-bold text-gold-pale">अनुगाथा <span className="font-cinzel text-xs font-normal uppercase tracking-wider text-parchment-dim">Admin</span></a></header>{error && <p role="alert" className="mx-auto mt-6 flex max-w-md items-center gap-2 px-4 text-sm text-red-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}<Login onLogin={login} /></div>;

  const saveAlbumDetails = async event => {
    event.preventDefault();
    if (!selectedAlbum) return;
    await updateAlbum(selectedAlbum, { title: editingTitle, description: editingDescription });
  };

  return <div className="min-h-screen overflow-x-hidden bg-transparent text-parchment-light">
    <header className="sticky top-0 z-30 border-b border-gold-antique/20 bg-obsidian-950/75 backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a href="/gallery" className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg border border-gold-antique/50 bg-gold-antique/10 font-devanagari text-2xl text-gold-pale">अ</span><span><span className="block font-devanagari text-base font-bold text-gold-pale">अनुगाथा</span><span className="block font-cinzel text-[10px] uppercase tracking-[0.18em] text-parchment-dim">Archive administration</span></span></a>
        <div className="flex items-center gap-2"><a href="/gallery" className="admin-button touch-target flex items-center gap-1.5 rounded-md px-3 text-xs"><ArrowUpRight className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Public gallery</span></a><button onClick={logout} className="admin-button touch-target flex items-center gap-1.5 rounded-md px-3 text-xs"><LogOut className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Sign out</span></button></div>
      </div>
    </header>

    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:py-9">
      <aside className="space-y-5">
        <form onSubmit={createAlbum} className="rounded-lg border border-gold-antique/25 bg-obsidian-900/85 p-4 backdrop-blur-sm sm:p-5">
          <h1 className="mb-4 flex items-center gap-2 font-cinzel text-sm font-semibold uppercase tracking-wider text-gold-pale"><Plus className="h-4 w-4" /> New album</h1>
          <label className="mb-3 block text-xs text-parchment-dim">Album title
            <input required maxLength={160} value={title} onChange={event => setTitle(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm text-white outline-none focus:border-gold-pale" />
          </label>
          <label className="mb-4 block text-xs text-parchment-dim">Description
            <textarea maxLength={2000} rows={3} value={description} onChange={event => setDescription(event.target.value)} className="mt-1.5 w-full resize-y rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-gold-pale" />
          </label>
          <label className="mb-4 flex min-h-11 cursor-pointer items-center gap-2 text-xs text-parchment-dim"><input type="checkbox" checked={publishOnCreate} onChange={event => setPublishOnCreate(event.target.checked)} className="h-4 w-4 accent-yellow-600" /> Publish immediately</label>
          <button disabled={busy} className="admin-button min-h-11 w-full rounded-md px-4 font-cinzel text-xs uppercase tracking-wider">Create album</button>
        </form>

        <section className="rounded-lg border border-white/10 bg-obsidian-900/65 p-4 backdrop-blur-sm">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-cinzel text-xs uppercase tracking-wider text-parchment-dim">Albums</h2><span className="text-xs text-gold-antique">{albums.length}</span></div>
          {albums.length === 0 && <p className="py-3 text-xs text-parchment-dim">Create an album to begin.</p>}
          <div className="max-h-[40vh] space-y-1 overflow-y-auto lg:max-h-[55vh]">
            {albums.map(album => <button key={album.id} aria-pressed={album.id === selectedAlbumId} onClick={() => setSelectedAlbumId(album.id)} className="admin-album-button flex min-h-12 w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left">
              <span className="min-w-0"><span className="block truncate text-sm">{album.title}</span><span className="text-[10px]">{album.photoCount} photos · {album.published ? 'Published' : 'Draft'}</span></span>
              {album.published ? <Eye className="h-4 w-4 shrink-0 text-emerald-300" /> : <EyeOff className="h-4 w-4 shrink-0 text-parchment-dim" />}
            </button>)}
          </div>
        </section>
      </aside>

      <section className="min-w-0">
        {error && <p role="alert" className="mb-4 flex items-center gap-2 rounded-md border border-red-400/30 bg-red-950/20 p-3 text-sm text-red-200"><AlertCircle className="h-4 w-4 shrink-0" />{error}</p>}
        {message && <p role="status" className="mb-4 flex items-center gap-2 rounded-md border border-emerald-400/20 bg-emerald-950/20 p-3 text-sm text-emerald-100"><Check className="h-4 w-4 shrink-0" />{message}</p>}
        {!selectedAlbum && <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-white/15 px-5 text-center"><Images className="h-8 w-8 text-gold-antique/70" /><p className="mt-3 font-cinzel text-sm text-parchment-light">Choose an album to manage</p><p className="mt-1 text-xs text-parchment-dim">Create a new album or select one from the list.</p></div>}
        {selectedAlbum && <>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="min-w-0"><p className="font-cinzel text-[10px] uppercase tracking-[0.18em] text-gold-antique">Album · {selectedAlbum.photoCount} {selectedAlbum.photoCount === 1 ? 'photo' : 'photos'}</p><h2 className="mt-1 break-words font-cinzel text-lg font-semibold sm:text-xl">{selectedAlbum.title}</h2><p className="mt-1 max-w-2xl whitespace-pre-line text-sm text-parchment-dim">{selectedAlbum.description}</p></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => updateAlbum(selectedAlbum, { published: !selectedAlbum.published })} className="admin-button touch-target inline-flex items-center gap-1.5 rounded-md px-3 text-xs">{selectedAlbum.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}{selectedAlbum.published ? 'Unpublish' : 'Publish'}</button>
              <button onClick={() => deleteAlbum(selectedAlbum)} className="admin-button touch-target inline-flex items-center gap-1.5 rounded-md px-3 text-xs"><Trash2 className="h-4 w-4" /> Delete album</button>
            </div>
          </div>

          <form onSubmit={saveAlbumDetails} className="mb-5 grid gap-3 rounded-lg border border-white/10 bg-obsidian-900/65 p-4 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] sm:items-end">
            <label className="block text-xs text-parchment-dim">Title<input required maxLength={160} value={editingTitle} onChange={event => setEditingTitle(event.target.value)} className="mt-1.5 min-h-11 w-full rounded-md border border-white/15 bg-black/40 px-3 text-sm text-white outline-none focus:border-gold-pale" /></label>
            <label className="block text-xs text-parchment-dim">Description<textarea maxLength={2000} rows={2} value={editingDescription} onChange={event => setEditingDescription(event.target.value)} className="mt-1.5 w-full resize-y rounded-md border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-gold-pale" /></label>
            <button className="admin-button min-h-11 rounded-md px-4 text-xs">Save details</button>
          </form>

          <form onSubmit={uploadPhotos} className="mb-6 rounded-lg border border-gold-antique/35 bg-obsidian-950/90 p-4 shadow-xl backdrop-blur-md sm:p-5">
            <label className="admin-upload-picker flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md px-3 py-4 text-center">
              <UploadCloud className="h-6 w-6 text-[#071113]" />
              <span className="text-sm font-bold text-[#071113]">{files.length ? `${files.length} photo${files.length === 1 ? '' : 's'} selected` : 'Choose multiple high-resolution photos'}</span>
              <span className="max-w-lg text-[11px] font-medium text-[#253333]">Select up to 20 images at once · JPEG, PNG, WebP, AVIF, HEIC or TIFF · 30 MB each</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif,image/heic,image/heif,image/tiff" multiple onChange={event => setFiles(event.target.files || [])} className="sr-only" />
            </label>
            {progress !== null && <UploadProgress value={progress} />}
            <div className="mt-3 flex justify-end"><button disabled={busy || !files.length} className="admin-button flex min-h-11 items-center gap-2 rounded-md px-4 font-cinzel text-xs uppercase tracking-wider"><Camera className="h-4 w-4" /> Upload photos</button></div>
          </form>

          {selectedAlbum.photos.length === 0 && <p className="py-14 text-center text-sm text-parchment-dim">This album has no photos yet.</p>}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {selectedAlbum.photos.map(photo => <article key={photo.id} className="group relative overflow-hidden rounded-md border border-white/10 bg-obsidian-900">
              <img src={thumbnailImageUrl(photo)} srcSet={imageSrcSet(photo, 'thumbnail')} sizes="(max-width: 640px) 50vw, 25vw" alt={photo.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <div className="flex items-center justify-between gap-2 p-2.5"><span className="truncate text-xs text-parchment-dim" title={photo.title}>{photo.title}</span><button onClick={() => deletePhoto(photo)} aria-label={`Delete ${photo.title}`} className="admin-button touch-target shrink-0 rounded-md p-2"><Trash2 className="h-4 w-4" /></button></div>
            </article>)}
          </div>
        </>}
      </section>
    </main>
  </div>;
}