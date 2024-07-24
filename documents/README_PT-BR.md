<h4 align="center">
    <p>
        <a href="https://github.com/Daniel-Alvarenga/Follcker/blob/main/README.md">English</a> |
        <b>Рortuguês</b>
    </p>
</h4>

<p align="center">
  <img src="https://github.com/Daniel-Alvarenga/Follcker/blob/main/src/assets/source/image/logo.png" alt="Follcker" />
</p>

# Follcker (rastreador de seguidor)

[![GitHub license](https://img.shields.io/github/license/daniel-alvarenga/follcker)](Daniel-Alvarenga/Follcker/blob/main/LICENSE)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/29e0fdf7a13b4001972204881fbd7dd6)](https://app.codacy.com/gh/Daniel-Alvarenga/Follcker/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![GitHub languages top](https://img.shields.io/github/languages/top/daniel-alvarenga/Follcker)
[![GitHub contributors](https://img.shields.io/github/contributors/daniel-alvarenga/Follcker)](https://github.com/daniel-alvarenga/Follcker/graphs/contributors)
![GitHub stars](https://img.shields.io/github/stars/daniel-alvarenga/Follcker)

Follcker é uma extensão do navegador de análise de seguidores do GitHub, que funciona na guia ?tab=following. Existe uma interface onde você insere seu nome de usuário do Github e um token com as permissões mínimas user:read e user:follow, a partir disso, ao entrar na página seguinte do GitHub, para cada usuário seguido será exibido se eles te seguirem ou não.
Funciona chamando a API do github com suas credenciais e verificando se um usuário da lista exibida também está em sua lista de seguidores.

[Follcker nas extensões do Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/)

## Funcionalidades

- Exibe se os usuários que você segue no GitHub também seguem você.
- Utiliza a API do GitHub para dados precisos.
- Configuração fácil com um token do GitHub.

## Instalação

1. [Baixe o Follcker nas Extensões do Firefox](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/).
2. Instale a extensão no seu navegador.
3. Crie um token do GitHub [aqui](https://github.com/settings/apps) com as seguintes permissões:
    - [x] user
      - [x] user:read 
      - [ ] user:email 
      - [x] user:follow 
4. Abra o popup da extensão e salve seu nome de usuário e token.
5. Certifique-se de que a extensão está ativada.

## Como Usar

- Insira seu nome de usuário e token do GitHub nas configurações da extensão.
- Visite sua página de seguidores no GitHub.
- Veja quem te segue de volta.

>[!warning]
>Você precisa marcar como verdadeiro apenas user:read e user:follow para segurança, porque o token será armazenado no storage público de seu navegador

## Contribuindo

Contribuições para este projeto são bem-vindas. Siga estas etapas para contribuir:

1. Bifurque o repositório.
2. Crie um novo branch para seu recurso ou correção de bug.
3. Confirme suas alterações.
4. Empurre para o galho.
5. Envie uma solicitação pull.
