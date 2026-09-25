import type { IApplicationCommandData } from "@tryforge/forgescript";
export default {
  data: {
    "name": "download",
    "description": "Download a media (Video/Audio/Image)",
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
        "name": "dd_option",
        "description": "Download Type (Default: Video/Audio => Image)",
        "required": false,
        "choices": [{
          "name": "Video/Audio => Image",
          "value": "vaf"
        },
        {
          "name": "Video/Audio",
          "value": "va"
        },
        {
          "name": "Image",
          "value": "vi"
        }]
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
        "type": 5,
        "name": "as_attachment",
        "description": "Upload to attachment? (Recommend if Discord fails to load)",
        "required": false
      },
      {
        "type": 3,
        "name": "file_name",
        "description": "File name for attachment (with 'as_attachment' set true)",
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
$let[as_attachment;$option[as_attachment]]
$onlyIf[$isValidLink[$get[url]];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidLinkDownload]]
$jsonLoad[musictype;$callFunction[filterMediaID;$get[url]]]
$onlyIf[$or[$env[musictype;id]==;$env[musictype;id]==null;$env[musictype;type]==null]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$onlyIf[$env[musictype;type]!=youtubeplaylist;$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$if[$channelExists[$channelID];
$if[$channelHasPerms[$channelID;$clientID;ViewChannel];
$onlyIf[$channelHasPerms[$channelID;$clientID;AttachFiles];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Attach Files** - <@$clientID>]
]]
$if[$or[$and[$channelExists[$channelID]==false;$option[ephemeral]!=false];$and[$channelExists[$channelID]==true;$option[ephemeral]==true]];$ephemeral]
$localFunction[runcodessync;
$let[mid;$interactionReply[
$addField[Type;\`$toTitleCase[$advancedReplace[$env[musictype;type];tiktokmusic;tiktok music;tiktokmob;tiktok mobile;instagramaudio;instagram audio;applemusic;apple music]]\`;true]
$addField[Length Size;$if[$get[clh]==;\`null\`;\`$get[clh]\`\n-# $round[$divide[$get[clh];1024;1024];2] MB - $round[$divide[$get[limitsize];1024;1024];2] MB];true]
$addField[Format;\`$if[$get[converttype]==;null;.$get[contenttype]$if[$get[contenttype]!=$get[converttype]; => .$get[converttype]]]\`;true]
$addField[File Name;$if[$and[$option[lyrics]==true;$get[checklyric]];$codeBlock[$default[$get[lyricnames];null]]]$codeBlock[$default[$get[names];null]]$if[$and[$has[checklyric];$get[checklyric]==false];\n-# WARNING: Lyrics not available];false]
$color[$callFunction[useIcon;color_embed];0]
$author[$if[$env[msg1]!=;$env[msg1];None]\n$env[msg2];$if[$env[togload]==true;$callFunction[useIcon;loading]]]
$timestamp
;true]]
$return
;msg1;msg2;togload]
$let[agent;$callFunction[configMusic;default_userAgent_desktop]]
$let[isactivelyric;$and[$get[as_attachment]==true;$option[yt_option]!=va;$option[lyrics]==true;$or[$env[musictype;type]==youtube;$env[musictype;type]==soundcloud;$env[musictype;type]==spotify;$env[musictype;type]==bandcamp]]]
$let[vafmode;$or[$option[dd_option]==;$option[dd_option]==vaf]]
$let[errdetail;]
$silent
$localFunction[vnmfcodes;
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
$if[$get[as_attachment]!=true;$defer;$callLocalFunction[runcodessync;Fetching;none;false]]
]
$loop[-1;
$if[$get[m-fetch]!=false;$break]
$wait[10]
]
$if[$get[m-fetch]!=null;
;
$if[$get[vafmode]==true;$return[0];$return[1]]
]
$if[$get[m-fetch]==true;
$let[getcdn;$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];$if[$option[yt_option]!=;$option[yt_option];$if[$get[as_attachment]==true;v;va]];$get[storeobjecthttp];$get[limitsize]]]
]
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
$if[$get[as_attachment]!=true;$defer;$callLocalFunction[runcodessync;Fetching;none;false]]
]
$loop[-1;
$if[$get[m-fetch]!=false;$break]
$wait[10]
]
$if[$get[m-fetch]!=null;
;
$if[$get[vafmode]==true;$return[0];$return[1]]
]
$if[$get[m-fetch]==true;
$let[getcdn;$callFunction[fallbackPlaybackTrack;$env[b;results;0;url];$if[$option[yt_option]!=;$option[yt_option];$if[$get[as_attachment]==true;v;va]];$get[storeobjecthttp];$get[limitsize]]]
]
;
$let[storeobjecthttp;]
$let[getcdn;]
$let[s-fetch;false]
$async[
$let[storeobjecthttp;$callFunction[extractTrack;$get[url]]]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$get[url];$if[$env[musictype;type]==youtube;$if[$get[as_attachment]==true;$option[yt_option];va];v];$get[storeobjecthttp];$get[limitsize]]]
$let[s-fetch;true]
]
$if[$get[s-fetch]==false;
$if[$get[as_attachment]!=true;$defer;$callLocalFunction[runcodessync;Fetching;none;false]]
]
$loop[-1;
$if[$get[s-fetch]!=false;$break]
$wait[10]
]
]
]
$if[$advancedTextSplit[$trimLines[$get[getcdn]];|;0]!=bot;
;
$let[errdetail;$advancedTextSplit[$trimLines[$get[getcdn]];|;1]]
$if[$get[vafmode]==true;$return[0];$return[1]]
]
$if[$or[$trimLines[$get[getcdn]]==null;$trimLines[$get[getcdn]]==live;$trimLines[$get[getcdn]]==]!=true;
;
$if[$get[vafmode]==true;$return[0];$return[1]]
]
$if[$has[gettitle]==false;
$let[gettitle;$cropText[$callFunction[fetchTitleTrack;$get[url];$get[storeobjecthttp]];0;479;]]
$if[$get[gettitle]==;$let[gettitle;$getTimestamp-$env[musictype;type]];
]
]
$if[$isJSON[$get[getcdn]];
$jsonLoad[yup;$get[getcdn]]
$let[clh-temp;$env[yup;length]]
$if[$get[clh]<=$get[limitsize];
;
$let[names;$if[$option[file_name]!=;$option[file_name];$get[gettitle]]]
$if[$get[as_attachment]!=true;
$addMediaGallery[$addMediaItem[$env[yup;original]]]
$return[3|gallery]
;
$return[2]
]
]
$let[isjsoncdn;true]
;
$let[isjsoncdn;false]
]
$if[$get[isactivelyric];
$let[checklyric;false]
$jsonLoad[lyricresult;$callFunction[getLyricsTrack;$get[gettitle];;true;true]]
$if[$env[lyricresult;results]!=;
$let[loadlyrics;$env[lyricresult;results;lyric]]
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
$!djsEval[fetch(ctx.getKeyword("getcdn"),{method:"GET",headers:JSON.parse(ctx.getKeyword("checkcdn_headers"))}).then(r=>{ctx.setKeyword("clh",r.headers?.get('content-length')??"")\\;ctx.setKeyword("cly",r.headers?.get('content-type')??"")\\;ctx.setKeyword("httpstatus",r.status)\\; return ((r.status === 200 || r.status === 206) && ((parseInt(r.headers?.get('content-length'), 10) ?? 0) <= ctx.getKeyword("limitsize")) && (ctx.getKeyword("as_attachment") == 'true')) ? r.arrayBuffer() : null\\;}).then(b => { if(b) ctx.setKeyword("condownbytes", Buffer.from(b).toString("base64"))\\; b = null\\; }).catch(() => "")]
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
$if[$get[httpstatus]!=;
;
$return[1]
]
$if[$or[$get[httpstatus]==200;$get[httpstatus]==206];
;
$let[errdetail;$get[httpstatus]]
$return[4]
]
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
$let[names;$if[$option[file_name]!=;$option[file_name].$get[converttype];$get[gettitle].$get[converttype]]]
$if[$get[clh]<=$get[limitsize];
;
$if[$get[as_attachment]!=true;
$addMediaGallery[$addMediaItem[$get[getcdn]]]
$return[3|gallery]
;
$return[2]
]
]
$let[getpuretitle;$cropText[($round[$divide[$get[clh];1024;1024];2] MB) $callFunction[fetchTitleTrack;$get[url];$get[storeobjecthttp]];0;1024;]]
$if[$get[f-fetch]==false;
$if[$get[isjsoncdn]==false;
$if[$get[as_attachment]==true;$callLocalFunction[runcodessync;Downloading » Uploading;$advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]]
;
$if[$get[as_attachment]==true;$callLocalFunction[runcodessync;Downloading;$advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]]
]]
$loop[-1;
$if[$get[f-fetch]!=false;$break]
$wait[10]
]
$if[$get[as_attachment]!=true;
$interactionReply[$addMediaGallery[$addMediaItem[$get[getcdn]]]]
$return[3|gallery]
]
$if[$get[isjsoncdn]==true;
$callLocalFunction[runcodessync;Processing » Uploading;$advancedTextSplit[$trimLines[$get[getcdn]];/;2];true]
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
$if[$get[condownbytes]!=;
;
$return[1]
]
$#interactionReply[
$if[$and[$option[lyrics]==true;$get[checklyric]];$#attachment[$get[loadlyrics];$get[lyricnames];true]]
$#attachment[$get[condownbytes];$get[names];true;base64;$get[getpuretitle]]
]
$if[$channelExists[$channelID];
$if[$option[ephemeral]!=true;
$fetchMessage[$channelID;$get[mid]]
$if[$messageAttachmentCount[$channelID;$get[mid]]==0;
$return[1]
]]]
$return[3|attachment]
]
$localFunction[vnmlcodes;
$if[$env[src]==chain;
;
$if[$get[as_attachment]!=true;$defer;$callLocalFunction[runcodessync;Downloading;Unknown;true]]
]
$let[checkcdn_headers;{
"Accept": "*/*",
"Accept-Encoding": "identity",
"Sec-Fetch-Site": "none",
"User-Agent": "$get[agent]"
}]
$if[$has[storeobjecthttp]==false;$let[storeobjecthttp;$callFunction[extractTrack;$get[url]]]]
$arrayLoad[imglist;
;$callFunction[fallbackPlaybackTrack;$get[url];vi;$get[storeobjecthttp];$get[limitsize]]]
$arrayFilter[imglist;im;$checkCondition[$env[im]!=];imglist]
$arraySlice[imglist;imglist;0;10]
$if[$arrayLength[imglist]!=0;
$let[viok;0]
$let[clh;0]
$if[$get[as_attachment]==true;
$#interactionReply[$arrayForEach[imglist;im;
$let[viraw;$djsEval[fetch(ctx.getEnvironmentKey("im"),{method:"GET",headers:JSON.parse(ctx.getKeyword("checkcdn_headers")||"{}")}).then(async r=>{const t=await r.arrayBuffer()\\;return r.status+"|||"+(r.headers?.get("content-type")??"")+"|||"+(t?.byteLength??0)+"|||"+Buffer.from(t).toString("base64")}).catch(()=>"")]]
$let[vistat;$advancedTextSplit[$get[viraw];|||;0]]
$let[vitype;$toLowercase[$advancedTextSplit[$get[viraw];|||;1]]]
$let[visize;$advancedTextSplit[$get[viraw];|||;2]]
$let[vib64;$advancedTextSplit[$get[viraw];|||;3]]
$if[$and[$or[$get[vistat]==200;$get[vistat]==206];$startsWith[$get[vitype];image/];$get[visize]<=$get[limitsize];$get[vib64]!=];
$let[viext;$advancedTextSplit[$get[vitype];/;1]]
$let[viext;$advancedReplace[$get[viext];jpeg;jpg;svg+xml;svg]]
$let[viname;$cropText[$if[$option[file_name]!=;$option[file_name];$get[gettitle]];0;80]_$cropText[$md5[$env[im]];0;8].$get[viext]]
$let[names;$get[viname]]
$let[contenttype;$get[viext]]
$let[converttype;$get[viext]]
$letSum[clh;$get[visize]]
$letSum[viok;1]
$#attachment[$get[vib64];$get[viname];true;base64;$get[gettitle]]
]
]]
$if[$channelExists[$channelID];
$if[$option[ephemeral]!=true;
$fetchMessage[$channelID;$get[mid]]
$if[$messageAttachmentCount[$channelID;$get[mid]]==0;
$return[0]
]]]
;
$interactionReply[$addMediaGallery[$arrayForEach[imglist;im;$addMediaItem[$env[im];$get[gettitle]]]]]
$return[3|gallery]
]
;
$return[0]
]
$return[3|attachment]
;src]
$try[
$if[$or[$option[dd_option]==;$option[dd_option]==vaf];
$let[checkprocessinglfl;$callLocalFunction[vnmfcodes]]
$if[$get[checkprocessinglfl]==0;$let[checkprocessinglfl;$callLocalFunction[vnmlcodes;chain]]]
;
$if[$option[dd_option]==vi;
$let[checkprocessinglfl;$callLocalFunction[vnmlcodes;fresh]]
;
$let[checkprocessinglfl;$callLocalFunction[vnmfcodes]]
]
]
$let[rcode;$advancedTextSplit[$get[checkprocessinglfl];|;0]]
$if[$get[rcode]==0;$let[rcode;1]]
$if[$get[rcode]==1;
$if[$get[as_attachment]!=true;$addTextDisplay[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]$if[$get[errdetail]!=;\n-# $get[errdetail]]];$callFunction[useCustomMusicMessage;config_generalEmptyDownload]$if[$get[errdetail]!=;\n-# $get[errdetail]]]
]
$if[$get[rcode]==2;
$if[$get[as_attachment]!=true;$addTextDisplay[$replace[$callFunction[useCustomMusicMessage;config_generalOverDownload];{limit_size};$round[$divide[$get[limitsize];1024;1024];2]MB]];$replace[$callFunction[useCustomMusicMessage;config_generalOverDownload];{limit_size};$round[$divide[$get[limitsize];1024;1024];2]MB]]
]
$if[$get[rcode]==4;
$if[$get[as_attachment]!=true;$addTextDisplay[($get[errdetail]) $callFunction[useCustomMusicMessage;config_generalForbiddenDownload]];($get[errdetail]) $callFunction[useCustomMusicMessage;config_generalForbiddenDownload]]
]
]
`
} satisfies IApplicationCommandData;
