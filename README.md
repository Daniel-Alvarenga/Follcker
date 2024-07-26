<h4 align="center">
    <p>
        <b>English</b> |
        <a href="https://github.com/Daniel-Alvarenga/Follcker/blob/main/documents/README_PT-BR.md">Рortuguês</a>
    </p>
</h4>

<p align="center">
  <img src="https://github.com/Daniel-Alvarenga/Follcker/blob/main/src/assets/source/image/logo.png" alt="Follcker" />
</p>

# Follcker (follower tracker)

[![GitHub license](https://img.shields.io/github/license/daniel-alvarenga/follcker)](Daniel-Alvarenga/Follcker/blob/main/LICENSE)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/29e0fdf7a13b4001972204881fbd7dd6)](https://app.codacy.com/gh/Daniel-Alvarenga/Follcker/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)
![GitHub languages top](https://img.shields.io/github/languages/top/daniel-alvarenga/Follcker)
[![GitHub contributors](https://img.shields.io/github/contributors/daniel-alvarenga/Follcker)](https://github.com/daniel-alvarenga/Follcker/graphs/contributors)
![GitHub stars](https://img.shields.io/github/stars/daniel-alvarenga/Follcker)

Follcker is a GitHub follower analytics browser extension, working in the ?tab=following tab. There is an interface where you enter your Github user name and a token with the minimum permissions user:read, and user:follow, from this, when you enter the GitHub following page, for each user followed it will be displayed if they follow you or not.
It works by calling the github API with your credentials and checking whether a user from the displayed list is also on your follower list.

[Follcker in Firefox extensions](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/)

## Features

- Displays if users you follow on GitHub follow you back.
- Uses GitHub API for accurate data.
- Easy setup with a GitHub token.

## Installation

1. [Download Follcker from Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/).
2. Install the extension in your browser.
3. Create a GitHub token [here](https://github.com/settings/apps) with this scope:
    - [x] user
      - [x] user:read 
      - [ ] user:email 
      - [x] user:follow 
4. Open the extension popup and save your username and token.
5. Ensure the extension is turned on.

## How to Use

- Enter your GitHub username and token in the extension settings.
- Visit your GitHub following page.
- See who follows you back.

>[!warning]
>You need to check as true only user:read and user:follow for secure, becase the token will be stored in your browser's public storage

## Support

If you have any questions or issues, please open an issue on [GitHub](https://github.com/Daniel-Alvarenga/Follcker/issues).


## Contributing

Contributions to this project are welcome. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes.
4. Push to the branch.
5. Submit a pull request.
