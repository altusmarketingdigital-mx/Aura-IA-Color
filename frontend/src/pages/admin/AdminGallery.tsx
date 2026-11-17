import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Plus, Trash2, X } from 'lucide-react';
import api from '../../services/api';

export const AdminGallery: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('BALAYAGE');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get('/gallery');
      if (res.data.success) {
        setItems(res.data.items);
      }
    } catch (e) {
      console.error('Error al cargar galería admin:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/admin/gallery', {
        title,
        category,
        imageUrl,
      });
      if (res.data.success) {
        setShowAddModal(false);
        setTitle('');
        setImageUrl('');
        fetchGallery();
      }
    } catch (e) {
      console.error('Error al agregar a galería:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl text-[#FFFFFF] mb-1">Administración de Galería</h1>
          <p className="text-xs text-[#888888]">
            Gestiona los resultados publicados en el sitio web público.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Fotografía</span>
        </button>
      </div>

      {loading ? (
        <div className="text-xs text-[#888888] py-12 text-center">Cargando galería...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-[#161616] border border-[#2B2B2B] rounded-sm overflow-hidden">
              <div className="aspect-[4/5] relative">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 bg-[#111111]/80 text-[#C6A15B] text-[9px] uppercase px-2 py-0.5 rounded font-bold">
                  {item.category}
                </span>
              </div>
              <div className="p-3">
                <p className="font-serif text-sm text-[#FFFFFF] truncate">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Agregar Imagen */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-md w-full rounded-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#262626] pb-3">
              <h3 className="font-serif text-lg text-[#FFFFFF]">Nueva Imagen para Galería</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#888888] hover:text-[#FFFFFF]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#888888] mb-1">Título del Trabajo</label>
                <input
                  type="text"
                  placeholder="Ej. Balayage Caramelo Miel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                >
                  <option value="BALAYAGE">Balayage</option>
                  <option value="BABYLIGHTS">Babylights</option>
                  <option value="COLORACION">Coloración</option>
                  <option value="TRANSFORMACIONES">Transformaciones</option>
                </select>
              </div>

              <div>
                <label className="block text-[#888888] mb-1">URL de la Imagen</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded text-xs focus:outline-none focus:border-[#C6A15B]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#262626] text-[#888888] rounded text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#C6A15B] text-[#111111] font-bold rounded text-xs uppercase"
                >
                  {saving ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
