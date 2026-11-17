import React, { useEffect, useState } from 'react';
import { Search, User, Phone, Mail, Calendar, Eye, X } from 'lucide-react';
import api from '../../services/api';

export const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/customers', { params: { search } });
      if (res.data.success) {
        setCustomers(res.data.customers);
      }
    } catch (e) {
      console.error('Error al cargar clientes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-3xl text-[#FFFFFF] mb-1">Gestión de Clientes</h1>
        <p className="text-xs text-[#888888]">
          Consulta el historial de servicios, citas y datos de contacto de cada clienta.
        </p>
      </div>

      {/* Buscador */}
      <form onSubmit={handleSearch} className="max-w-md relative">
        <input
          type="text"
          placeholder="Buscar por nombre, teléfono o email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#161616] border border-[#333333] text-[#FFFFFF] pl-9 pr-3 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
        />
        <Search className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
      </form>

      {/* Tabla de Clientes */}
      <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm overflow-hidden">
        {loading ? (
          <div className="text-xs text-[#888888] py-12 text-center">Cargando clientas...</div>
        ) : customers.length === 0 ? (
          <div className="text-xs text-[#888888] py-12 text-center">No se encontraron clientes registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E1E1E] text-[#888888] uppercase tracking-wider border-b border-[#2B2B2B]">
                <tr>
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Teléfono</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Total Visitas / Citas</th>
                  <th className="py-3 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262626]">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#1B1B1B] transition-colors">
                    <td className="py-3 px-4 font-medium text-[#FFFFFF]">{c.name}</td>
                    <td className="py-3 px-4 text-[#888888]">{c.phone}</td>
                    <td className="py-3 px-4 text-[#888888]">{c.email || '—'}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-[#C6A15B]">
                        {c.appointments ? c.appointments.length : 0}
                      </span>{' '}
                      visitas
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2.5 py-1 bg-[#242424] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#111111] rounded text-[11px] font-semibold transition-colors"
                      >
                        Ver Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Historial de Cliente */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-xl w-full rounded-sm p-6 sm:p-8 space-y-6 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#2B2B2B] pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#888888]">Historial de Clienta</span>
                <h3 className="font-serif text-2xl text-[#FFFFFF] mt-1">{selectedCustomer.name}</h3>
                <p className="text-xs text-[#C6A15B] mt-0.5">Tel: {selectedCustomer.phone}</p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-[#888888] hover:text-[#FFFFFF] p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <h4 className="font-serif text-sm text-[#FFFFFF]">Citas y Formulaciones Registradas</h4>

              {selectedCustomer.appointments?.length === 0 ? (
                <p className="text-[#888888] italic">No tiene citas registradas aún.</p>
              ) : (
                <div className="space-y-3">
                  {selectedCustomer.appointments?.map((app: any) => (
                    <div key={app.id} className="p-3 bg-[#1A1A1A] border border-[#282828] rounded">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono text-[#C6A15B] font-semibold">{app.folio}</span>
                        <span className="text-[10px] text-[#888888]">{app.status}</span>
                      </div>
                      <p className="text-[#FFFFFF] font-medium">{app.service?.name}</p>
                      <p className="text-[#888888] text-[11px] mt-0.5">
                        {new Date(app.appointmentDate).toLocaleDateString('es-MX')} • ${app.service?.price} MXN
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
