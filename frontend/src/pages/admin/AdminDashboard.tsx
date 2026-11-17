import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  User,
  ArrowUpRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (e) {
      console.error('Error al cargar dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="text-sm text-[#888888] py-12">Cargando métricas operativas...</div>;
  }

  const { stats, upcomingAppointments, recentLogs } = data || {};

  return (
    <div className="space-y-8">
      
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-3xl text-[#FFFFFF] mb-1">Panel de Control</h1>
        <p className="text-xs text-[#888888]">
          Resumen general de actividad y estado de reservaciones
        </p>
      </div>

      {/* 4 KPIs Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-[#161616] border border-[#2B2B2B] p-5 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#888888] uppercase tracking-wider block">Citas de Hoy</span>
            <span className="font-serif text-3xl text-[#FFFFFF] font-bold mt-1 block">
              {stats?.todayCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-[#1F1F1F] border border-[#333333] flex items-center justify-center text-[#C6A15B]">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2B2B2B] p-5 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#C6A15B] uppercase tracking-wider block">Por Confirmar</span>
            <span className="font-serif text-3xl text-[#C6A15B] font-bold mt-1 block">
              {stats?.pendingCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-[#C6A15B]/10 border border-[#C6A15B]/30 flex items-center justify-center text-[#C6A15B]">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2B2B2B] p-5 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-green-400 uppercase tracking-wider block">Confirmadas</span>
            <span className="font-serif text-3xl text-[#FFFFFF] font-bold mt-1 block">
              {stats?.confirmedCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-green-950/30 border border-green-500/30 flex items-center justify-center text-green-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#161616] border border-[#2B2B2B] p-5 rounded-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] text-red-400 uppercase tracking-wider block">Canceladas</span>
            <span className="font-serif text-3xl text-[#888888] font-bold mt-1 block">
              {stats?.cancelledCount || 0}
            </span>
          </div>
          <div className="w-10 h-10 rounded-sm bg-red-950/20 border border-red-500/20 flex items-center justify-center text-red-400">
            <XCircle className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Grid de 2 Columnas: Próximas Citas y Logs de Auditoría */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabla de Próximas Citas */}
        <div className="lg:col-span-2 bg-[#161616] border border-[#2B2B2B] rounded-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-lg text-[#FFFFFF]">Próximas Reservaciones</h2>
            <Link
              to="/admin/citas"
              className="text-xs text-[#C6A15B] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Ver todas</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingAppointments?.length === 0 ? (
            <p className="text-xs text-[#888888] py-8 text-center">No hay citas próximas programadas.</p>
          ) : (
            <div className="divide-y divide-[#262626]">
              {upcomingAppointments?.map((app: any) => {
                const dateObj = new Date(app.appointmentDate);
                const timeStr = `${dateObj.getUTCHours().toString().padStart(2, '0')}:${dateObj.getUTCMinutes().toString().padStart(2, '0')}`;
                const dateStr = dateObj.toISOString().split('T')[0];

                return (
                  <div key={app.id} className="py-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#C6A15B] font-semibold">{app.folio}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            app.status === 'CONFIRMED'
                              ? 'bg-green-950/50 text-green-400 border border-green-500/30'
                              : 'bg-yellow-950/50 text-yellow-400 border border-yellow-500/30'
                          }`}
                        >
                          {app.status === 'CONFIRMED' ? 'Confirmada' : 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-[#FFFFFF] font-medium mt-1">{app.customer?.name}</p>
                      <p className="text-[#888888] text-[11px]">{app.service?.name}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-[#FFFFFF] font-mono block">{timeStr} hrs</span>
                      <span className="text-[#888888] text-[11px] block">{dateStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registro de Actividad y Auditoría */}
        <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-6">
          <h2 className="font-serif text-lg text-[#FFFFFF] mb-4">Registro de Actividad</h2>
          <div className="space-y-4">
            {recentLogs?.map((log: any) => (
              <div key={log.id} className="text-xs border-b border-[#242424] pb-3">
                <div className="flex items-center justify-between text-[#888888] text-[10px]">
                  <span>{log.user?.name || 'Sistema'}</span>
                  <span>{new Date(log.createdAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-[#C6A15B] font-mono text-[11px] mt-0.5">{log.action}</p>
                {log.details && (
                  <p className="text-[#F5F1E9]/75 text-[11px] mt-0.5">{log.details}</p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
