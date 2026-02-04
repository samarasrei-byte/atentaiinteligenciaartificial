import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AI_LIMITS } from '@/lib/stripe';

export function useDailyQuestionLimit() {
  const { user, subscription } = useAuth();
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  // Determine limit based on new plan tiers
  const isPerformance = subscription.subscribed && subscription.plan === 'performance';
  const isControl = subscription.subscribed && subscription.plan === 'control';
  const isClarity = subscription.subscribed && subscription.plan === 'clarity';
  
  const dailyLimit = isPerformance ? AI_LIMITS.performance.dailyQuestions : 
                     isControl ? AI_LIMITS.control.dailyQuestions : 
                     isClarity ? AI_LIMITS.clarity.dailyQuestions : 3;
  const questionsRemaining = Math.max(0, dailyLimit - questionsUsed);
  const canAsk = questionsRemaining > 0 || isPerformance;

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setQuestionsUsed(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_daily_question_count', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error fetching daily usage:', error);
        setQuestionsUsed(0);
      } else {
        setQuestionsUsed(data || 0);
      }
    } catch (error) {
      console.error('Error fetching daily usage:', error);
      setQuestionsUsed(0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const incrementUsage = useCallback(async () => {
    if (!user || isPerformance) return true;

    try {
      const { data, error } = await supabase.rpc('increment_daily_questions', {
        p_user_id: user.id,
      });

      if (error) {
        console.error('Error incrementing usage:', error);
        return false;
      }

      setQuestionsUsed(data || questionsUsed + 1);
      return true;
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return false;
    }
  }, [user, isPerformance, questionsUsed]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    questionsUsed,
    questionsRemaining,
    canAsk,
    isPremium: isControl || isPerformance,
    isContador: isPerformance,
    loading,
    incrementUsage,
    refreshUsage: fetchUsage,
    limit: dailyLimit,
  };
}
