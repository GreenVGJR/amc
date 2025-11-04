module.exports = {
  data: {
  "name": "download",
  "description": "Download a media",
  "options": [
    {
      "type": 3,
      "name": "url",
      "description": "URL media | Youtube, Soundcloud, Spotify, Tiktok, Twitter, Instagram, Facebook, Bandcamp",
      "required": true,
      "min_length": 8
    },
    {
      "type": 3,
      "name": "yt_option",
      "description": "Override download options for Youtube",
      "required": false,
      "choices": [{
        "name": "Audio",
        "value": "1"
      },
      {
        "name": "Audio + Video",
        "value": "2"
      }],
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
$let[uravt;$memberAvatar[$guildID;$authorID;1024]]
$localFunction[runcodessync;
$let[mid2;$interactionReply[
$author[$if[$env[msg1]!=;$env[msg1];None];$get[uravt]]
$addField[Type;\`$toTitleCase[$advancedReplace[$env[musictype;type];tiktokmusic;tiktok music;tiktokmob;tiktok mobile]]\`;true]
$addField[Length Size;$if[$get[clh]==;\`null\`;\`$get[clh]\`\n-# $round[$divide[$get[clh];1024;1024];2] MB];true]
$addField[Format;\`$if[$get[converttype]==;null;.$get[contenttype]$if[$get[contenttype]!=$get[converttype]; => .$get[converttype]]]\`;true]
$addField[File Name;$if[$and[$option[lyrics]==true;$get[checklyric]];$codeBlock[$get[lyricnames]]]$codeBlock[$get[names]]$if[$and[$has[checklyric];$get[checklyric]==false];\n-# WARNING: Lyrics not available];false]
$color[$callFunction[useIcon;color_embed];0]
$footer[$env[msg2];$if[$env[togload]==true;$callFunction[useIcon;loading]]]
;$checkCondition[$has[mid]==false]]]
$if[$has[mid]==false;$let[mid;$get[mid2]]]
$return
;msg1;msg2;togload]
$let[isactivelyric;$and[$option[yt_option]!=2;$option[lyrics]==true;$or[$env[musictype;type]==youtube;$env[musictype;type]==soundcloud;$env[musictype;type]==spotify]]]
$try[
$if[$env[musictype;type]==spotify;
$callLocalFunction[runcodessync;Converting;Processing;true]
$let[storeobjecthttp;$callFunction[extractTrack;$env[b;results;0;url]]]
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1];$default[$get[storeobjecthttp];]];0;479;]]
$onlyIf[$get[gettitle]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$jsonLoad[b;$callFunction[getYoutubeMusic;$get[gettitle]]]
$onlyIf[$env[b;results;0]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$callLocalFunction[runcodessync;Getting CDN$if[$get[isactivelyric]; & Lyrics];Fetching - This may take longer;true]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];v;$default[$get[storeobjecthttp];]]]
;
$callLocalFunction[runcodessync;Getting CDN & Title$if[$get[isactivelyric]; & Lyrics];Fetching - This may take longer;true]
$let[storeobjecthttp;$callFunction[extractTrack;$get[url]]]
$jsonLoad[preobject;$get[storeobjecthttp]]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$get[url];$if[$and[$env[musictype;type]==youtube;$option[yt_option]==2];hls;v];$default[$get[storeobjecthttp];]]]
]
$onlyIf[$advancedTextSplit[$trimLines[$get[getcdn]];|;0]!=bot;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]\nError: $advancedTextSplit[$trimLines[$get[getcdn]];|;1]]
$onlyIf[$or[$trimLines[$get[getcdn]]==null;$trimLines[$get[getcdn]]==live;$trimLines[$get[getcdn]]==]!=true;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$!djsEval[fetch(ctx.getKeyword("getcdn"),{method:"GET"}).then(r=>{ctx.setKeyword("clh",r.headers.get("Content-Length")??"")\\;ctx.setKeyword("cly",r.headers.get("Content-Type")??"")\\;ctx.setKeyword("httpstatus",r.status.toString())}).catch()]
$if[$has[gettitle]==false;
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;$get[url];$default[$get[storeobjecthttp];]];0;479;]]
$if[$get[gettitle]==;$let[gettitle;$getTimestamp-$env[musictype;type]]]
]
$onlyIf[$or[$get[httpstatus]==200;$get[httpstatus]==206];$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$onlyIf[$get[clh]<=10000000;$callFunction[useCustomMusicMessage;config_generalOverDownload]\n$hyperlink[$get[gettitle];$trimLines[$get[getcdn]]]]
$let[mediatype;$advancedTextSplit[$get[cly];/;0]]
$let[contenttype;$advancedTextSplit[$get[cly];/;1]]
$if[$get[mediatype]==video;
$let[converttype;mp4]
;
$let[converttype;$if[$get[contenttype]==webm;opus;$if[$get[contenttype]==mp4;m4a;$if[$or[$get[contenttype]==mp3;$get[contenttype]==mpeg];mp3;$get[contenttype]]]]]
]
$if[$get[isactivelyric];
$let[checklyric;false]
$jsonLoad[lyricresult;$callFunction[getLyricsTrack;$get[gettitle];;true;true]]
$if[$env[lyricresult;results]!=;
$let[loadlyrics;$inflate[$env[lyricresult;results;lyric];hex]] 
$let[checklyric;true]
$let[lyricnames;$if[$option[file_name]!=;$option[file_name];$get[gettitle]].lrc]
]]
$let[names;$if[$option[file_name]!=;$option[file_name].$get[converttype];$get[gettitle].$get[converttype]]]
$if[$and[$env[musictype;type]==youtube;$option[yt_option]==2];
$let[contenttype;m3u8]
$let[converttype;ts]
$let[names;$get[gettitle]]
$onlyIf[$httpRequest[$get[getcdn];GET]==200;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$let[clh;$charCount[$httpResult]]
$callLocalFunction[runcodessync;Fetching Segments;Connected to: $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
$let[clh;0]
$arrayLoad[b;#EXTINF;$httpResult]
$!arrayShift[b]
$arrayMap[b;c;$return[$advancedTextSplit[$env[c];
;1]];b]
$arrayMap[b;c;$if[$get[clh]<=10000000;$return[$djsEval[fetch("$env[c]").then(r => r.arrayBuffer()).then(d => { (ctx.setKeyword("clh", Number(ctx.getKeyword("clh") ?? 0) + d.byteLength))\\; return Buffer.from(d).toString("base64")}).then(e => e).catch()]]];b]
$let[ks;$djsEval[Buffer.concat(JSON.parse(\\\`$env[b]\\\`).map(s => Buffer.from(s, "base64"))).toString("base64")]]
$onlyIf[$get[clh]!=0;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$onlyIf[$get[clh]<=10000000;$callFunction[useCustomMusicMessage;config_generalOverDownload]\n$hyperlink[$get[gettitle];$trimLines[$get[getcdn]]]]
$let[contenttype;ts]
$let[converttype;mp4]
$let[names;$get[gettitle].$get[converttype]]
$callLocalFunction[runcodessync;;Uploading;true]
$interactionReply[
$attachment[$get[ks];$get[names];true;base64]
]
;
$let[condownbytes_headers;{
"Accept": "*/*",
"Range": "bytes=0-$get[clh]",
"Sec-Fetch-Site": "none",
"User-Agent": "Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
}]
$callLocalFunction[runcodessync;Downloading;Connected to: $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
$let[condownbytes;$djsEval[fetch("$trimLines[$get[getcdn]]", { method: "GET", headers: JSON.parse(ctx.getKeyword("condownbytes_headers")) }).then(a => a.arrayBuffer()).then(b => Buffer.from(b).toString("base64")).then(e => e).catch()]]
$onlyIf[$get[condownbytes]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$callLocalFunction[runcodessync;;Uploading;true]
$interactionReply[
$if[$and[$option[lyrics]==true;$get[checklyric]];$attachment[$get[loadlyrics];$get[lyricnames];true]]
$attachment[$get[condownbytes];$get[names];true;base64]
]]
$if[$channelExists[$channelID];
$fetchMessage[$channelID;$get[mid]]
$if[$messageAttachmentCount[$channelID;$get[mid]]==0;
$interactionReply[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
]]
]
`
}