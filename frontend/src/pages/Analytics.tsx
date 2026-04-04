import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, CheckCircle, TrendingUp, UserX } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { dashboard } from '../services/api';
import { SkeletonStatGrid } from '../components/Skeleton';

// ─── Custom Tooltip ───────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-card px-4 py-3 text-sm">
        <p className="text-white font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill || p.color }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#06b6d4', '#8b5cf6'];

export default function Analytics() {
  const { eventId } = useParams();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['event-stats', eventId],
    queryFn: async () => {
      const response = await dashboard.eventStats(Number(eventId));
      return response.data;
    },
  });

  const barData = stats?.teams?.map((t: any) => ({
    name: t.team_name.length > 12 ? t.team_name.slice(0, 12) + '…' : t.team_name,
    fullName: t.team_name,
    'Checked In': t.checked_in,
    Absent: t.total_members - t.checked_in,
  })) || [];

  const pieData = stats
    ? [
        { name: 'Present',  value: stats.checked_in_count },
        { name: 'Absent',   value: stats.pending_count    },
      ]
    : [];

  const summaryCards = stats
    ? [
        { title: 'Total Teams',     value: stats.team_count,      icon: Users,       color: 'icon-bg-blue',   textColor: 'text-blue-400' },
        { title: 'Total Members',   value: stats.member_count,    icon: Users,       color: 'icon-bg-purple', textColor: 'text-purple-400' },
        { title: 'Checked In',      value: stats.checked_in_count, icon: CheckCircle, color: 'icon-bg-green',  textColor: 'text-emerald-400' },
        { title: 'Attendance Rate', value: `${stats.attendance_rate}%`, icon: TrendingUp, color: 'icon-bg-orange', textColor: 'text-orange-400' },
      ]
    : [];

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time event attendance insights</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <SkeletonStatGrid />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 animate-fadeInUp stagger-1">
          {summaryCards.map((card, i) => (
            <div key={card.title} className="glass-card glass-card-interactive p-5"
              style={{ animationDelay: `${i * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">{card.title}</p>
                  <p className={`text-[28px] font-bold leading-none ${card.textColor}`}>{card.value}</p>
                </div>
                <div className={`${card.color} p-2.5 rounded-xl flex-shrink-0`}>
                  <card.icon size={18} color="white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fadeInUp stagger-2">

          {/* Bar Chart */}
          <div className="glass-card p-6 lg:col-span-2">
            <h2 className="text-[15px] font-semibold text-white mb-6">Team-wise Attendance</h2>
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={barData} barGap={4}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                  <Bar dataKey="Checked In" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {barData.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="Absent" radius={[6, 6, 0, 0]} maxBarSize={36} fill="rgba(100,116,139,0.3)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-600">No team data available</div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="glass-card p-6">
            <h2 className="text-[15px] font-semibold text-white mb-6">Overall Split</h2>
            {pieData.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="45%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-40 text-slate-600">No data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Team breakdown table */}
      {stats?.teams && stats.teams.length > 0 && (
        <div className="glass-card p-6 animate-fadeInUp stagger-3">
          <h2 className="text-[15px] font-semibold text-white mb-5">Team Breakdown</h2>
          <div className="space-y-4">
            {stats.teams.map((team: any, i: number) => {
              const rate = team.total_members > 0
                ? Math.round((team.checked_in / team.total_members) * 100)
                : 0;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <p className="text-white font-medium">{team.team_name}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-slate-500 text-[12px]">{team.checked_in} / {team.total_members}</p>
                      <p className="font-semibold text-emerald-400 w-10 text-right">{rate}%</p>
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${rate}%`, background: `linear-gradient(90deg, ${COLORS[i % COLORS.length]}, ${COLORS[(i + 1) % COLORS.length]})` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {stats && (
        <div className="glass-card p-6 animate-fadeInUp stagger-4"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.06) 100%)' }}>
          <h3 className="text-[15px] font-semibold text-white mb-4">Event Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Participants', value: stats.member_count,      icon: Users,       color: 'text-white' },
              { label: 'Present',            value: stats.checked_in_count,  icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Absent',             value: stats.pending_count,     icon: UserX,       color: 'text-red-400' },
              { label: 'Overall Rate',       value: `${stats.attendance_rate}%`, icon: TrendingUp, color: 'text-blue-400' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <s.icon size={20} className={`${s.color} mx-auto mb-2`} />
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
