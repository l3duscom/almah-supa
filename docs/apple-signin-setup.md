# Apple Sign-In Setup Guide

Este guia explica como configurar o Apple Sign-In no Supabase para o projeto Amigo Secreto.

## ✅ Implementação Completa

O código já está implementado e pronto para uso futuro:
- ✅ Função `signInWithApple()` criada em `/app/(auth)/login/actions.ts`
- ✅ Botão "Continue with Apple" implementado (atualmente desabilitado)
- ✅ Estilo dark consistente com o tema da aplicação
- 🔒 **Status**: Desabilitado na UI, mas toda lógica mantida para ativação futura

## 🔧 Configuração Necessária

Para ativar o Apple Sign-In, você precisa configurar o provider no Supabase:

### 1. Configuração no Apple Developer

1. **Acesse o Apple Developer Portal:**
   - Vá para [developer.apple.com](https://developer.apple.com)
   - Entre com sua conta Apple Developer

2. **Crie um App ID:**
   - Vá para "Certificates, Identifiers & Profiles"
   - Crie um novo App ID com o capability "Sign In with Apple"

3. **Crie um Service ID:**
   - Crie um Service ID (será seu Client ID)
   - Configure o domínio de redirect para o Supabase

4. **Crie uma Private Key:**
   - Gere uma private key para Sign In with Apple
   - Baixe e guarde o arquivo `.p8`

### 2. Configuração no Supabase

1. **Acesse o Dashboard do Supabase:**
   - Vá para [supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecione seu projeto

2. **Configure o Provider Apple:**
   - Vá para "Authentication" > "Providers"
   - Ative o "Apple" provider
   - Preencha as informações:
     - **Client ID**: Service ID criado no Apple Developer
     - **Secret Key**: Conteúdo do arquivo `.p8`
     - **Key ID**: ID da private key
     - **Team ID**: Seu Team ID do Apple Developer

3. **URL de Redirect:**
   - Use: `https://your-project.supabase.co/auth/v1/callback`

### 3. Configuração de Domínio

No Apple Developer Portal, configure os domínios permitidos:
- Desenvolvimento: `localhost:3000`
- Produção: `seu-dominio.com`

## 🚀 Como Testar

1. **Configure o provider no Supabase** seguindo os passos acima
2. **Execute o projeto**: `npm run dev`
3. **Acesse**: `http://localhost:3000/login`
4. **Clique em "Continue with Apple"**
5. **Teste o fluxo de autenticação**

## 📝 Notas Importantes

- **Apple Developer Account**: Necessária conta paga ($99/ano)
- **Domínios**: Configure todos os domínios onde a app vai rodar
- **Testando**: Use Safari para testes mais precisos (melhor suporte)
- **Privacidade**: Apple pode mascarar emails dos usuários

## 🔍 Troubleshooting

### Erro "invalid_client"
- Verifique se o Client ID está correto
- Confirme se o Service ID está configurado corretamente

### Erro "unauthorized_client" 
- Verifique se o domínio está configurado no Apple Developer
- Confirme se a URL de redirect está correta

### Erro "access_denied"
- Usuário cancelou ou erro de permissões
- Verifique se o app tem permissões necessárias

## 🎯 Status Atual

- **Frontend**: ✅ Implementado (desabilitado na UI)
- **Backend**: ✅ Implementado  
- **Supabase Config**: ⏳ Pendente (requer configuração manual)
- **Apple Developer**: ⏳ Pendente (requer conta e configuração)

## 🔄 Como Ativar o Apple Sign-In

Para ativar o botão Apple Sign-In na interface:

1. **Complete a configuração** no Supabase e Apple Developer
2. **Altere o código** em `/components/login-form.tsx`:
   ```tsx
   // Mude de:
   {false && (
   
   // Para:
   {true && (
   ```
3. **Atualize a descrição** para incluir "Apple" novamente
4. **Teste a funcionalidade** completa

Assim que a configuração no Supabase e Apple Developer for feita, basta alterar `false` para `true` e o Apple Sign-In estará totalmente funcional!