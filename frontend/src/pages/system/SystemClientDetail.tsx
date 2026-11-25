import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft,
  Award,
  Copy,
  Check,
  ExternalLink,
  History,
  Receipt,
  SlidersHorizontal,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import api from '../../services/api';
import {
  LoyaltyLedgerEntry,
  PosClient,
  PosTransactionRecord,
  RewardItem,
} from '../../types/pos';

export const SystemClientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [client, setClient] = useState<
    (PosClient & {
      posTransactions: PosTransactionRecord[];
      loyaltyLedger: LoyaltyLedgerEntry[];
    }) | null
  >(null);
  const [availableRewards, setAvailableRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Ajuste manual de puntos / visitas
  const [showAdjustModal, setShowAdjustModal] = useState<boolean>(false);
  const [pointsDelta, setPointsDelta] = useState<number>(0);
  const [visitsDelta, setVisitsDelta] = useState<number>(0);
  const [adjustDescription, setAdjustDescription] = useState<string>('');
  const [adjusting, setAdjusting] = useState<boolean>(false);
  const [adjustError, setAdjustError] = useState<string>('');

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/system/clients/${id}`);
      if (res.data.success) {
        setClient(res.data.client);
        setAvailableRewards(res.data.availableRewards || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'No se pudo cargar el expediente del cliente.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleCopyCardUrl = async () => {
    if (!client) return;
    const url = `${window.location.origin}/lealtad/${client.qrToken}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setAdjusting(true);
    setAdjustError('');
    try {
      const res = await api.post(`/system/clients/${id}/adjust`, {
        pointsDelta: Number(pointsDelta),
        visitsDelta: Number(visitsDelta),
        description: adjustDescription.trim(),
      });
      if (res.data.success) {
        setShowAdjustModal(false);
        setPointsDelta(0);
        setVisitsDelta(0);
        setAdjustDescription('');
        fetchDetail();
      }
    } catch (err: any) {
      setAdjustError(err.response?.data?.error || 'No se pudo registrar el ajuste.');
    } finally {
      setAdjusting(false);
    }
  };

  if (loading) {
    return <div className="text-xs text-[#888888] py-16 text-center">Cargando historial del cliente...</div>;
  }

  if (error || !client) {
    return (
      <div className="space-y-4">
        <Link to="/system" className="inline-flex items-center gap-2 text-xs text-[#C6A15B] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Caja / POS</span>
        </Link>
        <div className="bg-[#161616] border border-red-500/40 p-6 rounded-sm text-xs text-red-300">
          {error || 'Cliente no encontrado'}
        </div>
      </div>
    );
  }

  const publicCardUrl = `${window.location.origin}/lealtad/${client.qrToken}`;

  return (
    <div className="space-y-8">
      {/* Navegación superior */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/system"
            className="inline-flex items-center gap-1.5 text-xs text-[#C6A15B] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al Módulo POS (/system)</span>
          </Link>
          <h1 className="font-serif text-3xl text-[#FFFFFF]">{client.name}</h1>
          <p className="text-xs text-[#888888]">
            Tel: {client.phone} {client.email ? `• ${client.email}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAdjustModal(true)}
            className="px-4 py-2 bg-[#1D1D1D] border border-[#333333] hover:border-[#C6A15B] text-[#F5F1E9] text-xs font-semibold rounded-sm flex items-center gap-2 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C6A15B]" />
            <span>Ajustar Puntos / Visitas</span>
          </button>
          <Link
            to={`/lealtad/${client.qrToken}`}
            target="_blank"
            className="px-4 py-2 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] text-xs font-bold uppercase tracking-wider rounded-sm flex items-center gap-2 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir Tarjeta QR</span>
          </Link>
        </div>
      </div>

      {/* Tarjeta de Resumen + QR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-[#161616] border border-[#C6A15B]/40 rounded-sm p-6 flex flex-col items-center text-center space-y-3">
          <span className="text-[10px] uppercase tracking-widest text-[#C6A15B] font-semibold">
            Tarjeta Digital QR
          </span>
          <div className="bg-[#FFFFFF] p-3 rounded-md">
            <QRCodeSVG value={publicCardUrl} size={140} level="M" />
          </div>
          <span className="font-mono text-xs text-[#FFFFFF] font-semibold">{client.qrToken}</span>
          <button
            type="button"
            onClick={handleCopyCardUrl}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#C6A15B] hover:text-[#DFBF7E]"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Enlace copiado' : 'Copiar enlace de tarjeta'}</span>
          </button>
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#161616] border border-[#2B2B2B] p-6 rounded-sm flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#888888]">Saldo Actual</span>
            <div>
              <span className="font-serif text-4xl text-[#C6A15B] font-bold">
                {client.currentPoints.toLocaleString('es-MX')}
              </span>
              <span className="text-xs text-[#888888] block mt-1">puntos acumulados</span>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#2B2B2B] p-6 rounded-sm flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#888888]">Visitas Totales</span>
            <div>
              <span className="font-serif text-4xl text-[#FFFFFF] font-bold">
                {client.totalVisits}
              </span>
              <span className="text-xs text-[#888888] block mt-1">visitas registradas en POS</span>
            </div>
          </div>

          <div className="bg-[#161616] border border-[#2B2B2B] p-6 rounded-sm flex flex-col justify-between">
            <span className="text-[11px] uppercase tracking-wider text-[#888888]">
              Recompensas Listas
            </span>
            <div>
              <span className="font-serif text-4xl text-emerald-400 font-bold">
                {availableRewards.length}
              </span>
              <span className="text-xs text-[#888888] block mt-1">
                {availableRewards.length > 0
                  ? availableRewards.map((r) => r.title).join(', ')
                  : 'Ninguna desbloqueada aún'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dos columnas: Movimientos de Lealtad & Compras en Caja */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Línea de tiempo de Movimientos (loyalty_ledger) */}
        <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#FFFFFF] flex items-center gap-2">
            <History className="w-5 h-5 text-[#C6A15B]" />
            <span>Línea de Tiempo de Lealtad</span>
          </h2>

          {client.loyaltyLedger.length === 0 ? (
            <p className="text-xs text-[#888888] italic">Sin movimientos registrados.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {client.loyaltyLedger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 bg-[#121212] border border-[#262626] rounded-sm flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                          entry.type === 'EARN'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : entry.type === 'REDEEM'
                            ? 'bg-amber-500/15 text-amber-400'
                            : 'bg-sky-500/15 text-sky-400'
                        }`}
                      >
                        {entry.type}
                      </span>
                      <span className="text-[11px] text-[#777777]">
                        {new Date(entry.createdAt).toLocaleString('es-MX', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>
                    <p className="text-[#F5F1E9]">{entry.description}</p>
                    {entry.visitsDelta !== 0 && (
                      <p className="text-[11px] text-[#888888]">
                        Visitas: {entry.visitsDelta > 0 ? `+${entry.visitsDelta}` : entry.visitsDelta}
                      </p>
                    )}
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

        {/* Historial de Operaciones en Caja (pos_transactions) */}
        <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-6 space-y-4">
          <h2 className="font-serif text-xl text-[#FFFFFF] flex items-center gap-2">
            <Receipt className="w-5 h-5 text-[#C6A15B]" />
            <span>Compras y Servicios en Caja</span>
          </h2>

          {client.posTransactions.length === 0 ? (
            <p className="text-xs text-[#888888] italic">Aún no tiene cobros registrados en POS.</p>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {client.posTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 bg-[#121212] border border-[#262626] rounded-sm space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between border-b border-[#222222] pb-2">
                    <span className="text-[11px] text-[#888888]">
                      {new Date(tx.createdAt).toLocaleString('es-MX', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </span>
                    <span className="font-serif text-base text-[#C6A15B] font-bold">
                      ${tx.totalPaid.toLocaleString('es-MX')} MXN
                    </span>
                  </div>

                  <ul className="space-y-1 text-[#D4D4D4]">
                    {tx.items.map((item, idx) => (
                      <li key={`${tx.id}-${idx}`} className="flex justify-between">
                        <span>
                          {item.quantity}x {item.name}{' '}
                          <span className="text-[10px] text-[#777777]">({item.category})</span>
                        </span>
                        <span className="font-mono">
                          ${item.lineTotal.toLocaleString('es-MX')}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {tx.discountApplied > 0 && (
                    <div className="flex justify-between text-amber-400 text-[11px] pt-1">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {tx.reward?.title || 'Recompensa aplicada'}
                      </span>
                      <span>-${tx.discountApplied.toLocaleString('es-MX')} MXN</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#888888] border-t border-[#1E1E1E]">
                    <span>
                      +{tx.pointsEarned} pts ganados
                      {tx.pointsRedeemed > 0 ? ` • -${tx.pointsRedeemed} pts canjeados` : ''}
                    </span>
                    <span className="font-mono text-[10px] text-[#555555]">
                      {tx.idempotencyKey.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Ajuste Manual */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-md w-full rounded-sm p-6 space-y-4">
            <h3 className="font-serif text-xl text-[#FFFFFF] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C6A15B]" />
              <span>Ajuste Manual de Puntos / Visitas</span>
            </h3>

            {adjustError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{adjustError}</span>
              </div>
            )}

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1">Delta Puntos (+/-)</label>
                  <input
                    type="number"
                    value={pointsDelta}
                    onChange={(e) => setPointsDelta(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1">Delta Visitas (+/-)</label>
                  <input
                    type="number"
                    value={visitsDelta}
                    onChange={(e) => setVisitsDelta(Number(e.target.value))}
                    className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Motivo del ajuste *</label>
                <input
                  type="text"
                  value={adjustDescription}
                  onChange={(e) => setAdjustDescription(e.target.value)}
                  placeholder="Ej. Bonificación por incidencia o migración de historial"
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 bg-[#262626] text-[#888888] rounded-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={adjusting}
                  className="px-5 py-2 bg-[#C6A15B] text-[#111111] font-bold rounded-sm uppercase disabled:opacity-50"
                >
                  {adjusting ? 'Guardando...' : 'Aplicar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
