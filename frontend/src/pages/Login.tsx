import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Zap, Shield, QrCode, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../services/api';

const features = [
  { icon: QrCode,    label: 'Encrypted QR Codes',   desc: 'Secure, tamper-proof passes' },
  { icon: Shield,    label: 'JWT Authentication',    desc: 'Enterprise-grade security'   },
  { icon: BarChart3, label: 'Real-time Analytics',   desc: 'Live attendance insights'    },
];

export default function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', email: '', full_name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const response = await auth.login(formData.username, formData.password);
        localStorage.setItem('token', response.data.access_token);
        toast.success('Welcome back! 🎉');
        navigate('/dashboard');
      } else {
        await auth.register(formData);
        toast.success('Account created! Please log in.');
        setIsLogin(true);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--color-bg-deep)' }}
    >
      {/* ── Left Panel (brand / features) ─────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[46%] p-12"
        style={{
          background: 'linear-gradient(145deg, #0d1f1a 0%, #0a1628 60%, #0a0f1c 100%)',
          borderRight: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl icon-bg-green flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(16,185,129,0.4)' }}
          >
            <Zap size={20} fill="white" color="white" />
          </div>
          <div>
            <p className="text-white font-bold text-[16px] leading-tight">Nova Pass</p>
            <p className="text-emerald-400/60 text-[11px] font-medium tracking-widest">GENERATOR</p>
          </div>
        </div>

        {/* Hero Text */}
        <div className="space-y-6">
          <h2 className="text-[40px] font-extrabold leading-tight text-white">
            Event passes,<br />
            <span className="gradient-text">beautifully crafted.</span>
          </h2>
          <p className="text-slate-400 text-[15px] leading-relaxed max-w-sm">
            Generate encrypted QR passes, track attendance in real time, and manage your events — all in one platform.
          </p>

          <div className="space-y-4 pt-2">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-white text-[13px] font-semibold">{label}</p>
                  <p className="text-slate-500 text-[12px]">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-600 text-[12px]">Built for HackGear 2.0 · Nova Coders</p>
      </div>

      {/* ── Right Panel (form) ─────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[400px] animate-fadeInUp">

          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl icon-bg-green flex items-center justify-center">
              <Zap size={18} fill="white" color="white" />
            </div>
            <p className="text-white font-bold text-[16px]">Nova Pass</p>
          </div>

          <h2 className="text-[26px] font-bold text-white mb-1">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p className="text-slate-400 text-[14px] mb-8">
            {isLogin ? 'Sign in to your account to continue.' : 'Get started with Nova Pass today.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    name="full_name"
                    type="text"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="John Doe"
                    required={!isLogin}
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="john@example.com"
                    required={!isLogin}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Username
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="admin"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-[15px] mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in…' : 'Creating account…'}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={17} />
                  {isLogin ? 'Sign In' : 'Create Account'}
                </span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsLogin(!isLogin); setFormData({ username: '', password: '', email: '', full_name: '' }); }}
              className="text-emerald-400 hover:text-emerald-300 text-[13px] font-medium transition-colors"
            >
              {isLogin ? "Don't have an account? Register →" : '← Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
