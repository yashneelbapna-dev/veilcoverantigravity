import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import NavigationLoader from "./components/NavigationLoader";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FloatingThemeToggle } from "./components/FloatingThemeToggle";

/* Branded loading fallback for route transitions */
const PageLoader = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
    <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">VEIL</h1>
    <div className="flex gap-1.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"
          style={{ animationDelay: `${i * 200}ms` }}
        />
      ))}
    </div>
  </div>
);

const SearchOverlay = lazy(() => import("./components/SearchOverlay"));
const CartSidebar = lazy(() => import("./components/CartSidebar"));
const EmailCaptureModal = lazy(() => import("./components/EmailCaptureModal"));
const ChatBot = lazy(() => import("./components/ChatBot"));

const Index = lazy(() => import("./pages/Index"));
const Shop = lazy(() => import("./pages/Shop"));
const Collections = lazy(() => import("./pages/Collections"));
const CollectionDetail = lazy(() => import("./pages/CollectionDetail"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Drops = lazy(() => import("./pages/Drops"));
const Collab = lazy(() => import("./pages/Collab"));
const About = lazy(() => import("./pages/About"));
const Auth = lazy(() => import("./pages/Auth"));
const Account = lazy(() => import("./pages/Account"));
const Wishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CheckoutConfirmation = lazy(() => import("./pages/CheckoutConfirmation"));
const TrackOrder = lazy(() => import("./pages/TrackOrder"));
const Admin = lazy(() => import("./pages/Admin"));
const Contact = lazy(() => import("./pages/Contact"));
const FAQ = lazy(() => import("./pages/FAQ"));
const ShippingReturns = lazy(() => import("./pages/ShippingReturns"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const CareGuide = lazy(() => import("./pages/CareGuide"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
      <BrowserRouter>
        <NavigationLoader />
        <Suspense fallback={null}>
          <SearchOverlay />
          <CartSidebar />
          <EmailCaptureModal />
        </Suspense>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/collections/:slug" element={<CollectionDetail />} />
            <Route path="/product/:productId" element={<ProductDetail />} />
            <Route path="/drops" element={<Drops />} />
            <Route path="/collab" element={<Collab />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/account" element={<Account />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
            <Route path="/track" element={<TrackOrder />} />
            <Route path="/track/:orderId" element={<TrackOrder />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/shipping-returns" element={<ShippingReturns />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/care-guide" element={<CareGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Suspense fallback={null}>
          <ChatBot />
        </Suspense>
        <FloatingThemeToggle />
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
