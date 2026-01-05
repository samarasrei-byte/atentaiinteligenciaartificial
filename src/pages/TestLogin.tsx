import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { QA_USER_EMAIL } from '@/lib/qaMode';
import { Loader2, Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const TestLogin = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Iniciando login de teste...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performTestLogin = async () => {
      try {
        // Check if already logged in as QA user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email === QA_USER_EMAIL) {
          setMessage('Já logado como QA User!');
          setStatus('success');
          setTimeout(() => navigate('/qa-dashboard'), 1500);
          return;
        }

        // Sign out if logged in as another user
        if (session) {
          setMessage('Deslogando usuário atual...');
          await supabase.auth.signOut();
        }

        setMessage('Realizando login QA...');
        
        // Login with test credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: QA_USER_EMAIL,
          password: 'guigo2208',
        });

        if (signInError) {
          throw signInError;
        }

        setMessage('Login realizado com sucesso!');
        setStatus('success');
        
        // Redirect to QA Dashboard
        setTimeout(() => navigate('/qa-dashboard'), 1500);
        
      } catch (err: any) {
        console.error('Test login error:', err);
        setError(err.message || 'Erro ao realizar login de teste');
        setStatus('error');
      }
    };

    performTestLogin();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">QA Test Login</CardTitle>
          <CardDescription>
            Ambiente de testes isolado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center gap-3 p-4 rounded-lg bg-muted/50">
            {status === 'loading' && (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-muted-foreground">{message}</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-green-600">{message}</span>
              </>
            )}
            {status === 'error' && (
              <>
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-destructive">{error}</span>
              </>
            )}
          </div>

          {status === 'error' && (
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
              >
                Tentar Novamente
              </Button>
              <Button 
                onClick={() => navigate('/auth')} 
                variant="outline"
                className="w-full"
              >
                Login Manual
              </Button>
            </div>
          )}

          <div className="text-center text-xs text-muted-foreground space-y-1">
            <p>Email: {QA_USER_EMAIL}</p>
            <p className="text-amber-600">⚠️ Ambiente exclusivo para testes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestLogin;
