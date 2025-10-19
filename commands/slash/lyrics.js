module.exports = {
  data: {
  "name": "lyrics",
  "description": "Search for lyrics | Providers: YT Music, Deezer, Lrclib, Genius",
  "options": [
    {
      "type": 3,
      "name": "song_name",
      "description": "Search for lyrics by typing the name of the song",
      "required": true
    },
    {
      "type": 5,
      "name": "line_synced",
      "description": "Get synchronized lyrics?",
      "required": false
    },
    {
      "type": 5,
      "name": "lyric_file",
      "description": "Include a lryics file?",
      "required": false
    },
  ],
  "description_localizations": {
    "id": "Mencari lirik | Sumber: YT Music, Deezer, Lrclib, Genius"
  },
  "integration_types": [
    0,
    1
  ],
  "contexts": [
    0
  ]
},
  type: 0,
  code: `
    $onlyIf[$guildID!=;]

    $ephemeral
    $let[fsearch;false]
    $async[
    $jsonLoad[result;$callFunction[getLyricsTrack;$option[song_name];;true;$option[line_synced]]]
    $if[$env[result;results]==;$let[fsearch;null];$let[fsearch;true]]
    $let[latencyrs;$round[$executionTime]]
    ]
    $interactionReply[
    $addContainer[
    $addTextDisplay[### -# Loading]
    ;$callFunction[useIcon;color_embed]]
    ]

    $loop[-1;
    $if[$get[fsearch]!=false;$break]
    $wait[4]
    ]

    $onlyIf[$get[fsearch]!=null;$interactionReply[$addTextDisplay[$callFunction[useCustomMusicMessage;config_errorNoResultLyrics]]]]
    $let[loadlyrics;$inflate[$env[result;results;lyric];hex]]
    $interactionReply[
    $if[$option[lyric_file]==true;
    $let[filename;$replaceRegex[$env[result;results;autocomplete];\\[^A-Za-z0-9_-\\];g;_]_-_Lyrics.$if[$option[line_synced]==true;lrc;txt]]
    $attachment[$get[loadlyrics];$get[filename];true]
    ]
    $addContainer[
    $if[$option[lyric_file]==true;
    $addTextDisplay[> ## Download]
    $addFile[attachment://$get[filename]]
    $addSeparator[Small;true]
    ]
    $addTextDisplay[> ### -# $get[latencyrs]ms | $toTitleCase[$env[result;results;provider]]]
    $addSeparator[Small;true]
    $addSection[
    $addTextDisplay[> ## $hyperlink[$decodeURI[$env[result;results;autocomplete]];$env[result;results;url]]]
    $addTextDisplay[$codeBlock[$cropText[$get[loadlyrics];0;3000;\n\n($callFunction[useCustomMusicMessage;config_errorOverResultLyrics])]]]
    $addThumbnail[$env[result;results;thumbnail]]
    ]
    ;$callFunction[useIcon;color_embed]]
    ]
    `
}