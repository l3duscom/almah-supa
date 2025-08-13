-- Seeder: Insert pricing plans data
-- Created: 2025-01-13

-- Insert Premium pricing plans with different billing periods
INSERT INTO public.pricing_plans (
  name,
  description,
  stripe_price_id,
  stripe_product_id,
  billing_period,
  price_cents,
  currency,
  sort_order,
  features
) VALUES 
-- Monthly Premium
(
  'Premium Mensal',
  'Acesso completo aos recursos premium',
  'price_premium_monthly_placeholder', -- Substitua pelo Price ID real do Stripe
  'prod_premium', -- Product ID unificado para todos os planos Premium
  'monthly',
  1990, -- R$ 19,90
  'brl',
  1,
  '["Grupos ilimitados", "Participantes ilimitados", "Histórico completo", "Suporte prioritário", "Temas personalizados"]'
),
-- Semiannual Premium (6 months)
(
  'Premium Semestral',
  'Acesso completo aos recursos premium - 6 meses',
  'price_premium_semiannual_placeholder', -- Substitua pelo Price ID real do Stripe
  'prod_premium', -- Product ID unificado para todos os planos Premium
  'semiannual',
  9540, -- R$ 95,40 (20% desconto)
  'brl',
  2,
  '["Grupos ilimitados", "Participantes ilimitados", "Histórico completo", "Suporte prioritário", "Temas personalizados", "20% de desconto"]'
),
-- Annual Premium (12 months)
(
  'Premium Anual',
  'Acesso completo aos recursos premium - 12 meses',
  'price_premium_annual_placeholder', -- Substitua pelo Price ID real do Stripe
  'prod_premium', -- Product ID unificado para todos os planos Premium
  'annual',
  14328, -- R$ 143,28 (40% desconto)
  'brl',
  3,
  '["Grupos ilimitados", "Participantes ilimitados", "Histórico completo", "Suporte prioritário", "Temas personalizados", "40% de desconto", "4+ meses grátis"]'
)
ON CONFLICT (stripe_price_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  billing_period = EXCLUDED.billing_period,
  price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order,
  features = EXCLUDED.features,
  updated_at = NOW();