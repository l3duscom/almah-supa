# Configuração do Stripe

## 1. Criar conta no Stripe

1. Acesse [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Crie sua conta
3. Complete a verificação da conta

## 2. Obter as chaves da API

### Modo de Teste (Development)

1. Vá para **Developers > API keys**
2. Copie as seguintes chaves:
   - **Publishable key** (começa com `pk_test_`)
   - **Secret key** (começa com `sk_test_`)

### Configurar no .env

```bash
STRIPE_SECRET_KEY=sk_test_sua_chave_secreta_aqui
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sua_chave_publica_aqui
```

## 3. Criar produto e preço

### No Dashboard do Stripe:

1. Vá para **Products**
2. Clique em **Create product**
3. Configure o produto:
   - **Name**: Amigo Secreto Premium
   - **Description**: Acesso premium com grupos e participantes ilimitados
   - **Pricing model**: Recurring
   - **Price**: R$ 19,00
   - **Billing period**: Monthly
   - **Currency**: BRL (Real Brasileiro)

4. Após criar, copie o **Price ID** (começa com `price_`)

### Configurar no .env

```bash
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_seu_price_id_aqui
```

## 4. Configurar Webhooks

### No Dashboard do Stripe:

1. Vá para **Developers > Webhooks**
2. Clique em **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://seu-dominio.com/api/stripe/webhooks`
   - **Events to send**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. Após criar, copie o **Signing secret** (começa com `whsec_`)

### Configurar no .env

```bash
STRIPE_WEBHOOK_SECRET=whsec_seu_webhook_secret_aqui
```

## 5. Exemplo completo do .env

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_51AbC123...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51AbC123...
STRIPE_WEBHOOK_SECRET=whsec_ABC123...
NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID=price_1ABC123...
```

## 6. Testar a integração

### Cartões de teste do Stripe:

- **Sucesso**: `4242 4242 4242 4242`
- **Cartão recusado**: `4000 0000 0000 0002`
- **Insuficiente**: `4000 0000 0000 9995`

**Dados para completar:**
- **CVV**: Qualquer 3 dígitos
- **Validade**: Qualquer data futura
- **Nome**: Qualquer nome
- **CEP**: Qualquer CEP válido

## 7. Produção

Para ir para produção:

1. Complete a verificação da conta no Stripe
2. Ative o modo live
3. Substitua as chaves `sk_test_` e `pk_test_` pelas chaves live
4. Reconfigure os webhooks para a URL de produção
5. Teste com cartões reais

## 8. Funcionalidades implementadas

✅ **Checkout**: Criação de sessões de pagamento
✅ **Webhooks**: Processamento automático de eventos
✅ **Assinaturas**: Gestão de planos recorrentes
✅ **Cancelamento**: Downgrade automático
✅ **Renovação**: Extensão automática de assinatura
✅ **Falhas**: Tratamento de pagamentos falhados

## 9. URLs importantes

- **Dashboard**: https://dashboard.stripe.com
- **Documentação**: https://stripe.com/docs
- **Cartões de teste**: https://stripe.com/docs/testing#cards
- **Webhooks**: https://stripe.com/docs/webhooks