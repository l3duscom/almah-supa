# App de Amigo Secreto

Este mini-projeto é uma aplicação web para organizar um evento de amigo secreto. Os usuários podem se cadastrar, fazer login e participar de um sorteio para descobrir quem será seu amigo secreto. Vamos usar Next.js com Supabase para a autenticação e o banco de dados. Para enviar os emails vamos usar o Resend. Os estilos e componentes serão feitos com shadcn/ui e TailwindCSS.

## 🤓 Antes de começar

Certifique-se de ter o Node.js instalado em sua máquina. Use o `create-next-app` para criar o projeto com a versão mais atualizada do framework.

```bash
npx create-next-app@latest
```

Siga o [tutorial do Supabase](https://supabase.com/docs/guides/auth/server-side/nextjs) para integrar o seu projeto Next.js com o Supabase.

## 🔨 Requisitos

### Login e cadastro

- Implemente a tela de login e a funcionalidade de login/cadastro com magic link
  - Recomendamos usar o [Supabase Auth](https://supabase.com/docs/guides/auth) para implementar a autenticação
  - Utilize a [documentação do Supabase](https://supabase.com/docs/guides/auth/auth-email-passwordless) para auxiliar na implementação

### Header / Navbar

- Implemente o header com a logo, um link para a página `Meus grupos` e um botão para criar um novo grupo

### Cadastro de grupo

- Implemente a tela de cadastro de grupo
  - O grupo deve ter um nome e uma data de cadastro. A data pode ser inserida automaticamente pelo backend
  - O grupo deverá ter participantes
    - Cada participante deve ter um nome e um email
    - O primeiro participante do grupo obrigatoriamente deve ser o usuário logado
    - O usuário logado não pode ser removido do grupo

### Sorteio do grupo e envio de emails

- Ao criar o grupo, o sistema deve sortear os amigos secretos de cada participante
- O sistema deve enviar um email para cada participante com o nome do seu amigo secreto

  - Recomendamos que você utilize o [Resend](https://resend.com/) para enviar os emails

  > 👀 **Dica:**
  > Você precisa de um domínio para enviar os emails. Caso não tenha, você pode usar o domínio de testes do Resend. Procure sobre ele na documentação.

### Tela do grupo

- Implemente a tela do grupo
  - A tela deve ter o nome do grupo e a lista de participantes
  - A tela deve exibir o nome do amigo secreto da pessoa logada
    - Deixe o nome do amigo escondido e só revele quando o usuário passar o mouse por cima

### Tela de grupos

- Implemente a tela de grupos
  - A tela deve ter a lista de grupos do usuário logado
  - Cada grupo deve ter o nome e a data de criação
  - Ao clicar em um grupo, o usuário deve ser redirecionado para a tela do grupo

## 🔨 Desafio extra para quem quer ir além

- Implemente a opção de adicionar uma lista de presentes para cada participante
- Implemente a opção de editar o grupo e fazer o sorteio novamente

## 🎨 Design Sugerido

Temos uma sugestão de design no Figma. Entretanto, fique à vontade para montar a aplicação conforme a sua criatividade.

### Figma

🔗 [Link do design](https://discord.com/channels/1089524234142888048/1271194778612273249/1318643189816627260)

## 👉🏽 Sobre esse mini-projeto

### O que você irá praticar:

#### Next.js

- Criação de rotas
- Criação de componentes
- Criação de server components e server actions
- Gerenciamento de autenticação com Supabase
- Gerenciamento de dados com Supabase

#### shadcn/ui

- Instalação e configuração
- Utilização de componentes
- Customização de temas

#### Supabase

- Autenticação com Supabase
- Autenticação com magic link
- Gerenciamento de dados com Supabase
- Conexão com um app Next.js

#### Resend

- Criação de conta
- Configuração e integração com Next.js
- Envio de emails com Resend

### Pré requisitos

- Conhecimento básico de React e TailwindCSS.
- Familiaridade com o uso de APIs e autenticação.
