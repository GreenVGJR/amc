// Ambient declarations for third-party packages that ship no TypeScript types.
// Kept intentionally loose (any) - these are only used at their existing call
// sites, so this preserves current runtime behavior while satisfying `tsc`.

declare module "discord-player-youtubei" {
  export const YoutubeExtractor: any;
  export type YoutubeExtractor = any;
}

declare module "discord-player-soundcloud" {
  export const SoundcloudExtractor: any;
  export type SoundcloudExtractor = any;
}

declare module "discord-player-spotify" {
  export const SpotifyExtractor: any;
  export type SpotifyExtractor = any;
}

declare module "discord-player-applemusic" {
  export const AppleMusicExtractor: any;
  export type AppleMusicExtractor = any;
}

declare module "bgutils-js/botguard" {
  export const getChallenge: any;
  export const BotGuardClient: any;
}

declare module "bgutils-js/webpo" {
  export const WebPoMinter: any;
  export const createColdStartToken: any;
}

declare module "bgutils-js/utils" {
  export const parseLooseJSON: any;
}
