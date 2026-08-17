import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import CampaignBanner from "./components/CampaignBanner.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ModuleRoute from "./components/ModuleRoute.jsx";
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import Loader from "./components/Loader.jsx";
import { firstAccessibleRoute } from "./utils/adminAccess.js";

// Code-split every page so the initial bundle stays lean (faster LCP/Web Vitals).
const Home = lazy(() => import("./pages/Home.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const Blog = lazy(() => import("./pages/Blog.jsx"));
const BlogDetail = lazy(() => import("./pages/BlogDetail.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const WriteForUs = lazy(() => import("./pages/WriteForUs.jsx"));
const Success = lazy(() => import("./pages/Success.jsx"));
const Cancel = lazy(() => import("./pages/Cancel.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin.jsx"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard.jsx"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts.jsx"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm.jsx"));
const AdminCoupons = lazy(() => import("./pages/admin/AdminCoupons.jsx"));
const AdminCouponForm = lazy(() => import("./pages/admin/AdminCouponForm.jsx"));
const AdminCampaigns = lazy(() => import("./pages/admin/AdminCampaigns.jsx"));
const AdminCampaignForm = lazy(() => import("./pages/admin/AdminCampaignForm.jsx"));
const AdminBlogs = lazy(() => import("./pages/admin/AdminBlogs.jsx"));
const AdminBlogForm = lazy(() => import("./pages/admin/AdminBlogForm.jsx"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders.jsx"));
const AdminReviews = lazy(() => import("./pages/admin/AdminReviews.jsx"));
const AdminAbandoned = lazy(() => import("./pages/admin/AdminAbandoned.jsx"));
const AdminChatLeads = lazy(() => import("./pages/admin/AdminChatLeads.jsx"));
const AdminManagement = lazy(() => import("./pages/admin/AdminManagement.jsx"));

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <CampaignBanner />
      <main className="min-h-[70vh]">
        <Suspense fallback={<Loader />}>{children}</Suspense>
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
}

// Fallback for /admin when the signed-in admin has no module access at all.
function AdminLanding() {
  if (firstAccessibleRoute() !== "/admin") return <Navigate to={firstAccessibleRoute()} replace />;
  return (
    <div className="container-px py-16 max-w-xl">
      <h1 className="font-display font-700 text-2xl mb-3">No access assigned yet</h1>
      <p className="text-text-muted">
        You don&apos;t have access to any module. Ask a super admin to grant you permissions.
      </p>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
      <ErrorBoundary>
        <Routes>
        {/* Public site */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
        <Route path="/products/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogDetail /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/write-for-us" element={<PublicLayout><WriteForUs /></PublicLayout>} />
        <Route path="/order-success" element={<PublicLayout><Success /></PublicLayout>} />
        <Route path="/order-cancelled" element={<PublicLayout><Cancel /></PublicLayout>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminLanding />} />
          <Route
            path="dashboard"
            element={
              <ModuleRoute module="dashboard">
                <AdminDashboard />
              </ModuleRoute>
            }
          />
          <Route
            path="products"
            element={
              <ModuleRoute module="products">
                <AdminProducts />
              </ModuleRoute>
            }
          />
          <Route
            path="products/new"
            element={
              <ModuleRoute module="products" action="create">
                <AdminProductForm />
              </ModuleRoute>
            }
          />
          <Route
            path="products/:id/edit"
            element={
              <ModuleRoute module="products" action="edit">
                <AdminProductForm />
              </ModuleRoute>
            }
          />
          <Route
            path="coupons"
            element={
              <ModuleRoute module="coupons">
                <AdminCoupons />
              </ModuleRoute>
            }
          />
          <Route
            path="coupons/new"
            element={
              <ModuleRoute module="coupons" action="create">
                <AdminCouponForm />
              </ModuleRoute>
            }
          />
          <Route
            path="coupons/:id/edit"
            element={
              <ModuleRoute module="coupons" action="edit">
                <AdminCouponForm />
              </ModuleRoute>
            }
          />
          <Route
            path="campaigns"
            element={
              <ModuleRoute module="campaigns">
                <AdminCampaigns />
              </ModuleRoute>
            }
          />
          <Route
            path="campaigns/new"
            element={
              <ModuleRoute module="campaigns" action="create">
                <AdminCampaignForm />
              </ModuleRoute>
            }
          />
          <Route
            path="campaigns/:id/edit"
            element={
              <ModuleRoute module="campaigns" action="edit">
                <AdminCampaignForm />
              </ModuleRoute>
            }
          />
          <Route
            path="blogs"
            element={
              <ModuleRoute module="blogs">
                <AdminBlogs />
              </ModuleRoute>
            }
          />
          <Route
            path="blogs/new"
            element={
              <ModuleRoute module="blogs" action="create">
                <AdminBlogForm />
              </ModuleRoute>
            }
          />
          <Route
            path="blogs/:id/edit"
            element={
              <ModuleRoute module="blogs" action="edit">
                <AdminBlogForm />
              </ModuleRoute>
            }
          />
          <Route
            path="orders"
            element={
              <ModuleRoute module="orders">
                <AdminOrders />
              </ModuleRoute>
            }
          />
          <Route
            path="reviews"
            element={
              <ModuleRoute module="reviews">
                <AdminReviews />
              </ModuleRoute>
            }
          />
          <Route
            path="cancelled"
            element={
              <ModuleRoute module="orders">
                <AdminAbandoned />
              </ModuleRoute>
            }
          />
          <Route
            path="leads"
            element={
              <ModuleRoute module="leads">
                <AdminChatLeads />
              </ModuleRoute>
            }
          />
          <Route
            path="admin-management"
            element={
              <ModuleRoute module="admin">
                <AdminManagement />
              </ModuleRoute>
            }
          />
        </Route>

        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
        </Routes>
      </ErrorBoundary>
    </Suspense>
  );
}