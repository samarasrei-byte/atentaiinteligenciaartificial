import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConsultationRatingProps {
  consultationId: string;
  currentRating: number | null;
  onRatingSubmitted: (rating: number, reviewText: string) => void;
}

export function ConsultationRating({ 
  consultationId, 
  currentRating,
  onRatingSubmitted 
}: ConsultationRatingProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(!!currentRating);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Selecione uma avaliação',
        description: 'Por favor, escolha de 1 a 5 estrelas.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    const { error } = await supabase
      .from('consultations')
      .update({
        rating,
        review_text: reviewText || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', consultationId);

    if (error) {
      toast({
        title: 'Erro ao enviar avaliação',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      title: 'Avaliação enviada!',
      description: 'Obrigado pelo seu feedback.',
    });
    
    setHasSubmitted(true);
    setIsSubmitting(false);
    onRatingSubmitted(rating, reviewText);
  };

  if (hasSubmitted) {
    return (
      <Card className="bg-success/5 border-success/20">
        <CardContent className="p-4 text-center">
          <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Avaliação enviada!</p>
          <div className="flex justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-5 w-5 ${
                  star <= rating
                    ? 'text-accent fill-accent'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" />
          Avaliar Consulta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 focus:outline-none"
            >
              <Star
                className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-accent fill-accent'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
        
        <p className="text-center text-sm text-muted-foreground">
          {rating === 0 && 'Clique para avaliar'}
          {rating === 1 && 'Muito ruim'}
          {rating === 2 && 'Ruim'}
          {rating === 3 && 'Regular'}
          {rating === 4 && 'Bom'}
          {rating === 5 && 'Excelente'}
        </p>
        
        <Textarea
          placeholder="Deixe um comentário sobre sua experiência (opcional)"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={3}
          className="resize-none"
        />
        
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Enviando...
            </>
          ) : (
            'Enviar Avaliação'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
