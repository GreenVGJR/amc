<div align="center">
  
# 🌠 AMC
Simple yet powerful Discord music bot. Built with [Forgescript](https://github.com/tryForge/ForgeScript)<br>
[![Forgescript](https://img.shields.io/github/package-json/v/tryforge/ForgeScript/main?label=@tryforge/forgescript&color=5c16d4)](https://github.com/tryforge/ForgeScript) [![QuorielDB](https://img.shields.io/github/package-json/v/quoriel/db/main?label=@quoriel/db&color=2596be)](https://github.com/quoriel/db) [![QuorielEdge](https://img.shields.io/github/package-json/v/quoriel/edge/main?label=@quoriel/edge&color=2596be)](https://github.com/quoriel/edge) [![ForgeLinked](https://img.shields.io/github/package-json/v/tryforge/ForgeLinked/dev?label=ForgeLinked&color=caa500)](https://github.com/tryforge/ForgeLinked/tree/dev) [![License](https://img.shields.io/github/license/GreenVGJR/amc-discord-bot)](LICENSE)

</div>

[Check another version](https://github.com/GreenVGJR/amc-discord-bot/blob/landing/README.md#choose-version)

## Installation

> [!CAUTION]
> Stream Youtube violates Discord ToS. Use it with caution.

> [!WARNING]
> This branch is only for testing and development. Expect errors.

> [!NOTE]
> These 2 intents are required to use all features.
> ![image](https://github.com/user-attachments/assets/4beb3e93-40f9-4253-99f4-c6ec8d5a7e67)

___

> [!NOTE]
> [List Public Lavalink Available](https://lavalink-list.darrennathanael.com/)

1. Make sure you have [node.js](https://nodejs.org/) and [git](https://git-scm.com/) installed, and greater than version v21.7.3 for node.js
2. [Download](https://github.com/GreenVGJR/amc-discord-bot/archive/refs/heads/fs-dev-lavalink.zip) this branch (.zip)
3. Extract it, and rename `.env.example` file to `.env` inside folder you did extract
4. Add your [Discord token bot](https://discord.com/developers/applications) inside `.env` at `DISCORD_TOKEN=yourtokenhere`
5. Run this command with IDE/Terminal (still same folder)
```js
npm install
npm update
node .
```
> How about for Pterodactyl user?

Ignore first & last installation step.

___

<details close>

<summary>
  
## List Support

</summary>

| Streaming     | Extractor     |
| ------------- | ------------- |
| Youtube       | Youtube       |
| Soundcloud    | Soundcloud    |
| Spotify       | Spotify       |
| Apple Music   | Apple Music   |
| Local/HTTP    | Local/HTTP    |

_At least with known lavalink server_

</details>

___

> [!WARNING]
> By doing this you're risking your account getting temporary / permanent banned if you use for massive requests / users.<br>
> Consider to use throwaway account. Only use this for certain cases.


> [!NOTE]
> You might also need to set for `YOUTUBE_UA=` User Agent same as previous.

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
- Queue
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
<img src="https://github.com/user-attachments/assets/09116ae0-20ef-44f0-aaf1-171bc5ecd106" />
<img src="https://github.com/user-attachments/assets/7a3ace53-eb6b-4766-bcf4-ae00f0687db8" />
<img src="https://github.com/user-attachments/assets/06a811ef-dcf3-4d44-b35f-35888e17d82d" />
<img src="https://github.com/user-attachments/assets/aeceb76b-f8e7-458b-9f0f-3056b354dd0f" />
<img src="https://github.com/user-attachments/assets/15d3277f-7fac-43d1-ad8b-70cc18c30f9b" />
</div>

</details>