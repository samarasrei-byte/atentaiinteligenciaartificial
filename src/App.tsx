import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { MPCheckoutProvider } from "@/contexts/MPCheckoutContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { AffiliateProtectedRoute } from "@/components/AffiliateProtectedRoute";
import { OfflineIndicator } from "@/components/pwa/OfflineIndicator";
import { AnimatedRoutes } from "@/components/layout/AnimatedRoutes";
import { ScrollToTop } from "@/components/ScrollToTop";
import { BottomNavigation } from "@/components/pwa/BottomNavigation";
import QaModeIndicator from "@/components/qa/QaModeIndicator";
import { lazy, Suspense } from "react";

// Only eagerly load the landing page — everything else is lazy
import Index from "./pages/Index";

// Global loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm animate-pulse">Carregando...</p>
    </div>
  </div>
);

// Lazy load ALL other pages
const Auth = lazy(() => import("./pages/Auth"));
const DashboardRouter = lazy(() => import("./pages/DashboardRouter"));
const ProfileSelector = lazy(() => import("./pages/ProfileSelector"));
const EmpresaPanel = lazy(() => import("./pages/EmpresaPanel"));
const AutonomoPanel = lazy(() => import("./pages/AutonomoPanel"));
const ContadorPanel = lazy(() => import("./pages/ContadorPanel"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminLoginNew = lazy(() => import("./pages/AdminLoginNew"));
const Profile = lazy(() => import("./pages/Profile"));
const Simulator = lazy(() => import("./pages/Simulator"));
const TransitionSimulator = lazy(() => import("./pages/TransitionSimulator"));
const Contadores = lazy(() => import("./pages/Contadores"));
const ContadoresPublic = lazy(() => import("./pages/ContadoresPublic"));
const Pricing = lazy(() => import("./pages/Pricing"));
const AIChat = lazy(() => import("./pages/AIChat"));
const FAQ = lazy(() => import("./pages/FAQ"));
const NotFound = lazy(() => import("./pages/NotFound"));
const PoliticaPrivacidade = lazy(() => import("./pages/PoliticaPrivacidade"));
const TermosDeUso = lazy(() => import("./pages/TermosDeUso"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const ConsultationHistory = lazy(() => import("./pages/ConsultationHistory"));
const ConsultationChatPage = lazy(() => import("./pages/ConsultationChatPage"));
const AberturaEmpresa = lazy(() => import("./pages/AberturaEmpresa"));
const AutonomoOnboarding = lazy(() => import("./pages/AutonomoOnboarding"));
const ContadorOnboarding = lazy(() => import("./pages/ContadorOnboarding"));
const LocacaoSimulator = lazy(() => import("./pages/LocacaoSimulator"));
const RegimeComparator = lazy(() => import("./pages/RegimeComparator"));
const LimpaNomePage = lazy(() => import("./pages/LimpaNomePage"));
const LimpaNomeStatusPage = lazy(() => import("./pages/LimpaNomeStatusPage"));
const CertificatesPage = lazy(() => import("./pages/CertificatesPage"));
const IRPage = lazy(() => import("./pages/IRPage"));
const QADashboard = lazy(() => import("./pages/QADashboard"));
const ServicosPage = lazy(() => import("./pages/ServicosPage"));
const FiscalDocumentsPage = lazy(() => import("./pages/FiscalDocumentsPage"));
const FiscalSuccessPage = lazy(() => import("./pages/FiscalSuccessPage"));
const ModuloFiscal = lazy(() => import("./pages/ModuloFiscal"));
const TimelineReforma = lazy(() => import("./pages/TimelineReforma"));
const TransicaoTributaria = lazy(() => import("./pages/TransicaoTributaria"));
const FerramentasLC214 = lazy(() => import("./pages/FerramentasLC214"));
const PlanoSimulador = lazy(() => import("./pages/PlanoSimulador"));
const PlanoAutonomo = lazy(() => import("./pages/PlanoAutonomo"));
const PlanoAtenteAi = lazy(() => import("./pages/PlanoAtenteAi"));
const PlanosPorPerfil = lazy(() => import("./pages/PlanosPorPerfil"));
const PlanComparison = lazy(() => import("./pages/PlanComparison"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const MetricsDashboard = lazy(() => import("./pages/MetricsDashboard"));
const InvestorPresentation = lazy(() => import("./pages/InvestorPresentation"));
const TrialOnboarding = lazy(() => import("./pages/TrialOnboarding"));
const TrialSuccess = lazy(() => import("./pages/TrialSuccess"));
const WelcomePage = lazy(() => import("./pages/WelcomePage"));
const UserTypeSelection = lazy(() => import("./pages/UserTypeSelection"));
const AffiliatePanel = lazy(() => import("./pages/AffiliatePanel"));
const AffiliateLanding = lazy(() => import("./pages/AffiliateLanding"));
const AffiliateLandingPremium = lazy(() => import("./pages/AffiliateLandingPremium"));
const AffiliateFiscalLanding = lazy(() => import("./pages/AffiliateFiscalLanding"));
const AffiliateLimpaNomeLanding = lazy(() => import("./pages/AffiliateLimpaNomeLanding"));
const AffiliateOnboarding = lazy(() => import("./pages/AffiliateOnboarding"));
const AffiliateOnboardingFlow = lazy(() => import("./pages/AffiliateOnboardingFlow"));
const AffiliateOfferPage = lazy(() => import("./pages/AffiliateOfferPage"));
const PartnerInvite = lazy(() => import("./pages/PartnerInvite"));
const PublicOnboarding = lazy(() => import("./pages/PublicOnboarding"));
const UserPanelBI = lazy(() => import("./pages/UserPanelBI"));
const LimpaNomeOnboarding = lazy(() => import("./pages/LimpaNomeOnboarding"));
const LimpaNomeLanding = lazy(() => import("./pages/LimpaNomeLanding"));
const ModuloFiscalLanding = lazy(() => import("./pages/ModuloFiscalLanding"));
const FiscalAnalysisOnboarding = lazy(() => import("./pages/FiscalAnalysisOnboarding"));
const TestLogin = lazy(() => import("./pages/TestLogin"));
const PartnerGuilhermePage = lazy(() => import("./pages/PartnerGuilhermePage"));
const PartnerGuilhermePanel = lazy(() => import("./pages/PartnerGuilhermePanel"));
const MarketplaceServicePage = lazy(() => import("./pages/MarketplaceServicePage"));
const SobrePage = lazy(() => import("./pages/SobrePage"));
const SuportePage = lazy(() => import("./pages/SuportePage"));
const BIContabilidadeLanding = lazy(() => import("./pages/BIContabilidadeLanding"));
const BIContabilidadeOnboarding = lazy(() => import("./pages/BIContabilidadeOnboarding"));
const CesarBILanding = lazy(() => import("./pages/CesarBILanding"));
const ChatGuilherme = lazy(() => import("./pages/ChatGuilherme"));
const ChatCesar = lazy(() => import("./pages/ChatCesar"));
const LimpaNomePaymentSuccess = lazy(() => import("./pages/LimpaNomePaymentSuccess"));
const LimpaNomeDataCollection = lazy(() => import("./pages/LimpaNomeDataCollection"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const CheckoutSuccessPage = lazy(() => import("./pages/CheckoutSuccessPage"));
const LimpaNomeColaborador = lazy(() => import("./pages/LimpaNomeColaborador"));
const SalesPresentation = lazy(() => import("./pages/SalesPresentation"));
const AdminPresentations = lazy(() => import("./pages/AdminPresentations"));
const SeracPresentation = lazy(() => import("./pages/SeracPresentation"));

// SERAC White Label - lazy loaded
const SeracLayout = lazy(() => import("./pages/serac/SeracLayout"));
const SeracDashboard = lazy(() => import("./pages/serac/SeracDashboard"));
const SeracReformaTributaria = lazy(() => import("./pages/serac/SeracReformaTributaria"));
const SeracInteligenciaFiscal = lazy(() => import("./pages/serac/SeracInteligenciaFiscal"));
const SeracClientes = lazy(() => import("./pages/serac/SeracClientes"));
const SeracCompliance = lazy(() => import("./pages/serac/SeracCompliance"));
const SeracAgentesIA = lazy(() => import("./pages/serac/SeracAgentesIA"));
const SeracProspeccao = lazy(() => import("./pages/serac/SeracProspeccao"));
const SeracJuridico = lazy(() => import("./pages/serac/SeracJuridico"));
const SeracRelatorios = lazy(() => import("./pages/serac/SeracRelatorios"));
const SeracConfiguracoes = lazy(() => import("./pages/serac/SeracConfiguracoes"));
const SeracLogin = lazy(() => import("./pages/serac/SeracLogin"));
const SeracProtectedRoute = lazy(() => import("./pages/serac/SeracProtectedRoute"));
const SeracCampanhas = lazy(() => import("./pages/serac/SeracCampanhas"));
const SeracMarketplace = lazy(() => import("./pages/serac/SeracMarketplace"));
const SeracCRM = lazy(() => import("./pages/serac/SeracCRM"));
const SeracAPIHub = lazy(() => import("./pages/serac/SeracAPIHub"));
const SeracFolhaCartorio = lazy(() => import("./pages/serac/SeracFolhaCartorio"));
const SeracMentorias = lazy(() => import("./pages/serac/SeracMentorias"));
const SeracDefesasDoc = lazy(() => import("./pages/serac/SeracDefesasDoc"));

// Tentaí - Fintech SaaS
const EmissaoNFLanding = lazy(() => import("./pages/EmissaoNFLanding"));
const EmissaoNFDashboard = lazy(() => import("./pages/EmissaoNFDashboard"));

// Capassi - lazy loaded
const CapassiGuardLazy = lazy(() => import("./components/capassi/CapassiGuard").then(m => ({ default: m.CapassiGuard })));
const CapassiLayoutLazy = lazy(() => import("./components/capassi/CapassiLayout").then(m => ({ default: m.CapassiLayout })));
const CapassiDashboard = lazy(() => import("./pages/capassi/CapassiDashboard"));
const CapassiTransactions = lazy(() => import("./pages/capassi/CapassiTransactions"));
const CapassiClients = lazy(() => import("./pages/capassi/CapassiClients"));
const CapassiAlerts = lazy(() => import("./pages/capassi/CapassiAlerts"));
const CapassiDRE = lazy(() => import("./pages/capassi/CapassiDRE"));
const CapassiCashflow = lazy(() => import("./pages/capassi/CapassiCashflow"));
const CapassiChat = lazy(() => import("./pages/capassi/CapassiChat"));
const CapassiAudit = lazy(() => import("./pages/capassi/CapassiAudit"));
const CapassiMetrics = lazy(() => import("./pages/capassi/CapassiMetrics"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 min cache
      gcTime: 10 * 60 * 1000, // 10 min gc
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
        <MPCheckoutProvider>
          <ScrollToTop />
          <Toaster />
          <Sonner />
          <OfflineIndicator />
          <div className="pb-20 md:pb-0 min-h-screen">
            <AnimatedRoutes>
              <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sobre" element={<SobrePage />} />
              <Route path="/suporte" element={<SuportePage />} />
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
              <Route path="/checkout/:serviceSlug" element={<CheckoutPage />} />
              <Route path="/checkout/sucesso" element={<CheckoutSuccessPage />} />
              <Route path="/marketplace/:serviceSlug" element={<MarketplaceServicePage />} />
              <Route path="/parceiroguilherme" element={<PartnerGuilhermePage />} />
              <Route path="/parceiroatentaigb" element={<PartnerGuilhermePanel />} />
              <Route path="/ir" element={<IRPage />} />
              <Route path="/ferramentas-lc214" element={<FerramentasLC214 />} />
              <Route path="/timeline-reforma" element={<TimelineReforma />} />
              <Route path="/investor" element={<InvestorPresentation />} />
              <Route path="/limpa-nome" element={<LimpaNomeLanding />} />
              <Route path="/limpa-nome/checkout" element={<LimpaNomePage />} />
              <Route path="/limpa-nome/onboarding" element={<LimpaNomeOnboarding />} />
              <Route path="/limpa-nome/sucesso" element={<LimpaNomePaymentSuccess />} />
              <Route path="/limpa-nome/dados" element={<LimpaNomeDataCollection />} />
              <Route path="/abertura-empresa" element={<AberturaEmpresa />} />
              <Route path="/modulo-fiscal" element={<ModuloFiscalLanding />} />
              <Route path="/modulo-fiscal/checkout" element={<ModuloFiscal />} />
              <Route path="/modulo-fiscal/onboarding" element={<FiscalAnalysisOnboarding />} />
              <Route path="/modulo-fiscal/sucesso" element={<FiscalSuccessPage />} />
              <Route path="/bi-contabilidade" element={<BIContabilidadeLanding />} />
              <Route path="/bi-contabilidade/onboarding" element={<BIContabilidadeOnboarding />} />
              <Route path="/bi-contabilidade/cesar" element={<CesarBILanding />} />
              <Route path="/admin/login" element={<AdminLoginNew />} />
              <Route path="/apresentacao/serac" element={<SeracPresentation />} />
              <Route path="/serac/defesas" element={<SeracDefesasDoc />} />
              <Route path="/apresentação/serac" element={<Navigate to="/apresentacao/serac" replace />} />
              <Route path="/apresentacao/:slug" element={<SalesPresentation />} />
              <Route path="/partner/invite/:token" element={<PartnerInvite />} />
              <Route path="/test-login" element={<TestLogin />} />
              {/* Emissão de NF routes */}
              <Route path="/emissao-nf" element={<EmissaoNFLanding />} />
              <Route path="/emissao-nf/dashboard" element={
                <ProtectedRoute>
                  <EmissaoNFDashboard />
                </ProtectedRoute>
              } />
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
              <Route path="/limpa-nome/status/:id" element={
                <ProtectedRoute>
                  <LimpaNomeStatusPage />
                </ProtectedRoute>
              } />
              <Route path="/minhas-solicitacoes" element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              } />
              <Route path="/meu-painel" element={
                <ProtectedRoute>
                  <UserPanelBI />
                </ProtectedRoute>
              } />
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
              <Route path="/simulator" element={
                <ProtectedRoute requiredPlan="simulator">
                  <Simulator />
                </ProtectedRoute>
              } />
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
              <Route path="/admin/apresentacoes" element={
                <RoleProtectedRoute requiredRole="admin">
                  <AdminPresentations />
                </RoleProtectedRoute>
              } />
              <Route path="/colaborador/limpa-nome" element={
                <RoleProtectedRoute requiredRole="equipe_guilherme">
                  <LimpaNomeColaborador />
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
              <Route path="/chat/guilherme" element={
                <ProtectedRoute>
                  <ChatGuilherme />
                </ProtectedRoute>
              } />
              <Route path="/chat/cesar" element={
                <ProtectedRoute>
                  <ChatCesar />
                </ProtectedRoute>
              } />
              
              {/* Capassi Panel - Exclusive for César */}
              <Route path="/capassi" element={
                <CapassiGuardLazy>
                  <CapassiLayoutLazy />
                </CapassiGuardLazy>
              }>
                <Route index element={<CapassiDashboard />} />
                <Route path="transactions" element={<CapassiTransactions />} />
                <Route path="clients" element={<CapassiClients />} />
                <Route path="alerts" element={<CapassiAlerts />} />
                <Route path="dre" element={<CapassiDRE />} />
                <Route path="cashflow" element={<CapassiCashflow />} />
                <Route path="chat" element={<CapassiChat />} />
                <Route path="audit" element={<CapassiAudit />} />
                <Route path="metrics" element={<CapassiMetrics />} />
              </Route>

              {/* SERAC White Label Platform */}
              <Route path="/serac/login" element={<SeracLogin />} />
              <Route path="/serac" element={<SeracProtectedRoute />}>
                <Route element={<SeracLayout />}>
                  <Route index element={<SeracDashboard />} />
                  <Route path="campanhas" element={<SeracCampanhas />} />
                  <Route path="marketplace" element={<SeracMarketplace />} />
                  <Route path="crm" element={<SeracCRM />} />
                  <Route path="api-hub" element={<SeracAPIHub />} />
                  <Route path="folha-cartorio" element={<SeracFolhaCartorio />} />
                  <Route path="mentorias" element={<SeracMentorias />} />
                  <Route path="reforma-tributaria" element={<SeracReformaTributaria />} />
                  <Route path="inteligencia-fiscal" element={<SeracInteligenciaFiscal />} />
                  <Route path="clientes" element={<SeracClientes />} />
                  <Route path="compliance" element={<SeracCompliance />} />
                  <Route path="agentes-ia" element={<SeracAgentesIA />} />
                  <Route path="prospeccao" element={<SeracProspeccao />} />
                  <Route path="juridico" element={<SeracJuridico />} />
                  <Route path="relatorios" element={<SeracRelatorios />} />
                  <Route path="configuracoes" element={<SeracConfiguracoes />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </AnimatedRoutes>
          </div>
          <BottomNavigation />
          <QaModeIndicator />
        </MPCheckoutProvider>
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
