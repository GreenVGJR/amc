<div align="center">
  
# 🌠 AMC
[![Forgescript](https://img.shields.io/github/package-json/v/tryforge/ForgeScript/main?label=@tryforge/forgescript&color=5c16d4)](https://github.com/tryforge/ForgeScript) [![QuorielDB](https://img.shields.io/github/package-json/v/quoriel/db/main?label=@quoriel/db&color=2596be)](https://github.com/quoriel/db) [![QuorielEdge](https://img.shields.io/github/package-json/v/quoriel/edge/main?label=@quoriel/edge&color=2596be)](https://github.com/quoriel/edge) [![ForgeMusic](https://img.shields.io/github/package-json/v/tryforge/ForgeMusic/main?label=@tryforge/forge.music&color=5c16d4)](https://github.com/tryforge/ForgeMusic) [![License](https://img.shields.io/github/license/GreenVGJR/amc-discord-bot)](LICENSE)

</div>

[Check another version](https://github.com/GreenVGJR/amc-discord-bot/blob/landing/README.md#choose-version)

## Installation

> [!CAUTION]
> Stream Youtube violates Discord ToS. Use it with caution.

> [!WARNING]
> This branch is only for testing and development. Expect errors.

> [!NOTE]
> These both intents are required to use all features.
> ![image](https://github.com/user-attachments/assets/4beb3e93-40f9-4253-99f4-c6ec8d5a7e67)

___

1. Required [node.js](https://nodejs.org/) and [git](https://git-scm.com/) installed, and greater than version v21.7.3 for node.js
2. [Download](https://github.com/GreenVGJR/amc-discord-bot/archive/refs/heads/fs-dev-local.zip) this branch (.zip)
3. Extract it, and rename `.env.example` file to `.env` inside folder you did extract
4. Add your [Discord token bot](https://discord.com/developers/applications) inside `.env` at `DISCORD_TOKEN=yourtokenhere`
5. Run this command with IDE/Terminal (still same folder)
```js
npm install
npm update
node .
```

___

<details close>

<summary>
  
## List Support

</summary>

| Streaming     | Extractor     | Dynamic Queue     |
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
> Doesn't show? do `Ctrl + F5`
5. Put inside `.env` at `YOUTUBE_COOKIES=put_cookies_here`

</details>

<details close>

<summary>

## Find Youtube Auth

</summary>

1. Navigate to this file `back/config.json`
2. Changes for 'useClientYT' to `ANDROID_VR` and 'useBearer' to `true`
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
> Doesn't show? do `Ctrl + F5`
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
    > Youtube Shorts
    > Youtube Music
    > Soundcloud
    > Spotify
    > Apple Music
    > Shazam
    > ITunes
    > Amazon Music
    > Bandcamp
    > Deezer
    > Tidal
    > Qobuz
    > JioSaavn
    > Tiktok Video
    > Tiktok Music
    > Tiktok Sound
    > BiliBili.tv
    > Twitch
    > Facebook Reels
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
    > Facebook
    > Bandcamp
    > Twitter / X

- Auto-generate auth keys needed
- Dynamic info message
- Show suggestion song name
- Music Controller
- Lyrics Translation
- Playlist
- Radio
- 24/7
- Dynamic Queue
- DJ
- Show bot information
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