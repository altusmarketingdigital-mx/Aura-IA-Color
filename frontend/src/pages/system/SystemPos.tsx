import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Award,
  CheckCircle2,
  Edit,
  ExternalLink,
  Gift,
  Minus,
  Package,
  Plus,
  QrCode,
  Receipt,
  Search,
  ShoppingBag,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import api from '../../services/api';
import {
  CartLine,
  CatalogItem,
  PosClient,
  PosTransactionRecord,
  RewardItem,
} from '../../types/pos';
import { QrScannerModal } from '../../components/pos/QrScannerModal';

type SystemTab = 'pos' | 'clientes' | 'catalogo';

const generateUuidV4 = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const computeDiscountPreview = (subtotal: number, reward: RewardItem | null): number => {
  if (!reward || subtotal <= 0) return 0;
  if (reward.discountType === 'percentage') {
    const pct = Math.min(100, Math.max(0, reward.discountValue));
    return Math.round(subtotal * (pct / 100) * 100) / 100;
  }
  if (reward.discountType === 'fixed' || reward.discountType === 'free_service') {
    const val = reward.discountValue > 0 ? reward.discountValue : subtotal;
    return Math.min(subtotal, Math.round(val * 100) / 100);
  }
  return 0;
};

export const SystemPos: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SystemTab>('pos');

  // Estado compartido de datos
  const [clients, setClients] = useState<PosClient[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<PosTransactionRecord[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

  // Estado del POS
  const [clientSearch, setClientSearch] = useState<string>('');
  const [selectedClient, setSelectedClient] = useState<PosClient | null>(null);
  const [availableClientRewards, setAvailableClientRewards] = useState<RewardItem[]>([]);
  const [selectedRewardId, setSelectedRewardId] = useState<string>('');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [catalogCategoryFilter, setCatalogCategoryFilter] = useState<'ALL' | 'Servicio' | 'Producto'>('ALL');
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [idempotencyKey, setIdempotencyKey] = useState<string>(() => generateUuidV4());
  const [submittingSale, setSubmittingSale] = useState<boolean>(false);
  const [posError, setPosError] = useState<string>('');
  const [saleReceipt, setSaleReceipt] = useState<{
    transaction: PosTransactionRecord;
    client: PosClient;
  } | null>(null);

  // Lector QR
  const [qrModalOpen, setQrModalOpen] = useState<boolean>(false);

  // Modal Nuevo Cliente
  const [newClientModalOpen, setNewClientModalOpen] = useState<boolean>(false);
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  const [savingClient, setSavingClient] = useState<boolean>(false);
  const [clientFormError, setClientFormError] = useState<string>('');

  // Directorio de clientes (Tab 2)
  const [directorySearch, setDirectorySearch] = useState<string>('');

  // Administración de Catálogo y Recompensas (Tab 3)
  const [editingCatalogItem, setEditingCatalogItem] = useState<Partial<CatalogItem> | null>(null);
  const [savingCatalogItem, setSavingCatalogItem] = useState<boolean>(false);
  const [editingReward, setEditingReward] = useState<Partial<RewardItem> | null>(null);
  const [savingReward, setSavingReward] = useState<boolean>(false);
  const [adminFormError, setAdminFormError] = useState<string>('');

  const loadSystemData = useCallback(async () => {
    setLoadingInitial(true);
    try {
      const [clientsRes, catalogRes, rewardsRes, txRes] = await Promise.all([
        api.get('/system/clients'),
        api.get('/system/catalog', { params: { includeInactive: 'true' } }),
        api.get('/system/rewards', { params: { includeInactive: 'true' } }),
        api.get('/system/pos/transactions', { params: { limit: 10 } }),
      ]);

      if (clientsRes.data.success) setClients(clientsRes.data.clients);
      if (catalogRes.data.success) setCatalog(catalogRes.data.items);
      if (rewardsRes.data.success) setRewards(rewardsRes.data.rewards);
      if (txRes.data.success) setRecentTransactions(txRes.data.transactions);
    } catch (e) {
      console.error('Error al cargar datos del módulo /system:', e);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadSystemData();
  }, [loadSystemData]);

  const computeEligibleRewards = useCallback(
    (client: PosClient | null) => {
      if (!client) return [];
      return rewards.filter((r) => r.active && client.currentPoints >= r.requiredPoints);
    },
    [rewards]
  );

  const selectClientForPos = (client: PosClient, customAvailable?: RewardItem[]) => {
    setSelectedClient(client);
    setAvailableClientRewards(customAvailable ?? computeEligibleRewards(client));
    setSelectedRewardId('');
    setPosError('');
    setClientSearch('');
  };

  // Escaneo QR
  const handleQrScanSuccess = async (token: string) => {
    setQrModalOpen(false);
    setPosError('');
    try {
      const res = await api.get(`/system/clients/qr/${encodeURIComponent(token)}`);
      if (res.data.success) {
        selectClientForPos(res.data.client, res.data.availableRewards);
        setActiveTab('pos');
      }
    } catch (err: any) {
      setPosError(err.response?.data?.error || `No se encontró cliente para el código QR ${token}.`);
    }
  };

  // Crear cliente rápido
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingClient(true);
    setClientFormError('');
    try {
      const res = await api.post('/system/clients', {
        name: newClientName.trim(),
        phone: newClientPhone.trim(),
        email: newClientEmail.trim(),
      });
      if (res.data.success && res.data.client) {
        setClients((prev) => [res.data.client, ...prev]);
        selectClientForPos(res.data.client, []);
        setNewClientModalOpen(false);
        setNewClientName('');
        setNewClientPhone('');
        setNewClientEmail('');
      }
    } catch (err: any) {
      setClientFormError(err.response?.data?.error || 'No se pudo registrar el cliente.');
    } finally {
      setSavingClient(false);
    }
  };

  // Carrito POS
  const addToCart = (item: CatalogItem) => {
    setPosError('');
    setCart((prev) => {
      const existing = prev.find((l) => l.item.id === item.id);
      if (existing) {
        return prev.map((l) => (l.item.id === item.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.item.id === itemId ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0)
    );
  };

  const resetOrder = () => {
    setCart([]);
    setSelectedRewardId('');
    setSaleNotes('');
    setIdempotencyKey(generateUuidV4());
    setPosError('');
  };

  // Cálculos en tiempo real del carrito
  const subtotal = useMemo(
    () =>
      Math.round(
        cart.reduce((acc, line) => acc + line.item.price * line.quantity, 0) * 100
      ) / 100,
    [cart]
  );

  const pointsToEarn = useMemo(
    () => cart.reduce((acc, line) => acc + line.item.pointsAwarded * line.quantity, 0),
    [cart]
  );

  const selectedReward = useMemo(
    () => availableClientRewards.find((r) => r.id === selectedRewardId) || null,
    [availableClientRewards, selectedRewardId]
  );

  const discountPreview = useMemo(
    () => computeDiscountPreview(subtotal, selectedReward),
    [subtotal, selectedReward]
  );

  const totalToPay = Math.max(0, Math.round((subtotal - discountPreview) * 100) / 100);

  // Procesar cobro atómico con idempotency_key
  const handleCheckout = async () => {
    if (!selectedClient) {
      setPosError('Selecciona o escanea un cliente antes de registrar la venta.');
      return;
    }
    if (cart.length === 0) {
      setPosError('Agrega al menos un servicio o producto al carrito.');
      return;
    }
    if (submittingSale) return;

    setSubmittingSale(true);
    setPosError('');

    try {
      const res = await api.post('/system/pos/transactions', {
        idempotencyKey,
        clientId: selectedClient.id,
        items: cart.map((line) => ({ id: line.item.id, quantity: line.quantity })),
        rewardId: selectedRewardId || null,
        notes: saleNotes.trim(),
      });

      if (res.data.success) {
        const updatedClient: PosClient = res.data.client;
        setSaleReceipt({
          transaction: res.data.transaction,
          client: updatedClient,
        });
        // Actualizar estado en memoria y generar nueva clave de idempotencia
        setClients((prev) =>
          prev.map((c) => (c.id === updatedClient.id ? { ...c, ...updatedClient } : c))
        );
        setSelectedClient(updatedClient);
        setAvailableClientRewards(res.data.availableRewards || []);
        setRecentTransactions((prev) => [
          {
            ...res.data.transaction,
            client: updatedClient,
          },
          ...prev.slice(0, 9),
        ]);
        resetOrder();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        'No se pudo procesar el cobro. Verifica tu conexión antes de reintentar.';
      setPosError(msg);
      // Si fue un duplicado de idempotencia ya procesado, rotar clave para evitar bucle
      if (err.response?.status === 409 && err.response?.data?.duplicate) {
        setIdempotencyKey(generateUuidV4());
      }
    } finally {
      setSubmittingSale(false);
    }
  };

  // Guardar ítem de catálogo POS
  const handleSaveCatalogItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalogItem) return;
    setSavingCatalogItem(true);
    setAdminFormError('');
    try {
      const payload = {
        name: String(editingCatalogItem.name || '').trim(),
        category: editingCatalogItem.category || 'Servicio',
        price: Number(editingCatalogItem.price || 0),
        pointsAwarded: Number(editingCatalogItem.pointsAwarded || 0),
        active: editingCatalogItem.active ?? true,
      };
      if (editingCatalogItem.id) {
        await api.put(`/system/catalog/${editingCatalogItem.id}`, payload);
      } else {
        await api.post('/system/catalog', payload);
      }
      setEditingCatalogItem(null);
      loadSystemData();
    } catch (err: any) {
      setAdminFormError(err.response?.data?.error || 'Error al guardar en catálogo.');
    } finally {
      setSavingCatalogItem(false);
    }
  };

  // Guardar recompensa
  const handleSaveReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;
    setSavingReward(true);
    setAdminFormError('');
    try {
      const payload = {
        title: String(editingReward.title || '').trim(),
        description: String(editingReward.description || '').trim(),
        requiredPoints: Number(editingReward.requiredPoints || 100),
        discountType: editingReward.discountType || 'fixed',
        discountValue: Number(editingReward.discountValue || 0),
        active: editingReward.active ?? true,
      };
      if (editingReward.id) {
        await api.put(`/system/rewards/${editingReward.id}`, payload);
      } else {
        await api.post('/system/rewards', payload);
      }
      setEditingReward(null);
      loadSystemData();
    } catch (err: any) {
      setAdminFormError(err.response?.data?.error || 'Error al guardar recompensa.');
    } finally {
      setSavingReward(false);
    }
  };

  // Filtros de búsqueda
  const quickSearchClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return [];
    return clients
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.qrToken.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [clients, clientSearch]);

  const filteredCatalog = useMemo(() => {
    const q = catalogSearch.trim().toLowerCase();
    return catalog.filter((item) => {
      if (!item.active) return false;
      if (catalogCategoryFilter !== 'ALL' && item.category !== catalogCategoryFilter) return false;
      if (q && !item.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [catalog, catalogCategoryFilter, catalogSearch]);

  const filteredDirectory = useMemo(() => {
    const q = directorySearch.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.qrToken.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, directorySearch]);

  return (
    <div className="space-y-6">
      {/* Cabecera y Navegación por Pestañas de /system */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-[#262626] pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#C6A15B] font-semibold block mb-1">
            Módulo Interno /system • Caja & Lealtad QR
          </span>
          <h1 className="font-serif text-3xl text-[#FFFFFF]">
            Punto de Venta y Programa de Lealtad
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all ${
              activeTab === 'pos'
                ? 'bg-[#C6A15B] text-[#111111] font-bold'
                : 'bg-[#161616] text-[#888888] hover:text-[#FFFFFF] border border-[#2B2B2B]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Caja / POS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('clientes')}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all ${
              activeTab === 'clientes'
                ? 'bg-[#C6A15B] text-[#111111] font-bold'
                : 'bg-[#161616] text-[#888888] hover:text-[#FFFFFF] border border-[#2B2B2B]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes ({clients.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalogo')}
            className={`px-4 py-2.5 text-xs uppercase tracking-wider rounded-sm flex items-center gap-2 transition-all ${
              activeTab === 'catalogo'
                ? 'bg-[#C6A15B] text-[#111111] font-bold'
                : 'bg-[#161616] text-[#888888] hover:text-[#FFFFFF] border border-[#2B2B2B]'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>Catálogo y Recompensas</span>
          </button>
        </div>
      </div>

      {loadingInitial ? (
        <div className="text-xs text-[#888888] py-16 text-center">
          Cargando terminal POS y catálogo de lealtad...
        </div>
      ) : (
        <>
          {/* ================================================================ */}
          {/* PESTAÑA 1: TERMINAL DE PUNTO DE VENTA (POS) + LECTOR QR          */}
          {/* ================================================================ */}
          {activeTab === 'pos' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Columna Izquierda (7 cols): Cliente + Catálogo */}
              <div className="xl:col-span-7 space-y-6">
                {/* 1. Identificación rápida de cliente + Botón Escanear QR */}
                <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-5 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-serif text-lg text-[#FFFFFF] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C6A15B]" />
                      <span>1. Identificar Cliente</span>
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQrModalOpen(true)}
                        className="px-3.5 py-2 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Escanear QR</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClientFormError('');
                          setNewClientModalOpen(true);
                        }}
                        className="px-3 py-2 bg-[#222222] hover:bg-[#2B2B2B] border border-[#333333] text-[#F5F1E9] text-xs font-semibold rounded-sm flex items-center gap-1.5 transition-colors"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#C6A15B]" />
                        <span>Nuevo</span>
                      </button>
                    </div>
                  </div>

                  {/* Buscador por nombre o teléfono */}
                  <div className="relative">
                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                      placeholder="Buscar por nombre, teléfono o token QR..."
                      className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] pl-9 pr-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                    />
                    <Search className="w-4 h-4 text-[#666666] absolute left-3 top-3" />

                    {quickSearchClients.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-[#1B1B1B] border border-[#C6A15B]/50 rounded-sm shadow-2xl divide-y divide-[#262626]">
                        {quickSearchClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectClientForPos(c)}
                            className="w-full px-4 py-2.5 text-left hover:bg-[#242424] flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-semibold text-[#FFFFFF] block">{c.name}</span>
                              <span className="text-[11px] text-[#888888]">
                                {c.phone} • {c.qrToken}
                              </span>
                            </div>
                            <span className="font-mono text-[#C6A15B] font-bold">
                              {c.currentPoints} pts
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Perfil del Cliente Seleccionado */}
                  {selectedClient ? (
                    <div className="bg-[#121212] border border-[#C6A15B]/50 rounded-sm p-4 space-y-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-lg text-[#FFFFFF]">
                              {selectedClient.name}
                            </span>
                            <span className="font-mono text-[10px] px-2 py-0.5 bg-[#C6A15B]/15 text-[#C6A15B] rounded">
                              {selectedClient.qrToken}
                            </span>
                          </div>
                          <p className="text-xs text-[#888888] mt-0.5">
                            Tel: {selectedClient.phone} •{' '}
                            <Link
                              to={`/system/clientes/${selectedClient.id}`}
                              className="text-[#C6A15B] hover:underline"
                            >
                              Ver historial completo
                            </Link>
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-[#888888] block">Puntos</span>
                            <span className="font-serif text-xl text-[#C6A15B] font-bold">
                              {selectedClient.currentPoints.toLocaleString('es-MX')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] uppercase text-[#888888] block">Visitas</span>
                            <span className="font-serif text-xl text-[#FFFFFF] font-bold">
                              {selectedClient.totalVisits}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClient(null);
                              setAvailableClientRewards([]);
                              setSelectedRewardId('');
                            }}
                            className="p-1 text-[#777777] hover:text-[#FFFFFF]"
                            title="Quitar cliente"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* ALERTA VISUAL DE RECOMPENSAS DESBLOQUEADAS */}
                      {availableClientRewards.length > 0 && (
                        <div className="bg-emerald-950/35 border border-emerald-500/50 rounded-sm p-3.5 space-y-2">
                          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span>
                              ¡Cliente elegible para {availableClientRewards.length} recompensa(s) activa(s)!
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {availableClientRewards.map((reward) => {
                              const active = selectedRewardId === reward.id;
                              return (
                                <button
                                  key={reward.id}
                                  type="button"
                                  onClick={() =>
                                    setSelectedRewardId(active ? '' : reward.id)
                                  }
                                  className={`px-3 py-1.5 rounded-sm text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                                    active
                                      ? 'bg-emerald-500 text-[#111111]'
                                      : 'bg-[#161616] border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                                  }`}
                                >
                                  <Gift className="w-3.5 h-3.5" />
                                  <span>
                                    {active ? 'Aplicada: ' : 'Canjear: '}
                                    {reward.title} (-{reward.requiredPoints} pts)
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-[#777777] border border-dashed border-[#2A2A2A] rounded-sm p-4 text-center">
                      Busca un cliente por nombre/teléfono o escanea su Tarjeta QR para iniciar el cobro.
                    </div>
                  )}
                </div>

                {/* 2. Catálogo rápido de Servicios y Productos */}
                <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <h2 className="font-serif text-lg text-[#FFFFFF] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#C6A15B]" />
                      <span>2. Agregar Servicios / Productos</span>
                    </h2>

                    <div className="flex flex-wrap gap-1.5">
                      {(['ALL', 'Servicio', 'Producto'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCatalogCategoryFilter(cat)}
                          className={`px-3 py-1 text-[11px] rounded-sm transition-colors ${
                            catalogCategoryFilter === cat
                              ? 'bg-[#C6A15B] text-[#111111] font-bold'
                              : 'bg-[#111111] text-[#888888] border border-[#2D2D2D] hover:text-[#FFFFFF]'
                          }`}
                        >
                          {cat === 'ALL' ? 'Todos' : `${cat}s`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Filtrar servicio o producto..."
                      className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] pl-9 pr-4 py-2 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                    />
                    <Search className="w-3.5 h-3.5 text-[#666666] absolute left-3 top-2.5" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {filteredCatalog.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => addToCart(item)}
                        className="p-3.5 bg-[#121212] hover:bg-[#1B1B1B] border border-[#262626] hover:border-[#C6A15B]/60 rounded-sm text-left transition-all flex items-center justify-between gap-3 group"
                      >
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#C6A15B] font-mono block">
                            {item.category}
                          </span>
                          <span className="text-xs font-semibold text-[#FFFFFF] group-hover:text-[#DFBF7E] block mt-0.5">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-emerald-400 font-mono block mt-1">
                            +{item.pointsAwarded} pts
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-serif text-base text-[#FFFFFF] font-bold block">
                            ${item.price.toLocaleString('es-MX')}
                          </span>
                          <span className="text-[10px] text-[#C6A15B] uppercase font-semibold">
                            + Agregar
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Columna Derecha (5 cols): Carrito, Descuentos y Cobro Atómico */}
              <div className="xl:col-span-5 space-y-6">
                <div className="bg-[#161616] border border-[#C6A15B]/40 rounded-sm p-5 sm:p-6 space-y-5 sticky top-6">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                    <h2 className="font-serif text-xl text-[#FFFFFF] flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-[#C6A15B]" />
                      <span>Orden Actual de Caja</span>
                    </h2>
                    {cart.length > 0 && (
                      <button
                        type="button"
                        onClick={resetOrder}
                        className="text-[11px] text-[#888888] hover:text-red-400 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Limpiar</span>
                      </button>
                    )}
                  </div>

                  {posError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-sm text-red-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{posError}</span>
                    </div>
                  )}

                  {/* Ítems del carrito */}
                  {cart.length === 0 ? (
                    <div className="py-10 text-center text-xs text-[#777777] border border-dashed border-[#262626] rounded-sm">
                      El carrito está vacío. Selecciona servicios o productos del catálogo.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#242424] max-h-64 overflow-y-auto pr-1">
                      {cart.map((line) => (
                        <div key={line.item.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                          <div className="flex-1 min-w-0">
                            <p className="text-[#FFFFFF] font-medium truncate">{line.item.name}</p>
                            <p className="text-[11px] text-[#888888]">
                              ${line.item.price.toLocaleString('es-MX')} c/u • +{line.item.pointsAwarded * line.quantity} pts
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(line.item.id, -1)}
                              className="w-6 h-6 bg-[#222222] hover:bg-[#333333] text-[#FFFFFF] rounded-sm flex items-center justify-center"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-mono text-[#FFFFFF]">
                              {line.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(line.item.id, 1)}
                              className="w-6 h-6 bg-[#222222] hover:bg-[#333333] text-[#FFFFFF] rounded-sm flex items-center justify-center"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="font-mono font-semibold text-[#FFFFFF] w-20 text-right">
                            ${(line.item.price * line.quantity).toLocaleString('es-MX')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selector de Recompensa a Canjear */}
                  {selectedClient && availableClientRewards.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#262626]">
                      <label className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block">
                        Aplicar Recompensa (Opcional)
                      </label>
                      <select
                        value={selectedRewardId}
                        onChange={(e) => setSelectedRewardId(e.target.value)}
                        className="w-full bg-[#111111] border border-emerald-500/40 text-[#FFFFFF] px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-emerald-400"
                      >
                        <option value="">-- No canjear recompensa en esta visita --</option>
                        {availableClientRewards.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.title} (-{r.requiredPoints} pts)
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Notas de la venta */}
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-[#888888] block mb-1">
                      Notas de caja / Fórmula aplicada (Opcional)
                    </label>
                    <input
                      type="text"
                      value={saleNotes}
                      onChange={(e) => setSaleNotes(e.target.value)}
                      placeholder="Ej. Matiz beige 9.13 + tratamiento post-color"
                      className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                    />
                  </div>

                  {/* Resumen de Totales y Puntos */}
                  <div className="bg-[#111111] border border-[#262626] rounded-sm p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-[#888888]">
                      <span>Subtotal:</span>
                      <span>${subtotal.toLocaleString('es-MX')} MXN</span>
                    </div>
                    {discountPreview > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Descuento recompensa:</span>
                        <span>-${discountPreview.toLocaleString('es-MX')} MXN</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-[#242424]">
                      <span className="text-[#FFFFFF] font-semibold uppercase tracking-wider">
                        Total a Cobrar:
                      </span>
                      <span className="font-serif text-2xl text-[#C6A15B] font-bold">
                        ${totalToPay.toLocaleString('es-MX')} MXN
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] pt-1 text-[#A3A3A3]">
                      <span>Puntos que acumula esta venta:</span>
                      <span className="font-mono text-emerald-400 font-bold">+{pointsToEarn} pts</span>
                    </div>
                    {selectedReward && (
                      <div className="flex justify-between text-[11px] text-amber-400">
                        <span>Puntos a descontar por canje:</span>
                        <span className="font-mono font-bold">-{selectedReward.requiredPoints} pts</span>
                      </div>
                    )}
                  </div>

                  {/* Botón Cobrar / Registrar con protección anti-doble-clic */}
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={submittingSale || !selectedClient || cart.length === 0}
                    className="w-full py-3.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-[0.2em] rounded-sm transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {submittingSale ? 'Procesando cobro...' : 'Cobrar / Registrar Venta'}
                  </button>

                  <p className="text-[10px] text-[#555555] font-mono text-center">
                    Idempotency Key: {idempotencyKey}
                  </p>
                </div>

                {/* Últimas operaciones en caja */}
                {recentTransactions.length > 0 && (
                  <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-5 space-y-3">
                    <h3 className="font-serif text-base text-[#FFFFFF]">Últimos Cobros</h3>
                    <div className="divide-y divide-[#242424] text-xs">
                      {recentTransactions.slice(0, 5).map((tx: any) => (
                        <div key={tx.id} className="py-2.5 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-[#FFFFFF] font-medium">
                              {tx.client?.name || 'Cliente'}
                            </p>
                            <p className="text-[10px] text-[#777777]">
                              {new Date(tx.createdAt).toLocaleString('es-MX', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}{' '}
                              • +{tx.pointsEarned} pts
                            </p>
                          </div>
                          <span className="font-mono text-[#C6A15B] font-bold">
                            ${tx.totalPaid.toLocaleString('es-MX')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* PESTAÑA 2: DIRECTORIO DE CLIENTES E HISTORIAL                    */}
          {/* ================================================================ */}
          {activeTab === 'clientes' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative max-w-md w-full">
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Buscar cliente por nombre, teléfono o token QR..."
                    className="w-full bg-[#161616] border border-[#333333] text-[#FFFFFF] pl-9 pr-4 py-2.5 rounded-sm text-xs focus:outline-none focus:border-[#C6A15B]"
                  />
                  <Search className="w-4 h-4 text-[#666666] absolute left-3 top-3" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setClientFormError('');
                    setNewClientModalOpen(true);
                  }}
                  className="px-4 py-2.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase tracking-wider rounded-sm flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrar Cliente</span>
                </button>
              </div>

              <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm overflow-hidden">
                {filteredDirectory.length === 0 ? (
                  <div className="text-xs text-[#888888] py-12 text-center">
                    No se encontraron clientes registrados.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#1E1E1E] text-[#888888] uppercase tracking-wider border-b border-[#2B2B2B]">
                        <tr>
                          <th className="py-3 px-4">Cliente</th>
                          <th className="py-3 px-4">Teléfono</th>
                          <th className="py-3 px-4">Token QR</th>
                          <th className="py-3 px-4">Puntos</th>
                          <th className="py-3 px-4">Visitas</th>
                          <th className="py-3 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242424]">
                        {filteredDirectory.map((c) => (
                          <tr key={c.id} className="hover:bg-[#1B1B1B] transition-colors">
                            <td className="py-3 px-4">
                              <span className="font-medium text-[#FFFFFF] block">{c.name}</span>
                              {c.email && (
                                <span className="text-[11px] text-[#777777]">{c.email}</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-[#888888]">{c.phone}</td>
                            <td className="py-3 px-4 font-mono text-[11px] text-[#C6A15B]">
                              {c.qrToken}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                              {c.currentPoints.toLocaleString('es-MX')} pts
                            </td>
                            <td className="py-3 px-4 text-[#FFFFFF]">{c.totalVisits}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    selectClientForPos(c);
                                    setActiveTab('pos');
                                  }}
                                  className="px-2.5 py-1 bg-[#252525] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#111111] rounded text-[11px] font-semibold transition-colors"
                                >
                                  Cobrar
                                </button>
                                <Link
                                  to={`/system/clientes/${c.id}`}
                                  className="px-2.5 py-1 bg-[#111111] border border-[#333333] hover:border-[#C6A15B] text-[#F5F1E9] rounded text-[11px] font-semibold transition-colors"
                                >
                                  Historial
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* PESTAÑA 3: CONFIGURACIÓN DE CATÁLOGO Y RECOMPENSAS               */}
          {/* ================================================================ */}
          {activeTab === 'catalogo' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Catálogo POS (services_catalog) */}
              <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <div>
                    <h2 className="font-serif text-xl text-[#FFFFFF]">
                      Catálogo de Servicios y Productos
                    </h2>
                    <p className="text-[11px] text-[#888888]">
                      Configura precios y puntos otorgados en caja.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminFormError('');
                      setEditingCatalogItem({
                        name: '',
                        category: 'Servicio',
                        price: 0,
                        pointsAwarded: 0,
                        active: true,
                      });
                    }}
                    className="px-3 py-2 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase rounded-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nuevo</span>
                  </button>
                </div>

                <div className="divide-y divide-[#242424] text-xs">
                  {catalog.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#FFFFFF]">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#242424] text-[#C6A15B]">
                            {item.category}
                          </span>
                          {!item.active && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">
                              Inactivo
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#888888] mt-0.5 font-mono">
                          ${item.price.toLocaleString('es-MX')} MXN • +{item.pointsAwarded} pts
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminFormError('');
                          setEditingCatalogItem(item);
                        }}
                        className="p-2 bg-[#222222] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#111111] rounded-sm transition-colors"
                        title="Editar ítem"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catálogo de Recompensas (rewards_catalog) */}
              <div className="bg-[#161616] border border-[#2B2B2B] rounded-sm p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#262626] pb-3">
                  <div>
                    <h2 className="font-serif text-xl text-[#FFFFFF]">Reglas de Recompensas</h2>
                    <p className="text-[11px] text-[#888888]">
                      Define los puntos necesarios y el beneficio en caja.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAdminFormError('');
                      setEditingReward({
                        title: '',
                        description: '',
                        requiredPoints: 200,
                        discountType: 'fixed',
                        discountValue: 200,
                        active: true,
                      });
                    }}
                    className="px-3 py-2 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase rounded-sm flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nueva</span>
                  </button>
                </div>

                <div className="divide-y divide-[#242424] text-xs">
                  {rewards.map((r) => (
                    <div key={r.id} className="py-3 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#FFFFFF]">{r.title}</span>
                          {!r.active && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-400">
                              Inactiva
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#888888] mt-0.5">{r.description}</p>
                        <p className="text-[11px] text-[#C6A15B] font-mono mt-1">
                          Requiere {r.requiredPoints} pts •{' '}
                          {r.discountType === 'percentage'
                            ? `${r.discountValue}% descuento`
                            : r.discountType === 'fixed'
                            ? `$${r.discountValue} MXN descuento`
                            : `Servicio cortesía (hasta $${r.discountValue} MXN)`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setAdminFormError('');
                          setEditingReward(r);
                        }}
                        className="p-2 bg-[#222222] hover:bg-[#C6A15B] text-[#C6A15B] hover:text-[#111111] rounded-sm transition-colors shrink-0"
                        title="Editar recompensa"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================================================================ */}
      {/* MODALES AUXILIARES                                               */}
      {/* ================================================================ */}

      {/* Escáner QR */}
      <QrScannerModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        onScanSuccess={handleQrScanSuccess}
      />

      {/* Comprobante de Venta Exitosa */}
      {saleReceipt && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#C6A15B]/60 max-w-md w-full rounded-sm p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>

            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C6A15B] font-semibold">
                Venta y Lealtad Sincronizadas
              </span>
              <h3 className="font-serif text-2xl text-[#FFFFFF] mt-1">¡Cobro Registrado!</h3>
              <p className="text-xs text-[#888888] mt-1">
                {saleReceipt.client.name} • Saldo actualizado:{' '}
                <strong className="text-[#C6A15B]">
                  {saleReceipt.client.currentPoints.toLocaleString('es-MX')} pts
                </strong>{' '}
                ({saleReceipt.client.totalVisits} visitas)
              </p>
            </div>

            <div className="bg-[#111111] border border-[#2A2A2A] rounded-sm p-4 text-xs space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-[#888888]">Total cobrado:</span>
                <span className="text-[#FFFFFF] font-bold">
                  ${saleReceipt.transaction.totalPaid.toLocaleString('es-MX')} MXN
                </span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Puntos acumulados:</span>
                <span>+{saleReceipt.transaction.pointsEarned} pts</span>
              </div>
              {saleReceipt.transaction.pointsRedeemed > 0 && (
                <div className="flex justify-between text-amber-400">
                  <span>Puntos canjeados:</span>
                  <span>-{saleReceipt.transaction.pointsRedeemed} pts</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Link
                to={`/lealtad/${saleReceipt.client.qrToken}`}
                target="_blank"
                className="w-full py-2.5 bg-[#222222] hover:bg-[#2C2C2C] border border-[#C6A15B]/50 text-[#C6A15B] text-xs font-semibold rounded-sm flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Tarjeta QR Actualizada</span>
              </Link>
              <button
                type="button"
                onClick={() => setSaleReceipt(null)}
                className="w-full py-2.5 bg-[#C6A15B] hover:bg-[#DFBF7E] text-[#111111] font-bold text-xs uppercase rounded-sm"
              >
                Continuar en Caja
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Nuevo Cliente */}
      {newClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-md w-full rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="font-serif text-lg text-[#FFFFFF]">Registrar Cliente en Lealtad</h3>
              <button
                type="button"
                onClick={() => setNewClientModalOpen(false)}
                className="text-[#888888] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {clientFormError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-200 text-xs">
                {clientFormError}
              </div>
            )}

            <form onSubmit={handleCreateClient} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888888] mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1">Teléfono / WhatsApp (10 dígitos) *</label>
                <input
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[#888888] mb-1">Correo electrónico (Opcional)</label>
                <input
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewClientModalOpen(false)}
                  className="px-4 py-2 bg-[#262626] text-[#888888] rounded-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingClient}
                  className="px-5 py-2 bg-[#C6A15B] text-[#111111] font-bold rounded-sm uppercase disabled:opacity-50"
                >
                  {savingClient ? 'Creando...' : 'Crear y Generar QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar / Crear Ítem de Catálogo POS */}
      {editingCatalogItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-md w-full rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="font-serif text-lg text-[#FFFFFF]">
                {editingCatalogItem.id ? 'Editar Servicio / Producto' : 'Nuevo Servicio / Producto'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCatalogItem(null)}
                className="text-[#888888] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminFormError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-200 text-xs">
                {adminFormError}
              </div>
            )}

            <form onSubmit={handleSaveCatalogItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888888] mb-1">Nombre *</label>
                <input
                  type="text"
                  value={editingCatalogItem.name || ''}
                  onChange={(e) =>
                    setEditingCatalogItem({ ...editingCatalogItem, name: e.target.value })
                  }
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Categoría *</label>
                <select
                  value={editingCatalogItem.category || 'Servicio'}
                  onChange={(e) =>
                    setEditingCatalogItem({
                      ...editingCatalogItem,
                      category: e.target.value as 'Servicio' | 'Producto',
                    })
                  }
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                >
                  <option value="Servicio">Servicio</option>
                  <option value="Producto">Producto</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1">Precio ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editingCatalogItem.price ?? 0}
                    onChange={(e) =>
                      setEditingCatalogItem({
                        ...editingCatalogItem,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1">Puntos que otorga *</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCatalogItem.pointsAwarded ?? 0}
                    onChange={(e) =>
                      setEditingCatalogItem({
                        ...editingCatalogItem,
                        pointsAwarded: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                    required
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingCatalogItem.active ?? true}
                  onChange={(e) =>
                    setEditingCatalogItem({ ...editingCatalogItem, active: e.target.checked })
                  }
                  className="accent-[#C6A15B]"
                />
                <span className="text-[#CCCCCC]">Activo en caja POS</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCatalogItem(null)}
                  className="px-4 py-2 bg-[#262626] text-[#888888] rounded-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCatalogItem}
                  className="px-5 py-2 bg-[#C6A15B] text-[#111111] font-bold rounded-sm uppercase disabled:opacity-50"
                >
                  {savingCatalogItem ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar / Crear Recompensa */}
      {editingReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161616] border border-[#2B2B2B] max-w-md w-full rounded-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#262626] pb-3">
              <h3 className="font-serif text-lg text-[#FFFFFF]">
                {editingReward.id ? 'Editar Recompensa' : 'Nueva Recompensa'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingReward(null)}
                className="text-[#888888] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {adminFormError && (
              <div className="p-3 bg-red-950/40 border border-red-500/40 rounded text-red-200 text-xs">
                {adminFormError}
              </div>
            )}

            <form onSubmit={handleSaveReward} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#888888] mb-1">Título *</label>
                <input
                  type="text"
                  value={editingReward.title || ''}
                  onChange={(e) => setEditingReward({ ...editingReward, title: e.target.value })}
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1">Descripción *</label>
                <textarea
                  rows={2}
                  value={editingReward.description || ''}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, description: e.target.value })
                  }
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1">Puntos requeridos *</label>
                  <input
                    type="number"
                    min="1"
                    value={editingReward.requiredPoints ?? 100}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        requiredPoints: Number(e.target.value),
                      })
                    }
                    className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1">Tipo de descuento *</label>
                  <select
                    value={editingReward.discountType || 'fixed'}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        discountType: e.target.value as 'percentage' | 'fixed' | 'free_service',
                      })
                    }
                    className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  >
                    <option value="fixed">Monto fijo ($ MXN)</option>
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="free_service">Servicio cortesía</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#888888] mb-1">
                  Valor del descuento ({editingReward.discountType === 'percentage' ? '%' : '$ MXN'}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingReward.discountValue ?? 0}
                  onChange={(e) =>
                    setEditingReward({
                      ...editingReward,
                      discountValue: Number(e.target.value),
                    })
                  }
                  className="w-full bg-[#111111] border border-[#333333] text-[#FFFFFF] px-3 py-2 rounded-sm"
                  required
                />
              </div>

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingReward.active ?? true}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, active: e.target.checked })
                  }
                  className="accent-[#C6A15B]"
                />
                <span className="text-[#CCCCCC]">Recompensa activa</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="px-4 py-2 bg-[#262626] text-[#888888] rounded-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingReward}
                  className="px-5 py-2 bg-[#C6A15B] text-[#111111] font-bold rounded-sm uppercase disabled:opacity-50"
                >
                  {savingReward ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
