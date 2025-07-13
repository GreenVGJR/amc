module.exports = {
  data: {
  "name": "lyrics",
  "description": "Search for lyrics | Providers: Lrclib, Genius, AZLyrics",
  "options": [
    {
      "type": 3,
      "name": "song_name",
      "description": "Search for lyrics by typing the name of the song",
      "required": true
    }
  ],
  "description_localizations": {
    "id": "Mencari lirik | Sumber: Lrclib, Genius, AZLyrics"
  },
  "contexts": [
    0
  ]
},
  type: 0,
  code: `
    $onlyIf[$guildID!=;]

    $ephemeral
    $defer

    $jsonLoad[result;$callFunction[getLyricsTrack;$option[song_name];;true]]
    $onlyIf[$env[result;results]!=;$callFunction[useCustomMusicMessage;config_errorNoResultLyrics]]
    $let[loadlyrics;$inflate[$env[result;results;lyric];hex]]
    $if[$charCount[$get[loadlyrics]]>3900;$attachment[$get[loadlyrics];lyrics-$getTimestamp.txt;true]]
    $!interactionFollowUp[
    $title[$env[result;results;autocomplete];$env[result;results;url]]
    $description[$codeBlock[$cropText[$get[loadlyrics];0;3900;\n\n($callFunction[useCustomMusicMessage;config_errorOverResultLyrics])]]]
    $footer[$env[result;results;provider];$callFunction[useIcon;$env[result;results;provider]]]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    ]
    `
}