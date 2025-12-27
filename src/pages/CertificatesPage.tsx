import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import CertificateRequestForm from '@/components/certificates/CertificateRequestForm';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, Clock, Shield } from 'lucide-react';

const CertificatesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const benefits = [
    {
      icon: CheckCircle,
      title: 'Contador Especializado',
      description: 'Emissão por profissional com CRC ativo e verificado'
    },
    {
      icon: Clock,
      title: 'Prazo Garantido',
      description: 'Entrega dentro do prazo estimado ou devolução do valor'
    },
    {
      icon: Shield,
      title: 'Documento Oficial',
      description: 'Certidão com validade legal e código de verificação'
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header onNavigate={() => navigate('/')} />
      
      <main className="flex-1 container mx-auto px-4 py-8 pt-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/60">
            <FileText className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Emissão de Certidões</h1>
            <p className="text-muted-foreground">
              Solicite certidões fiscais com emissão por contadores especializados
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <CertificateRequestForm onSuccess={() => navigate('/dashboard')} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Por que escolher a AtentAI?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <benefit.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{benefit.title}</p>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Preço único</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-primary">R$ 100</span>
                    <span className="text-muted-foreground">/certidão</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Inclui emissão e verificação
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dúvidas Frequentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-foreground text-sm">
                    Quanto tempo leva para receber?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    O prazo varia de 1 a 7 dias úteis, dependendo do tipo de certidão.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    A certidão tem validade legal?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Sim, todas as certidões são oficiais e verificáveis nos órgãos emissores.
                  </p>
                </div>
                <div>
                  <p className="font-medium text-foreground text-sm">
                    E se a empresa tiver pendências?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    O contador entrará em contato para orientar sobre a regularização.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer onNavigate={() => navigate('/')} />
    </div>
  );
};

export default CertificatesPage;
