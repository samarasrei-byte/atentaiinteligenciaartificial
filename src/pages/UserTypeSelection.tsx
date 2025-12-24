import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Calculator, Briefcase, ArrowLeft } from 'lucide-react';

type UserType = 'empresa' | 'autonomo' | 'contador';

interface UserTypeOption {
  type: UserType;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
}

const userTypeOptions: UserTypeOption[] = [
  {
    type: 'empresa',
    title: 'Empresa',
    description: 'Possuo ou estou abrindo uma empresa (MEI, ME, LTDA, etc.)',
    icon: <Building2 className="h-8 w-8" />,
    route: '/onboarding',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    type: 'autonomo',
    title: 'Autônomo',
    description: 'Trabalho como profissional autônomo ou liberal',
    icon: <Briefcase className="h-8 w-8" />,
    route: '/autonomo-onboarding',
    color: 'from-purple-500 to-pink-500',
  },
  {
    type: 'contador',
    title: 'Contador',
    description: 'Sou contador e quero oferecer meus serviços na plataforma',
    icon: <Calculator className="h-8 w-8" />,
    route: '/contador-onboarding',
    color: 'from-teal-500 to-emerald-500',
  },
];

const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleSelectType = (option: UserTypeOption) => {
    // Store selected type for later use in auth flow
    sessionStorage.setItem('selectedUserType', option.type);
    navigate(option.route);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <img 
            src="/logo-atentai.png" 
            alt="AtentAI" 
            className="h-16 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo ao AtentAI
          </h1>
          <p className="text-slate-400 text-lg">
            Selecione seu perfil para começar
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {userTypeOptions.map((option) => (
            <Card 
              key={option.type}
              className="bg-slate-800/50 border-slate-700 backdrop-blur-sm hover:border-slate-500 transition-all cursor-pointer group"
              onClick={() => handleSelectType(option)}
            >
              <CardHeader className="text-center pb-2">
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${option.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                  {option.icon}
                </div>
                <CardTitle className="text-xl text-white">{option.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-slate-400 mb-4">
                  {option.description}
                </CardDescription>
                <Button 
                  className={`w-full bg-gradient-to-r ${option.color} hover:opacity-90`}
                >
                  Selecionar
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            variant="ghost"
            className="text-slate-400 hover:text-white"
            onClick={() => navigate('/auth')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Já tenho uma conta
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserTypeSelection;
