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
| Spotify*      | Spotify*      |
| Apple Music*  | Apple Music*  |
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

> (Only works for downloader command)

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

![Preview 1](https://github.com/user-attachments/assets/09116ae0-20ef-44f0-aaf1-171bc5ecd106)
![Preview 2](https://github.com/user-attachments/assets/7a3ace53-eb6b-4766-bcf4-ae00f0687db8)
![Preview 3](https://github.com/user-attachments/assets/06a811ef-dcf3-4d44-b35f-35888e17d82d)
![Preview 4](https://github.com/user-attachments/assets/aeceb76b-f8e7-458b-9f0f-3056b354dd0f)
![Preview 5](https://github.com/user-attachments/assets/15d3277f-7fac-43d1-ad8b-70cc18c30f9b)

</details>
