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
$let[url;$sliceText[$option[url];0;1]]
$onlyIf[$isValidLink[$get[url]];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidLinkDownload]]
$jsonLoad[musictype;$callFunction[filterMediaID;$get[url]]]
$onlyIf[$or[$env[musictype;id]==;$env[musictype;id]==null;$env[musictype;type]==null]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$onlyIf[$env[musictype;type]!=youtubeplaylist;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$localFunction[runcodessync;
$let[mid2;$interactionReply[
$if[$env[msg1]!=;$author[$env[msg1]]]
$addField[Type;\`$toTitleCase[$advancedReplace[$env[musictype;type];tiktokmusic;tiktok music;tiktokmob;tiktok mobile]]\`;true]
$addField[Length Size;\`$get[clh]\`\n-# $round[$divide[$get[clh];1024;1024];2] MB;true]
$addField[Format;\`.$get[contenttype]$if[$get[contenttype]!=$get[converttype]; => .$get[converttype]]\`;true]
$addField[File Name;$if[$and[$option[lyrics]==true;$get[checklyric]];$codeBlock[$get[lyricnames]]]$codeBlock[$get[names]]$if[$and[$has[checklyric];$get[checklyric]==false];\n-# WARNING: Lyrics not available];false]
$color[$callFunction[useIcon;color_embed];0]
$footer[$env[msg2];$if[$env[togload]==true;$callFunction[useIcon;loading]]]
;$checkCondition[$has[mid]==false]]]
$if[$has[mid]==false;$let[mid;$get[mid2]]]
$return
;msg1;msg2;togload]
$try[
$if[$env[musictype;type]==spotify;
$callLocalFunction[runcodessync;Converting;Processing;true]
$let[gettitle;$callFunction[fetchTitleTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1]]]
$onlyIf[$get[gettitle]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$jsonLoad[b;$callFunction[getYoutubeMusic;$get[gettitle]]]
$onlyIf[$env[b;results;0]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$callLocalFunction[runcodessync;Getting CDN;Fetching - This may take longer;true]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];v]]
;
$callLocalFunction[runcodessync;Getting CDN & Title;Fetching - This may take longer;true]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$get[url];v]]
]
$onlyIf[$advancedTextSplit[$trimLines[$get[getcdn]];|;0]!=bot;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]\nError: $advancedTextSplit[$trimLines[$get[getcdn]];|;1]]
$onlyIf[$or[$trimLines[$get[getcdn]]==null;$trimLines[$get[getcdn]]==live;$trimLines[$get[getcdn]]==]!=true;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$if[$has[gettitle]==false;
$let[gettitle;$callFunction[fetchTitleTrack;$get[url]]]
$if[$get[gettitle]==;$let[gettitle;$getTimestamp-$env[musictype;type]]]
]
$if[$and[$option[lyrics]==true;$or[$env[musictype;type]!=tiktokmob;$env[musictype;type]!=tiktok;$env[musictype;type]!=tiktokmusic]];
$let[checklyric;false]
$jsonLoad[lyricresult;$callFunction[getLyricsTrack;$get[gettitle];;true;true]]
$callLocalFunction[runcodessync;;Fetching Lyrics;true]
$if[$env[lyricresult;results]!=;
$let[loadlyrics;$inflate[$env[lyricresult;results;lyric];hex]] 
$let[checklyric;true]
$let[lyricnames;$if[$option[file_name]!=;$option[file_name];$get[gettitle]].lrc]
]]
$callLocalFunction[runcodessync;;Testing URL;false]
$!djsEval[fetch(ctx.getKeyword("getcdn"),{method:"GET"}).then(r=>{ctx.setKeyword("clh",r.headers.get("Content-Length")??"")\\;ctx.setKeyword("cly",r.headers.get("Content-Type")??"")\\;ctx.setKeyword("httpstatus",r.status.toString())}).catch()]
$onlyIf[$or[$get[httpstatus]==200;$get[httpstatus]==206];$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$onlyIf[$get[clh]<=10000000;$callFunction[useCustomMusicMessage;config_generalOverDownload]\n$hyperlink[$get[gettitle];$trimLines[$trimLines[$get[getcdn]]]]]
$let[contenttype;$advancedTextSplit[$get[cly];/;1]]
$if[$or[$env[musictype;type]==tiktok;$env[musictype;type]==tiktokmob];
$let[converttype;mp4]
;
$let[converttype;$if[$get[contenttype]==webm;opus;$if[$get[contenttype]==mp4;m4a;$if[$or[$get[contenttype]==mp3;$get[contenttype]==mpeg];mp3;$get[contenttype]]]]]
]
$let[names;$if[$option[file_name]!=;$option[file_name].$get[converttype];$get[gettitle].$get[converttype]]]
$callLocalFunction[runcodessync;;Downloading;true]
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