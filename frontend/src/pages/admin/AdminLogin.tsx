import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        login(res.data.token, res.data.user);
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('Error de login:', err);
      setError(err.response?.data?.error || 'Credenciales incorrectas o problema de conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#161616] border border-[#2B2B2B] p-8 sm:p-10 rounded-sm shadow-2xl">
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full border border-[#C6A15B] flex items-center justify-center bg-[#1A1A1A] mx-auto mb-4">
            <Sparkles className="w-6 h-6 text-[#C6A15B]" />
          </div>
          <h1 className="font-serif text-2xl text-[#FFFFFF] font-bold">
            AURA <span className="text-[#C6A15B] font-light">ADMIN</span>
          </h1>
          <p className="text-xs text-[#888888] uppercase tracking-widest mt-1">
            Control Operativo y Reservaciones
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#888888] mb-1.5">
              Correo Administrativo
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@auraiacolor.mx"
                className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] pl-10 pr-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                required
              />
              <Mail className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-[#888888] mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] pl-10 pr-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                required
              />
              <Lock className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-widest rounded-sm transition-all shadow-md disabled:opacity-50 mt-2"
          >
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#262626] text-center text-[11px] text-[#666666]">
          <p>AURA IA COLOR © {new Date().getFullYear()}</p>
          <p className="mt-1">Sistema exclusivo para personal autorizado</p>
        </div>

      </div>
    </div>
  );
};
