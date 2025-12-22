import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Carlos Silva",
    role: "Contador - São Paulo",
    content: "O AtentAI revolucionou minha forma de trabalhar com a reforma tributária. A IA entende exatamente o que preciso e me economiza horas de pesquisa.",
    rating: 5,
    avatar: "CS"
  },
  {
    name: "Maria Fernanda",
    role: "CFO - Indústria",
    content: "O simulador de impacto tributário é fantástico! Consegui projetar os custos da minha empresa para os próximos anos com precisão.",
    rating: 5,
    avatar: "MF"
  },
  {
    name: "Roberto Almeida",
    role: "Empresário - Varejo",
    content: "Finalmente uma ferramenta que explica a reforma tributária de forma clara. O suporte é excelente e a IA está sempre atualizada.",
    rating: 5,
    avatar: "RA"
  },
  {
    name: "Ana Paula",
    role: "Advogada Tributarista",
    content: "Uso o AtentAI diariamente para tirar dúvidas dos meus clientes. A precisão das informações e a velocidade das respostas são impressionantes.",
    rating: 5,
    avatar: "AP"
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
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
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
