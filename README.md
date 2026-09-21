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

Follcker tells you who follows you back on GitHub, without leaving GitHub.

Open any profile's **following** or **followers** tab and every account gets a badge:
`follows you` or `doesn't follow you`. A summary bar counts the one-sided ones and
can hide everything else with a single click.

[Follcker on Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/)

## Features

- Badges on `?tab=following` **and** `?tab=followers`.
- Summary bar with counts, plus a "show only these" filter for one-sided follows.
- Works on **any** profile's follow list, always compared against your own account.
- **No token required.** GitHub's public API is enough for most accounts.
- A ring in the header showing how much of your hourly GitHub quota is spent.
- Built-in help panel, and a language picker with 10 languages.
- Follows GitHub's theme (light, dark, dimmed, high contrast).
- Works in **Chrome and Firefox** from the same Manifest V3 codebase.

## Install

### From the stores

- **Firefox:** [Firefox Add-ons](https://addons.mozilla.org/pt-BR/firefox/addon/follcker/)
- **Chrome:** not published yet - load it manually with the steps below.

### Load it manually

**Chrome / Edge / Brave**

1. Download or clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and pick the repository folder.

**Firefox**

1. Open `about:debugging#/runtime/this-firefox`.
2. Click **Load Temporary Add-on** and pick this repository's `manifest.json`.
3. Open the popup and press **Grant** if it asks for access to `api.github.com`
   (Firefox makes host permissions opt-in).

## Usage

1. Open the Follcker popup.
2. Type your GitHub username and press **Save**.
3. Turn the switch on.
4. Visit any profile's following or followers tab.

## Languages

The interface ships in the ten most spoken languages in the world, and the
picker in the popup overrides the browser's own language:

English · 中文（简体） · हिन्दी · Español · Français · العربية · বাংলা ·
Português (Brasil) · Русский · اردو

Arabic and Urdu render the whole popup right-to-left.

> [!NOTE]
> English and Brazilian Portuguese are maintained first-hand. The other eight
> were machine-assisted and would benefit from a native-speaker review -
> corrections via pull request are very welcome.

## Requests this hour

The ring in the popup's header shows how much of GitHub's hourly limit you have
spent. Hover it (or focus it with the keyboard) for the percentage, the
used/total count and when the window resets. The ring turns amber past 70% and
red past 90%, and the numbers are always in the tooltip, so the state never
depends on color alone.

The number comes from GitHub's own `/rate_limit` endpoint, which is free - it
does not count against the limit it reports - plus the quota headers that ride
along on every other call.

## About the token

The token is **optional**. Follcker only reads public follower lists, so it works
anonymously within GitHub's limit of 60 requests/hour - plenty, because the lists
are fetched once and cached for 10 minutes.

Add a token only if you hit that limit. It raises it to 5,000 requests/hour.

> [!TIP]
> Use a [fine-grained token](https://github.com/settings/personal-access-tokens/new)
> with **read-only** access and an expiry date. Follcker never writes anything to
> your account, so no write scope is needed.

> [!WARNING]
> The token is kept in the browser's extension storage, which is not encrypted.
> Anything able to read your browser profile can read it. This is why Follcker
> works without one, and why a short-lived read-only token is the safe choice.
> Use **Clear** in the popup to remove it at any time.

## How it works

Follcker fetches `/users/{you}/followers` and `/users/{you}/following` **once**,
caches both lists for 10 minutes, and then every check on the page is a local
lookup. Nothing is sent anywhere except to `api.github.com`, and nothing about
you is collected.

## Development

No build step, no dependencies - load the folder as an unpacked extension.

```
manifest.json           Manifest V3, shared by Chrome and Firefox
_locales/               en, pt_BR
src/shared/browser.js   chrome/browser namespace shim
src/shared/i18n.js      runtime language switching
src/background/         GitHub API, caching, message routing
src/content/            badge injection on github.com
src/popup/              extension popup
```

> [!NOTE]
> The manifest declares both `background.service_worker` (Chrome) and
> `background.scripts` (Firefox), so a single manifest loads in both. Chrome
> shows a harmless warning about the unused `scripts` key.
> Before publishing an update to Firefox Add-ons, add the listing's add-on ID
> under `browser_specific_settings.gecko.id`.
>
> `ext.i18n.getMessage` always follows the *browser's* language and cannot be
> overridden, so the language picker reads the same `_locales/<id>/messages.json`
> files at runtime through `src/shared/i18n.js`. Adding a language means adding
> one folder there and one entry in `LOCALES`.

## Support

If you have any questions or issues, please open an issue on
[GitHub](https://github.com/Daniel-Alvarenga/Follcker/issues).

## Contributing

Contributions to this project are welcome. Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes.
4. Push to the branch.
5. Submit a pull request.
