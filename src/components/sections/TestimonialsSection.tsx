import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Contador - São Paulo",
    content: "O AtentAI revolucionou minha forma de trabalhar com a reforma tributária. A IA entende exatamente o que preciso e me economiza horas de pesquisa.",
    rating: 5,
    avatar: "CS",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Maria Fernanda",
    role: "CFO - Indústria",
    content: "O simulador de impacto tributário é fantástico! Consegui projetar os custos da minha empresa para os próximos anos com precisão.",
    rating: 5,
    avatar: "MF",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Roberto Almeida",
    role: "Empresário - Varejo",
    content: "Finalmente uma ferramenta que explica a reforma tributária de forma clara. O suporte é excelente e a IA está sempre atualizada.",
    rating: 5,
    avatar: "RA",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Ana Paula",
    role: "Advogada Tributarista",
    content: "Uso o AtentAI diariamente para tirar dúvidas dos meus clientes. A precisão das informações e a velocidade das respostas são impressionantes.",
    rating: 5,
    avatar: "AP",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Fernando Costa",
    role: "Diretor Financeiro - Tech",
    content: "A transição para o novo sistema tributário parecia complexa, mas com o AtentAI conseguimos planejar tudo com antecedência e segurança.",
    rating: 5,
    avatar: "FC",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Juliana Santos",
    role: "Contadora - Escritório",
    content: "Meus clientes ficam impressionados com a rapidez das análises. O AtentAI se tornou indispensável no meu dia a dia profissional.",
    rating: 5,
    avatar: "JS",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Pedro Henrique",
    role: "CEO - Startup",
    content: "Excelente custo-benefício. A clareza nas explicações da reforma tributária nos ajudou a tomar decisões estratégicas importantes.",
    rating: 5,
    avatar: "PH",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
  },
  {
    name: "Camila Rodrigues",
    role: "Gerente Fiscal - Indústria",
    content: "A base de conhecimento é muito completa e sempre atualizada. Recomendo para qualquer profissional da área tributária.",
    rating: 5,
    avatar: "CR",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face"
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-primary/30 text-primary">
            Depoimentos
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            O que dizem nossos clientes
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Veja como o AtentAI está ajudando profissionais a dominar a reforma tributária
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="bg-card border-border hover:shadow-lg transition-all hover:scale-[1.02] relative overflow-hidden"
            >
              <CardContent className="pt-6">
                <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10" />
                
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                
                <p className="text-muted-foreground text-sm mb-6 line-clamp-4">
                  "{testimonial.content}"
                </p>
                
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage src={testimonial.image} alt={testimonial.name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-white font-semibold">
                      {testimonial.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
