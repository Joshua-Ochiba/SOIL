import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";

// ── Lazy-loaded pages — each becomes its own JS chunk ────────────────────────
const Home             = lazy(() => import("./pages/Home"));
const Intelligence     = lazy(() => import("./pages/Intelligence"));
const Studio           = lazy(() => import("./pages/Studio"));
const Cultivate        = lazy(() => import("./pages/Cultivate"));
const NotFound         = lazy(() => import("./pages/NotFound"));
const AdminLogin       = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard   = lazy(() => import("./pages/admin/AdminDashboard"));
const CheckoutSuccess  = lazy(() => import("./pages/studio/CheckoutSuccess"));
const CheckoutCancelled= lazy(() => import("./pages/studio/CheckoutCancelled"));
const ProductPage      = lazy(() => import("./pages/studio/ProductPage"));
const Legal            = lazy(() => import("./pages/Legal"));

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import Navbar from "./components/shared/Navbar";
import ScrollToTop from "./components/shared/ScrollToTop";
import CustomCursor from "./components/soil/CustomCursor";
import SpotifyPlayer from "./components/shared/SpotifyPlayer";
import CookieConsent from "./components/shared/CookieConsent";
import { useAuth } from "./hooks/useAuth";
import ContactModal from "./components/shared/ContactModal";
import useUIStore from "./store/uiStore";
import useThemeStore from "./store/themeStore";

// ── Theme controller ─────────────────────────────────────────────────────────
// Applies the `.dark` class on <html> from the user's preference, EXCEPT on the
// Home/Origin page and the Admin area which are always dark (the brand intro and
// the internal tool keep the original look). The no-flash inline script in
// index.html applies the same on first paint; this keeps it in sync on SPA nav
// and when the user toggles. :root in index.css holds the light palette; .dark
// holds the original dark values.
function ThemeController() {
  const theme = useThemeStore((s) => s.theme);
  const { pathname } = useLocation();
  const forcedDark = pathname === "/" || pathname.startsWith("/admin");

  useEffect(() => {
    const root = document.documentElement;
    const effective = forcedDark ? "dark" : theme;
    root.classList.toggle("dark", effective === "dark");
  }, [theme, forcedDark]);

  return null;
}

// Minimal dark fallback shown during chunk load — matches site bg, no flash
function PageFallback() {
  return <div className="min-h-screen bg-[#0a0806]" />;
}

// ── Public site (with Navbar + cursor) ───────────────────────────────────────
function PublicRoutes() {
  const location = useLocation();
  return (
    <>
      <Navbar />
      <Suspense fallback={<PageFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"                   element={<Home />} />
            <Route path="/intelligence"       element={<Intelligence />} />
            <Route path="/studio"             element={<Studio />} />
            <Route path="/studio/product/:id" element={<ProductPage />} />
            <Route path="/studio/success"     element={<CheckoutSuccess />} />
            <Route path="/studio/cancelled"   element={<CheckoutCancelled />} />
            <Route path="/cultivate"          element={<Cultivate />} />
            <Route path="/privacy"            element={<Legal doc="privacy" />} />
            <Route path="/terms"              element={<Legal doc="terms" />} />
            <Route path="*"                   element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      {/* Soundtrack player — persists across nav, hidden until tracks configured */}
      <SpotifyPlayer />
      <CookieConsent />
    </>
  );
}

// ── Admin guard ──────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  // Show a minimal dark screen while the session check resolves —
  // returning null causes a blank flash; this matches the site background
  if (loading) return <div className="min-h-screen bg-[#0a0806] flex items-center justify-center">
    <div className="w-5 h-5 rounded-full border border-soil-sun/30 border-t-soil-sun/80 animate-spin" />
  </div>;
  return user ? children : <Navigate to="/admin" replace />;
}

function GlobalModals() {
  const { contactOpen, closeContact } = useUIStore();
  return <ContactModal isOpen={contactOpen} onClose={closeContact} />;
}

export default function App() {
  return (
    <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <CustomCursor />
      <Toaster theme="dark" position="bottom-right" toastOptions={{
        style: { background: '#1a1612', border: '1px solid rgba(255,255,255,0.08)', color: '#f5f0e8' }
      }} />
      <Router>
        <ThemeController />
        <GlobalModals />
        <ScrollToTop />
        <Routes>
          {/* Admin routes — no Navbar, no cursor */}
          <Route path="/admin" element={
            <Suspense fallback={<PageFallback />}><AdminLogin /></Suspense>
          } />
          <Route path="/admin/dashboard" element={
            <Suspense fallback={<PageFallback />}>
              <RequireAuth><AdminDashboard /></RequireAuth>
            </Suspense>
          } />
          {/* Public site */}
          <Route path="/*" element={<PublicRoutes />} />
        </Routes>
      </Router>
    </QueryClientProvider>
    </HelmetProvider>
  );
}
