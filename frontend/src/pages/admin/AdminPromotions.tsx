import React, { useEffect, useState } from 'react';
import { Tag, Edit, CheckCircle2, AlertCircle, X } from 'lucide-react';
import api from '../../services/api';

export const AdminPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [editingPromo, setEditingPromo] = useState<any>(null);
  const [title, setTitle] = useState<string>('');
  const [discountText, setDiscountText] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [conditions, setConditions] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/promotions');
      if (res.data.success) {
        setPromotions(res.data.promotions);
      }
    } catch (e) {
      console.error('Error al cargar promociones admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromos();
  }, []);

  const handleEditClick = (p: any) => {
    setEditingPromo(p);
    setTitle(p.title);
    setDiscountText(p.discountText || '');
    setDescription(p.description);
    setConditions(p.conditions || '');
    setIsActive(p.isActive);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.put(`/admin/promotions/${editingPromo.id}`, {
        title,
        discountText,
        description,
        conditions,
        isActive,
      });
      if (res.data.success) {
        setEditingPromo(null);
        fetchPromos();
      }
    } catch (e) {
      console.error('Error al guardar promoción:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div>
        <h1 className="font-serif text-3xl text-[#FFFFFF] mb-1">Administración de Promociones</h1>
        <p className="text-xs text-[#888888]">
          Gestiona las ofertas, textos promocionales y el programa de 50% de descuento en la 5ta visita.
        </p>
      </div>

      {loading ? (
        <div className="text-xs text-[#888888] py-12 text-center">Cargando promociones...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promotions.map((p) => (
            <div key={p.id} className="bg-[#161616] border border-[#2B2B2B] p-6 rounded-sm space-y-4">
              <div className="flex justify-between items-start">
                <span className="px-2.5 py-1 bg-[#C6A15B]/20 text-[#C6A15B] rounded text-xs font-bold font-mono">
                  {p.discountText || 'PROMO'}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                    p.isActive ? 'bg-green-950/40 text-green-400' : 'bg-red-950/40 text-red-400'
                  }`}
                >
                  {p.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#FFFFFF]">{p.title}</h3>
                <p className="text-xs text-[#888888] font-light mt-1">{p.description}</p>
                {p.conditions && (
                  <p className="text-[11px] text-[#C6A15B]/80 mt-2 italic">
                    Condiciones: {p.conditions}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-[#262626] flex justify-end">
                <button
                  onClick={() => handleEditClick(p)}
                  className="px-3 py-1.5 bg-[#242424] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#111111] rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Modificar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Edición de Promoción */}
      {editingPromo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-md w-full rounded-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <h3 className="font-serif text-lg text-[#FFFFFF]">Editar Promoción</h3>
              <button onClick={() => setEditingPromo(null)} className="text-[#888888] hover:text-[#FFFFFF]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#888888] mb-1">Título de la Promoción</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Texto Destacado (Badge)</label>
                <input
                  type="text"
                  placeholder="Ej. 50% DE DESCUENTO"
                  value={discountText}
                  onChange={(e) => setDiscountText(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
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

              <div>
                <label className="block text-[#888888] mb-1">Términos y Condiciones</label>
                <input
                  type="text"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPromo(null)}
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
