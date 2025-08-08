module.exports = {
  data: {
  "name": "download",
  "description": "Download a song",
  "options": [
    {
      "type": 3,
      "name": "url",
      "description": "URL song (Youtube / Soundcloud / Spotify)",
      "required": true,
      "min_length": 8
    },
    {
      "type": 3,
      "name": "file_name",
      "description": "File name for attachment",
      "required": false
    }
  ]
},
  "integration_types": [
    0,
    1
  ],
  "contexts": [
    0
  ],
  "description_localizations": {
    "id": "Unduh sebuah lagu"
  },
type: 0,
code: `
$onlyIf[$guildID!=;]

$onlyIf[$isValidLink[$option[url]];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidLinkDownload]]
$jsonLoad[musictype;$callFunction[filterMediaID;$option[url]]]
$onlyIf[$or[$env[musictype;id]!=;$env[musictype;id]!=null;$env[musictype;type]!=null];$ephemeral $callFunction[useCustomMusicMessage;config_generalInvalidProviderDownload]]
$try[
$let[mid;$interactionReply[Testing URL...;true]]
$let[getcdn;$callFunction[fallbackPlaybackTrack;$option[url]]]
$onlyIf[$or[$get[getcdn]!=null;$get[getcdn]!=live;$get[getcdn]!=];$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$let[http;$httpRequest[$get[getcdn];HEAD]]
$onlyIf[$or[$get[http]==200;$get[http]==206];$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
$onlyIf[$httpGetHeader[Content-Length]<=10000000;$callFunction[useCustomMusicMessage;config_generalOverDownload]]
$let[contenttype;$advancedTextSplit[$httpGetHeader[Content-Type];/;1]]
$let[converttype;$if[$get[contenttype]==webm;opus;$if[$get[contenttype]==mp4;m4a;$if[$or[$get[contenttype]==mp3;$get[contenttype]==mpeg];mp3;$get[contenttype]]]]]
$let[timest;$getTimestamp]
$let[names;$if[$option[file_name]!=;$option[file_name].$get[converttype];audio-$get[timest].$get[converttype]]]
$interactionUpdate[
$addField[Type;\`$toTitleCase[$env[musictype;type]]\`;true]
$addField[Length Size;\`$httpGetHeader[Content-Length]\`\n-# $round[$divide[$httpGetHeader[Content-Length];1024;1024];2] MB;true]
$addField[Format;\`.$get[contenttype]$if[$get[contenttype]!=$get[converttype]; => .$get[converttype]]\`;true]
$addField[File Name;$codeBlock[$get[names]];false]
$thumbnail[$userAvatar[$authorID;2048]]
$color[$callFunction[useIcon;color_embed];0]
$footer[Downloading;$callFunction[useIcon;loading]]
]
$interactionUpdate[$attachment[$trimLines[$get[getcdn]];$get[names]]]
$if[$channelExists[$channelID];
$fetchMessage[$channelID;$get[mid]]
$if[$messageAttachmentCount[$channelID;$get[mid]]==0;
$interactionUpdate[$callFunction[useCustomMusicMessage;config_generalEmptyDownload]]
]]
]
`
}