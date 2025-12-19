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
        },
        {
          "name": "Audio + Video (Legacy)",
          "value": "3"
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
$let[url;$sliceText[$trim[$option[url]];0;1]]
$let[uravt;$userAvatar[$authorID;1024]]
$onlyIf[$isValidLink[$get[url]];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidLinkDownload]]
$jsonLoad[musictype;$callFunction[filterMediaID;$get[url]]]
$onlyIf[$or[$env[musictype;id]==;$env[musictype;id]==null;$env[musictype;type]==null]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$onlyIf[$env[musictype;type]!=youtubeplaylist;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$if[$channelExists[$channelID];
$onlyIf[$channelHasPerms[$channelID;$clientID;AttachFiles];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Attach Files** - <@$clientID>]
]
$let[mid;]
$localFunction[runcodessync;
$let[mid;$interactionReply[
$author[$if[$env[msg1]!=;$env[msg1];None];$get[uravt]]
$addField[Type;\`$toTitleCase[$advancedReplace[$env[musictype;type];tiktokmusic;tiktok music;tiktokmob;tiktok mobile;instagramaudio;instagram audio]]\`;true]
$addField[Length Size;$if[$get[clh]==;\`null\`;\`$get[clh]\`\n-# $round[$divide[$get[clh];1024;1024];2] MB];true]
$addField[Format;\`$if[$get[converttype]==;null;.$get[contenttype]$if[$get[contenttype]!=$get[converttype]; => .$get[converttype]]]\`;true]
$addField[File Name;$if[$and[$option[lyrics]==true;$get[checklyric]];$codeBlock[$get[lyricnames]]]$codeBlock[$get[names]]$if[$and[$has[checklyric];$get[checklyric]==false];\n-# WARNING: Lyrics not available];false]
$color[$callFunction[useIcon;color_embed];0]
$footer[$env[msg2];$if[$env[togload]==true;$callFunction[useIcon;loading]]]
;true]]
$return
;msg1;msg2;togload]
$let[agent;$callFunction[configMusic;default_userAgent]]
$let[isactivelyric;$and[$option[yt_option]!=2;$option[yt_option]!=3;$option[lyrics]==true;$or[$env[musictype;type]==youtube;$env[musictype;type]==soundcloud;$env[musictype;type]==spotify;$env[musictype;type]==bandcamp]]]
$try[
$if[$env[musictype;type]==spotify;
$callLocalFunction[runcodessync;Converting;Processing;true]
$let[storeobjecthttp;$callFunction[extractTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1]]]
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1];$get[storeobjecthttp]];0;479;]]
$onlyIf[$get[gettitle]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$jsonLoad[b;$callFunction[getYoutubeMusic;$get[gettitle]]]
$onlyIf[$env[b;results;0]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$callLocalFunction[runcodessync;Getting CDN$if[$get[isactivelyric]; & Lyrics];Fetching - This may take longer;true]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];v;$get[storeobjecthttp]]]
;
$let[storeobjecthttp;]
$let[getcdn;]
$let[s-fetch;false]
$async[
$wait[3]
$let[storeobjecthttp;$callFunction[extractTrack;$get[url]]]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$get[url];$if[$and[$env[musictype;type]==youtube;$option[yt_option]==2];hls;$if[$and[$env[musictype;type]==youtube;$option[yt_option]==3];va;v]];$get[storeobjecthttp]]]
$let[s-fetch;true]
]
$callLocalFunction[runcodessync;Getting CDN & Title$if[$get[isactivelyric]; & Lyrics];Fetching - This may take longer;true]
$loop[-1;
$if[$get[s-fetch]!=false;$break]
$wait[5]
]
]
$onlyIf[$advancedTextSplit[$trimLines[$get[getcdn]];|;0]!=bot;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]\nError: $advancedTextSplit[$trimLines[$get[getcdn]];|;1]]
$onlyIf[$or[$trimLines[$get[getcdn]]==null;$trimLines[$get[getcdn]]==live;$trimLines[$get[getcdn]]==]!=true;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$if[$has[gettitle]==false;
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;$get[url];$get[storeobjecthttp]];0;479;]]
$if[$get[gettitle]==;$let[gettitle;$getTimestamp-$env[musictype;type]]]
]
$if[$get[isactivelyric];
$let[checklyric;false]
$jsonLoad[lyricresult;$callFunction[getLyricsTrack;$get[gettitle];;true;true]]
$if[$env[lyricresult;results]!=;
$let[loadlyrics;$inflate[$env[lyricresult;results;lyric];hex]] 
$let[checklyric;true]
$let[lyricnames;$if[$option[file_name]!=;$option[file_name];$get[gettitle]].lrc]
]]
$let[checkcdn_headers;{
"Accept": "*/*",
"Sec-Fetch-Site": "none",
"User-Agent": "$get[agent]"
}]
$if[$and[$env[musictype;type]==youtube;$option[yt_option]==2];
$let[contenttype;m3u8]
$let[converttype;ts]
$let[names;$get[gettitle]]
$let[names;$if[$option[file_name]!=;$option[file_name].$get[converttype];$get[gettitle].$get[converttype]]]
$httpAddHeader[User-Agent;$get[agent]]
$httpSetContentType[Text]
$onlyIf[$httpRequest[$get[getcdn];GET]==200;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$let[clh;$charCount[$httpResult]]
$callLocalFunction[runcodessync;Fetching Segments » Uploading;Connected to: $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
$let[clh;0]
$arrayLoad[b;#EXTINF;$httpResult]
$!arrayShift[b]
$arrayMap[b;c;$return[$advancedTextSplit[$env[c];
;1]];b]
$arrayMap[b;c;$if[$get[clh]<=10000000;$return[$djsEval[fetch("$env[c]", { method: "GET", headers: JSON.parse(ctx.getKeyword("checkcdn_headers")) }).then(r => r.arrayBuffer()).then(d => { (ctx.setKeyword("clh", Number(ctx.getKeyword("clh") ?? 0) + d.byteLength))\\; return Buffer.from(d).toString("base64")}).then(e => e).catch()]]];b]
$let[ks;$djsEval[Buffer.concat(JSON.parse(\\\`$env[b]\\\`).map(s => Buffer.from(s, "base64"))).toString("base64")]]
$onlyIf[$get[clh]!=0;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$onlyIf[$get[clh]<=10000000;$callFunction[useCustomMusicMessage;config_generalOverDownload]\n$hyperlink[$get[gettitle];$trimLines[$get[getcdn]]]]
$let[contenttype;ts]
$let[converttype;mp4]
$let[names;$get[gettitle].$get[converttype]]
$#interactionReply[
$attachment[$get[ks];$get[names];true;base64]
]
;
$let[f-fetch;false]
$let[condownbytes;]
$let[httpstatus;]
$let[clh;]
$let[cly;]
$async[
$wait[3]
$let[condownbytes;$djsEval[fetch(ctx.getKeyword("getcdn"),{method:"GET",headers:JSON.parse(ctx.getKeyword("checkcdn_headers"))}).then(r=>{ctx.setKeyword("clh",r.headers?.get('content-length')??"")\\;ctx.setKeyword("cly",r.headers?.get('content-type')??"")\\;ctx.setKeyword("httpstatus",r.status)\\; return ((r.status === 200 || r.status === 206) && ((parseInt(r.headers?.get('content-length'), 10) ?? 0) <= 10000000)) ? r.arrayBuffer() : null\\;}).then(b => Buffer.from(b).toString("base64")).then(e => e).catch()]]
$let[f-fetch;true]
]
$loop[-1;
$if[$or[$isNumber[$get[clh]];$get[f-fetch]==true];$break]
$wait[5]
]
$onlyIf[$or[$get[httpstatus]==200;$get[httpstatus]==206];$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$onlyIf[$get[clh]<=10000000;$callFunction[useCustomMusicMessage;config_generalOverDownload]\n$hyperlink[$advancedTextSplit[$get[gettitle];
;0];$trimLines[$get[getcdn]]]]
$let[mediatype;$advancedTextSplit[$get[cly];/;0]]
$let[contenttype;$advancedTextSplit[$get[cly];/;1]]
$if[$get[mediatype]==video;
$if[$env[musictype;type]==instagramaudio;
$let[converttype;m4a]
;
$let[converttype;mp4]
]
;
$let[converttype;$if[$get[contenttype]==webm;opus;$if[$get[contenttype]==mp4;m4a;$if[$or[$get[contenttype]==mp3;$get[contenttype]==mpeg];mp3;$get[contenttype]]]]]
]
$let[names;$if[$option[file_name]!=;$option[file_name].$get[converttype];$get[gettitle].$get[converttype]]]
$if[$get[f-fetch]==false;
$callLocalFunction[runcodessync;Downloading » Uploading;Connected to: $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
]
$loop[-1;
$if[$get[f-fetch]!=false;$break]
$wait[5]
]
$onlyIf[$get[condownbytes]!=;$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$#interactionReply[
$if[$and[$option[lyrics]==true;$get[checklyric]];$attachment[$get[loadlyrics];$get[lyricnames];true]]
$attachment[$get[condownbytes];$get[names];true;base64]
]]
$if[$channelExists[$channelID];
$fetchMessage[$channelID;$get[mid]]
$if[$messageAttachmentCount[$channelID;$get[mid]]==0;
$#interactionReply[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
]]
]
`
}