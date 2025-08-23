module.exports = {
  data: {
  "name": "download",
  "description": "Download a media",
  "options": [
    {
      "type": 3,
      "name": "url",
      "description": "URL song | Youtube / Soundcloud / Spotify / Tiktok Video & Music",
      "required": true,
      "min_length": 8
    },
    {
      "type": 5,
      "name": "lyrics",
      "description": "Include lyrics?",
      "required": false
    },
    {
      "type": 3,
      "name": "file_name",
      "description": "File name for attachment",
      "required": false
    }
  ],
  "integration_types": [
    0,
    1
  ],
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Unduh sebuah media"
  },
},
type: 0,
code: `
$onlyIf[$guildID!=;]

$onlyIf[$isValidLink[$option[url]];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidLinkDownload]]
$jsonLoad[musictype;$callFunction[filterMediaID;$option[url]]]
$onlyIf[$or[$env[musictype;id]!=;$env[musictype;id]!=null;$env[musictype;type]!=null];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$onlyIf[$env[musictype;type]!=youtubeplaylist;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$try[
$if[$env[musictype;type]==spotify;
$defer
$let[gettitle;$callFunction[fetchTitleTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1]]]
$onlyIf[$get[gettitle]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$jsonLoad[b;$callFunction[getYoutubeMusic;$get[gettitle]]]
$onlyIf[$env[b;results;0]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$let[getcdn;$trimLines[$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];v]]]
$let[mid;$interactionReply[Testing URL...;true]]
;
$let[mid;$interactionReply[Testing URL...;true]]
$let[getcdn;$trimLines[$callFunction[fallbackPlaybackTrack;$option[url];]]]
]
$onlyIf[$advancedTextSplit[$get[getcdn];|;0]!=bot;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]\nError: $advancedTextSplit[$get[getcdn];|;1]]
$onlyIf[$or[$get[getcdn]==null;$get[getcdn]==live;$get[getcdn]==]!=true;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$if[$has[gettitle]==false;
$let[gettitle;$callFunction[fetchTitleTrack;$option[url]]]
$if[$get[gettitle]==;$let[gettitle;$getTimestamp-$env[musictype;type]]]
]
$!djsEval[(async () => { const c = new AbortController(), r = await fetch(ctx.getKeyword("getcdn"), { signal: c.signal })\\; ctx.setKeyword("clh", r.headers.get('Content-Length') ?? '')\\; ctx.setKeyword("cly", r.headers.get('Content-Type') ?? '')\\; ctx.setKeyword("httpstatus", r.status.toString())\\; r.body?.cancel()\\; c.abort()\\; })()]
$onlyIf[$or[$get[httpstatus]==200;$get[httpstatus]==206];$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$onlyIf[$get[clh]<=10000000;$callFunction[useCustomMusicMessage;config_generalOverDownload]]
$if[$and[$option[lyrics]==true;$or[$env[musictype;type]!=spotify;$env[musictype;type]!=tiktokmob;$env[musictype;type]!=tiktok;$env[musictype;type]!=tiktokmusic]];
$interactionReply[Fetching Lyrics...]
$let[checklyric;false]
$jsonLoad[lyricresult;$callFunction[getLyricsTrack;$get[gettitle];;true;true]]
$if[$env[lyricresult;results]!=;
$let[loadlyrics;$inflate[$env[lyricresult;results;lyric];hex]] 
$let[checklyric;true]
$let[lyricnames;$if[$option[file_name]!=;$option[file_name];$get[gettitle]].lrc]
]]
$let[contenttype;$advancedTextSplit[$get[cly];/;1]]
$if[$or[$env[musictype;type]==tiktok;$env[musictype;type]==tiktokmob];
$let[converttype;mp4]
;
$let[converttype;$if[$get[contenttype]==webm;opus;$if[$get[contenttype]==mp4;m4a;$if[$or[$get[contenttype]==mp3;$get[contenttype]==mpeg];mp3;$get[contenttype]]]]]
]
$let[timest;$getTimestamp]
$let[names;$if[$option[file_name]!=;$option[file_name].$get[converttype];$get[gettitle].$get[converttype]]]
$interactionReply[
$addField[Type;\`$toTitleCase[$env[musictype;type]]\`;true]
$addField[Length Size;\`$get[clh]\`\n-# $round[$divide[$get[clh];1024;1024];2] MB;true]
$addField[Format;\`.$get[contenttype]$if[$get[contenttype]!=$get[converttype]; => .$get[converttype]]\`;true]
$addField[File Name;$if[$and[$option[lyrics]==true;$get[checklyric]];$codeBlock[$get[lyricnames]]]$codeBlock[$get[names]];false]
$thumbnail[$userAvatar[$authorID;2048]]
$color[$callFunction[useIcon;color_embed];0]
$footer[Downloading;$callFunction[useIcon;loading]]
]
$interactionReply[
$if[$and[$option[lyrics]==true;$get[checklyric]];$attachment[$get[loadlyrics];$get[lyricnames];true]]
$attachment[$trimLines[$get[getcdn]];$get[names]]
]
$if[$channelExists[$channelID];
$fetchMessage[$channelID;$get[mid]]
$if[$messageAttachmentCount[$channelID;$get[mid]]==0;
$interactionReply[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
]]
]
`
}