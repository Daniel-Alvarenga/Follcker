# Follcker

[![GitHub license](https://img.shields.io/github/license/daniel-alvarenga/Follcker)](vitorcarvalho67/Boot/blob/master/LICENSE)
![GitHub languages top](https://img.shields.io/github/languages/top/daniel-alvarenga/Follcker)
[![GitHub contributors](https://img.shields.io/github/contributors/daniel-alvarenga/Follcker)](https://github.com/daniel-alvarenga/Follcker/graphs/contributors)
![GitHub stars](https://img.shields.io/github/stars/daniel-alvarenga/Follcker)

Follcker is a GitHub follower analytics browser extension, working in the ?tab=following tab. There is an interface where you enter your Github user name and a token with the minimum permissions user:read, and user:follow, from this, when you enter the GitHub following page, for each user followed it will be displayed if they follow you or not.
It works by calling the github API with your credentials and checking whether a user from the displayed list is also on your follower list.

## How to Use

- Create a GitHub token [here](https://github.com/settings/apps)

  The permissions would be like:
  - [x] user
    - [x] user:read 
    - [ ] user:email 
    - [x] user:follow 


- Open the extension popup in your browser extensions tab and save your user name and your created token

- Certify the extension is ON


>[!warning]
>You need to check as true only user:read and user:follow for secure, becase the token will be stored in your browser's public storage
