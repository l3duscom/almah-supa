# Configuração Google OAuth - Troubleshooting

## Problema Identificado
O login do Google estava criando dados no banco mas não logando o usuário devido a:

1. **Variáveis de ambiente ausentes** ✅ **RESOLVIDO**
2. **Possível configuração OAuth no Supabase** ⚠️ **VERIFICAR**

## Alterações Implementadas

### 1. Melhorias no Server Action (`actions.ts`)
```typescript
export async function signInWithGoogle() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/confirm`,
    },
  });

  if (error) {
    console.error("Google OAuth error:", error);
    redirect("/login?message=Could not authenticate user");
  }

  if (data?.url) {
    redirect(data.url);
  }
  
  redirect("/login?message=Could not authenticate user");
}
```

### 2. Melhorias na Rota de Confirmação (`/auth/confirm/route.ts`)
```typescript
// Handle OAuth callback (Google, etc.)
if (code) {
  console.log("Processing OAuth callback with code:", code.substring(0, 10) + "...");
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (!error) {
    console.log("OAuth session exchange successful, redirecting to:", next);
    redirect(next);
  } else {
    console.error("OAuth session exchange failed:", error);
  }
}
```

## Configuração Necessária no Supabase

### 1. Verificar Configuração Google OAuth
1. Acesse o Supabase Dashboard
2. Vá em **Authentication > Providers**
3. Habilite **Google** provider
4. Configure:
   - **Client ID**: Obtido no Google Cloud Console
   - **Client Secret**: Obtido no Google Cloud Console

### 2. URLs Autorizadas no Google Cloud Console
No Google Cloud Console, configure estas URLs:
- **Authorized JavaScript origins**: `http://localhost:3000`, `https://seu-dominio.com`
- **Authorized redirect URIs**: 
  - `https://fnemwtlabryefecprety.supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/confirm`

### 3. Verificar Logs
Com o servidor rodando (`npm run dev`), teste o login e verifique:
1. **Browser Console**: Erros de JavaScript
2. **Server Console**: Logs que adicionamos
3. **Supabase Dashboard > Authentication > Users**: Se usuário está sendo criado

## Como Testar

1. Acesse `http://localhost:3000/login`
2. Clique em "Continue with Google"
3. Complete o fluxo OAuth
4. Verifique os logs no terminal
5. Confirme se foi redirecionado para `/app`

## Se Ainda Não Funcionar

1. **Verificar configuração Google OAuth** no Supabase Dashboard
2. **Verificar URLs** no Google Cloud Console
3. **Limpar cookies** do browser
4. **Verificar logs** no Supabase Dashboard > Authentication > Logs