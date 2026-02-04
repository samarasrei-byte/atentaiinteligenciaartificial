-- PARTE 1: Adicionar nova role 'equipe_guilherme' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'equipe_guilherme';