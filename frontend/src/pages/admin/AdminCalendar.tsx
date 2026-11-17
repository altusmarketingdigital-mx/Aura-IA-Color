import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Trash2, Clock, AlertTriangle } from 'lucide-react';
import api from '../../services/api';

export const AdminCalendar: React.FC = () => {
  const [blockedSlots, setBlockedSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Nuevo Bloqueo
  const [date, setDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('19:00');
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string>('');

  const fetchBlockedSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/blocked-slots');
      if (res.data.success) {
        setBlockedSlots(res.data.slots);
      }
    } catch (e) {
      console.error('Error al cargar bloqueos:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockedSlots();
  }, []);

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!date || !startTime || !endTime || !reason.trim()) {
      setError('Todos los campos son obligatorios');
      return;
    }

    try {
      const res = await api.post('/admin/blocked-slots', {
        date,
        startTime,
        endTime,
        reason,
      });
      if (res.data.success) {
        setDate('');
        setReason('');
        fetchBlockedSlots();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar bloqueo');
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este bloqueo de horario?')) return;
    try {
      const res = await api.delete(`/admin/blocked-slots/${id}`);
      if (res.data.success) {
        fetchBlockedSlots();
      }
    } catch (e) {
      console.error('Error al eliminar bloqueo:', e);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-3xl text-[#FFFFFF] mb-1">Calendario y Bloqueos de Horario</h1>
        <p className="text-xs text-[#888888]">
          Configura cierres especiales, descansos o mantenimiento para que el motor de disponibilidad no permita reservas.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario de Nuevo Bloqueo */}
        <div className="bg-[#161616] border border-[#2B2B2B] p-6 rounded-sm">
          <h2 className="font-serif text-lg text-[#FFFFFF] mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#C6A15B]" />
            <span>Agregar Bloqueo</span>
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-500/40 rounded text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreateBlock} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#888888] uppercase tracking-wider mb-1">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#888888] uppercase tracking-wider mb-1">Hora Inicio</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>
              <div>
                <label className="block text-[#888888] uppercase tracking-wider mb-1">Hora Fin</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[#888888] uppercase tracking-wider mb-1">Motivo del Bloqueo</label>
              <input
                type="text"
                placeholder="Ej. Capacitación o mantenimiento de salón"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold uppercase tracking-wider text-xs rounded transition-all"
            >
              Guardar Bloqueo
            </button>
          </form>
        </div>

        {/* Listado de Bloqueos Activos */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#2B2B2B] p-6 rounded-sm">
          <h2 className="font-serif text-lg text-[#FFFFFF] mb-4">Bloqueos Registrados</h2>

          {loading ? (
            <div className="text-xs text-[#888888] py-8 text-center">Cargando bloqueos...</div>
          ) : blockedSlots.length === 0 ? (
            <div className="text-xs text-[#888888] py-8 text-center border border-dashed border-[#2A2A2A] rounded">
              No hay bloqueos activos. El calendario opera según los horarios regulares (Lunes a Sábado de 09:00 a 19:00).
            </div>
          ) : (
            <div className="divide-y divide-[#262626]">
              {blockedSlots.map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#C6A15B] font-semibold">{b.date}</span>
                      <span className="text-[#888888]">
                        de {b.startTime} a {b.endTime} hrs
                      </span>
                    </div>
                    <p className="text-[#FFFFFF] mt-0.5">{b.reason}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteBlock(b.id)}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                    title="Eliminar bloqueo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
