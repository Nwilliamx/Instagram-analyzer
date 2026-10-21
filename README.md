# Instagram Analyzer

Aplicação web desenvolvida para analisar os dados de seguidores do Instagram, comparar as listas de seguidores e contas seguidas e identificar quem não segue de volta.

## Funcionalidades

- Análise dos arquivos JSON exportados do Instagram.
- Identificação de contas que você segue, mas que não seguem você de volta.
- Identificação de contas que seguem você, mas que você não segue de volta.
- Comparação entre seguidores e contas seguidas.
- Interface web para visualizar os resultados da análise.

## Tecnologias utilizadas

- JavaScript
- React
- Vite
- HTML
- CSS

## Requisitos

- Node.js
- npm

## Como executar o projeto

1. Clone o repositório:

   ```bash
   git clone URL_DO_REPOSITORIO
   ```

2. Entre na pasta do projeto:

   ```bash
   cd instagram-analyzer
   ```

3. Instale as dependências:

   ```bash
   npm install
   ```

4. Inicie o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

5. Acesse o endereço local exibido no terminal.

## Como utilizar

1. Exporte seus dados pelo Instagram, incluindo as listas de seguidores e contas seguidas.
2. Utilize os arquivos JSON correspondentes a `followers` e `following`, conforme o formato aceito pela aplicação.
3. Carregue os arquivos na interface, caso esse recurso esteja implementado.
4. Consulte os resultados para identificar as diferenças entre as listas.

## Privacidade

Os arquivos exportados do Instagram podem conter informações pessoais. Utilize os dados com cuidado e evite compartilhá-los publicamente.

## Objetivo

Facilitar a comparação entre seguidores e contas seguidas do Instagram por meio de uma interface web simples e prática.
