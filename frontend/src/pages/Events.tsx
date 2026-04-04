import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Trash2, QrCode, FileSpreadsheet, BarChart3, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { events } from '../services/api';
import { SkeletonCardGrid } from '../components/Skeleton';

// ─── Event status badge ───────────────────────────────────────
function EventStatusBadge({ date }: { date?: string }) {
  if (!date) return <span className="badge badge-gray">No Date</span>;
  const d = new Date(date);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 0) return <span className="badge badge-gray">Past</span>;
  if (diff < 86_400_000 * 3) return <span className="badge badge-yellow">Soon</span>;
  return <span className="badge badge-green">Upcoming</span>;
}

// ─── Quick-link actions inside event card ─────────────────────
const eventLinks = [
  { label: 'Passes',   path: 'passes',   icon: QrCode           },
  { label: 'CSV',      path: 'csv',      icon: FileSpreadsheet  },
  { label: 'Scanner',  path: 'scanner',  icon: BarChart3        },
];

export default function Events() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', date: '', venue: '' });

  const { data: eventsList, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const res = await events.list();
      return res.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => events.create(data),
    onSuccess: () => {
      toast.success('Event created!');
      queryClient.invalidateQueries({ queryKey: ['events'] });
      setShowModal(false);
      setFormData({ name: '', description: '', date: '', venue: '' });
    },
    onError: () => toast.error('Failed to create event'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => events.delete(id),
    onSuccess: () => {
      toast.success('Event deleted');
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: () => toast.error('Failed to delete event'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) { toast.error('Event name is required'); return; }
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-center justify-between animate-fadeInUp">
        <div>
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <p className="text-slate-400 text-sm mt-1">Manage your hackathon events & participants</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={17} />
          New Event
        </button>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <SkeletonCardGrid count={3} />
      ) : !eventsList || eventsList.length === 0 ? (

        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 glass-card animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
            <Calendar size={28} className="text-emerald-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-1">No events yet</h3>
          <p className="text-slate-500 text-sm mb-6 text-center max-w-xs">
            Create your first event to start managing teams, passes, and attendance.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> Create First Event
          </button>
        </div>

      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {eventsList.map((event: any, i: number) => (
            <div
              key={event.id}
              className="glass-card glass-card-interactive p-5 flex flex-col animate-fadeInUp cursor-pointer"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
              onClick={() => navigate(`/events/${event.id}`)}
            >
              {/* Card Top */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 pr-2">
                  <h3 className="text-white font-semibold text-[15px] leading-snug line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-slate-500 text-[12px] mt-1 line-clamp-2">
                    {event.description || 'No description provided.'}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "${event.name}"?`)) deleteMutation.mutate(event.id);
                  }}
                  className="btn-danger p-2 rounded-lg flex-shrink-0"
                  title="Delete event"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-3 text-[12px] text-slate-500 mb-4">
                {event.date && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-slate-600" />
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {event.venue && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-600" />
                    {event.venue}
                  </span>
                )}
              </div>

              {/* Status + Quick Links */}
              <div className="mt-auto pt-3 border-t border-white/[0.05] flex items-center justify-between">
                <EventStatusBadge date={event.date} />
                <div className="flex items-center gap-1">
                  {eventLinks.map(({ label, path, icon: Icon }) => (
                    <button
                      key={path}
                      onClick={(e) => { e.stopPropagation(); navigate(`/events/${event.id}/${path}`); }}
                      title={label}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                    >
                      <Icon size={15} />
                    </button>
                  ))}
                  <ChevronRight size={15} className="text-slate-600 ml-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content glass-card p-7 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">New Event</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { name: 'name',        label: 'Event Name *', type: 'text',           placeholder: 'HackGear 2.0', required: true },
                { name: 'venue',       label: 'Venue',        type: 'text',           placeholder: 'City Conference Hall' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    className="input-field"
                    placeholder={field.placeholder}
                    required={field.required}
                  />
                </div>
              ))}

              <div>
                <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Brief description of the event…"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
                  {createMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating…
                    </span>
                  ) : (
                    'Create Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
