import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SeoProvider } from './context/SeoContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CategoryProvider } from './context/CategoryContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

// Layouts (loaded eagerly — needed on every route)
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// RBAC Components (loaded eagerly — needed for route protection logic)
import ProtectedAdminRoute from './components/rbac/ProtectedAdminRoute';
import ScrollToTop from './components/ScrollToTop';

// ── Lazy-loaded User Pages ─────────────────────────────────────────────────────
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ProductList = lazy(() => import('./pages/ProductList'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PolicyPage = lazy(() => import('./pages/PolicyPage'));
const AccountDeletePage = lazy(() => import('./pages/AccountDeletePage'));
const BlogList = lazy(() => import('./pages/BlogList'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));

// ── Lazy-loaded Admin Pages ────────────────────────────────────────────────────
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Products = lazy(() => import('./pages/admin/Products'));
const ProductAttributes = lazy(() => import('./pages/admin/ProductAttributes'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Users = lazy(() => import('./pages/admin/Users'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const Policies = lazy(() => import('./pages/admin/Policies'));
const Ads = lazy(() => import('./pages/admin/Ads'));
const SeoManager = lazy(() => import('./pages/admin/SeoManager'));
const DeliverySettings = lazy(() => import('./pages/admin/DeliverySettings'));
const GaSettings = lazy(() => import('./pages/admin/GaSettings'));
const PaymentSettings = lazy(() => import('./pages/admin/PaymentSettings'));
const GoogleAnalyticsDashboard = lazy(() => import('./pages/admin/GoogleAnalyticsDashboard'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));

// ── Lazy-loaded Admin Auth Pages ───────────────────────────────────────────────
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminForgotPassword = lazy(() => import('./pages/admin/AdminForgotPassword'));
const AdminResetPassword = lazy(() => import('./pages/admin/AdminResetPassword'));
const AcceptInvitation = lazy(() => import('./pages/admin/AcceptInvitation'));

// ── Lazy-loaded RBAC Admin Pages ───────────────────────────────────────────────
const AdminUsers = lazy(() => import('./pages/admin/rbac/AdminUsers'));
const Roles = lazy(() => import('./pages/admin/rbac/Roles'));
const Modules = lazy(() => import('./pages/admin/rbac/Modules'));
const Invitations = lazy(() => import('./pages/admin/rbac/Invitations'));
const ActivityLogs = lazy(() => import('./pages/admin/rbac/ActivityLogs'));
const DeletedAccounts = lazy(() => import('./pages/admin/DeletedAccounts'));

// ── Lazy-loaded Invoice Builder Pages ─────────────────────────────────────────
const InvoiceTemplates = lazy(() => import('./pages/admin/invoice/InvoiceTemplates'));
const InvoiceVisualEditor = lazy(() => import('./pages/admin/invoice/InvoiceVisualEditor'));
const InvoiceSettings = lazy(() => import('./pages/admin/invoice/InvoiceSettings'));
const InvoiceVariables = lazy(() => import('./pages/admin/invoice/InvoiceVariables'));
const InvoiceCategories = lazy(() => import('./pages/admin/invoice/InvoiceCategories'));

// ── GA4 Route Tracker ──────────────────────────────────────────────────────────
import { initGA, trackPageView } from './utils/gaTracker';
import { useLocation } from 'react-router-dom';

const GaRouteTracker = () => {
    const location = useLocation();

    React.useEffect(() => {
        // Read GA Measurement ID from client env var (set VITE_GA_MEASUREMENT_ID in .env)
        const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
        if (measurementId) {
            initGA(measurementId);
        }
        // No unauthenticated server fetch needed — the ID is a public value safe for env
    }, []);

    React.useEffect(() => {
        if (!location.pathname.startsWith('/admin')) {
            trackPageView(location.pathname + location.search);
        }
    }, [location]);

    return null;
};

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <GaRouteTracker />
      <ErrorBoundary>
        <SeoProvider>
          <AuthProvider>
            <CartProvider>
              <CategoryProvider>
                <AdminAuthProvider>
                  <ToastContainer position="top-right" autoClose={2000} />
                  <Suspense fallback={<LoadingSpinner />}>
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
                        <Route path="blog" element={<BlogList />} />
                        <Route path="blog/:slug" element={<BlogDetail />} />
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
                        <Route path="blogs" element={
                          <ProtectedAdminRoute requiredModule="SEO">
                            <BlogManager />
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
                        <Route path="delivery-settings" element={
                          <ProtectedAdminRoute requiredModule="Dashboard">
                            <DeliverySettings />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="analytics/google" element={
                          <ProtectedAdminRoute requiredModule="Reports">
                            <GoogleAnalyticsDashboard />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="settings" element={
                          <ProtectedAdminRoute requiredModule="Settings">
                            <PaymentSettings />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="settings/google-analytics" element={
                          <ProtectedAdminRoute requiredModule="Settings">
                            <GaSettings />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="settings/payment" element={
                          <ProtectedAdminRoute requiredModule="Settings">
                            <PaymentSettings />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="payment-settings" element={
                          <ProtectedAdminRoute requiredModule="Settings">
                            <PaymentSettings />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="settings/payment-settings" element={
                          <ProtectedAdminRoute requiredModule="Settings">
                            <PaymentSettings />
                          </ProtectedAdminRoute>
                        } />
                        <Route path="payment" element={
                          <ProtectedAdminRoute requiredModule="Settings">
                            <PaymentSettings />
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
                          <Link to="/" className="bg-[#ff3269] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#e62e5c] transition-colors">
                            Return to Home
                          </Link>
                        </div>
                      } />
                    </Routes>
                  </Suspense>
                </AdminAuthProvider>
              </CategoryProvider>
            </CartProvider>
          </AuthProvider>
        </SeoProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
