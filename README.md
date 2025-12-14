> [!CAUTION]
> Stream Youtube violates Discord ToS. Use it with caution.

> [!WARNING]
> This branch is only for testing and development. Expect errors.

> [!NOTE]
> These 2 intents are required to use all features.
> ![image](https://github.com/user-attachments/assets/4beb3e93-40f9-4253-99f4-c6ec8d5a7e67)

___

> [!NOTE]
> [List Public Lavalink available](https://lavalink-list.darrennathanael.com/).

## Installation
1. Make sure you have [node.js](https://nodejs.org/) and [git](https://git-scm.com/) installed, and greater than version v21.7.3 for node.js
2. [Download](https://github.com/GreenVGJR/amc-discord-bot/archive/refs/heads/fs-dev-lavalink.zip) this branch (.zip)
3. Extract it, and rename `.env.example` file to `.env` inside folder you did extract
4. Add your [Discord token bot](https://discord.com/developers/applications) inside `.env` at `DISCORD_TOKEN=yourtokenhere`
5. Run this command with IDE/Terminal (still same folder)
```js
npm install
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
| -             | Spotify*      |
| -             | Apple Music*  |
| Local/HTTP    | Local/HTTP    |
> *If Available

</details>

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

> [!WARNING]
> By doing this you're risking your account getting temporary / permanent banned if you use for massive requests / users.<br>
> Consider to use throwaway account. Only use this for certain cases.

<details close>

<summary>

## Features

</summary>

```js
- Find Lyrics from current/specific song
  Providers:
  = > Youtube Music
    > Deezer
    > Shazam
    > Lrclib
    > Genius

- Search a media (Max. 10 Results)
  Providers:
  = > Youtube
    > Youtube Shorts
    > Youtube Music
    > Youtube Audio Library
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
    > Tiktok Video
    > Tiktok Music
    > Tiktok Sound
    > NCS
    > Capcut - Templates | Global
    > Capcut - Templates | US
    > Kinemaster - Templates
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
    > Twitter

- Auto-generate auth keys needed
- Dynamic info message
- Show suggestion song name
- Controller
- Playlist
- Radio
- Queue
- DJ
- Show bot information
```

</details>

<details close>

<summary>

## Preview

</summary>

![Preview 1](https://github.com/user-attachments/assets/5cf219b9-f6a2-4a08-bdb2-4df5f8743e21)
![Preview 2](https://github.com/user-attachments/assets/d75568aa-948d-48bc-a93e-827749a48613)
![Preview 3](https://github.com/user-attachments/assets/4f99016b-5987-4662-bda0-dc282bca7343)

</details>
