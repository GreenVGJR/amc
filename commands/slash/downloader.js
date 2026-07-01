module.exports = {
  data: {
    "name": "download",
    "description": "Download a media (Only supports Video, Audio)",
    "options": [
      {
        "type": 3,
        "name": "url",
        "description": "Youtube, Soundcloud, Spotify, Apple Music, Tiktok, Twitter, Instagram, Threads, Facebook, Bandcamp",
        "required": true,
        "min_length": 8
      },
      {
        "type": 3,
        "name": "yt_option",
        "description": "Override download options for Youtube",
        "required": false,
        "choices": [{
          "name": "Audio - M4A",
          "value": "v"
        },
        {
          "name": "Audio - OPUS",
          "value": "vs"
        },
        {
          "name": "Audio + Video (Legacy)",
          "value": "va"
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
      },
      {
        "type": 5,
        "name": "ephemeral",
        "description": "Respond on ephemeral?",
        "required": false
      },
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
$let[limitsize;$djsEval[ctx.interaction.attachmentSizeLimit]]
$let[url;$sliceText[$trim[$decodeURIComponent[$option[url]]];0;1]]
$onlyIf[$isValidLink[$get[url]];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidLinkDownload]]
$jsonLoad[musictype;$callFunction[filterMediaID;$get[url]]]
$onlyIf[$or[$env[musictype;id]==;$env[musictype;id]==null;$env[musictype;type]==null]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$onlyIf[$env[musictype;type]!=youtubeplaylist;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$if[$channelExists[$channelID];
$onlyIf[$channelHasPerms[$channelID;$clientID;AttachFiles];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Attach Files** - <@$clientID>]
]
$if[$or[$and[$channelExists[$channelID]==false;$option[ephemeral]!=false];$and[$channelExists[$channelID]==true;$option[ephemeral]==true]];$ephemeral]
$localFunction[runcodessync;
$interactionReply[
$addContainer[
$addSection[
$addTextDisplay[### $env[msg1]]
$addTextDisplay[-# » $toTitleCase[$advancedReplace[$env[musictype;type];tiktokmusic;tiktok music;tiktokmob;tiktok mobile;instagramaudio;instagram audio;applemusic;apple music]]\n-# » $if[$get[clh]==;null;$round[$divide[$get[clh];1024;1024];2] MB - $round[$divide[$get[limitsize];1024;1024];2] MB]\n-# » $if[$get[converttype]==;null;.$get[contenttype]$if[$get[contenttype]!=$get[converttype]; => .$get[converttype]]]]
$addThumbnail[$userAvatar[$authorID;2048]]
]
$addSeparator[Small;true]
$addTextDisplay[$env[msg2]]
$if[$env[togload]==true;
$addSeparator[Small;true]
$if[$get[targetattachtype]==0;
$addTextDisplay[$if[$and[$option[lyrics]==true;$get[checklyric]];$codeBlock[$default[$get[lyricnames];null]]]$codeBlock[$default[$get[names];null]]$if[$and[$has[checklyric];$get[checklyric]==false];\n-# WARNING: Lyrics not available]]
$addMediaGallery[$addMediaItem[$get[getcdn];$get[getpuretitle]]]
]
$addTextDisplay[-# Preview Mode$if[$get[targetattachtype]!=0; (Not Available)]]
]
;$callFunction[useIcon;color_embed]]
]
$return
;msg1;msg2;togload]
$let[agent;$callFunction[configMusic;default_userAgent_desktop]]
$let[isactivelyric;$and[$option[yt_option]!=va;$option[lyrics]==true;$or[$env[musictype;type]==youtube;$env[musictype;type]==soundcloud;$env[musictype;type]==spotify;$env[musictype;type]==bandcamp]]]
$try[
$if[$env[musictype;type]==spotify;
$let[m-fetch;false]
$let[storeobjecthttp;]
$let[gettitle;]
$let[getpuretitle;]
$let[getcdn;]
$async[
$let[storeobjecthttp;$callFunction[extractTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1]]]
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1];$get[storeobjecthttp]];0;479;]]
$onlyIf[$get[gettitle]!=;$let[m-fetch;null]]
$let[getpuretitle;$cropText[$callFunction[fetchTitleTrack;https://open.spotify.com/track/$advancedTextSplit[$env[musictype;id];/;1];$get[storeobjecthttp]];0;1024;]]
$jsonLoad[b;$callFunction[getYoutubeMusic;$get[getpuretitle]]]
$onlyIf[$env[b;results;0]!=;$let[m-fetch;null]]
$let[m-fetch;true]
]
$if[$get[m-fetch]==false;
$callLocalFunction[runcodessync;Fetching;none;false]
]
$loop[-1;
$if[$get[m-fetch]!=false;$break]
$wait[10]
]
$onlyIf[$get[m-fetch]!=null;$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];v;$get[storeobjecthttp];$get[limitsize]]]
;
$if[$env[musictype;type]==applemusic;
$let[m-fetch;false]
$let[storeobjecthttp;]
$let[gettitle;]
$let[getpuretitle;]
$let[getcdn;]
$async[
$let[storeobjecthttp;$callFunction[extractTrack;https://music.apple.com/us/song//$env[musictype;id]]]
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;https://music.apple.com/us/song//$env[musictype;id];$get[storeobjecthttp]];0;479;]]
$onlyIf[$get[gettitle]!=;$let[m-fetch;null]]
$let[getpuretitle;$cropText[$callFunction[fetchTitleTrack;https://music.apple.com/us/song//$env[musictype;id];$get[storeobjecthttp]];0;1024;]]
$jsonLoad[b;$callFunction[getYoutubeMusic;$get[getpuretitle]]]
$onlyIf[$env[b;results;0]!=;$let[m-fetch;null]]
$let[m-fetch;true]
]
$if[$get[m-fetch]==false;
$callLocalFunction[runcodessync;Fetching;none;false]
]
$loop[-1;
$if[$get[m-fetch]!=false;$break]
$wait[10]
]
$onlyIf[$get[m-fetch]!=null;$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];v;$get[storeobjecthttp];$get[limitsize]]]
;
$let[storeobjecthttp;]
$let[getcdn;]
$let[s-fetch;false]
$async[
$let[storeobjecthttp;$callFunction[extractTrack;$get[url]]]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$get[url];$if[$env[musictype;type]==youtube;$option[yt_option];v];$get[storeobjecthttp];$get[limitsize]]]
$let[s-fetch;true]
]
$if[$get[s-fetch]==false;
$callLocalFunction[runcodessync;Fetching;none;false]
]
$loop[-1;
$if[$get[s-fetch]!=false;$break]
$wait[10]
]
]
]
$onlyIf[$advancedTextSplit[$trimLines[$get[getcdn]];|;0]!=bot;$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]\n-# $advancedTextSplit[$trimLines[$get[getcdn]];|;1]]]
$onlyIf[$or[$trimLines[$get[getcdn]]==null;$trimLines[$get[getcdn]]==live;$trimLines[$get[getcdn]]==]!=true;$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]]
$if[$has[gettitle]==false;
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;$get[url];$get[storeobjecthttp]];0;479;]]
$if[$get[gettitle]==;$let[gettitle;$getTimestamp-$env[musictype;type]];
]
]
$if[$isJSON[$get[getcdn]];
$jsonLoad[yup;$get[getcdn]]
$let[clh-temp;$env[yup;length]]
$onlyIf[$get[clh]<=$get[limitsize];
$let[names;$if[$option[file_name]!=;$option[file_name];$get[gettitle]]]
$callLocalFunction[runcodessync;Aborted;-# $bold[$replace[$callFunction[useCustomMusicMessage;config_generalOverDownload];{limit_size};$round[$divide[$get[limitsize];1024;1024];2]MB]]\n-# $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
]
$let[isjsoncdn;true]
;
$let[isjsoncdn;false]
]
$if[$get[isactivelyric];
$let[checklyric;false]
$jsonLoad[lyricresult;$callFunction[getLyricsTrack;$get[gettitle];;true;true]]
$if[$env[lyricresult;results]!=;
$let[loadlyrics;$inflate[$env[lyricresult;results;lyric];base64]] 
$let[checklyric;true]
$let[lyricnames;$if[$option[file_name]!=;$option[file_name];$get[gettitle]].lrc]
]]
$let[checkcdn_headers;{
"Accept": "*/*",
"Accept-Encoding": "identity",
"Sec-Fetch-Site": "none",
"User-Agent": "$get[agent]"
}]

$let[f-fetch;false]
$let[condownbytes;]
$let[httpstatus;]
$let[clh;]
$let[cly;]
$async[
$if[$get[isjsoncdn]==false;
$!djsEval[fetch(ctx.getKeyword("getcdn"),{method:"GET",headers:JSON.parse(ctx.getKeyword("checkcdn_headers"))}).then(r=>{ctx.setKeyword("clh",r.headers?.get('content-length')??"")\\;ctx.setKeyword("cly",r.headers?.get('content-type')??"")\\;ctx.setKeyword("httpstatus",r.status)\\; return ((r.status === 200 || r.status === 206) && ((parseInt(r.headers?.get('content-length'), 10) ?? 0) <= ctx.getKeyword("limitsize"))) ? r.arrayBuffer() : null\\;}).then(b => { if(b) ctx.setKeyword("condownbytes", Buffer.from(b).toString("base64"))\\; b = null\\; }).catch(() => "")]
;
$let[clh;$get[clh-temp]]
$jsonLoad[yup_container;$env[yup;container]]
$let[getcdn;$env[yup;original]]
$arrayMap[yup_container;c;$return[$djsEval[fetch("$env[c]", { method: "GET", headers: JSON.parse(ctx.getKeyword("checkcdn_headers")) }).then(r=>{ctx.setKeyword("cly",r.headers?.get('content-type')??"")\\;ctx.setKeyword("httpstatus",r.status)\\; return ((r.status === 200 || r.status === 206) && ((parseInt(r.headers?.get('content-length'), 10) ?? 0) <= ctx.getKeyword("limitsize"))) ? r.arrayBuffer() : null\\;}).then(d => { const b = d ? Buffer.from(d).toString("base64") : ""\\; d = null\\; return b\\; }).catch(() => "")]];yup_container]
]
$let[f-fetch;true]
]
$loop[-1;
$if[$or[$isNumber[$get[httpstatus]];$get[f-fetch]==true];$break]
$wait[10]
]
$onlyIf[$get[httpstatus]!=;$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]]
$onlyIf[$or[$get[httpstatus]==200;$get[httpstatus]==206];$addTextDisplay[($get[httpstatus]) $callFunction[useCustomMusicMessage;config_generalForbiddenDownload]]]
$let[mediatype;$advancedTextSplit[$get[cly];/;0]]
$let[contenttype;$advancedTextSplit[$get[cly];/;1]]
$if[$get[mediatype]==video;
$let[targetattachtype;0]
$if[$env[musictype;type]==instagramaudio;
$let[converttype;m4a]
$let[targetattachtype;1]
;
$let[converttype;mp4]
]
;
$let[targetattachtype;1]
$let[converttype;$if[$get[contenttype]==webm;opus;$if[$get[contenttype]==mp4;m4a;$if[$or[$get[contenttype]==mp3;$get[contenttype]==mpeg];mp3;$get[contenttype]]]]]
]
$let[names;$if[$option[file_name]!=;$option[file_name];$get[gettitle]]]
$onlyIf[$get[clh]<=$get[limitsize];$callLocalFunction[runcodessync;Aborted;-# $bold[$replace[$callFunction[useCustomMusicMessage;config_generalOverDownload];{limit_size};$round[$divide[$get[limitsize];1024;1024];2]MB]]\n-# $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]]
$if[$get[f-fetch]==false;
$if[$get[isjsoncdn]==false;
$callLocalFunction[runcodessync;Downloading » Uploading;-# $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
;
$callLocalFunction[runcodessync;Downloading;-# $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
]]
$loop[-1;
$if[$get[f-fetch]!=false;$break]
$wait[10]
]
$if[$get[isjsoncdn]==true;
$callLocalFunction[runcodessync;Processing » Uploading;-# $advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
$try[$!djsEval[
let chunks = ctx.getEnvironmentKey("yup_container")\\;
  if (!Array.isArray(chunks)) chunks = [\\]\\;

  const decoded = chunks.map((s) => Buffer.from(s, "base64"))\\;
  const totalLength = decoded.reduce((n, b) => n + b.length, 0)\\;

  const final = Buffer.allocUnsafe(totalLength)\\;
  let offset = 0\\;
  for (const buf of decoded) {
    buf.copy(final, offset)\\;
    offset += buf.length\\;
  }

  ctx.setKeyword("condownbytes", final.toString("base64"))\\;
  decoded.length = 0\\;
]]
]
$onlyIf[$get[condownbytes]!=;$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]]
$let[getpuretitle;$cropText[($round[$divide[$get[clh];1024;1024];2] MB) $callFunction[fetchTitleTrack;$get[url];$get[storeobjecthttp]];0;1024;]]
$try[
$interactionReply[
$let[names;$replaceRegex[$get[names];\\[^A-Za-z0-9_-\\];g;_].$get[converttype]]
$if[$and[$option[lyrics]==true;$get[checklyric]];
$attachment[$get[loadlyrics];$get[lyricnames];true]
$addFile[attachment://$get[lyricnames]]
]
$attachment[$get[condownbytes];$get[names];true;base64]
$if[$get[targetattachtype]==0;
$addMediaGallery[
$addMediaItem[attachment://$get[names];$get[getpuretitle]]
]
;
$addFile[attachment://$get[names]]
]
]
;
$#interactionReply[$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]]
]
]
`
}