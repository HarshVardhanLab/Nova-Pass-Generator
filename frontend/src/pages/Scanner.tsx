import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ScanLine, CheckCircle, XCircle, Camera, Keyboard } from 'lucide-react';
import toast from 'react-hot-toast';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { scanner } from '../services/api';

export default function Scanner() {
  const { eventId } = useParams();
  const queryClient = useQueryClient();
  const [qrData, setQrData] = useState('');
  const [encryptionPassword, setEncryptionPassword] = useState('');
  const [lastScan, setLastScan] = useState<any>(null);
  const [useCamera, setUseCamera] = useState(true);

  // References to prevent stale closures inside scanner callback
  const isScanningRef = useRef(false);
  const passwordRef = useRef(encryptionPassword);

  useEffect(() => {
    passwordRef.current = encryptionPassword;
  }, [encryptionPassword]);

  const { data: attendance } = useQuery({
    queryKey: ['attendance', eventId],
    queryFn: async () => {
      const response = await scanner.attendance(Number(eventId));
      return response.data;
    },
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: logs } = useQuery({
    queryKey: ['attendance-logs', eventId],
    queryFn: async () => {
      const response = await scanner.logs(Number(eventId));
      return response.data;
    },
    refetchInterval: 5000,
  });

  const scanMutation = useMutation({
    mutationFn: (data: any) => scanner.scan(data),
    onSuccess: (response) => {
      setLastScan(response.data);
      if (response.data.already_checked_in) {
        toast.error(response.data.message);
      } else {
        toast.success(response.data.message);
      }
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-logs'] });
      setQrData('');
      setTimeout(() => { isScanningRef.current = false; }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Scan failed');
      setQrData('');
      setTimeout(() => { isScanningRef.current = false; }, 2000);
    },
  });

  useEffect(() => {
    if (!useCamera) return;

    const qrScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    qrScanner.render(
      (decodedText) => {
        if (isScanningRef.current) return;
        isScanningRef.current = true;
        setQrData(decodedText);
        
        scanMutation.mutate({
          encrypted_data: decodedText,
          scanned_by: 'web-camera',
          encryption_password: passwordRef.current || undefined,
        });
      },
      () => {
        // Ignored. Html5QrcodeScanner drops a ton of frames/errors while looking for a code.
      }
    );

    return () => {
      qrScanner.clear().catch(e => console.error("Scanner clear fail", e));
    };
  }, [useCamera]);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrData.trim()) {
      scanMutation.mutate({
        encrypted_data: qrData.trim(),
        scanned_by: 'web-scanner',
        encryption_password: passwordRef.current || undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-3xl font-bold text-white">QR Scanner</h1>
        <p className="text-slate-400 text-sm mt-1">Scan QR codes for attendance tracking</p>
      </div>

      {/* Stats */}
      {attendance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeInUp stagger-1">
          <div className="glass-card p-4">
            <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-2">Total Members</p>
            <p className="text-2xl font-bold text-white">{attendance.total_members}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-emerald-500 text-sm font-semibold uppercase tracking-wider mb-2">Checked In</p>
            <p className="text-2xl font-bold text-emerald-400">{attendance.checked_in}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-orange-500 text-sm font-semibold uppercase tracking-wider mb-2">Pending</p>
            <p className="text-2xl font-bold text-orange-400">{attendance.pending}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-blue-500 text-sm font-semibold uppercase tracking-wider mb-2">Attendance Rate</p>
            <p className="text-2xl font-bold text-blue-400">{attendance.attendance_rate}%</p>
          </div>
        </div>
      )}

      {/* Scanner Module */}
      <div className="glass-card p-6 border border-emerald-500/20 animate-fadeInUp stagger-2">
        <div className="flex items-center gap-3 mb-6">
          <ScanLine className="text-emerald-400" size={24} />
          <h2 className="text-xl font-bold text-white">Scan Verification</h2>
        </div>

        {/* Input Toggle */}
        <div className="flex gap-3 mb-6">
          <button 
            type="button"
            onClick={() => setUseCamera(true)}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl transition-all font-semibold ${useCamera ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Camera size={18} /> Camera
          </button>
          <button 
            type="button"
            onClick={() => setUseCamera(false)}
            className={`flex-1 flex justify-center items-center gap-2 py-3 rounded-xl transition-all font-semibold ${!useCamera ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <Keyboard size={18} /> Manual Entry
          </button>
        </div>

        {/* Encryption Override */}
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Custom Encryption Key (Optional)
          </label>
          <input
            type="password"
            value={encryptionPassword}
            onChange={(e) => setEncryptionPassword(e.target.value)}
            placeholder="Leave blank for event default..."
            className="input-field w-full"
          />
        </div>

        {/* Camera/Input Switch */}
        {useCamera ? (
          <div>
            <div id="reader" className="w-full max-w-sm mx-auto overflow-hidden rounded-xl border-2 border-emerald-500/30 shadow-xl shadow-emerald-500/10"></div>
            {isScanningRef.current && (
               <p className="text-center text-emerald-400 mt-4 animate-pulse font-medium">Processing code...</p>
            )}
          </div>
        ) : (
          <form onSubmit={handleScan} className="space-y-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Encrypted QR Code Data
              </label>
              <input
                type="text"
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                placeholder="Paste encrypted payload here..."
                className="input-field w-full"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={!qrData.trim() || scanMutation.isPending}
              className="btn-primary w-full justify-center text-[16px] py-4"
            >
              {scanMutation.isPending ? 'Verifying...' : 'Submit Scan'}
            </button>
          </form>
        )}

        {/* Last Scan Result Alert */}
        {lastScan && (
          <div className={`mt-6 p-4 rounded-xl shadow-lg border-2 animate-fadeIn ${
            lastScan.already_checked_in 
              ? 'bg-orange-500/10 border-orange-500/30' 
              : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              {lastScan.already_checked_in ? (
                <XCircle className="text-orange-400 flex-shrink-0" size={24} />
              ) : (
                <CheckCircle className="text-emerald-400 flex-shrink-0" size={24} />
              )}
              <p className="text-white font-bold leading-tight">{lastScan.message}</p>
            </div>
            {lastScan.member_data && (
              <div className="ml-9 text-sm text-slate-300 space-y-1">
                <p><span className="text-slate-500 uppercase tracking-wider text-[11px] font-bold mr-2">Name</span> {lastScan.member_data.name}</p>
                <p><span className="text-slate-500 uppercase tracking-wider text-[11px] font-bold mr-2">Team</span> {lastScan.member_data.team_name}</p>
                <p><span className="text-slate-500 uppercase tracking-wider text-[11px] font-bold mr-2">Role</span> <span className="badge badge-purple">{lastScan.member_data.status}</span></p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Scans Logs */}
      <div className="glass-card p-6 animate-fadeInUp stagger-3">
        <h2 className="text-[15px] font-bold text-white mb-4">Recent Check-ins</h2>
        
        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
          {logs?.map((log: any) => (
            <div
              key={log.id}
              className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-xl"
            >
              <div>
                <p className="text-white font-medium text-sm">{log.member_name}</p>
                <p className="text-slate-500 text-[11px]">{log.team_name}</p>
              </div>
              <div className="text-right">
                <p className="text-emerald-400 text-xs font-semibold">{log.action}</p>
                <p className="text-slate-500 text-[10px]">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {!logs || logs.length === 0 && (
            <p className="text-center text-slate-500 py-6 text-sm">No recent scans on record.</p>
          )}
        </div>
      </div>
    </div>
  );
}
