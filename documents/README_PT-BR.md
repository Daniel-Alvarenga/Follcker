<h4 align="center">
    <p>
        <a href="https://github.com/Daniel-Alvarenga/Follcker/blob/main/README.md">English</a> |
        <b>Рortuguês</b>
    </p>
</h4>

<p align="center">
  <img src="https://github.com/Daniel-Alvarenga/Follcker/blob/main/src/assets/source/image/logo.png" alt="Follcker" />
</p>

# Follcker (rastreador de seguidores)

[![GitHub license](https://img.shields.io/github/license/daniel-alvarenga/follcker)](Daniel-Alvarenga/Follcker/blob/main/LICENSE)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/29e0fdf7a13b4001972204881fbd7dd6)](https://app.codacy.com/gh/Daniel-Alvarenga/Follcker/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![GitHub languages top](https://img.shields.io/github/languages/top/daniel-alvarenga/Follcker)
[![GitHub contributors](https://img.shields.io/github/contributors/daniel-alvarenga/Follcker)](https://github.com/daniel-alvarenga/Follcker/graphs/contributors)
![GitHub stars](https://img.shields.io/github/stars/daniel-alvarenga/Follcker)

O Follcker mostra quem te segue de volta no GitHub, sem você sair do GitHub.

Abra a aba **following** ou **followers** de qualquer perfil e cada conta ganha uma
marcação: `te segue` ou `não te segue`. Uma barra de resumo conta quantos são
unilaterais e esconde todo o resto com um clique.

[Follcker nas extensões do Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/)

## Funcionalidades

- Marcações em `?tab=following` **e** `?tab=followers`.
- Barra de resumo com contagem e filtro "ver só esses" para os unilaterais.
- Funciona na lista de **qualquer** perfil, sempre comparando com a sua conta.
- **Não exige token.** A API pública do GitHub basta para a maioria das contas.
- Anel no cabeçalho mostrando quanto da sua cota horária do GitHub já foi gasta.
- Painel de ajuda embutido e seletor com 10 idiomas.
- Acompanha o tema do GitHub (claro, escuro, dimmed, alto contraste).
- Funciona no **Chrome e no Firefox** a partir do mesmo código Manifest V3.

## Instalação

### Pelas lojas

- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/)
- **Chrome:** ainda não publicado - instale manualmente com os passos abaixo.

### Instalação manual

**Chrome / Edge / Brave**

1. Baixe ou clone este repositório.
2. Abra `chrome://extensions` e ligue o **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação** e escolha a pasta do repositório.

**Firefox**

1. Abra `about:debugging#/runtime/this-firefox`.
2. Clique em **Carregar extensão temporária** e escolha o `manifest.json` deste repositório.
3. Abra o popup e clique em **Permitir** se ele pedir acesso à `api.github.com`
   (no Firefox as permissões de host são opcionais por padrão).

## Como usar

1. Abra o popup do Follcker.
2. Digite seu usuário do GitHub e clique em **Salvar**.
3. Ligue a chave.
4. Visite a aba following ou followers de qualquer perfil.

## Idiomas

A interface vem nos dez idiomas mais falados do mundo, e o seletor no popup
sobrepõe o idioma do próprio navegador:

English · 中文（简体） · हिन्दी · Español · Français · العربية · বাংলা ·
Português (Brasil) · Русский · اردو

Árabe e urdu invertem o popup inteiro para a direita-esquerda.

> [!NOTE]
> Inglês e português do Brasil são mantidos em primeira mão. Os outros oito
> foram traduzidos com apoio automático e merecem revisão de falantes nativos -
> correções por pull request são muito bem-vindas.

## Requisições nesta hora

O anel no cabeçalho do popup mostra quanto do limite por hora do GitHub já foi
gasto. Passe o mouse (ou dê foco pelo teclado) para ver a porcentagem, a
contagem uso/total e quando a janela reinicia. O anel fica âmbar acima de 70% e
vermelho acima de 90%, e os números estão sempre no tooltip, então o estado
nunca depende só da cor.

O número vem do próprio endpoint `/rate_limit` do GitHub, que é gratuito - não
conta contra o limite que ele informa - somado aos cabeçalhos de cota que
acompanham todas as outras chamadas.

## Sobre o token

O token é **opcional**. O Follcker só lê listas públicas de seguidores, então
funciona anonimamente dentro do limite de 60 requisições/hora do GitHub - o que
sobra, já que as listas são buscadas uma vez e ficam 10 minutos em cache.

Adicione um token apenas se você estourar esse limite. Ele eleva o teto para
5.000 requisições/hora.

> [!TIP]
> Use um [token fine-grained](https://github.com/settings/personal-access-tokens/new)
> **somente leitura** e com data de expiração. O Follcker nunca escreve nada na
> sua conta, então nenhum escopo de escrita é necessário.

> [!WARNING]
> O token fica no armazenamento da extensão, que não é criptografado. Qualquer
> coisa capaz de ler o perfil do seu navegador consegue lê-lo. É por isso que o
> Follcker funciona sem token, e por isso que um token somente leitura e de vida
> curta é a escolha segura. Use **Limpar** no popup para removê-lo quando quiser.

## Como funciona

O Follcker busca `/users/{você}/followers` e `/users/{você}/following` **uma
única vez**, guarda as duas listas por 10 minutos em cache, e a partir daí cada
verificação na página é uma consulta local. Nada é enviado para lugar nenhum
além da `api.github.com`, e nada sobre você é coletado.

## Desenvolvimento

Sem build, sem dependências - é só carregar a pasta como extensão.

```
manifest.json           Manifest V3, compartilhado por Chrome e Firefox
_locales/               en, pt_BR
src/shared/browser.js   shim dos namespaces chrome/browser
src/shared/i18n.js      troca de idioma em tempo de execução
src/background/         API do GitHub, cache e roteamento de mensagens
src/content/            injeção das marcações no github.com
src/popup/              popup da extensão
```

### Lint

O Codacy roda ESLint neste repositório. O `.eslintrc.json` descreve o escopo
global compartilhado de que os scripts clássicos da extensão dependem, para que
nomes usados entre arquivos - `ext`, `t`, `MSG`, `I18N`, `LOCALES` - não sejam
reportados como indefinidos.

```
npx eslint .
```

> [!NOTE]
> O manifest declara `background.service_worker` (Chrome) e `background.scripts`
> (Firefox) ao mesmo tempo, então um único manifest carrega nos dois. O Chrome
> exibe um aviso inofensivo sobre a chave `scripts` não utilizada.
> Antes de publicar uma atualização no Firefox Add-ons, adicione o ID da
> extensão em `browser_specific_settings.gecko.id`.
>
> O `ext.i18n.getMessage` sempre segue o idioma do *navegador* e não pode ser
> sobreposto, então o seletor de idioma lê os mesmos arquivos
> `_locales/<id>/messages.json` em runtime, via `src/shared/i18n.js`. Adicionar
> um idioma é criar uma pasta lá e uma entrada em `LOCALES`.

## Suporte

Em caso de dúvidas ou problemas, abra uma issue no
[GitHub](https://github.com/Daniel-Alvarenga/Follcker/issues).

## Contribuindo

Contribuições para este projeto são bem-vindas. Siga estas etapas para contribuir:

1. Bifurque o repositório.
2. Crie um novo branch para seu recurso ou correção de bug.
3. Confirme suas alterações.
4. Envie para o branch.
5. Abra um pull request.
