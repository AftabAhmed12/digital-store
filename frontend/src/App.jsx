import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import ChatWidget from "./components/ChatWidget.jsx";
import CampaignBanner from "./components/CampaignBanner.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Loader from "./components/Loader.jsx";

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

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <CampaignBanner />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loader />}>
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
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id/edit" element={<AdminProductForm />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="coupons/new" element={<AdminCouponForm />} />
          <Route path="coupons/:id/edit" element={<AdminCouponForm />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="campaigns/new" element={<AdminCampaignForm />} />
          <Route path="campaigns/:id/edit" element={<AdminCampaignForm />} />
          <Route path="blogs" element={<AdminBlogs />} />
          <Route path="blogs/new" element={<AdminBlogForm />} />
          <Route path="blogs/:id/edit" element={<AdminBlogForm />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="cancelled" element={<AdminAbandoned />} />
          <Route path="leads" element={<AdminChatLeads />} />
        </Route>

        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </Suspense>
  );
}