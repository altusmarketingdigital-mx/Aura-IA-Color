import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  Award,
  CheckCircle2,
  Gift,
  History,
  RefreshCw,
  Search,
  Sparkles,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import api from '../services/api';
import { PublicLoyaltyCardData } from '../types/pos';

export const LoyaltyCard: React.FC = () => {
  const { qrToken } = useParams<{ qrToken?: string }>();
  const navigate = useNavigate();

  const [lookupInput, setLookupInput] = useState<string>('');
  const [lookupError, setLookupError] = useState<string>('');
  const [searching, setSearching] = useState<boolean>(false);

  const [card, setCard] = useState<PublicLoyaltyCardData | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(qrToken));
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchCard = useCallback(async (token: string, silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setError('');
    try {
      const res = await api.get(`/loyalty/card/${encodeURIComponent(token)}`, {
        params: { _t: Date.now() },
      });
      if (res.data.success) {
        setCard(res.data.card);
      }
    } catch (err: any) {
      setCard(null);
      setError(err.response?.data?.error || 'No se pudo cargar tu tarjeta de lealtad.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!qrToken) {
      setCard(null);
      setLoading(false);
      return;
    }
    fetchCard(qrToken);

    // Sincronización automática cuando la clienta vuelve a abrir o enfocar la pestaña
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchCard(qrToken, true);
      }
    };
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [qrToken, fetchCard]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupInput.trim()) return;
    setSearching(true);
    setLookupError('');
    try {
      const res = await api.get('/loyalty/lookup', { params: { q: lookupInput.trim() } });
      if (res.data.success && res.data.qrToken) {
        navigate(`/lealtad/${res.data.qrToken}`);
      }
    } catch (err: any) {
      setLookupError(
        err.response?.data?.error || 'No encontramos ninguna tarjeta con ese teléfono o código.'
      );
    } finally {
      setSearching(false);
    }
  };

  const formatRewardBadge = (discountType: string, discountValue: number) => {
    if (discountType === 'percentage') return `${discountValue}% OFF`;
    if (discountType === 'fixed') return `$${discountValue.toLocaleString('es-MX')} MXN OFF`;
    return 'SERVICIO CORTESÍA';
  };

  if (!qrToken) {
    return (
      <div className="bg-[#111111] py-20 min-h-[75vh] flex items-center justify-center">
        <div className="max-w-md w-full mx-auto px-4">
          <div className="bg-[#171717] border border-[#C6A15B]/40 rounded-sm p-8 text-center space-y-6 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-[#C6A15B]/15 border border-[#C6A15B]/50 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6 text-[#C6A15B]" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block mb-1.5">
                AURA IA COLOR CLUB
              </span>
              <h1 className="font-serif text-3xl text-[#FFFFFF] mb-2">
                Tu Tarjeta de Lealtad Digital
              </h1>
              <p className="text-xs text-[#888888] font-light leading-relaxed">
                Consulta tus puntos acumulados, visitas, código QR personal y recompensas desbloqueadas en tiempo real.
              </p>
            </div>

            {lookupError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-sm text-red-200 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            <form onSubmit={handleLookup} className="space-y-3 text-left">
              <label className="block text-[11px] uppercase tracking-wider text-[#888888]">
                Teléfono registrado o código QR
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={lookupInput}
                  onChange={(e) => setLookupInput(e.target.value)}
                  placeholder="Ej. 5512345678 o AURA-QR-..."
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] pl-9 pr-4 py-3 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
                <Search className="w-4 h-4 text-[#666666] absolute left-3 top-3.5" />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="w-full py-3 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-widest rounded-sm transition-all disabled:opacity-50"
              >
                {searching ? 'Buscando tarjeta...' : 'Consultar mi Tarjeta'}
              </button>
            </form>

            <div className="pt-4 border-t border-[#262626] text-[11px] text-[#777777]">
              ¿Aún no tienes tarjeta? Solicítala en tu próxima visita en caja o{' '}
              <Link to="/reservar" className="text-[#C6A15B] hover:underline">
                agenda tu cita aquí
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cardUrl = `${window.location.origin}/lealtad/${qrToken}`;
  const progressPercent = card?.nextReward
    ? Math.min(100, Math.round((card.currentPoints / card.nextReward.requiredPoints) * 100))
    : 100;

  return (
    <div className="bg-[#111111] py-14 min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        {loading ? (
          <div className="text-center py-20 text-xs text-[#888888]">
            Sincronizando tu tarjeta de lealtad en tiempo real...
          </div>
        ) : error || !card ? (
          <div className="bg-[#171717] border border-red-500/40 p-8 rounded-sm text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h2 className="font-serif text-2xl text-[#FFFFFF]">Tarjeta no encontrada</h2>
            <p className="text-xs text-[#888888]">{error}</p>
            <Link
              to="/lealtad"
              className="inline-block px-6 py-2.5 bg-[#C6A15B] text-[#111111] text-xs font-bold uppercase tracking-wider rounded-sm"
            >
              Buscar con otro teléfono
            </Link>
          </div>
        ) : (
          <>
            {/* Cabecera y Botón de Actualización en Tiempo Real */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block">
                  AURA IA COLOR CLUB • Tarjeta Digital
                </span>
                <h1 className="font-serif text-3xl text-[#FFFFFF]">Hola, {card.name}</h1>
              </div>
              <button
                type="button"
                onClick={() => fetchCard(card.qrToken, true)}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1B1B1B] border border-[#C6A15B]/40 text-[#C6A15B] hover:bg-[#242424] rounded-sm text-xs font-semibold self-start sm:self-auto transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Actualizando...' : 'Actualizar saldo'}</span>
              </button>
            </div>

            {/* Tarjeta Principal con Código QR */}
            <div className="rounded-xl bg-gradient-to-br from-[#232323] via-[#171717] to-[#0F0F0F] border-2 border-[#C6A15B]/60 p-6 sm:p-8 shadow-[0_15px_50px_rgba(198,161,91,0.2)]">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* QR */}
                <div className="md:col-span-5 flex flex-col items-center">
                  <div className="bg-[#FFFFFF] p-3.5 rounded-lg shadow-xl">
                    <QRCodeSVG value={cardUrl} size={156} level="M" />
                  </div>
                  <span className="mt-3 font-mono text-[11px] text-[#C6A15B] tracking-widest font-semibold">
                    {card.qrToken}
                  </span>
                  <span className="text-[10px] text-[#888888] mt-0.5">
                    Muestra este QR en caja al pagar
                  </span>
                </div>

                {/* Métricas de Puntos y Visitas */}
                <div className="md:col-span-7 space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#111111]/90 border border-[#2D2D2D] p-4 rounded-sm">
                      <span className="text-[10px] uppercase tracking-wider text-[#888888] block">
                        Puntos Disponibles
                      </span>
                      <span className="font-serif text-3xl text-[#C6A15B] font-bold">
                        {card.currentPoints.toLocaleString('es-MX')}
                      </span>
                      <span className="text-[10px] text-[#A3A3A3] block mt-0.5">pts AURA</span>
                    </div>

                    <div className="bg-[#111111]/90 border border-[#2D2D2D] p-4 rounded-sm">
                      <span className="text-[10px] uppercase tracking-wider text-[#888888] block">
                        Visitas Totales
                      </span>
                      <span className="font-serif text-3xl text-[#FFFFFF] font-bold">
                        {card.totalVisits}
                      </span>
                      <span className="text-[10px] text-[#A3A3A3] block mt-0.5">
                        servicios en estudio
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progreso hacia la Siguiente Recompensa */}
                  {card.nextReward ? (
                    <div className="bg-[#111111]/80 border border-[#2A2A2A] p-4 rounded-sm space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#DFBF7E] font-medium flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-[#C6A15B]" />
                          Próxima meta: {card.nextReward.title}
                        </span>
                        <span className="font-mono text-[#C6A15B]">
                          {card.currentPoints}/{card.nextReward.requiredPoints} pts
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#222222] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#C6A15B] to-[#DFBF7E] transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-[#888888]">
                        Te faltan{' '}
                        <strong className="text-[#FFFFFF]">
                          {(card.nextReward.requiredPoints - card.currentPoints).toLocaleString('es-MX')} puntos
                        </strong>{' '}
                        para desbloquearla.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-[#111111]/80 border border-[#C6A15B]/40 p-3.5 rounded-sm text-xs text-[#DFBF7E] flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#C6A15B]" />
                      <span>¡Has desbloqueado todas las recompensas disponibles!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recompensas Desbloqueadas y Catálogo */}
            <div className="bg-[#171717] border border-[#262626] rounded-sm p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl text-[#FFFFFF] flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#C6A15B]" />
                  <span>Recompensas Disponibles</span>
                </h2>
                <span className="text-xs text-[#C6A15B] font-mono">
                  {card.unlockedRewards.length} desbloqueada(s)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {card.rewardsCatalog.map((reward) => {
                  const unlocked = card.currentPoints >= reward.requiredPoints;
                  return (
                    <div
                      key={reward.id}
                      className={`p-4 rounded-sm border transition-all ${
                        unlocked
                          ? 'bg-[#1D1B15] border-[#C6A15B]/70'
                          : 'bg-[#121212] border-[#262626] opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#C6A15B]/15 text-[#C6A15B] font-bold">
                          {formatRewardBadge(reward.discountType, reward.discountValue)}
                        </span>
                        {unlocked ? (
                          <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Disponible
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#888888] font-mono">
                            {reward.requiredPoints} pts
                          </span>
                        )}
                      </div>
                      <h3 className="font-serif text-base text-[#FFFFFF]">{reward.title}</h3>
                      <p className="text-[11px] text-[#888888] mt-1 font-light">
                        {reward.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Historial Reciente */}
            <div className="bg-[#171717] border border-[#262626] rounded-sm p-6 space-y-4">
              <h2 className="font-serif text-xl text-[#FFFFFF] flex items-center gap-2">
                <History className="w-5 h-5 text-[#C6A15B]" />
                <span>Movimientos Recientes</span>
              </h2>

              {card.recentHistory.length === 0 ? (
                <p className="text-xs text-[#888888] italic">
                  Aún no hay movimientos registrados en tu tarjeta.
                </p>
              ) : (
                <div className="divide-y divide-[#242424]">
                  {card.recentHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <p className="text-[#FFFFFF] font-medium">{entry.description}</p>
                        <p className="text-[11px] text-[#777777] mt-0.5">
                          {new Date(entry.createdAt).toLocaleString('es-MX', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                      </div>
                      <span
                        className={`font-mono font-bold shrink-0 ${
                          entry.pointsDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {entry.pointsDelta >= 0 ? `+${entry.pointsDelta}` : entry.pointsDelta} pts
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
