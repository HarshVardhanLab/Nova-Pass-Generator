import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Calendar, CheckCircle, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { dashboard } from '../services/api';
import { SkeletonStatGrid } from '../components/Skeleton';

// ─── Animated Counter ─────────────────────────────────────────
function AnimatedNumber({ target }: { target: number }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    const duration = 900;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target]);

  return <>{value.toLocaleString()}</>;
}

// ─── Stat Card ────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  iconBg: string;
  delay: string;
  suffix?: string;
}

function StatCard({ title, value, icon: Icon, iconBg, delay, suffix = '' }: StatCardProps) {
  return (
    <div
      className="glass-card glass-card-interactive p-6 animate-fadeInUp"
      style={{ animationDelay: delay, animationFillMode: 'both' }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[12px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-[32px] font-bold text-white leading-none animate-countUp">
            <AnimatedNumber target={value} />{suffix}
          </p>
        </div>
        <div className={`${iconBg} p-3 rounded-xl flex-shrink-0`} style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
          <Icon size={22} color="white" />
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboard.stats();
      return response.data;
    },
  });

  const statCards = [
    { title: 'Total Events',   value: stats?.total_events   || 0, icon: Calendar,    iconBg: 'icon-bg-blue',   delay: '0ms' },
    { title: 'Total Teams',    value: stats?.total_teams    || 0, icon: Users,        iconBg: 'icon-bg-purple', delay: '60ms' },
    { title: 'Total Members',  value: stats?.total_members  || 0, icon: Users,        iconBg: 'icon-bg-green',  delay: '120ms' },
    { title: 'Checked In',     value: stats?.total_checked_in || 0, icon: CheckCircle, iconBg: 'icon-bg-orange', delay: '180ms' },
  ];

  const checkInRate = stats?.total_members
    ? Math.round((stats.total_checked_in / stats.total_members) * 100)
    : 0;

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1 text-sm">Welcome back — here's what's happening.</p>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <SkeletonStatGrid />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>
      )}

      {/* Middle Row: Check-in rate + Quick Actions */}
      {!isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fadeInUp stagger-3">

          {/* Check-in Progress */}
          <div className="glass-card p-6 lg:col-span-1">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={18} className="text-emerald-400" />
              <h2 className="text-[15px] font-semibold text-white">Overall Attendance</h2>
            </div>

            <div className="relative flex items-center justify-center mb-5">
              <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                <circle
                  cx="50" cy="50" r="40" fill="none"
                  stroke="url(#grad)" strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - checkInRate / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.22,0.61,0.36,1)' }}
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-center">
                <p className="text-2xl font-bold text-white">{checkInRate}%</p>
                <p className="text-[10px] text-slate-500 font-medium">Rate</p>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <div className="text-center">
                <p className="text-emerald-400 font-bold text-lg">{stats?.total_checked_in || 0}</p>
                <p className="text-slate-500 text-[11px]">Present</p>
              </div>
              <div className="w-px bg-white/5" />
              <div className="text-center">
                <p className="text-slate-300 font-bold text-lg">{stats?.total_members || 0}</p>
                <p className="text-slate-500 text-[11px]">Total</p>
              </div>
              <div className="w-px bg-white/5" />
              <div className="text-center">
                <p className="text-red-400 font-bold text-lg">{(stats?.total_members || 0) - (stats?.total_checked_in || 0)}</p>
                <p className="text-slate-500 text-[11px]">Absent</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-6 lg:col-span-2">
            <h2 className="text-[15px] font-semibold text-white mb-5">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: 'Create New Event',     desc: 'Set up an event & teams',       path: '/events',    color: 'from-emerald-600/20 to-teal-600/10',   border: 'border-emerald-500/20' },
                { label: 'Manage Templates',      desc: 'Upload or edit pass templates', path: '/templates', color: 'from-indigo-600/20 to-purple-600/10',  border: 'border-indigo-500/20' },
              ].map((action) => (
                <button
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  className={`flex items-center justify-between p-4 rounded-xl bg-gradient-to-br ${action.color} border ${action.border} text-left hover:scale-[1.02] transition-transform duration-200`}
                >
                  <div>
                    <p className="text-white font-semibold text-sm">{action.label}</p>
                    <p className="text-slate-400 text-[12px] mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-slate-400 flex-shrink-0 ml-3" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Check-ins */}
      <div className="glass-card p-6 animate-fadeInUp stagger-4">
        <h2 className="text-[15px] font-semibold text-white mb-5">Recent Check-ins</h2>

        {stats?.recent_check_ins && stats.recent_check_ins.length > 0 ? (
          <div className="space-y-2">
            {stats.recent_check_ins.map((checkin: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg icon-bg-green flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
                    {checkin.member_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{checkin.member_name}</p>
                    <p className="text-slate-500 text-[11px]">{checkin.team_name} · {checkin.event_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-green">✓ Checked In</span>
                  <p className="text-slate-500 text-[11px] hidden sm:block">
                    {new Date(checkin.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mx-auto mb-3">
              <CheckCircle size={24} className="text-slate-600" />
            </div>
            <p className="text-slate-400 text-sm font-medium">No recent check-ins</p>
            <p className="text-slate-600 text-[12px] mt-1">Check-ins will appear here in real time</p>
          </div>
        )}
      </div>
    </div>
  );
}
