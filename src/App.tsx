import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { BottomNavigation } from "@/components/pwa/BottomNavigation";
import { InstallPWAPrompt } from "@/components/pwa/InstallPWAPrompt";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { PWATour } from "@/components/tour/PWATour";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PublicOnboarding from "./pages/PublicOnboarding";
import Dashboard from "./pages/Dashboard";
import AIChat from "./pages/AIChat";
import Pricing from "./pages/Pricing";
import Simulator from "./pages/Simulator";
import Contadores from "./pages/Contadores";
import ContadorPanel from "./pages/ContadorPanel";
import ContadorOnboarding from "./pages/ContadorOnboarding";
import AdminPanel from "./pages/AdminPanel";
import AdminReports from "./pages/AdminReports";
import RoleManagement from "./pages/RoleManagement";
import LocacaoSimulator from "./pages/LocacaoSimulator";
import RegimeComparator from "./pages/RegimeComparator";
import TermosDeUso from "./pages/TermosDeUso";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import NotFound from "./pages/NotFound";
import PlanoSimulador from "./pages/PlanoSimulador";
import PlanoAtenteAi from "./pages/PlanoAtenteAi";
import ConsultationChatPage from "./pages/ConsultationChatPage";
import ConsultationHistory from "./pages/ConsultationHistory";
import Profile from "./pages/Profile";
import PlanComparison from "./pages/PlanComparison";
import PaymentSuccess from "./pages/PaymentSuccess";
import FAQ from "./pages/FAQ";
import AutonomoPanel from "./pages/AutonomoPanel";
import PlanoAutonomo from "./pages/PlanoAutonomo";
import AutonomoOnboardingPage from "./pages/AutonomoOnboarding";
import UserTypeSelection from "./pages/UserTypeSelection";
import InstallApp from "./pages/InstallApp";
import TransitionSimulator from "./pages/TransitionSimulator";
import CertificatesPage from "./pages/CertificatesPage";
import TransicaoTributaria from "./pages/TransicaoTributaria";
import MetricsDashboard from "./pages/MetricsDashboard";
import PlanosPorPerfil from "./pages/PlanosPorPerfil";
import ContadoresPublic from "./pages/ContadoresPublic";
import ServicosPage from "./pages/ServicosPage";
import IRPage from "./pages/IRPage";
import FerramentasLC214 from "./pages/FerramentasLC214";
import TimelineReforma from "./pages/TimelineReforma";
import LimpaNomePage from "./pages/LimpaNomePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <ScrollToTop />
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <div className="pb-20 md:pb-0">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/comecar" element={<UserTypeSelection />} />
              <Route path="/onboarding" element={<PublicOnboarding />} />
              <Route path="/autonomo-onboarding" element={<AutonomoOnboardingPage />} />
              <Route path="/contador-onboarding" element={<ContadorOnboarding />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/instalar" element={<InstallApp />} />
              <Route path="/plano/simulador" element={<PlanoSimulador />} />
              <Route path="/plano/atente-ai" element={<PlanoAtenteAi />} />
              <Route path="/plano/autonomo" element={<PlanoAutonomo />} />
              <Route path="/plano/comparar" element={<PlanComparison />} />
              <Route path="/planos-perfil" element={<PlanosPorPerfil />} />
              <Route path="/contadores-publico" element={<ContadoresPublic />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/termos" element={<TermosDeUso />} />
              <Route path="/privacidade" element={<PoliticaPrivacidade />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/simulador" element={<Simulator />} />
              <Route path="/transicao" element={<TransitionSimulator />} />
              <Route path="/transicao-tributaria" element={<TransicaoTributaria />} />
              <Route path="/certidoes" element={<CertificatesPage />} />
              <Route path="/servicos" element={<ServicosPage />} />
              <Route path="/ir" element={<IRPage />} />
              <Route path="/ferramentas-lc214" element={<FerramentasLC214 />} />
              <Route path="/timeline-reforma" element={<TimelineReforma />} />
              <Route path="/limpa-nome" element={<LimpaNomePage />} />
              {/* Protected routes - require authentication */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/perfil" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* Simulator plan features */}
              <Route path="/simulator" element={
                <ProtectedRoute requiredPlan="simulator">
                  <Simulator />
                </ProtectedRoute>
              } />
              
              {/* Premium plan features */}
              <Route path="/ai-chat" element={
                <ProtectedRoute requiredPlan="premium">
                  <AIChat />
                </ProtectedRoute>
              } />
              <Route path="/locacao" element={
                <ProtectedRoute requiredPlan="premium">
                  <LocacaoSimulator />
                </ProtectedRoute>
              } />
              <Route path="/regime-comparator" element={
                <ProtectedRoute requiredPlan="premium">
                  <RegimeComparator />
                </ProtectedRoute>
              } />
              <Route path="/contadores" element={
                <ProtectedRoute requiredPlan="premium">
                  <Contadores />
                </ProtectedRoute>
              } />
              
              {/* Role-based routes */}
              <Route path="/autonomo" element={
                <ProtectedRoute>
                  <AutonomoPanel />
                </ProtectedRoute>
              } />
              <Route path="/autonomo/onboarding" element={
                <ProtectedRoute>
                  <AutonomoOnboardingPage />
                </ProtectedRoute>
              } />
              <Route path="/contador" element={
                <ProtectedRoute>
                  <ContadorPanel />
                </ProtectedRoute>
              } />
              <Route path="/contador/onboarding" element={
                <ProtectedRoute>
                  <ContadorOnboarding />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminPanel />
                </ProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <ProtectedRoute>
                  <RoleManagement />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              } />
              <Route path="/admin/metrics" element={
                <ProtectedRoute>
                  <MetricsDashboard />
                </ProtectedRoute>
              } />
              <Route path="/chat/:consultationId" element={
                <ProtectedRoute>
                  <ConsultationChatPage />
                </ProtectedRoute>
              } />
              <Route path="/consultations" element={
                <ProtectedRoute>
                  <ConsultationHistory />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <BottomNavigation />
          <InstallPWAPrompt />
          <PWATour />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
