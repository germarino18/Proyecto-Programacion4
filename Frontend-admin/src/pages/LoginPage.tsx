import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/admin');
    } catch {
      setError('Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFEDDB]">
      <div className="bg-surface-container-high rounded-lg shadow-[0_10px_20px_-5px_rgba(77,96,128,0.08)] p-10 border border-outline-variant/10 w-full max-w-[440px]">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="ROST" className="h-14 mx-auto mb-6" />
          <h2 className="font-headline text-2xl font-bold text-primary">Panel de Control</h2>
          <p className="font-body text-on-surface-variant text-sm mt-1">Accede a la gestión de especialidad</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-body text-xs font-semibold text-on-surface-variant uppercase tracking-[0.08em] mb-1.5">
              Email
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-[18px]">mail</span>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg pl-9 pr-4 py-3 text-on-surface font-body text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>
          <div>
            <label className="block font-body text-xs font-semibold text-on-surface-variant uppercase tracking-[0.08em] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#F5E6D3] border border-outline-variant rounded-lg pl-9 pr-4 py-3 text-on-surface font-body text-sm placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm font-body">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4d6080] text-[#ffffff] py-4 rounded-lg font-body font-semibold uppercase tracking-[0.1em] text-sm hover:opacity-90 transition-all disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
          <div className="text-center">
            <a href="#" className="font-body text-xs text-primary hover:text-primary-container transition-colors">
              Recuperar contraseña
            </a>
          </div>
        </form>

        <div className="flex items-center gap-3 mt-8">
          <div className="flex-1 h-px bg-outline-variant/30" />
          <span className="font-body text-[11px] text-on-surface-variant/50 uppercase tracking-[0.15em]">Acceso Protegido</span>
          <div className="flex-1 h-px bg-outline-variant/30" />
        </div>
      </div>
    </div>
  );
}
