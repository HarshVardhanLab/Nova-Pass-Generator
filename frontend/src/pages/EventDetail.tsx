import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Upload, QrCode, ScanLine, BarChart3, ArrowLeft, Palette } from 'lucide-react';
import { events, dashboard } from '../services/api';

export default function EventDetail() {
  const { eventId } = useParams();

  const { data: event } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const response = await events.get(Number(eventId));
      return response.data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['event-stats', eventId],
    queryFn: async () => {
      const response = await dashboard.eventStats(Number(eventId));
      return response.data;
    },
  });

  const actions = [
    {
      to: `/events/${eventId}/csv`,
      icon: Upload,
      title: 'CSV Manager',
      description: 'Upload or edit member data',
      color: 'bg-blue-500',
    },
    {
      to: `/events/${eventId}/template-editor`,
      icon: Palette,
      title: 'Template Editor',
      description: 'Create custom pass template',
      color: 'bg-orange-500',
    },
    {
      to: `/events/${eventId}/passes`,
      icon: QrCode,
      title: 'Generate Passes',
      description: 'Create QR codes and PDF passes',
      color: 'bg-green-500',
    },
    {
      to: `/events/${eventId}/scanner`,
      icon: ScanLine,
      title: 'Scanner',
      description: 'Scan QR codes for attendance',
      color: 'bg-purple-500',
    },
    {
      to: `/events/${eventId}/analytics`,
      icon: BarChart3,
      title: 'Analytics',
      description: 'View event statistics',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Events
      </Link>

      {/* Event Header */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h1 className="text-3xl font-bold text-white mb-2">{event?.name}</h1>
        <p className="text-gray-400">{event?.description}</p>
        
        {event?.date && (
          <p className="text-gray-400 mt-2">
            📅 {new Date(event.date).toLocaleString()}
          </p>
        )}
        {event?.venue && (
          <p className="text-gray-400">📍 {event.venue}</p>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Teams</p>
            <p className="text-2xl font-bold text-white">{stats.team_count}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Members</p>
            <p className="text-2xl font-bold text-white">{stats.member_count}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Checked In</p>
            <p className="text-2xl font-bold text-green-400">{stats.checked_in_count}</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-400 text-sm">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-400">{stats.attendance_rate}%</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors group"
          >
            <div className="flex items-start gap-4">
              <div className={`${action.color} p-3 rounded-lg`}>
                <action.icon className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-green-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-400 text-sm mt-1">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
