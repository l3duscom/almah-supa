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
  'prod_premium_placeholder', -- Substitua pelo Product ID real do Stripe
  'monthly',
  2990, -- R$ 29,90
  'brl',
  1,
  '["Grupos ilimitados", "Participantes ilimitados", "Histórico completo", "Suporte prioritário", "Temas personalizados"]'
),
-- Quarterly Premium (3 months)
(
  'Premium Trimestral',
  'Acesso completo aos recursos premium - 3 meses',
  'price_premium_quarterly_placeholder', -- Substitua pelo Price ID real do Stripe
  'prod_premium_placeholder', -- Substitua pelo Product ID real do Stripe
  'quarterly',
  7990, -- R$ 79,90 (10% desconto)
  'brl',
  2,
  '["Grupos ilimitados", "Participantes ilimitados", "Histórico completo", "Suporte prioritário", "Temas personalizados", "10% de desconto"]'
),
-- Semiannual Premium (6 months)
(
  'Premium Semestral',
  'Acesso completo aos recursos premium - 6 meses',
  'price_premium_semiannual_placeholder', -- Substitua pelo Price ID real do Stripe
  'prod_premium_placeholder', -- Substitua pelo Product ID real do Stripe
  'semiannual',
  14990, -- R$ 149,90 (17% desconto)
  'brl',
  3,
  '["Grupos ilimitados", "Participantes ilimitados", "Histórico completo", "Suporte prioritário", "Temas personalizados", "17% de desconto"]'
),
-- Annual Premium (12 months)
(
  'Premium Anual',
  'Acesso completo aos recursos premium - 12 meses',
  'price_premium_annual_placeholder', -- Substitua pelo Price ID real do Stripe
  'prod_premium_placeholder', -- Substitua pelo Product ID real do Stripe
  'annual',
  27990, -- R$ 279,90 (22% desconto)
  'brl',
  4,
  '["Grupos ilimitados", "Participantes ilimitados", "Histórico completo", "Suporte prioritário", "Temas personalizados", "22% de desconto", "2 meses grátis"]'
)
ON CONFLICT (stripe_price_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  billing_period = EXCLUDED.billing_period,
  price_cents = EXCLUDED.price_cents,
  sort_order = EXCLUDED.sort_order,
  features = EXCLUDED.features,
  updated_at = NOW();