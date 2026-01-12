import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Link2, 
  Copy, 
  Check, 
  MessageCircle, 
  Instagram, 
  Mail, 
  BarChart3,
  ArrowRight,
  QrCode,
  Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AffiliateOnboardingPremiumProps {
  affiliateCode: string;
  onComplete: () => void;
}

const AffiliateOnboardingPremium = ({ affiliateCode, onComplete }: AffiliateOnboardingPremiumProps) => {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const [counter, setCounter] = useState(0);
  const navigate = useNavigate();

  const affiliateLink = `${window.location.origin}/p/${affiliateCode}`;

  // Animated counter for R$ 89 million
  useEffect(() => {
    if (step === 0) {
      const target = 89000000;
      const duration = 2000;
      const steps = 60;
      const increment = target / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          setCounter(target);
          clearInterval(timer);
        } else {
          setCounter(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(timer);
    }
  }, [step]);

  const copyLink = () => {
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    toast.success('Link copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const copyWhatsAppMessage = () => {
    const message = `🚀 Olá! Descobri uma forma incrível de recuperar dinheiro para empresas e limpar restrições no CNPJ.

✅ Mais de R$ 89 milhões já foram recuperados
✅ Análise 100% gratuita
✅ Atendimento premium

Clique aqui e faça sua análise agora:
${affiliateLink}`;
    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada para WhatsApp!');
  };

  const copyInstagramBio = () => {
    const bio = `🔥 Ajudo empresas a recuperar dinheiro
💰 +R$89M já devolvidos
👇 Faça sua análise gratuita
${affiliateLink}`;
    navigator.clipboard.writeText(bio);
    toast.success('Texto copiado para Instagram!');
  };

  const copyEmailScript = () => {
    const email = `Assunto: Sua empresa pode estar perdendo dinheiro sem saber

Olá,

Você sabia que muitas empresas brasileiras pagam impostos a mais ou têm créditos fiscais que nunca foram recuperados?

Descobri uma plataforma que já devolveu mais de R$ 89 milhões para empresários em todo o Brasil.

A análise é 100% gratuita e você só paga se tiver resultado.

Clique aqui para fazer sua análise: ${affiliateLink}

Abraços`;
    navigator.clipboard.writeText(email);
    toast.success('Script de e-mail copiado!');
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete();
      navigate('/afiliado');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {/* Tela 1 - Boas-Vindas */}
        {step === 0 && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center"
            >
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl font-bold tracking-tight"
              >
                Bem-vindo ao Programa de Afiliados
                <span className="text-primary"> Atentai</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-muted-foreground"
              >
                Agora você pode lucrar indicando serviços premium que transformam empresas.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-8"
            >
              <p className="text-sm text-muted-foreground mb-2">Já recuperamos para empresas brasileiras</p>
              <p className="text-5xl md:text-6xl font-bold text-primary">
                {formatCurrency(counter)}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button size="xl" onClick={nextStep} className="gap-2">
                Continuar
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Tela 2 - Link Exclusivo */}
        {step === 1 && (
          <motion.div
            key="link"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center"
            >
              <Link2 className="h-10 w-10 text-white" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                Seu Link Exclusivo
              </h1>
              <p className="text-lg text-muted-foreground">
                Este é o link que você vai divulgar. Todo cliente que entrar por ele será automaticamente marcado como seu.
              </p>
            </div>

            <Card className="p-6 space-y-4">
              <div className="flex items-center gap-3 bg-muted rounded-xl p-4">
                <input
                  type="text"
                  value={affiliateLink}
                  readOnly
                  className="flex-1 bg-transparent text-sm font-mono outline-none"
                />
                <Button
                  variant={copied ? "success" : "default"}
                  size="sm"
                  onClick={copyLink}
                  className="gap-2"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <div className="w-32 h-32 bg-muted rounded-xl flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-muted-foreground" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                QR Code do seu link exclusivo
              </p>
            </Card>

            <Button size="xl" onClick={nextStep} className="gap-2">
              Continuar
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* Tela 3 - Como Divulgar */}
        {step === 2 && (
          <motion.div
            key="share"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl w-full text-center space-y-8"
          >
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                Como Divulgar e Ganhar
              </h1>
              <p className="text-lg text-muted-foreground">
                Quanto mais clientes você indicar, maior será sua comissão.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card 
                  className="p-6 text-left hover:shadow-lg transition-all cursor-pointer group"
                  onClick={copyWhatsAppMessage}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">
                        Mensagem pronta para copiar e enviar para seus contatos.
                      </p>
                    </div>
                    <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card 
                  className="p-6 text-left hover:shadow-lg transition-all cursor-pointer group"
                  onClick={copyInstagramBio}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-pink-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Instagram className="h-6 w-6 text-pink-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">Instagram</h3>
                      <p className="text-sm text-muted-foreground">
                        Texto curto para bio e DMs.
                      </p>
                    </div>
                    <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card 
                  className="p-6 text-left hover:shadow-lg transition-all cursor-pointer group"
                  onClick={copyEmailScript}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Mail className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">E-mail</h3>
                      <p className="text-sm text-muted-foreground">
                        Script pronto para enviar por e-mail.
                      </p>
                    </div>
                    <Copy className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card className="p-6 text-left bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Comissões</h3>
                      <p className="text-sm text-muted-foreground">
                        Você recebe <span className="text-primary font-bold">90%</span> de cada venda. Acompanhe tudo no painel.
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            <Button size="xl" onClick={nextStep} className="gap-2">
              Continuar
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        )}

        {/* Tela 4 - Acesso ao Painel */}
        {step === 3 && (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary/60 rounded-3xl flex items-center justify-center"
            >
              <Rocket className="h-12 w-12 text-primary-foreground" />
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold">
                Tudo Pronto! 🎉
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Seu painel já está configurado. Lá você acompanha seus leads, vendas, comissões e solicita saques.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Leads', icon: '👥' },
                { label: 'Vendas', icon: '💰' },
                { label: 'Comissões', icon: '📈' },
                { label: 'Saques', icon: '🏦' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <Card className="p-4 text-center">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-sm font-medium mt-2">{item.label}</p>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              <Button size="xl" onClick={nextStep} className="gap-2">
                Acessar Meu Painel
                <ArrowRight className="h-5 w-5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className={`h-2 rounded-full transition-all ${
              i === step ? 'w-8 bg-primary' : 'w-2 bg-muted-foreground/30'
            }`}
            animate={{ scale: i === step ? 1.1 : 1 }}
          />
        ))}
      </div>
    </div>
  );
};

export default AffiliateOnboardingPremium;
