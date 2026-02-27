import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings, Users, Shield, Bell, Palette } from 'lucide-react';

const perfis = [
  { role: 'Administrador SERAC', desc: 'Acesso total à plataforma', usuarios: 2, cor: '#1B3A5C' },
  { role: 'Sócio', desc: 'Dashboard, relatórios e configurações', usuarios: 3, cor: '#2563EB' },
  { role: 'Contador', desc: 'Clientes, compliance e inteligência fiscal', usuarios: 12, cor: '#059669' },
  { role: 'Analista', desc: 'Clientes e documentos (somente leitura)', usuarios: 8, cor: '#D97706' },
  { role: 'Cliente Final', desc: 'Visualização limitada do próprio perfil', usuarios: 247, cor: '#9CA3AF' },
];

export default function SeracConfiguracoes() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#1B3A5C]">Configurações</h2>
        <p className="text-sm text-[#6B7280] mt-1">Gestão da plataforma e níveis de acesso</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfis de Acesso */}
        <Card className="border-[#E5E7EB]">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
              <Shield className="h-4 w-4" /> Níveis de Acesso
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {perfis.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-[#E5E7EB]">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.cor }} />
                  <div>
                    <p className="text-sm font-medium text-[#1B3A5C]">{p.role}</p>
                    <p className="text-xs text-[#6B7280]">{p.desc}</p>
                  </div>
                </div>
                <Badge variant="secondary" className="text-[10px]">{p.usuarios} usuários</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Configurações Gerais */}
        <div className="space-y-4">
          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
                <Palette className="h-4 w-4" /> Identidade Visual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Nome da Plataforma</label>
                <Input defaultValue="SERAC Intelligence Platform" className="border-[#E5E7EB]" />
              </div>
              <div>
                <label className="text-xs text-[#6B7280] block mb-1">Cor Primária</label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#1B3A5C]" />
                  <Input defaultValue="#1B3A5C" className="border-[#E5E7EB] w-32" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#E5E7EB]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-[#1B3A5C] flex items-center gap-2">
                <Bell className="h-4 w-4" /> Notificações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Alertas de risco fiscal',
                'Novos insights da IA',
                'Prazos de obrigações',
                'Relatórios automáticos',
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#4B5563]">{n}</span>
                  <Switch defaultChecked />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
