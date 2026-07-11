import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { ChevronRight, DownloadCloud, Edit2, RefreshCw, CheckCircle2, Circle, Users, MapPin, Calendar as CalendarIcon, Loader2, Send, UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import apiClient from '../lib/apiClient';
import axios from 'axios';
import { exportToCSV, exportToExcel, exportToPDF, type ExportDataRow } from '../lib/exportUtils';

interface EventMeta {
  id: string;
  title: string;
  description: string;
  eventType: string;
  status: string;
  startTimestamp: string;
  endTimestamp: string;
  location: string | null;
  capacity: number | null;
  coverImageUrl: string | null;
  creditValue: number;
  isFeatured: boolean;
  _count?: { bookings: number };
}

interface Booking {
  id: string;
  bookingReferenceId: string;
  createdAt: string;
  checkedInAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function EventDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [event, setEvent] = useState<EventMeta | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // For edit: cache file locally, only upload to Cloudinary on Save/Publish confirm (same as Create)
  const [editCoverImageFile, setEditCoverImageFile] = useState<File | null>(null);
  const [editLocalPreviewUrl, setEditLocalPreviewUrl] = useState<string>('');

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<EventMeta>>({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventRes, bookingsRes] = await Promise.all([
        apiClient.get(`/events/${id}`),
        apiClient.get(`/bookings/event/${id}`)
      ]);
      setEvent(eventRes.data.data);
      setBookings(bookingsRes.data.data);
      setEditForm(eventRes.data.data);
    } catch (e) {
      console.error('Failed to load event data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Manage local preview for edit cover image (object URL cleanup)
  useEffect(() => {
    if (editCoverImageFile) {
      const url = URL.createObjectURL(editCoverImageFile);
      setEditLocalPreviewUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setEditLocalPreviewUrl('');
      };
    } else {
      setEditLocalPreviewUrl('');
    }
  }, [editCoverImageFile]);

  // Effective preview for edit
  const editPreviewImageUrl = editLocalPreviewUrl || editForm.coverImageUrl;

  // Image upload for edit form (re-uses same /api/upload endpoint)
  // Uses main apiClient + explicit token from hook for reliability
  async function uploadImageFile(file: File): Promise<string> {
    if (!file.type.startsWith('image/')) throw new Error('Please select an image file');
    if (file.size > 5 * 1024 * 1024) throw new Error('Image too large (max 5MB)');
    const fd = new FormData();
    fd.append('image', file);

    // Get token from hook and attach explicitly; interceptor cleans Content-Type
    let token = null;
    try {
      token = await getToken({ skipCache: true });
    } catch (e) {}
    if (!token && window.Clerk && window.Clerk.session) {
      try {
        // @ts-expect-error
        token = await window.Clerk.session.getToken({ skipCache: true });
      } catch (e) {}
    }
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    console.log('[Admin Upload Edit] Sending /upload via apiClient with token from hook:', !!token, 'fallback:', !!(window.Clerk && window.Clerk.session), 'final headers:', config.headers);

    const res = await apiClient.post('/upload', fd, config);
    const uploadedUrl = res.data?.url || res.data?.secure_url;
    if (!uploadedUrl) {
      throw new Error('Upload succeeded but no URL returned from server');
    }
    return uploadedUrl;
  }

  // Cache the file for edit. Only upload to Cloudinary when user confirms Save/Publish.
  function handleEditImageFileSelect(file: File) {
    console.log('[Admin Upload Edit] handleEditImageFileSelect (caching until save)', file.name);
    setUploadError(null);
    setEditCoverImageFile(file);
    // If user picks a new local file, clear any remote URL in the form temporarily
    // (we will set the real URL on submit)
    if (editForm.coverImageUrl) {
      setEditForm({ ...editForm, coverImageUrl: '' });
    }
  }

  function removeEditCoverImage() {
    setUploadError(null);
    setEditCoverImageFile(null);
    setEditLocalPreviewUrl('');
    setEditForm({ ...editForm, coverImageUrl: '' });
  }

  function triggerEditImagePicker() {
    console.log('[Admin Upload Edit] triggerEditImagePicker called');
    if (editFileInputRef.current) {
      editFileInputRef.current.click();
    } else {
      console.error('[Admin Upload Edit] editFileInputRef is null');
    }
  }

  const toggleCheckIn = async (bookingId: string) => {
    // Optimistic update using functional state update
    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, checkedInAt: b.checkedInAt ? null : new Date().toISOString() } : b));
    
    try {
      const res = await apiClient.patch(`/bookings/${bookingId}/checkin`);
      // Update with actual server timestamp using functional state update
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, checkedInAt: res.data.data.checkedInAt } : b));
    } catch (e) {
      console.error('Failed to toggle check-in', e);
      // Revert optimistic update
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, checkedInAt: b.checkedInAt ? null : b.checkedInAt } : b));
      // Re-fetch to be safe if error occurs
      fetchData();
    }
  };

  const handleExport = (format: 'csv' | 'xlsx' | 'pdf') => {
    setShowExportOptions(false);
    const data: ExportDataRow[] = bookings.map(b => ({
      'Student Name': b.user.name,
      'Email': b.user.email,
      'Booking Reference': b.bookingReferenceId,
      'Booked At': new Date(b.createdAt).toLocaleString(),
      'Checked In': b.checkedInAt ? 'Yes' : 'No',
      'Event': event?.title || ''
    }));

    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `Attendees_${event?.title.replace(/[^a-z0-9]/gi, '_')}_${dateStr}`;

    if (format === 'csv') exportToCSV(data, filename);
    if (format === 'xlsx') exportToExcel(data, filename);
    if (format === 'pdf') exportToPDF(data, `Attendees - ${event?.title}`, filename);
  };

  const handleEditSubmit = async (status: 'DRAFT' | 'PUBLISHED') => {
    setSubmitting(true);
    setUploadError(null);

    try {
      let finalCoverImageUrl = editForm.coverImageUrl || undefined;

      // Only upload cached file to Cloudinary when user confirms Save/Publish
      if (editCoverImageFile) {
        setUploadingImage(true);
        try {
          console.log('[Admin Upload Edit] Uploading cached image now (on save confirm)...');
          finalCoverImageUrl = await uploadImageFile(editCoverImageFile);
          console.log('[Admin Upload Edit] Image uploaded on confirm, url=', finalCoverImageUrl);
        } catch (e: any) {
          const msg = e?.response?.data?.error || e.message || 'Failed to upload image';
          setUploadError(msg);
          return; // don't save if image upload failed
        } finally {
          setUploadingImage(false);
        }
      }

      const payload = { ...editForm, coverImageUrl: finalCoverImageUrl, status };
      await apiClient.patch(`/events/${id}`, payload);

      // Clear cached file after successful save
      setEditCoverImageFile(null);
      setEditLocalPreviewUrl('');

      setIsEditing(false);
      fetchData();
    } catch (e) {
      console.error('Failed to update event', e);
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!event) return <div className="p-8 text-slate-500">Event not found.</div>;

  const filteredBookings = bookings.filter(b => 
    b.user.name.toLowerCase().includes(search.toLowerCase()) || 
    b.user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full px-6 py-6 fade-in max-w-7xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-3 font-medium">
            <button onClick={() => navigate('/')} className="hover:text-amber-500 transition-colors">Dashboard</button>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-amber-500 font-bold">{event.title}</span>
          </nav>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{event.title}</h1>
        </div>
        <div className="flex gap-4 relative">
          <button onClick={() => {
            const nextEditing = !isEditing;
            if (nextEditing && event) {
              setEditForm(event);
              // Clear any previously cached file when (re)opening edit
              setEditCoverImageFile(null);
              setEditLocalPreviewUrl('');
            } else {
              // Canceling edit: discard pending file
              setEditCoverImageFile(null);
              setEditLocalPreviewUrl('');
            }
            setIsEditing(nextEditing);
          }} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
            <Edit2 size={18} /> {isEditing ? 'Cancel Edit' : 'Edit Event'}
          </button>
          
          <div className="relative">
            <button onClick={() => setShowExportOptions(!showExportOptions)} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <DownloadCloud size={18} /> Export Attendees
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-40 bg-white border border-slate-200 shadow-xl rounded-lg overflow-hidden z-10">
                <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 border-b border-slate-100">CSV</button>
                <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50 border-b border-slate-100">Excel (XLSX)</button>
                <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-50">PDF</button>
              </div>
            )}
          </div>
          
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-md">
            <RefreshCw size={18} /> Refresh
          </button>
        </div>
      </header>

      {/* Meta Card */}
      {!isEditing ? (
        <section className="glass-card p-6 rounded-xl mb-8 flex flex-wrap md:flex-nowrap gap-6 items-center">
          {event.coverImageUrl && (
            <img src={event.coverImageUrl} alt={event.title} className="w-24 h-24 rounded-lg object-cover bg-slate-100" />
          )}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Status</p>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === 'PUBLISHED' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-600 bg-slate-100 border border-slate-200'}`}>
                {event.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Type</p>
              <span className="font-bold text-slate-900">{event.eventType}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Date</p>
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                <CalendarIcon size={16} className="text-amber-500" />
                {new Date(event.startTimestamp).toLocaleDateString()}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Location</p>
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                <MapPin size={16} className="text-amber-500" />
                {event.location || 'TBA'}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 mb-1">Capacity</p>
              <div className="flex items-center gap-1.5 text-slate-900 font-semibold text-sm">
                <Users size={16} className="text-amber-500" />
                {bookings.length} / {event.capacity || '∞'} Booked
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="glass-card p-6 md:p-8 rounded-xl mb-8 space-y-6 bg-slate-50">
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-200 pb-2">Edit Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Title</label>
              <input type="text" value={editForm.title || ''} onChange={(e: any) => setEditForm({...editForm, title: e.target.value})} className="w-full input-glow p-3 text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Event Type</label>
              <select value={editForm.eventType || ''} onChange={(e: any) => setEditForm({...editForm, eventType: e.target.value})} className="w-full input-glow p-3 text-sm transition-all">
                <option>Seminar</option><option>Workshop</option><option>Conference</option><option>Exhibition</option><option>Networking</option><option>Hands-on</option><option>Competition</option><option>Career Fair</option><option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Capacity</label>
              <input type="number" value={editForm.capacity || ''} onChange={(e: any) => setEditForm({...editForm, capacity: e.target.value ? Number(e.target.value) : null})} className="w-full input-glow p-3 text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Start Date & Time</label>
              <input type="datetime-local" value={editForm.startTimestamp ? new Date(editForm.startTimestamp).toISOString().slice(0, 16) : ''} onChange={(e: any) => setEditForm({...editForm, startTimestamp: new Date(e.target.value).toISOString()})} className="w-full input-glow p-3 text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">End Date & Time</label>
              <input type="datetime-local" value={editForm.endTimestamp ? new Date(editForm.endTimestamp).toISOString().slice(0, 16) : ''} onChange={(e: any) => setEditForm({...editForm, endTimestamp: new Date(e.target.value).toISOString()})} className="w-full input-glow p-3 text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Location</label>
              <input type="text" value={editForm.location || ''} onChange={(e: any) => setEditForm({...editForm, location: e.target.value})} className="w-full input-glow p-3 text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Credit Value</label>
              <input type="number" value={editForm.creditValue ?? 0} onChange={(e: any) => setEditForm({...editForm, creditValue: Number(e.target.value) || 0})} className="w-full input-glow p-3 text-sm transition-all" />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Featured</label>
              <select value={String(editForm.isFeatured ?? false)} onChange={(e: any) => setEditForm({...editForm, isFeatured: e.target.value === 'true'})} className="w-full input-glow p-3 text-sm transition-all">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>

            {/* Cover Image Upload (edit) */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Cover Image</label>
              <div className="flex items-center gap-3">
                {editPreviewImageUrl ? (
                  <div className="relative w-28 h-20 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                    <img src={editPreviewImageUrl} alt="cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={removeEditCoverImage}
                      className="absolute top-1 right-1 p-0.5 bg-black/60 hover:bg-black/80 rounded text-white"
                      title="Remove image"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-20 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-400 bg-slate-50">
                    <ImageIcon size={22} />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={triggerEditImagePicker}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                    {editPreviewImageUrl ? 'Change' : 'Upload'} Image
                  </button>
                  {editPreviewImageUrl && (
                    <button
                      type="button"
                      onClick={removeEditCoverImage}
                      className="px-3 py-2 text-sm border border-slate-300 rounded-lg hover:bg-red-50 hover:text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e: any) => {
                    console.log('[Admin Upload Edit] file input change');
                    const f = e.target?.files?.[0];
                    if (f) handleEditImageFileSelect(f);
                    if (e.target) e.target.value = '';
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">Select image here. It will only be uploaded to Cloudinary when you click Save/Publish.</p>
              {uploadError && (
                <p className="text-xs text-red-600 mt-1">{uploadError}</p>
              )}
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Description</label>
              <textarea rows={4} value={editForm.description || ''} onChange={(e: any) => setEditForm({...editForm, description: e.target.value})} className="w-full input-glow p-4 text-sm transition-all resize-y" />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
            <button disabled={submitting} onClick={() => handleEditSubmit('DRAFT')} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-all">
              {submitting ? <Loader2 className="animate-spin" /> : 'Save as Draft'}
            </button>
            <button disabled={submitting} onClick={() => handleEditSubmit('PUBLISHED')} className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-all flex items-center gap-2">
              {submitting ? <Loader2 className="animate-spin" /> : <><Send size={16} /> Publish</>}
            </button>
          </div>
        </section>
      )}

      {/* Roster Table */}
      <section className="glass-card rounded-xl overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-white">
          <h2 className="text-xl font-bold text-slate-900">Attendee Roster</h2>
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e: any) => setSearch(e.target.value)}
            className="w-64 input-glow p-2 text-sm transition-all rounded-lg"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">#</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking Ref</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Booked At</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Checked In</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking, i) => (
                  <tr key={booking.id} className="hover:bg-slate-50/70 transition-colors bg-white">
                    <td className="p-4 text-sm text-slate-500">{i + 1}</td>
                    <td className="p-4 font-bold text-slate-900">{booking.user.name}</td>
                    <td className="p-4 text-sm text-slate-600">{booking.user.email}</td>
                    <td className="p-4 text-sm font-mono text-slate-500">{booking.bookingReferenceId}</td>
                    <td className="p-4 text-sm text-slate-600">{new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleCheckIn(booking.id)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors ${booking.checkedInAt ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' : 'bg-slate-100 text-slate-300 hover:bg-slate-200'}`}
                        title={booking.checkedInAt ? `Checked in at ${new Date(booking.checkedInAt).toLocaleTimeString()}` : 'Mark as checked in'}
                      >
                        {booking.checkedInAt ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 text-sm font-medium">
                    No attendees found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
