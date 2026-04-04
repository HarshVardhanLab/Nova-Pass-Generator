import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Download, Loader2, Search, CheckCircle2, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { members, passes, templates } from '../services/api';

// ─── Simulated progress during generation ─────────────────────
function useProgress(active: boolean) {
  const [progress, setProgress] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (active) {
      setProgress(5);
      timer.current = setInterval(() => {
        setProgress((p) => {
          if (p >= 90) { clearInterval(timer.current); return 90; }
          return p + Math.random() * 8;
        });
      }, 350);
    } else {
      clearInterval(timer.current);
      if (progress > 0) setProgress(100);
      const t = setTimeout(() => setProgress(0), 800);
      return () => clearTimeout(t);
    }
    return () => clearInterval(timer.current);
  }, [active]);

  return progress;
}

export default function PassGenerator() {
  const { eventId } = useParams();
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filter, setFilter] = useState('');
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const progress = useProgress(isGenerating);

  const { data: membersList } = useQuery({
    queryKey: ['members', eventId],
    queryFn: async () => {
      const response = await members.list(undefined, Number(eventId));
      return response.data;
    },
    enabled: !!eventId,
  });

  const { data: templatesList } = useQuery({
    queryKey: ['templates', eventId],
    queryFn: async () => {
      const response = await templates.list(Number(eventId));
      return response.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: any) => passes.generate(data),
    onSuccess: (response) => {
      toast.success(response.data.message);
      setIsGenerating(false);
    },
    onError: () => {
      toast.error('Failed to generate passes');
      setIsGenerating(false);
    },
  });

  const handleGenerate = () => {
    if (selectedMembers.length === 0) { toast.error('Select at least one member'); return; }
    setIsGenerating(true);
    generateMutation.mutate({
      event_id: Number(eventId),
      template_id: selectedTemplate,
      member_ids: selectedMembers,
      encryption_password: encryptionPassword || undefined,
    });
  };

  const handleSelectAll = () => {
    const filtered = filteredMembers?.map((m: any) => m.id) || [];
    const allSelected = filtered.every((id: number) => selectedMembers.includes(id));
    if (allSelected) {
      setSelectedMembers(selectedMembers.filter((id) => !filtered.includes(id)));
    } else {
      setSelectedMembers([...new Set([...selectedMembers, ...filtered])]);
    }
  };

  const handleDownload = async (memberId: number, memberName: string, teamId: string) => {
    try {
      const response = await passes.download(memberId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${teamId}_${memberName.replace(/\s+/g, '_')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded pass for ${memberName}`);
    } catch {
      toast.error('Download failed');
    }
  };

  const handleDownloadAll = async () => {
    const withPasses = membersList?.filter((m: any) => m.pass_path) || [];
    if (withPasses.length === 0) { toast.error('No passes available yet. Generate them first.'); return; }
    try {
      const toastId = toast.loading('Creating ZIP archive…');
      const response = await passes.downloadAll(Number(eventId));
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event_${eventId}_passes.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.dismiss(toastId);
      toast.success(`Downloaded ${withPasses.length} passes!`);
    } catch {
      toast.error('Failed to download passes');
    }
  };

  const filteredMembers = membersList?.filter((m: any) =>
    m.name.toLowerCase().includes(filter.toLowerCase()) ||
    m.email?.toLowerCase().includes(filter.toLowerCase())
  );

  const passesGenerated = membersList?.filter((m: any) => m.pass_path).length || 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fadeInUp">
        <div>
          <h1 className="text-3xl font-bold text-white">Pass Generator</h1>
          <p className="text-slate-400 text-sm mt-1">Generate encrypted QR codes and PDF passes</p>
        </div>
        {passesGenerated > 0 && (
          <button onClick={handleDownloadAll} className="btn-secondary gap-2">
            <Download size={16} />
            Download All ({passesGenerated})
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {(isGenerating || progress === 100) && (
        <div className="glass-card p-5 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-white">
              {progress < 100 ? 'Generating passes…' : '✅ Passes generated!'}
            </p>
            <p className="text-sm text-emerald-400 font-semibold">{Math.round(progress)}%</p>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Stats Row */}
      {membersList && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fadeInUp stagger-2">
          {[
            { label: 'Total Members',    value: membersList.length,  icon: Users,       color: 'text-blue-400' },
            { label: 'Passes Generated', value: passesGenerated,     icon: FileText,    color: 'text-emerald-400' },
            { label: 'Selected',         value: selectedMembers.length, icon: CheckCircle2, color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 flex items-center gap-3">
              <s.icon size={20} className={s.color} />
              <div>
                <p className="text-white font-bold text-xl leading-none">{s.value}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Selection */}
      <div className="glass-card p-6 animate-fadeInUp stagger-2">
        <h2 className="text-[15px] font-semibold text-white mb-4">Select Template</h2>
        {!templatesList || templatesList.length === 0 ? (
          <p className="text-slate-500 text-sm">No templates found for this event. Upload one in the Template Editor first.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {templatesList.map((template: any) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                  selectedTemplate === template.id
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-white/[0.06] hover:border-white/20 bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-white font-medium text-sm">{template.name}</p>
                  {template.is_default && <span className="badge badge-green">Default</span>}
                </div>
                {selectedTemplate === template.id && (
                  <CheckCircle2 size={14} className="text-emerald-400 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Member Selection */}
      <div className="glass-card p-6 animate-fadeInUp stagger-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-[15px] font-semibold text-white">Select Members</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSelectAll}
              className="text-emerald-400 hover:text-emerald-300 text-[12px] font-medium transition-colors"
            >
              {filteredMembers?.every((m: any) => selectedMembers.includes(m.id)) ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Search & Override */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by name or email…"
              className="input-field pl-9"
            />
          </div>
          <div>
            <input
              type="password"
              value={encryptionPassword}
              onChange={(e) => setEncryptionPassword(e.target.value)}
              placeholder="Custom Encryption Key (Optional)…"
              className="input-field"
            />
          </div>
        </div>

        <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
          {filteredMembers?.map((member: any) => (
            <label
              key={member.id}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedMembers.includes(member.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMembers([...selectedMembers, member.id]);
                  } else {
                    setSelectedMembers(selectedMembers.filter((id) => id !== member.id));
                  }
                }}
                className="w-4 h-4 accent-emerald-500 rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{member.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{member.email}</p>
              </div>
              {member.pass_path ? (
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="badge badge-green">✓ Pass</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleDownload(member.id, member.name, member.team?.team_id || 'TEAM');
                    }}
                    className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/10 transition-colors"
                    title="Download pass"
                  >
                    <Download size={15} />
                  </button>
                </div>
              ) : (
                <span className="badge badge-gray flex-shrink-0">No Pass</span>
              )}
            </label>
          ))}

          {filteredMembers?.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">No members match your search.</p>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating || selectedMembers.length === 0}
        className="btn-primary w-full justify-center py-4 text-[16px] animate-fadeInUp stagger-4"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin" size={22} />
            Generating {selectedMembers.length} passes…
          </>
        ) : (
          <>
            🚀 Generate {selectedMembers.length} Pass{selectedMembers.length !== 1 ? 'es' : ''}
          </>
        )}
      </button>
    </div>
  );
}
