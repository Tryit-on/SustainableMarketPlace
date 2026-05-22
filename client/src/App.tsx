import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";
import Profile from "@/pages/Profile";
import Orders from "@/pages/Orders";
import About from "@/pages/About";
import Login from "@/pages/Login";
// Seller
import SellerApply from "@/pages/seller/Apply";
import SellerApplicationStatus from "@/pages/seller/ApplicationStatus";
import SellerDashboard from "@/pages/seller/Dashboard";
// Admin
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminApplicationDetail from "@/pages/admin/ApplicationDetail";
// Public
import SellerProfile from "@/pages/SellerProfile";
import Learn from "@/pages/Learn";
import Replace from "@/pages/Replace";
import ReplacementGuide from "@/pages/ReplacementGuide";
import Compare from "@/pages/Compare";
import ImpactDashboard from "@/pages/ImpactDashboard";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <Route path="/" component={Home} />
      )}

      {/* Shop */}
      <Route path="/shop" component={Shop} />
      <Route path="/product/:slug" component={ProductDetail} />
      <Route path="/compare" component={Compare} />
      <Route path="/replace" component={Replace} />
      <Route path="/replace/:slug" component={ReplacementGuide} />

      {/* Cart / checkout */}
      <Route path="/cart" component={Cart} />
      <Route path="/wishlist" component={Wishlist} />
      <Route path="/checkout" component={Checkout} />

      {/* Account */}
      <Route path="/profile" component={Profile} />
      <Route path="/orders" component={Orders} />
      <Route path="/account/impact" component={ImpactDashboard} />

      {/* Seller */}
      <Route path="/seller/apply" component={SellerApply} />
      <Route path="/seller/application" component={SellerApplicationStatus} />
      <Route path="/seller/dashboard" component={SellerDashboard} />
      <Route path="/seller/dashboard/:tab" component={SellerDashboard} />

      {/* Admin */}
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/applications/:id" component={AdminApplicationDetail} />

      {/* Public pages */}
      <Route path="/sellers/:slug" component={SellerProfile} />
      <Route path="/learn" component={Learn} />
      <Route path="/about" component={About} />
      <Route path="/login" component={Login} />

      {/* Legacy redirects */}
      <Route path="/community">
        <Redirect to="/learn" />
      </Route>
      <Route path="/become-seller">
        <Redirect to="/seller/apply" />
      </Route>
      <Route path="/sellers">
        <Redirect to="/shop" />
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
