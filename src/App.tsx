import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { AffiliateProtectedRoute } from "@/components/AffiliateProtectedRoute";
import { PartnerProtectedRoute } from "@/components/PartnerProtectedRoute";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { AnimatedRoutes } from "@/components/layout/AnimatedRoutes";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BottomNavigation } from "@/components/pwa/BottomNavigation";
import QaModeIndicator from "@/components/qa/QaModeIndicator";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import DashboardRouter from "./pages/DashboardRouter";
import ProfileSelector from "./pages/ProfileSelector";
import EmpresaPanel from "./pages/EmpresaPanel";
import AutonomoPanel from "./pages/AutonomoPanel";
import ContadorPanel from "./pages/ContadorPanel";
import AdminPanel from "./pages/AdminPanel";
import AdminReports from "./pages/AdminReports";
import AdminLogin from "./pages/AdminLogin";
import Profile from "./pages/Profile";
import Simulator from "./pages/Simulator";
import TransitionSimulator from "./pages/TransitionSimulator";
import Contadores from "./pages/Contadores";
import ContadoresPublic from "./pages/ContadoresPublic";
import Pricing from "./pages/Pricing";
import AIChat from "./pages/AIChat";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import PoliticaPrivacidade from "./pages/PoliticaPrivacidade";
import TermosDeUso from "./pages/TermosDeUso";
import PaymentSuccess from "./pages/PaymentSuccess";
import ConsultationHistory from "./pages/ConsultationHistory";
import ConsultationChatPage from "./pages/ConsultationChatPage";
import AberturaEmpresa from "./pages/AberturaEmpresa";
import AutonomoOnboarding from "./pages/AutonomoOnboarding";
import ContadorOnboarding from "./pages/ContadorOnboarding";
import LocacaoSimulator from "./pages/LocacaoSimulator";
import RegimeComparator from "./pages/RegimeComparator";
import LimpaNomePage from "./pages/LimpaNomePage";
import LimpaNomeStatusPage from "./pages/LimpaNomeStatusPage";
import CertificatesPage from "./pages/CertificatesPage";
import IRPage from "./pages/IRPage";
import QADashboard from "./pages/QADashboard";
import ServicosPage from "./pages/ServicosPage";
import FiscalDocumentsPage from "./pages/FiscalDocumentsPage";
import FiscalSuccessPage from "./pages/FiscalSuccessPage";
import ModuloFiscal from "./pages/ModuloFiscal";
import TimelineReforma from "./pages/TimelineReforma";
import TransicaoTributaria from "./pages/TransicaoTributaria";
import FerramentasLC214 from "./pages/FerramentasLC214";
import PlanoSimulador from "./pages/PlanoSimulador";
import PlanoAutonomo from "./pages/PlanoAutonomo";
import PlanoAtenteAi from "./pages/PlanoAtenteAi";
import PlanosPorPerfil from "./pages/PlanosPorPerfil";
import PlanComparison from "./pages/PlanComparison";
import RoleManagement from "./pages/RoleManagement";
import MetricsDashboard from "./pages/MetricsDashboard";
import InvestorPresentation from "./pages/InvestorPresentation";
import TrialOnboarding from "./pages/TrialOnboarding";
import TrialSuccess from "./pages/TrialSuccess";
import WelcomePage from "./pages/WelcomePage";
import UserTypeSelection from "./pages/UserTypeSelection";
import AffiliatePanel from "./pages/AffiliatePanel";
import AffiliateLanding from "./pages/AffiliateLanding";
import AffiliateLandingPremium from "./pages/AffiliateLandingPremium";
import AffiliateFiscalLanding from "./pages/AffiliateFiscalLanding";
import AffiliateLimpaNomeLanding from "./pages/AffiliateLimpaNomeLanding";
import AffiliateOnboarding from "./pages/AffiliateOnboarding";
import AffiliateOnboardingFlow from "./pages/AffiliateOnboardingFlow";
import AffiliateOfferPage from "./pages/AffiliateOfferPage";
import PartnerLogin from "./pages/PartnerLogin";
import PartnerPanel from "./pages/PartnerPanel";
import PartnerInvite from "./pages/PartnerInvite";
import PublicOnboarding from "./pages/PublicOnboarding";
import MinhasSolicitacoesPage from "./pages/MinhasSolicitacoesPage";
import LimpaNomeOnboarding from "./pages/LimpaNomeOnboarding";
import PartnerOnboarding from "./pages/PartnerOnboarding";
import LimpaNomeLanding from "./pages/LimpaNomeLanding";
import ModuloFiscalLanding from "./pages/ModuloFiscalLanding";
import TestLogin from "./pages/TestLogin";
import PartnerGuilhermePage from "./pages/PartnerGuilhermePage";
import MarketplaceServicePage from "./pages/MarketplaceServicePage";

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
            <AnimatedRoutes>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/comecar" element={<UserTypeSelection />} />
              <Route path="/trial" element={<TrialOnboarding />} />
              <Route path="/trial-success" element={<TrialSuccess />} />
              <Route path="/onboarding" element={<PublicOnboarding />} />
              <Route path="/autonomo-onboarding" element={<AutonomoOnboarding />} />
              <Route path="/contador-onboarding" element={<ContadorOnboarding />} />
              <Route path="/pricing" element={<Pricing />} />
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
              <Route path="/marketplace/:serviceSlug" element={<MarketplaceServicePage />} />
              <Route path="/parceiroguilherme" element={<PartnerGuilhermePage />} />
              <Route path="/ir" element={<IRPage />} />
              <Route path="/ferramentas-lc214" element={<FerramentasLC214 />} />
              <Route path="/timeline-reforma" element={<TimelineReforma />} />
              <Route path="/investor" element={<InvestorPresentation />} />
              <Route path="/limpa-nome" element={<LimpaNomeLanding />} />
              <Route path="/limpa-nome/checkout" element={<LimpaNomePage />} />
              <Route path="/limpa-nome/onboarding" element={<LimpaNomeOnboarding />} />
              <Route path="/abertura-empresa" element={<AberturaEmpresa />} />
              <Route path="/modulo-fiscal" element={<ModuloFiscalLanding />} />
              <Route path="/modulo-fiscal/checkout" element={<ModuloFiscal />} />
              <Route path="/modulo-fiscal/sucesso" element={<FiscalSuccessPage />} />
              <Route path="/parceiro/onboarding" element={<PartnerOnboarding />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/parceiro/login" element={<PartnerLogin />} />
              <Route path="/partner/invite/:token" element={<PartnerInvite />} />
              <Route path="/test-login" element={<TestLogin />} />
              {/* Affiliate routes */}
              <Route path="/afiliado/cadastro" element={<AffiliateOnboarding />} />
              <Route path="/afiliado/oferta/:affiliateCode" element={<AffiliateOfferPage />} />
              <Route path="/afiliado/:affiliateCode" element={<AffiliateLandingPremium />} />
              <Route path="/afiliado/:affiliateCode/:serviceSlug" element={<AffiliateLandingPremium />} />
              <Route path="/p/:affiliateCode" element={<AffiliateLandingPremium />} />
              <Route path="/p/:affiliateCode/fiscal" element={<AffiliateFiscalLanding />} />
              <Route path="/p/:affiliateCode/limpa-nome" element={<AffiliateLimpaNomeLanding />} />
              <Route path="/documentos-fiscais" element={<FiscalDocumentsPage />} />
              <Route path="/afiliado/painel" element={
                <AffiliateProtectedRoute>
                  <AffiliatePanel />
                </AffiliateProtectedRoute>
              } />
              <Route path="/qa-dashboard" element={
                <ProtectedRoute>
                  <QADashboard />
                </ProtectedRoute>
              } />
              <Route path="/parceiro" element={
                <PartnerProtectedRoute>
                  <PartnerPanel />
                </PartnerProtectedRoute>
              } />
              <Route path="/limpa-nome/status/:id" element={
                <ProtectedRoute>
                  <LimpaNomeStatusPage />
                </ProtectedRoute>
              } />
              <Route path="/minhas-solicitacoes" element={
                <ProtectedRoute>
                  <MinhasSolicitacoesPage />
                </ProtectedRoute>
              } />
              {/* Protected routes - require authentication */}
              <Route path="/bem-vindo" element={
                <ProtectedRoute>
                  <WelcomePage />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              <Route path="/selecionar-perfil" element={
                <ProtectedRoute>
                  <ProfileSelector />
                </ProtectedRoute>
              } />
              <Route path="/empresa" element={
                <RoleProtectedRoute requiredRole="user">
                  <EmpresaPanel />
                </RoleProtectedRoute>
              } />
              <Route path="/perfil" element={
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
              
              {/* Role-based protected routes */}
              <Route path="/autonomo" element={
                <RoleProtectedRoute requiredRole="autonomo">
                  <AutonomoPanel />
                </RoleProtectedRoute>
              } />
              <Route path="/autonomo/onboarding" element={
                <RoleProtectedRoute requiredRole="autonomo">
                  <AutonomoOnboarding />
                </RoleProtectedRoute>
              } />
              <Route path="/contador" element={
                <RoleProtectedRoute requiredRole="contador">
                  <ContadorPanel />
                </RoleProtectedRoute>
              } />
              <Route path="/contador/onboarding" element={
                <RoleProtectedRoute requiredRole="contador">
                  <ContadorOnboarding />
                </RoleProtectedRoute>
              } />
              <Route path="/admin" element={
                <RoleProtectedRoute requiredRole="admin">
                  <AdminPanel />
                </RoleProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <RoleProtectedRoute requiredRole="admin">
                  <RoleManagement />
                </RoleProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <RoleProtectedRoute requiredRole="admin">
                  <AdminReports />
                </RoleProtectedRoute>
              } />
              <Route path="/admin/metrics" element={
                <RoleProtectedRoute requiredRole="admin">
                  <MetricsDashboard />
                </RoleProtectedRoute>
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
            </AnimatedRoutes>
          </div>
          <BottomNavigation />
          <QaModeIndicator />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
