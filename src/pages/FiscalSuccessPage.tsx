import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  PartyPopper, 
  FileText, 
  Clock, 
  MessageSquare, 
  FileCheck, 
  ArrowRight,
  Home,
  Search
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function FiscalSuccessPage() {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      icon: Search,
      title: 'Análise em andamento',
      description: 'Nossa equipe de especialistas já está analisando sua guia fiscal.',
      time: '24-48h úteis'
    },
    {
      icon: MessageSquare,
      title: 'Contato via WhatsApp',
      description: 'Entraremos em contato para informar o resultado e próximos passos.',
    },
    {
      icon: FileCheck,
      title: 'Relatório detalhado',
      description: 'Você receberá um relatório completo com todas as oportunidades identificadas.',
    }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated confetti-like decorations */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                left: `${10 + (i * 8)}%`,
                backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'][i % 4],
              }}
              initial={{ top: -20, opacity: 1 }}
              animate={{ 
                top: '100%', 
                opacity: 0,
                rotate: 360 * (i % 2 === 0 ? 1 : -1)
              }}
              transition={{ 
                duration: 2 + (i * 0.2), 
                ease: 'easeIn',
                delay: i * 0.1
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />

      <div className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
        {/* Success Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          >
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </motion.div>
          
          <div className="flex items-center justify-center gap-3 mb-3">
            <PartyPopper className="h-7 w-7 text-accent" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Solicitação Enviada!
            </h1>
            <PartyPopper className="h-7 w-7 text-accent scale-x-[-1]" />
          </div>
          
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Sua análise fiscal foi recebida com sucesso. Em breve você receberá o resultado.
          </p>
        </motion.div>

        {/* Service Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-8 overflow-hidden border-2 border-primary/20">
            <div className="h-2 bg-gradient-to-r from-primary to-accent" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary to-accent">
                    <FileText className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Módulo Fiscal Inteligente</CardTitle>
                    <CardDescription>Análise de recuperação tributária</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-500 text-white">Recebido</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Separator className="my-4" />

              {/* Next Steps */}
              <div>
                <p className="text-sm font-semibold text-foreground mb-4">Próximos passos:</p>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-start gap-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.5 + (index * 0.1) }}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">{step.title}</p>
                          {step.time && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {step.time}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {step.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Info Box */}
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 <strong>Dica:</strong> Fique atento ao seu WhatsApp e email. 
                  Nossa equipe entrará em contato em breve com o resultado da análise.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <Home className="h-4 w-4" />
            Voltar ao início
          </Button>
          <Button 
            onClick={() => navigate('/modulo-fiscal')}
            size="lg"
            className="gap-2"
          >
            Nova análise
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>

        {/* Footer Text */}
        <motion.p 
          className="text-center text-sm text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          Dúvidas? Entre em contato pelo WhatsApp ou email.
        </motion.p>
      </div>
    </div>
  );
}
