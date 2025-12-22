import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DAILY_QUESTION_LIMIT } from '@/lib/stripe';

export function useDailyQuestionLimit() {
  const { user, subscription } = useAuth();
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [loading, setLoading] = useState(true);

  const isPremium = subscription.subscribed && subscription.plan === 'premium';
  const questionsRemaining = isPremium ? Infinity : Math.max(0, DAILY_QUESTION_LIMIT - questionsUsed);
  const canAsk = isPremium || questionsRemaining > 0;

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
    if (!user || isPremium) return true;

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
  }, [user, isPremium, questionsUsed]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    questionsUsed,
    questionsRemaining,
    canAsk,
    isPremium,
    loading,
    incrementUsage,
    refreshUsage: fetchUsage,
    limit: DAILY_QUESTION_LIMIT,
  };
}
