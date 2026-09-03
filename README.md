<div align="center">
  
# 🌠 AMC
[![Forgescript](https://img.shields.io/github/package-json/v/tryforge/ForgeScript/main?label=@tryforge/forgescript&color=5c16d4)](https://github.com/tryforge/ForgeScript) [![QuorielDB](https://img.shields.io/github/package-json/v/quoriel/db/main?label=@quoriel/db&color=2596be)](https://github.com/quoriel/db) [![QuorielEdge](https://img.shields.io/github/package-json/v/quoriel/edge/main?label=@quoriel/edge&color=2596be)](https://github.com/quoriel/edge) [![ForgeMusic](https://img.shields.io/github/package-json/v/tryforge/ForgeMusic/main?label=@tryforge/forge.music&color=5c16d4)](https://github.com/tryforge/ForgeMusic) [![License](https://img.shields.io/github/license/GreenVGJR/amc)](LICENSE)

</div>

## Installation

> [!CAUTION]
> Stream Youtube violates Discord ToS. Use it with caution.

> [!NOTE]
> These intents must be enable to use all features.
> ![image](https://github.com/user-attachments/assets/4beb3e93-40f9-4253-99f4-c6ec8d5a7e67)

___

1. Required [node.js](https://nodejs.org/) and [git](https://git-scm.com/) installed, and greater than version v22.22.3 for node.js
2. Clone the repository and install dependencies:

```bash
git clone -b fs-main-local https://github.com/GreenVGJR/amc.git
cd amc
npm install --allow-git=all
```
3. Navigate to that folder and rename `.env.example` file to `.env`
4. Add your [Discord token bot](https://discord.com/developers/applications) inside `.env` at `DISCORD_TOKEN=yourtokenhere`
5. Then run command `node .` inside that folder

___

<details close>

<summary>
  
## List Support

</summary>

| Streaming     | Extractor     | Autoplay          |
| ------------- | ------------- | ----------------- |
| Youtube       | Youtube       | Youtube           |
| Soundcloud    | Soundcloud    | Soundcloud        |
| -             | Spotify*      | Spotify           |
| -             | Apple Music*  | Apple Music       |
| Local/HTTP    | Local/HTTP    | -                 |
> *Stream via Youtube

</details>

___

<details close>

<summary>

## Find Youtube Cookies

</summary>

1. Open a new private browsing/incognito window and login your youtube account
2. If that done, navigate to `https://www.youtube.com/robots.txt` then open developers tools (`Ctrl + Shift + I`)
3. Go to "Network" tab and find `robots.txt` request
4. Copy the `Cookie` from Request Headers
> Not showing? do `Ctrl + F5`
5. Put inside `.env` at `YOUTUBE_COOKIES=put_cookies_here`

</details>

<details close>

<summary>

## Find Youtube Auth

</summary>

1. Navigate to this file `back/config.json`
2. Changes for 'useClientYT' to `ANDROID_VR`
3. Restart the client and follow the instructions

</details>

<details close>

<summary>

## Find Spotify Cookies

</summary>

1. Open a new private browsing/incognito window and login your spotify account
2. If that done, navigate to `https://accounts.spotify.com/robots.txt` then open developers tools (`Ctrl + Shift + I`)
3. Go to "Network" tab and find `robots.txt` request
4. Copy the `Cookie` from Request Headers
> Not showing? do `Ctrl + F5`
5. Put inside `.env` at `SPOTIFY_COOKIES=put_cookies_here`

</details>

___

<details close>

<summary>

## Features

</summary>

```js
- Find Lyrics from current/specific song
  Providers:
  = > Youtube Music
    > Shazam
    > Tidal
    > Deezer
    > Lrclib
    > Genius

- Search a media (Max. 10 Results)
  Providers:
  = > Youtube
    > Youtube (TV)
    > Youtube Shorts
    > Youtube Music
    > Soundcloud
    > Spotify
    > Apple Music
    > Amazon Music
    > Bandcamp
    > Deezer
    > Tidal
    > Qobuz
    > JioSaavn
    > BiliBili.tv
    > Twitch
    > NCS
    > Capcut - Templates
    > Roblox Music

- Download media
  Providers:
  = > Youtube
    > Soundcloud
    > Spotify (from Youtube)
    > Apple Music (from Youtube)
    > Tiktok
    > Instagram
    > Threads
    > Facebook
    > Bandcamp
    > Twitter / X

- Auto-generate auth keys needed
- Autoplay
- Dynamic info message
- Music Controller
- Lyrics Translation
- DJ
- Playlist
- Radio
- 24/7
```

</details>

___

<details close>

<summary>

## Preview

</summary>

<div align="center">
<img src="https://github.com/user-attachments/assets/1474fc30-9f04-4eea-b79b-8ccd7f7ee04d" />
<img src="https://github.com/user-attachments/assets/49c2d8fb-26d2-4313-8dab-5a1dfca09569" />
<img src="https://github.com/user-attachments/assets/0a059212-0213-4aa6-9d7a-841b04fa0b35" />
<img src="https://github.com/user-attachments/assets/e8fbab0d-7a5c-4ed6-ba37-06aac6df5d97" />
<img src="https://github.com/user-attachments/assets/f29f19a3-0dd3-466c-9737-b9166be6f465" />
</div>

</details>