# Facebook Sign-In Setup Guide

Este guia explica como configurar o Facebook Sign-In no Supabase para o projeto Amigo Secreto.

## ✅ Implementação Completa

O código já está implementado e funcionando:

- ✅ Função `signInWithFacebook()` criada em `/app/(auth)/login/actions.ts`
- ✅ Botão "Continue with Facebook" adicionado no componente login
- ✅ Estilo azul oficial do Facebook (bg-blue-600)
- ✅ **Status**: Ativo na UI e pronto para configuração

## 🔧 Configuração Necessária

Para ativar o Facebook Sign-In, você precisa configurar o provider no Supabase:

### 1. Configuração no Facebook Developers

1. **Acesse o Facebook for Developers:**

   - Vá para [developers.facebook.com](https://developers.facebook.com)
   - Entre com sua conta Facebook

2. **Crie um App:**

   - Clique em "My Apps" > "Create App"
   - Escolha "Consumer" ou "Business" conforme seu caso
   - Preencha as informações básicas do app

3. **Configure o Facebook Login:**

   - No dashboard do app, vá para "Add a Product"
   - Adicione "Facebook Login"
   - Configure as URLs de redirect válidas

4. **Obtenha as Credenciais:**
   - Vá para "Settings" > "Basic"
   - Copie o **App ID** e **App Secret**

### 2. Configuração no Supabase

1. **Acesse o Dashboard do Supabase:**

   - Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Configure o Provider Facebook:**

   - Vá para "Authentication" > "Providers"
   - Ative o "Facebook" provider
   - Preencha as informações:
     - **Client ID**: App ID do Facebook
     - **Client Secret**: App Secret do Facebook

3. **URL de Redirect:**
   - Use: `https://your-project.supabase.co/auth/v1/callback`

### 3. Configuração de Domínios no Facebook

No Facebook App Dashboard, configure:

1. **Valid OAuth Redirect URIs:**

   - Desenvolvimento: `https://your-project.supabase.co/auth/v1/callback`
   - Produção: `https://your-project.supabase.co/auth/v1/callback`

2. **App Domains:**

   - Desenvolvimento: `localhost:3000`
   - Produção: `seu-dominio.com`

3. **Site URL:**
   - Desenvolvimento: `http://localhost:3000`
   - Produção: `https://seu-dominio.com`

## 🚀 Como Testar

1. **Configure o provider no Supabase** seguindo os passos acima
2. **Execute o projeto**: `npm run dev`
3. **Acesse**: `http://localhost:3000/login`
4. **Clique em "Continue with Facebook"**
5. **Teste o fluxo de autenticação**

## 📝 Notas Importantes

- **Facebook App Review**: Apps em produção podem precisar de review
- **Permissões**: Por padrão, só solicita email e perfil público
- **Domínios**: Configure todos os domínios onde a app vai rodar
- **HTTPS**: Facebook requer HTTPS em produção

## 🔍 Troubleshooting

### Erro "redirect_uri_mismatch"

- Verifique se a URL de redirect está configurada no Facebook App
- Confirme se está usando a URL correta do Supabase

### Erro "App Not Setup"

- Verifique se o Facebook Login foi adicionado ao app
- Confirme se o app está ativo no Facebook Developers

### Erro "invalid_client_id"

- Verifique se o App ID está correto no Supabase
- Confirme se o app está publicado (não em modo desenvolvimento)

### Erro de Domínio

- Adicione o domínio na lista de "App Domains"
- Configure a "Site URL" corretamente

## 🎯 Configuração de Desenvolvimento vs Produção

### Desenvolvimento

```
App Domains: localhost:3000
Site URL: http://localhost:3000
Valid OAuth Redirect URIs: https://your-project.supabase.co/auth/v1/callback
```

### Produção

```
App Domains: seu-dominio.com
Site URL: https://seu-dominio.com
Valid OAuth Redirect URIs: https://your-project.supabase.co/auth/v1/callback
```

## 🎨 Design Current

```
┌─────────────────────────────────┐
│        Continue with Google     │ ← Botão branco/outline
├─────────────────────────────────┤
│        Continue with Facebook   │ ← Botão azul com ícone Facebook
├─────────────────────────────────┤
│     Ou continue com email       │ ← Separator
├─────────────────────────────────┤
│        [Email Input]            │
│        Login with Email         │ ← Magic link
└─────────────────────────────────┘
```

## 🎯 Status Atual

- **Frontend**: ✅ Implementado e ativo
- **Backend**: ✅ Implementado
- **Supabase Config**: ⏳ Pendente (requer configuração manual)
- **Facebook App**: ⏳ Pendente (requer criação e configuração)

Assim que a configuração no Supabase e Facebook Developers for feita, o Facebook Sign-In estará totalmente funcional!

## 📋 Checklist de Setup

- [ ] Criar app no Facebook for Developers
- [ ] Ativar Facebook Login no app
- [ ] Copiar App ID e App Secret
- [ ] Configurar provider no Supabase
- [ ] Adicionar URLs de redirect
- [ ] Configurar domínios permitidos
- [ ] Testar fluxo completo
- [ ] Publicar app Facebook (se necessário)
