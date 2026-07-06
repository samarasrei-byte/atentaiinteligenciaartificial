import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function ParceiroCartasLogin() {
  const nav = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("parceiro@atentai.com.br");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Idempotently provision the partner account on mount (fire-and-forget, never blocks login)
  useEffect(() => {
    supabase.functions.invoke("provision-carta-partner").catch((e) => {
      console.warn("provision skipped", e);
    });
  }, []);

  // If already logged in as the partner, jump straight to panel
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email?.toLowerCase() === "parceiro@atentai.com.br") {
        nav("/parceiro/cartas", { replace: true });
      }
    });
  }, [nav]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Falha no acesso", description: error.message, variant: "destructive" });
      return;
    }
    nav("/parceiro/cartas", { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Helmet>
        <title>Painel do Parceiro | AtentAI</title>
      </Helmet>
      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle>Painel do Parceiro</CardTitle>
          <CardDescription>Validação de cartas contempladas</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-[11px] text-muted-foreground">
              Acesso restrito. Todos os acessos são auditados.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
