module.exports = {
  data: {
    "name": "lyrics",
    "description": "Search for lyrics | Providers: Youtube Music, Deezer, Shazam, Lrclib, Genius",
    "options": [
      {
        "type": 3,
        "name": "song_name",
        "description": "Search lyrics by typing song name",
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
      "id": "Cari lirik lagu | Sumber: Youtube Music, Deezer, Shazam, Lrclib, Genius"
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
    $wait[3]
    $jsonLoad[result;$callFunction[getLyricsTrack;$option[song_name];;true;$option[line_synced]]]
    $if[$env[result;results]==;$let[fsearch;null];$let[fsearch;true]]
    $let[latencyrs;$env[result;response_time]]
    ]
    $defer

    $loop[-1;
    $if[$get[fsearch]!=false;$break]
    $wait[5]
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
    $addSection[
    $addTextDisplay[- $get[latencyrs]ms | $toTitleCase[$env[result;results;provider]]\n»   $bold[$hyperlink[$decodeURI[$env[result;results;autocomplete]];$env[result;results;url]]]]
    $addThumbnail[$env[result;results;thumbnail]]
    ]
    $addSeparator[Small;true]
    $addActionRow
    $addButton[$env[result;results;thumbnail];Thumbnail;Link;🖼️]
    $addButton[$env[result;results;url];Source;Link;🎶]
    $addTextDisplay[$bold[$codeBlock[$cropText[$get[loadlyrics];0;3000;\n\n($callFunction[useCustomMusicMessage;config_errorOverResultLyrics])]]]]
    ;$callFunction[useIcon;color_embed]]
    ]
    `
}