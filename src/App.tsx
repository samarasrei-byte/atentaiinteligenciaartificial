import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AIChat from "./pages/AIChat";
import Pricing from "./pages/Pricing";
import Simulator from "./pages/Simulator";
import Contadores from "./pages/Contadores";
import ContadorPanel from "./pages/ContadorPanel";
import AdminPanel from "./pages/AdminPanel";
import LocacaoSimulator from "./pages/LocacaoSimulator";
import RegimeComparator from "./pages/RegimeComparator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ai-chat" element={<AIChat />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/simulator" element={<Simulator />} />
            <Route path="/locacao" element={<LocacaoSimulator />} />
            <Route path="/regime-comparator" element={<RegimeComparator />} />
            <Route path="/contadores" element={<Contadores />} />
            <Route path="/contador" element={<ContadorPanel />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
