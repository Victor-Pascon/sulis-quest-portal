

# 🎮 Sulis Quest — Tela de Autenticação

## Visão Geral
Criar a tela de login e cadastro para o Sulis Quest, uma plataforma de produtividade gamificada, com tema escuro, visual imersivo e integração completa com Supabase Auth.

---

## 1. Conectar Supabase ao Projeto
- Conectar um projeto Supabase existente ou criar um novo
- Configurar as chaves de API no Lovable

## 2. Banco de Dados — Tabela de Perfis
- Criar tabela `profiles` com campos: `id`, `username`, `avatar_url`, `created_at`
- Configurar políticas de segurança (RLS) para que cada usuário só acesse seu próprio perfil
- Trigger automático para criar perfil ao registrar novo usuário

## 3. Tela de Autenticação (Login + Cadastro)
- **Layout centralizado** e totalmente responsivo (mobile-first)
- **Tema escuro** com gradiente de fundo roxo → azul
- **Logo/nome "Sulis Quest"** em destaque no topo com tipografia impactante
- **Frase motivacional** abaixo do nome: *"Transforme sua rotina em uma jornada épica"*
- **Alternância fluida** entre as abas de Login e Cadastro
- **Campos** com inputs arredondados e estilizados:
  - Email
  - Senha
  - Nome de usuário (apenas no cadastro)
- **Botão principal** com efeito glow sutil em roxo e feedback visual ao clicar
- **Botão de Login com Google** estilizado e integrado ao Supabase Auth
- **Validação de campos** com mensagens claras de erro (email inválido, senha fraca, etc.)
- **Mensagens de sucesso** ao criar conta (ex: "Conta criada! Verifique seu email")

## 4. Fluxo de Navegação
- Após login bem-sucedido → redirecionar para a página Dashboard (`/dashboard`)
- Criar uma página Dashboard placeholder com mensagem de boas-vindas
- Usuários não autenticados tentando acessar o Dashboard → redirecionados para `/auth`
- Botão de logout no Dashboard

## 5. Configuração do Google Auth
- Orientar a configuração do provedor Google no painel do Supabase
- Configurar URLs de redirecionamento corretas

