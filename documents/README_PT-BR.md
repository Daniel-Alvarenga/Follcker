<h4 align="center">
    <p>
        <a href="https://github.com/Daniel-Alvarenga/Follcker/blob/main/README.md">English</a> |
        <b>Рortuguês</b>
    </p>
</h4>

<p align="center">
  <img src="https://github.com/Daniel-Alvarenga/Follcker/blob/main/src/assets/source/image/logo.png" alt="Follcker" />
</p>

[![GitHub license](https://img.shields.io/github/license/daniel-alvarenga/follcker)](Daniel-Alvarenga/Follcker/blob/main/LICENSE)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/29e0fdf7a13b4001972204881fbd7dd6)](https://app.codacy.com/gh/Daniel-Alvarenga/Follcker/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![GitHub languages top](https://img.shields.io/github/languages/top/daniel-alvarenga/Follcker)
[![GitHub contributors](https://img.shields.io/github/contributors/daniel-alvarenga/Follcker)](https://github.com/daniel-alvarenga/Follcker/graphs/contributors)
![GitHub stars](https://img.shields.io/github/stars/daniel-alvarenga/Follcker)

Follcker é uma extensão do navegador de análise de seguidores do GitHub, que funciona na guia ?tab=following. Existe uma interface onde você insere seu nome de usuário do Github e um token com as permissões mínimas user:read e user:follow, a partir disso, ao entrar na página seguinte do GitHub, para cada usuário seguido será exibido se eles te seguirem ou não.
Funciona chamando a API do github com suas credenciais e verificando se um usuário da lista exibida também está em sua lista de seguidores.

## Como usar

- Crie um token no GitHub [aqui](https://github.com/settings/apps)

  As permissões devem ser assim:
  - [x] user
    - [x] user:read 
    - [ ] user:email 
    - [x] user:follow 


- Abra o pop-up da extensão na guia de extensões do seu navegador e salve seu nome de usuário e o token criado

- Certifique-se de que a extensão esteja ligada


>[!warning]
>Você precisa marcar como verdadeiro apenas user:read e user:follow para segurança, porque o token será armazenado no storage público de seu navegador

## Contribuindo

Contribuições para este projeto são bem-vindas. Siga estas etapas para contribuir:

1. Bifurque o repositório.
2. Crie um novo branch para seu recurso ou correção de bug.
3. Confirme suas alterações.
4. Empurre para o galho.
5. Envie uma solicitação pull.