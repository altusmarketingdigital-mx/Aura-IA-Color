import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Eye,
  Clock,
  RotateCcw,
  AlertCircle,
  X,
} from 'lucide-react';
import api from '../../services/api';

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Modal de Detalle
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [modalLoading, setModalLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string>('');

  // Modal de Reprogramación
  const [isRescheduling, setIsRescheduling] = useState<boolean>(false);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('10:00');

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/appointments', {
        params: { status: statusFilter, search },
      });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (e) {
      console.error('Error al cargar citas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAppointments();
  };

  // Abrir detalle
  const handleOpenDetail = async (id: string) => {
    setModalLoading(true);
    setActionError('');
    setIsRescheduling(false);
    try {
      const res = await api.get(`/admin/appointments/${id}`);
      if (res.data.success) {
        setSelectedApp(res.data.appointment);
      }
    } catch (e) {
      console.error('Error al cargar detalle de cita:', e);
    } finally {
      setModalLoading(false);
    }
  };

  // Confirmar Cita
  const handleConfirm = async (id: string) => {
    setActionError('');
    try {
      const res = await api.post(`/admin/appointments/${id}/confirm`);
      if (res.data.success) {
        setSelectedApp(res.data.appointment);
        fetchAppointments();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'No fue posible confirmar la cita.');
    }
  };

  // Rechazar / Cancelar Cita
  const handleStatusChange = async (id: string, status: 'REJECTED' | 'CANCELLED') => {
    setActionError('');
    const reason = prompt('Indica el motivo (opcional):') || '';
    try {
      const endpoint = status === 'REJECTED' ? 'reject' : 'cancel';
      const res = await api.post(`/admin/appointments/${id}/${endpoint}`, { reason });
      if (res.data.success) {
        setSelectedApp(res.data.appointment);
        fetchAppointments();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Error al cambiar estado.');
    }
  };

  // Reprogramar Cita
  const handleReschedule = async (id: string) => {
    setActionError('');
    if (!newDate || !newTime) {
      setActionError('Debes seleccionar fecha y hora para reprogramar');
      return;
    }

    try {
      const [y, m, d] = newDate.split('-').map(Number);
      const [h, min] = newTime.split(':').map(Number);
      const isoDate = new Date(Date.UTC(y, m - 1, d, h, min, 0)).toISOString();

      const res = await api.post(`/admin/appointments/${id}/reschedule`, { newDate: isoDate });
      if (res.data.success) {
        setIsRescheduling(false);
        setSelectedApp(res.data.appointment);
        fetchAppointments();
      }
    } catch (err: any) {
      setActionError(err.response?.data?.error || 'Error al reprogramar la cita.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-3xl text-[#FFFFFF] mb-1">Citas y Reservaciones</h1>
        <p className="text-xs text-[#888888]">
          Gestión de solicitudes, confirmaciones, cancelaciones y fotografías de clientes
        </p>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-[#161616] border border-[#2B2B2B] p-4 rounded-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <input
            type="text"
            placeholder="Buscar por folio, cliente o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] pl-9 pr-3 py-2 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
          />
          <Search className="w-4 h-4 text-[#666666] absolute left-3 top-2.5" />
        </form>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-sm text-xs font-medium tracking-wider transition-all ${
                statusFilter === st
                  ? 'bg-[#C6A15B] text-[#111111] font-bold'
                  : 'bg-[#1F1F1F] text-[#888888] hover:text-[#FFFFFF]'
              }`}
            >
              {st === 'ALL'
                ? 'Todas'
                : st === 'PENDING'
                ? 'Pendientes'
                : st === 'CONFIRMED'
                ? 'Confirmadas'
                : st === 'CANCELLED'
                ? 'Canceladas'
                : 'Rechazadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Reservaciones */}
      <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm overflow-hidden">
        {loading ? (
          <div className="text-xs text-[#888888] py-12 text-center">Cargando reservaciones...</div>
        ) : appointments.length === 0 ? (
          <div className="text-xs text-[#888888] py-12 text-center">No se encontraron citas con los filtros seleccionados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E1E1E] text-[#888888] uppercase tracking-wider border-b border-[#2B2B2B]">
                <tr>
                  <th className="py-3 px-4">Folio</th>
                  <th className="py-3 px-4">Clienta</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Servicio</th>
                  <th className="py-3 px-4">Fecha & Hora</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {appointments.map((app) => {
                  const dateObj = new Date(app.appointmentDate);
                  const timeStr = `${dateObj.getUTCHours().toString().padStart(2, '0')}:${dateObj.getUTCMinutes().toString().padStart(2, '0')}`;
                  const dateStr = dateObj.toISOString().split('T')[0];

                  return (
                    <tr key={app.id} className="hover:bg-[#1B1B1B] transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-[#C6A15B]">{app.folio}</td>
                      <td className="py-3 px-4 font-medium text-[#FFFFFF]">{app.customer?.name}</td>
                      <td className="py-3 px-4 text-[#888888]">{app.customer?.phone}</td>
                      <td className="py-3 px-4 text-[#FFFFFF]">{app.service?.name}</td>
                      <td className="py-3 px-4">
                        <span className="text-[#FFFFFF]">{dateStr}</span>{' '}
                        <span className="text-[#C6A15B] font-mono">{timeStr} hrs</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'CONFIRMED'
                              ? 'bg-green-950/60 text-green-400 border border-green-500/30'
                              : app.status === 'PENDING'
                              ? 'bg-yellow-950/60 text-yellow-400 border border-yellow-500/30'
                              : 'bg-red-950/60 text-red-400 border border-red-500/30'
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(app.id)}
                          className="px-2.5 py-1 bg-[#242424] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#111111] rounded text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Detalle de Cita */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-2xl w-full rounded-sm p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#888888]">Detalle de Reservación</span>
                <h3 className="font-serif text-2xl text-[#FFFFFF] font-bold mt-1">
                  Folio: <span className="text-[#C6A15B] font-mono">{selectedApp.folio}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="text-[#888888] hover:text-[#FFFFFF] p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-950/40 border border-red-500/50 rounded text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Información de la Cita */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#1A1A1A] p-4 rounded border border-[#282828]">
                <span className="text-[#888888] block text-[10px] uppercase">Clienta</span>
                <p className="text-sm font-semibold text-[#FFFFFF] mt-1">{selectedApp.customer?.name}</p>
                <p className="text-[#888888] mt-0.5">Tel: {selectedApp.customer?.phone}</p>
                {selectedApp.customer?.email && (
                  <p className="text-[#888888]">Email: {selectedApp.customer?.email}</p>
                )}
              </div>

              <div className="bg-[#1A1A1A] p-4 rounded border border-[#282828]">
                <span className="text-[#888888] block text-[10px] uppercase">Servicio y Horario</span>
                <p className="text-sm font-semibold text-[#FFFFFF] mt-1">{selectedApp.service?.name}</p>
                <p className="text-[#C6A15B] font-mono mt-0.5">
                  ${selectedApp.service?.price?.toLocaleString('es-MX')} MXN • {selectedApp.service?.durationMinutes} min
                </p>
                <p className="text-[#FFFFFF] mt-1">
                  {new Date(selectedApp.appointmentDate).toISOString().split('T')[0]} a las{' '}
                  {new Date(selectedApp.appointmentDate).getUTCHours().toString().padStart(2, '0')}:
                  {new Date(selectedApp.appointmentDate).getUTCMinutes().toString().padStart(2, '0')} hrs
                </p>
              </div>
            </div>

            {/* Notas del Cliente */}
            {selectedApp.clientNotes && (
              <div className="bg-[#1A1A1A] p-4 rounded border border-[#282828] text-xs">
                <span className="text-[#888888] block text-[10px] uppercase mb-1">Comentarios de la Clienta:</span>
                <p className="text-[#FFFFFF] italic">{selectedApp.clientNotes}</p>
              </div>
            )}

            {/* Fotografías Protegidas */}
            <div>
              <span className="text-xs uppercase tracking-wider text-[#888888] block mb-3">
                Fotografías de Diagnóstico (Almacenamiento Privado)
              </span>
              {selectedApp.photos && selectedApp.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {selectedApp.photos.map((p: any) => (
                    <div key={p.id} className="border border-[#333333] rounded overflow-hidden bg-[#111111] p-2">
                      <p className="text-[10px] text-[#C6A15B] uppercase font-semibold mb-1">
                        {p.photoType === 'CURRENT' ? 'Foto Actual del Cabello' : 'Foto de Referencia'}
                      </p>
                      <img
                        src={`/api/admin/appointments/${selectedApp.id}/photos/${p.id}`}
                        alt="Foto Cita"
                        className="w-full h-44 object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#666666] italic">No se adjuntaron fotografías en esta cita.</p>
              )}
            </div>

            {/* Sección de Reprogramación */}
            {isRescheduling && (
              <div className="bg-[#1F1F1F] p-4 rounded border border-[#C6A15B]/40 space-y-3 text-xs">
                <span className="text-[#C6A15B] font-semibold block">Seleccionar Nueva Fecha y Hora:</span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs"
                  />
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReschedule(selectedApp.id)}
                    className="px-4 py-1.5 bg-[#C6A15B] text-[#111111] font-bold rounded text-xs"
                  >
                    Guardar Nueva Fecha
                  </button>
                  <button
                    onClick={() => setIsRescheduling(false)}
                    className="px-3 py-1.5 bg-[#2B2B2B] text-[#888888] rounded text-xs"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Acciones de Estado */}
            <div className="pt-4 border-t border-[#2B2B2B] flex flex-wrap gap-3 justify-end">
              {selectedApp.status === 'PENDING' && (
                <button
                  onClick={() => handleConfirm(selectedApp.id)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded text-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar Cita</span>
                </button>
              )}

              <button
                onClick={() => setIsRescheduling(!isRescheduling)}
                className="px-4 py-2 bg-[#2D2D2D] hover:bg-[#3D3D3D] text-[#FFFFFF] font-semibold rounded text-xs flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reprogramar</span>
              </button>

              {selectedApp.status !== 'CANCELLED' && selectedApp.status !== 'REJECTED' && (
                <button
                  onClick={() => handleStatusChange(selectedApp.id, 'CANCELLED')}
                  className="px-4 py-2 bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 font-semibold rounded text-xs flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cancelar Cita</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
