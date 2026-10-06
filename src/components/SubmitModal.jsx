import React, { useState } from 'react';
import { X, UploadCloud, Camera, Sparkles, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Workshops',
  'Orientations',
  'Exhibitions',
  'Team Reveals',
  'Field Expeditions'
];

const ORDERS = [
  { id: 'Sindhu', color: '#14b8a6' },
  { id: 'Aakar', color: '#eab308' },
  { id: 'Pragya', color: '#10b981' },
  { id: 'Kshatra', color: '#ef4444' },
  { id: 'Aarohan', color: '#3b82f6' },
  { id: 'Utkarsh', color: '#a855f7' }
];

export default function SubmitModal({ isOpen, onClose, onPhotoAdded }) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDevanagari: '',
    title: '',
    category: 'Workshops',
    orderTag: 'Pragya',
    date: '12 Sep 2025',
    venue: '',
    photographer: '',
    description: '',
    tags: '',
    imageUrl: ''
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.eventName) {
      setErrorMsg('Please enter the event name.');
      return;
    }

    if (!selectedFile && !formData.imageUrl) {
      setErrorMsg('Please select a photo file or provide an image link.');
      return;
    }

    try {
      setIsSubmitting(true);
      const data = new FormData();
      data.append('eventName', formData.eventName);
      data.append('eventDevanagari', formData.eventDevanagari);
      data.append('title', formData.title || formData.eventName);
      data.append('category', formData.category);
      data.append('orderTag', formData.orderTag);
      data.append('date', formData.date);
      data.append('venue', formData.venue);
      data.append('photographer', formData.photographer || 'Guild Photographer');
      data.append('description', formData.description);
      data.append('tags', formData.tags);

      if (selectedFile) {
        data.append('image', selectedFile);
      } else if (formData.imageUrl) {
        data.append('imageUrl', formData.imageUrl);
      }

      const res = await fetch('/api/artifacts', {
        method: 'POST',
        body: data
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to archive event photo.');
      }

      const newPhoto = await res.json();
      onPhotoAdded(newPhoto);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Error occurred during submission.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto backdrop-blur-xl bg-obsidian-950/85 animate-in fade-in duration-300">
      
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-gradient-to-b from-obsidian-900 to-obsidian-950 border border-gold-antique/40 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8 my-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full border border-gold-antique/30 bg-obsidian-950/80 text-parchment-dim hover:text-gold-pale hover:border-gold-pale transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-xs font-cinzel tracking-widest text-gold-pale uppercase mb-1">
            <Camera className="w-3.5 h-3.5 text-gold-antique" />
            <span>Event Archive Inscription</span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold text-parchment-light uppercase">
            Add Event Photograph
          </h2>
          <p className="font-serif text-xs text-parchment-dim mt-1">
            Upload and archive moments captured during workshops, sessions, and ceremonies.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-3 rounded-xl border border-red-500/40 bg-red-950/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Event Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-gold-pale mb-1">
                Event Name *
              </label>
              <input
                type="text"
                required
                value={formData.eventName}
                onChange={e => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                placeholder="e.g. Workshop: Visual Storytelling"
                className="w-full px-3.5 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-serif text-parchment-light focus:outline-none focus:border-gold-pale"
              />
            </div>
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-parchment-dim mb-1">
                Event Category
              </label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-cinzel text-parchment-light focus:outline-none focus:border-gold-pale"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-obsidian-950 text-parchment-light">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Caption & Devanagari Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-parchment-dim mb-1">
                Photo Caption / Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Participants exploring light & shadows"
                className="w-full px-3.5 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-serif text-parchment-light focus:outline-none focus:border-gold-pale"
              />
            </div>
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-parchment-dim mb-1">
                Hindi / Devanagari Title
              </label>
              <input
                type="text"
                value={formData.eventDevanagari}
                onChange={e => setFormData(prev => ({ ...prev, eventDevanagari: e.target.value }))}
                placeholder="e.g. दृश्य कथा वाचन कार्यशाला"
                className="w-full px-3.5 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-devanagari text-parchment-light focus:outline-none focus:border-gold-pale"
              />
            </div>
          </div>

          {/* Date, Venue, Photographer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-parchment-dim mb-1">
                Date
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                placeholder="12 Sep 2025"
                className="w-full px-3 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-serif text-parchment-light focus:outline-none focus:border-gold-pale"
              />
            </div>
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-parchment-dim mb-1">
                Venue
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={e => setFormData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Amphitheatre / Mandapam"
                className="w-full px-3 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-serif text-parchment-light focus:outline-none focus:border-gold-pale"
              />
            </div>
            <div>
              <label className="block text-xs font-cinzel uppercase tracking-wider text-parchment-dim mb-1">
                Photographer
              </label>
              <input
                type="text"
                value={formData.photographer}
                onChange={e => setFormData(prev => ({ ...prev, photographer: e.target.value }))}
                placeholder="Arya Sen • Guild"
                className="w-full px-3 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-serif text-parchment-light focus:outline-none focus:border-gold-pale"
              />
            </div>
          </div>

          {/* Photo File Upload */}
          <div>
            <label className="block text-xs font-cinzel uppercase tracking-wider text-gold-pale mb-1">
              Event Photograph *
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <label className="flex-1 w-full border-2 border-dashed border-gold-antique/30 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-gold-pale/60 bg-obsidian-950/50 transition-all text-center">
                <UploadCloud className="w-6 h-6 text-gold-antique mb-1.5" />
                <span className="text-xs font-cinzel uppercase tracking-wider text-parchment-light">
                  {selectedFile ? selectedFile.name : 'Select Photo File'}
                </span>
                <span className="text-[10px] text-parchment-dim mt-0.5">JPG, PNG, WebP up to 15MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <div className="w-24 h-20 rounded-xl overflow-hidden border border-gold-pale flex-shrink-0 shadow-gold-subtle">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* External URL alternative */}
            <div className="mt-2">
              <span className="text-[10px] font-cinzel tracking-wider uppercase text-parchment-dim">
                Or paste image web link:
              </span>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={e => {
                  setFormData(prev => ({ ...prev, imageUrl: e.target.value }));
                  setSelectedFile(null);
                  setPreviewUrl(e.target.value);
                }}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full mt-1 px-3 py-1.5 bg-obsidian-950 border border-gold-antique/20 rounded-lg text-xs font-mono text-parchment-dim focus:outline-none focus:border-gold-pale"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-cinzel uppercase tracking-wider text-parchment-dim mb-1">
              Event Story / Note
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="What took place during this event? Key moments, participants, speakers..."
              className="w-full px-3.5 py-2 bg-obsidian-950 border border-gold-antique/30 rounded-xl text-xs font-serif text-parchment-light focus:outline-none focus:border-gold-pale"
            />
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-white/10 text-xs font-cinzel tracking-wider uppercase text-parchment-dim hover:text-parchment-light transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-full border border-gold-pale bg-gold-antique text-obsidian-950 text-xs font-cinzel font-bold tracking-[0.2em] uppercase hover:bg-gold-pale hover:shadow-gold-subtle transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Archiving...' : 'Add to Event Gallery'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
