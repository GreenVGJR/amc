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
    $onlyIf[$env[result;results]!=;No lyrics were available.]
    $if[$charCount[$env[result;results;lyric]]>3900;$attachment[$env[result;results;lyric];lyrics-$getTimestamp.txt;true]]
    $!interactionFollowUp[
    $title[$env[result;results;autocomplete];$env[result;results;url]]
    $description[$codeBlock[$cropText[$env[result;results;lyric];0;3900;\n\n(Unfortunately, i can't show the rest of them.)]]]
    $footer[$env[result;results;provider];$callFunction[useIcon;$env[result;results;provider]]]
    $color[$callFunction[useIcon;color_embed]]
    $timestamp
    ]
    `
}