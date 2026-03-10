module.exports = {
  data: {
    "name": "lyrics",
    "description": "Search for lyrics | Providers: Youtube Music, Shazam, Deezer, Lrclib, Genius",
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
        "type": 3,
        "name": "translate",
        "description": "Translate lyrics to another language",
        "required": false,
        "autocomplete": true
      },
      {
        "type": 5,
        "name": "lyric_file",
        "description": "Include a lryics file?",
        "required": false
      },
      {
        "type": 5,
        "name": "ephemeral",
        "description": "Respond on ephemeral?",
        "required": false
      },
    ],
    "description_localizations": {
      "id": "Cari lirik lagu | Sumber: Youtube Music, Shazam, Deezer, Lrclib, Genius"
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

    $if[$or[$option[ephemeral]==;$option[ephemeral]==true];$ephemeral]
    $let[fsearch;false]
    $async[
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
    $let[loadlyrics;$env[result;results;lyric]]
    $if[$option[translate]!=;
    $jsonLoad[checklang;$getCache[system_file-listLyricsLanguage]]
    $jsonLoad[checklang;$jsonEntries[checklang]]
    $arrayMap[checklang;rest;$if[$checkContains[$toLowercase[$env[rest;1]];$toLowercase[$option[translate]]];$return[$env[rest]]];checklang]
    $jsonLoad[loadtranslatelyrics;$callFunction[translateText;$get[loadlyrics];;$env[checklang;0;0]]]
    $let[loadlyrics;$arrayJoin[loadtranslatelyrics;
]]
    $let[translateTextLang-c;$env[checklang;0;0]]
    $let[translateTextLang-n;$env[checklang;0;1]]
    ]
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
    $addTextDisplay[- $get[latencyrs]ms | $toTitleCase[$env[result;results;provider]]\n»   $bold[$hyperlink[$decodeURI[$env[result;results;autocomplete]];$env[result;results;url]]]$if[$and[$option[translate]!=;$get[translateTextLang-c]!=];\n»   $bold[Translated to:] $get[translateTextLang-n]]]
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