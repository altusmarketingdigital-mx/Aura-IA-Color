import React, { useEffect, useState } from 'react';
import { Palette, Edit, Plus, CheckCircle2, Clock, DollarSign, X } from 'lucide-react';
import api from '../../services/api';

export const AdminServices: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingService, setEditingService] = useState<any>(null);
  const [price, setPrice] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [description, setDescription] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/services');
      if (res.data.success) {
        setCategories(res.data.categories);
      }
    } catch (e) {
      console.error('Error al cargar servicios admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEditClick = (service: any) => {
    setEditingService(service);
    setPrice(service.price);
    setDuration(service.durationMinutes);
    setDescription(service.description);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/admin/services/${editingService.id}`, {
        price: Number(price),
        durationMinutes: Number(duration),
        description,
      });
      if (res.data.success) {
        setEditingService(null);
        fetchServices();
      }
    } catch (e) {
      console.error('Error al guardar servicio:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-3xl text-[#FFFFFF] mb-1">Catálogo de Servicios</h1>
        <p className="text-xs text-[#888888]">
          Administra las tarifas oficiales, tiempos de duración y descripciones de cada técnica.
        </p>
      </div>

      {loading ? (
        <div className="text-xs text-[#888888] py-12 text-center">Cargando catálogo...</div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-6">
              <h2 className="font-serif text-xl text-[#FFFFFF] mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-[#C6A15B]" />
                <span>{cat.name}</span>
              </h2>

              <div className="divide-y divide-[#262626]">
                {cat.services?.map((s: any) => (
                  <div key={s.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                    <div className="max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#FFFFFF] text-sm">{s.name}</span>
                        {s.isFeatured && (
                          <span className="text-[10px] bg-[#C6A15B]/20 text-[#C6A15B] px-1.5 py-0.5 rounded font-bold">
                            Destacado
                          </span>
                        )}
                      </div>
                      <p className="text-[#888888] mt-1 font-light">{s.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-[#C6A15B] font-mono">
                        <span>${s.price.toLocaleString('es-MX')} MXN</span>
                        <span>•</span>
                        <span>{s.durationMinutes} minutos</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEditClick(s)}
                      className="px-3 py-1.5 bg-[#252525] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#111111] rounded text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar Tarifa</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición de Servicio */}
      {editingService && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-md w-full rounded-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <h3 className="font-serif text-lg text-[#FFFFFF]">Editar Servicio</h3>
              <button onClick={() => setEditingService(null)} className="text-[#888888] hover:text-[#FFFFFF]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#C6A15B] font-semibold">{editingService.name}</p>

            <form onSubmit={handleSaveService} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#888888] mb-1">Precio Oficial ($ MXN)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Duración del Servicio (Minutos)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingService(null)}
                  className="px-4 py-2 bg-[#262626] text-[#888888] rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#C6A15B] text-[#111111] font-bold rounded text-xs uppercase"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
