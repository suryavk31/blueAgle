import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SeoProvider } from './context/SeoContext';
import { AdminAuthProvider } from './context/AdminAuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// User Pages
import Home from './pages/Home';
import Login from './pages/Login';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import PolicyPage from './pages/PolicyPage';
import AccountDeletePage from './pages/AccountDeletePage';

// Admin Pages (existing)
import Dashboard from './pages/admin/Dashboard';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import ProductAttributes from './pages/admin/ProductAttributes';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import Coupons from './pages/admin/Coupons';
import Policies from './pages/admin/Policies';
import Ads from './pages/admin/Ads';
import SeoManager from './pages/admin/SeoManager';

// Admin Auth Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminForgotPassword from './pages/admin/AdminForgotPassword';
import AdminResetPassword from './pages/admin/AdminResetPassword';
import AcceptInvitation from './pages/admin/AcceptInvitation';

// RBAC Admin Pages
import AdminUsers from './pages/admin/rbac/AdminUsers';
import Roles from './pages/admin/rbac/Roles';
import Modules from './pages/admin/rbac/Modules';
import Invitations from './pages/admin/rbac/Invitations';
import ActivityLogs from './pages/admin/rbac/ActivityLogs';
import DeletedAccounts from './pages/admin/DeletedAccounts';

// Invoice Builder Pages
import InvoiceTemplates from './pages/admin/invoice/InvoiceTemplates';
import InvoiceVisualEditor from './pages/admin/invoice/InvoiceVisualEditor';
import InvoiceSettings from './pages/admin/invoice/InvoiceSettings';
import InvoiceVariables from './pages/admin/invoice/InvoiceVariables';
import InvoiceCategories from './pages/admin/invoice/InvoiceCategories';

// RBAC Components
import ProtectedAdminRoute from './components/rbac/ProtectedAdminRoute';

function App() {
  return (
    <BrowserRouter>
      <SeoProvider>
        <AuthProvider>
          <CartProvider>
            <AdminAuthProvider>
              <ToastContainer position="top-right" autoClose={2000} />
              <Routes>
                {/* ── Customer Routes ─────────────────────────────── */}
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="products" element={<ProductList />} />
                  <Route path="product/:id" element={<ProductDetail />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="account/delete" element={<AccountDeletePage />} />
                  <Route path="policy/:type" element={<PolicyPage />} />
                  <Route path="policies/:type" element={<PolicyPage />} />
                  <Route path="policies/account-deletion" element={<PolicyPage />} />
                </Route>

                {/* ── Admin Auth Pages (no sidebar layout) ────────── */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
                <Route path="/admin/reset-password" element={<AdminResetPassword />} />
                <Route path="/admin/invite/accept/:token" element={<AcceptInvitation />} />

                {/* ── Admin Panel (with sidebar layout) ───────────── */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={
                    <ProtectedAdminRoute requiredModule="Dashboard">
                      <Dashboard />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="products" element={
                    <ProtectedAdminRoute requiredModule="Products">
                      <Products />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="product-attributes" element={
                    <ProtectedAdminRoute requiredModule="Products">
                      <ProductAttributes />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="categories" element={
                    <ProtectedAdminRoute requiredModule="Categories">
                      <Categories />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="orders" element={
                    <ProtectedAdminRoute requiredModule="Orders">
                      <Orders />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="coupons" element={
                    <ProtectedAdminRoute requiredModule="Coupons">
                      <Coupons />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="seo" element={
                    <ProtectedAdminRoute requiredModule="SEO">
                      <SeoManager />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="policies" element={
                    <ProtectedAdminRoute requiredModule="Policies">
                      <Policies />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="users" element={
                    <ProtectedAdminRoute requiredModule="Customers">
                      <Users />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/deleted-accounts" element={
                    <ProtectedAdminRoute requiredModule="Customers">
                      <DeletedAccounts />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="ads" element={
                    <ProtectedAdminRoute requiredModule="Ads">
                      <Ads />
                    </ProtectedAdminRoute>
                  } />

                  {/* ── RBAC Administration Pages ──────────────────── */}
                  <Route path="rbac/roles" element={
                    <ProtectedAdminRoute requiredModule="Roles">
                      <Roles />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/admin-users" element={
                    <ProtectedAdminRoute requiredModule="AdminUsers">
                      <AdminUsers />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/modules" element={
                    <ProtectedAdminRoute requiredModule="Modules">
                      <Modules />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/invitations" element={
                    <ProtectedAdminRoute requiredModule="Invitations">
                      <Invitations />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/activity-logs" element={
                    <ProtectedAdminRoute requiredModule="ActivityLogs">
                      <ActivityLogs />
                    </ProtectedAdminRoute>
                  } />

                  {/* ── Invoice Builder Routes ──────────────────────── */}
                  <Route path="rbac/invoice-builder/templates" element={
                    <ProtectedAdminRoute requiredModule="InvoiceBuilder">
                      <InvoiceTemplates />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/invoice-builder/editor/:id" element={
                    <ProtectedAdminRoute requiredModule="InvoiceBuilder">
                      <InvoiceVisualEditor />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/invoice-builder/settings" element={
                    <ProtectedAdminRoute requiredModule="InvoiceBuilder">
                      <InvoiceSettings />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/invoice-builder/variables" element={
                    <ProtectedAdminRoute requiredModule="InvoiceBuilder">
                      <InvoiceVariables />
                    </ProtectedAdminRoute>
                  } />
                  <Route path="rbac/invoice-builder/categories" element={
                    <ProtectedAdminRoute requiredModule="InvoiceBuilder">
                      <InvoiceCategories />
                    </ProtectedAdminRoute>
                  } />
                </Route>

                {/* 404 */}
                <Route path="*" element={
                  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
                    <div className="text-8xl font-black text-[#3c006b] mb-4">404</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h1>
                    <p className="text-gray-500 mb-6">The page you are looking for does not exist or has been moved.</p>
                    <a href="/" className="bg-[#ff3269] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e62e5c] transition-colors">
                      Return to Home
                    </a>
                  </div>
                } />
              </Routes>
            </AdminAuthProvider>
          </CartProvider>
        </AuthProvider>
      </SeoProvider>
    </BrowserRouter>
  );
}

export default App;
