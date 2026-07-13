import React, { useEffect, useState } from 'react';
import { Wand2, Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Sparkles, Loader2, LogIn, Info } from 'lucide-react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithMagicLink,
  onAuthChange,
  getCurrentUser,
  AuthUser,
} from '../services/authService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { APP_VERSION, APP_VERSION_NAME } from '../data/appVersion';
import {
  DEMO_USER, isDemoLoggedIn, getDemoUser, demoSignIn,
} from '../services/demoAuth';

interface AuthGateProps {
  children: (user: AuthUser) => React.ReactNode;
}

type Mode = 'signin' | 'signup' | 'magic';

export const AuthGate: React.FC<AuthGateProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoTick, setDemoTick] = useState(0); // bump khi demo login xong để re-render

  useEffect(() => {
    let cancelled = false;
    // Ưu tiên demo user nếu đã login
    const demo = getDemoUser();
    if (demo) {
      setUser(demo as unknown as AuthUser);
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    getCurrentUser().then((u) => {
      if (cancelled) return;
      setUser(u);
      setLoading(false);
    });
    const off = onAuthChange((u) => setUser(u));
    return () => {
      cancelled = true;
      off();
    };
  }, [demoTick]);

  const handleDemoLoginSuccess = () => setDemoTick(t => t + 1);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas text-fg">
        <Loader2 className="animate-spin text-brand" size={28} />
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onDemoSuccess={handleDemoLoginSuccess} />;
  }

  return <>{children(user)}</>;
};

interface LoginScreenProps {
  onDemoSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onDemoSuccess }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'err' | 'ok'; text: string } | null>(null);

  // Demo form state
  const [demoUser, setDemoUser] = useState(DEMO_USER.username);
  const [demoPass, setDemoPass] = useState(DEMO_USER.password);
  const [demoErr, setDemoErr] = useState<string | null>(null);

  const handleDemoLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoErr(null);
    const ok = demoSignIn(demoUser, demoPass);
    if (!ok) {
      setDemoErr(`Sai tài khoản/mật khẩu. Dùng: ${DEMO_USER.username} / ${DEMO_USER.password}`);
      return;
    }
    onDemoSuccess();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else if (mode === 'signup') {
        await signUpWithEmail(email, password, displayName || undefined);
        setMsg({ kind: 'ok', text: 'Đăng ký thành công. Đang đăng nhập...' });
      } else {
        await signInWithMagicLink(email);
        setMsg({ kind: 'ok', text: 'Magic link đã gửi tới email. Kiểm tra inbox.' });
      }
    } catch (err: any) {
      setMsg({ kind: 'err', text: err?.message || 'Có lỗi xảy ra' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas text-fg p-6">
      <div className="w-full max-w-md space-y-4">
        {/* Logo */}
        <div className="text-center mb-2">
          <div className="inline-flex items-center justify-center bg-brand text-white p-3 rounded-xl border-2 border-fg/10 shadow-pop mb-3">
            <Wand2 size={22} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">AI Banner Pro</h1>
          <p className="text-[11px] text-subtle font-mono mt-0.5">
            v{APP_VERSION} · {APP_VERSION_NAME}
          </p>
        </div>

        {/* Demo login block — LUÔN hiện, credentials show ngoài */}
        <div className="bg-brand/5 border-2 border-brand/40 rounded-xl p-5 shadow-pop">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-brand/20 text-brand p-1.5 rounded border border-brand/40">
              <LogIn size={14} />
            </div>
            <div>
              <p className="text-sm font-bold text-fg">Demo Login (nhanh)</p>
              <p className="text-[11px] text-subtle">Dùng thử ngay không cần Supabase</p>
            </div>
          </div>

          <div className="bg-canvas border border-line rounded-md p-2 mb-3 flex items-center gap-2">
            <Info size={12} className="text-brand shrink-0" />
            <p className="text-[11px] text-fg">
              Tài khoản: <code className="font-mono font-semibold text-brand">{DEMO_USER.username}</code>
              {' · '}
              Mật khẩu: <code className="font-mono font-semibold text-brand">{DEMO_USER.password}</code>
            </p>
          </div>

          <form onSubmit={handleDemoLogin} className="space-y-2">
            <input
              type="text"
              value={demoUser}
              onChange={(e) => setDemoUser(e.target.value)}
              placeholder="admin"
              className="w-full bg-canvas border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
            <input
              type="password"
              value={demoPass}
              onChange={(e) => setDemoPass(e.target.value)}
              placeholder="pass"
              className="w-full bg-canvas border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
            />
            {demoErr && (
              <div className="text-xs rounded-md p-2 flex items-start gap-2 border bg-red-500/10 border-red-500/30 text-red-400">
                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                {demoErr}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-2 rounded-md flex items-center justify-center gap-2 transition-colors shadow-pop"
            >
              <LogIn size={14} /> Đăng nhập Demo
            </button>
          </form>
        </div>

        {/* Supabase login — chỉ hiện khi đã cấu hình */}
        {isSupabaseConfigured ? (
          <div className="bg-surface border border-line rounded-xl p-6 shadow-pop">
            <p className="text-[11px] text-subtle text-center mb-3">— hoặc dùng Supabase (production) —</p>
            {/* Tabs */}
            <div className="flex gap-1 mb-5 bg-raised rounded-md p-1">
              <TabBtn active={mode === 'signin'} onClick={() => setMode('signin')}>Đăng nhập</TabBtn>
              <TabBtn active={mode === 'signup'} onClick={() => setMode('signup')}>Đăng ký</TabBtn>
              <TabBtn active={mode === 'magic'}  onClick={() => setMode('magic')}>Magic Link</TabBtn>
            </div>

            <form onSubmit={submit} className="space-y-3">
              {mode === 'signup' && (
                <Field icon={<UserIcon size={14} />} label="Tên hiển thị">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Bạn muốn được gọi là gì?"
                    className="w-full bg-canvas border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
                  />
                </Field>
              )}

              <Field icon={<Mail size={14} />} label="Email">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ban@example.com"
                  className="w-full bg-canvas border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
                />
              </Field>

              {mode !== 'magic' && (
                <Field icon={<Lock size={14} />} label="Mật khẩu">
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full bg-canvas border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
                  />
                </Field>
              )}

              {msg && (
                <div className={`text-xs rounded-md p-2.5 flex items-start gap-2 border ${
                  msg.kind === 'err'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                  <AlertCircle size={12} className="shrink-0 mt-0.5" />
                  {msg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-canvas border border-line hover:bg-raised text-fg font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    {mode === 'signin' && <>Đăng nhập <ArrowRight size={16} /></>}
                    {mode === 'signup' && <>Tạo tài khoản <Sparkles size={16} /></>}
                    {mode === 'magic'  && <>Gửi magic link <Mail size={16} /></>}
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-surface/50 border border-dashed border-line rounded-xl p-4 text-center">
            <p className="text-xs text-subtle">
              Supabase chưa cấu hình → chỉ dùng Demo mode. Xem <code className="font-mono">README.md</code> để setup Supabase (optional, cho sync đa thiết bị).
            </p>
          </div>
        )}

        <p className="text-center text-[11px] text-subtle">
          {isSupabaseConfigured
            ? 'Demo mode dùng localStorage. Supabase dùng cloud database + RLS.'
            : 'Demo mode: dữ liệu lưu localStorage trình duyệt.'}
        </p>
      </div>
    </div>
  );
};

const TabBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 text-xs py-1.5 rounded transition-colors ${
      active ? 'bg-canvas text-fg shadow-sm' : 'text-muted hover:text-fg'
    }`}
  >
    {children}
  </button>
);

const Field: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div>
    <label className="text-[11px] font-medium text-muted flex items-center gap-1.5 mb-1">
      {icon} {label}
    </label>
    {children}
  </div>
);
