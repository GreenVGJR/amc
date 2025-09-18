module.exports = {
  data: {
  "name": "lyrics",
  "description": "Search for lyrics | Providers: YT Music, Lrclib, Genius",
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
    "id": "Mencari lirik | Sumber: YT Music, Lrclib, Genius"
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
    $defer

    $jsonLoad[result;$callFunction[getLyricsTrack;$option[song_name];;true;$option[line_synced]]]
    $onlyIf[$env[result;results]!=;$callFunction[useCustomMusicMessage;config_errorNoResultLyrics]]
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
    $addTextDisplay[> ## $hyperlink[$env[result;results;autocomplete];$env[result;results;url]]]
    $addTextDisplay[$codeBlock[$cropText[$get[loadlyrics];0;3800;\n\n($callFunction[useCustomMusicMessage;config_errorOverResultLyrics])]]]
    $if[$checkContains[$env[result;results;url];music.youtube.com];
    $addThumbnail[https://i.ytimg.com/vi/$advancedTextSplit[$env[result;results;url];?v=;1;&;0]/frame0.jpg]
    ;
    $addThumbnail[$userAvatar[$clientID;1024]]
    ]]
    ;$callFunction[useIcon;color_embed]]
    ]
    `
}