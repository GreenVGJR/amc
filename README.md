> [!CAUTION]
> Stream Youtube violates Discord ToS. Use it with caution.

> [!NOTE]
> These 2 intents are required to use all features.
> ![image](https://github.com/user-attachments/assets/4beb3e93-40f9-4253-99f4-c6ec8d5a7e67)

___

## Installation
1. Make sure you have [node.js](https://nodejs.org/) and [git](https://git-scm.com/) installed, and greater than version v21.7.3 for node.js
2. [Download](https://github.com/GreenVGJR/amc-discord-bot/archive/refs/heads/fs-main-local.zip) this branch (.zip)
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
| Soundcloud*   | Soundcloud    |
| -             | Spotify**     |
| -             | Apple Music** |
| Local/HTTP    | Local/HTTP    |
> *Unstable

> **Stream via Youtube

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
    > Lrclib
    > Genius

- Search a media (Max. 10 Result)
  Providers:
  = > Youtube
    > Youtube Shorts
    > Youtube Music
    > Soundcloud
    > Spotify
    > Apple Music
    > Amazon Music
    > Bandcamp
    > ITunes
    > Deezer
    > Tidal
    > Qobuz
    > Tiktok Video
    > Tiktok Music
    > Tiktok Sound
    > NCS

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
- Radio
- Queue
- DJ
- Skip song
- Seek to specific duration
- Change Volume
- Stop song
- Show bot information
```

</details>

<details close>

<summary>

## Preview

</summary>

![Preview 1](https://github.com/user-attachments/assets/6d80a389-f400-4436-a1aa-cae521a70cf3)
![Preview 2](https://github.com/user-attachments/assets/863b8268-05b5-42df-a429-c85bf2277b00)
![Preview 3](https://github.com/user-attachments/assets/b2070b40-5c88-456c-a441-0cb303c73a15)
![Preview 4](https://github.com/user-attachments/assets/3a14db8c-2a69-4d4a-8084-0aa02ebcf3df)
![Preview 5](https://github.com/user-attachments/assets/1b3ca4e3-06a6-4434-9548-ef3c870b1e55)

</details>