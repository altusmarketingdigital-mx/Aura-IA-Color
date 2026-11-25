import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Páginas Públicas
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Services } from './pages/Services';
import { IATechnology } from './pages/IATechnology';
import { Gallery } from './pages/Gallery';
import { Promotions } from './pages/Promotions';
import { Contact } from './pages/Contact';
import { Booking } from './pages/Booking';

// Módulo POS y Lealtad
import { SystemPos } from './pages/system/SystemPos';
import { SystemClientDetail } from './pages/system/SystemClientDetail';
import { LoyaltyCard } from './pages/LoyaltyCard';

// Páginas Administrativas
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAppointments } from './pages/admin/AdminAppointments';
import { AdminCalendar } from './pages/admin/AdminCalendar';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminPromotions } from './pages/admin/AdminPromotions';
import { AdminGallery } from './pages/admin/AdminGallery';

// Guardián de Rutas Privadas
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center text-xs text-[#888888]">
        Verificando credenciales...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          
          {/* Rutas Públicas de Sitio Web */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/nosotros" element={<About />} />
            <Route path="/servicios" element={<Services />} />
            <Route path="/tecnologia-ia" element={<IATechnology />} />
            <Route path="/galeria" element={<Gallery />} />
            <Route path="/promociones" element={<Promotions />} />
            <Route path="/contacto" element={<Contact />} />
            <Route path="/reservar" element={<Booking />} />
          </Route>

          {/* Rutas Administrativas */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/citas"
            element={
              <ProtectedRoute>
                <AdminAppointments />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/calendario"
            element={
              <ProtectedRoute>
                <AdminCalendar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/clientes"
            element={
              <ProtectedRoute>
                <AdminCustomers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/servicios"
            element={
              <ProtectedRoute>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/promociones"
            element={
              <ProtectedRoute>
                <AdminPromotions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/galeria"
            element={
              <ProtectedRoute>
                <AdminGallery />
              </ProtectedRoute>
            }
          />

          {/* Tarjeta de Lealtad Pública */}
          <Route path="/lealtad" element={<LoyaltyCard />} />
          <Route path="/lealtad/:qrToken" element={<LoyaltyCard />} />

          {/* Módulo POS y Lealtad — Protegido */}
          <Route
            path="/system"
            element={
              <ProtectedRoute>
                <SystemPos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/system/clientes/:id"
            element={
              <ProtectedRoute>
                <SystemClientDetail />
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
