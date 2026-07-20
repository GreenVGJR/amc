module.exports = {
    data: {
    "name": "playlist",
    "description": "Show playlist you've made",
    "options": [
    {
        "type": 3,
        "name": "name",
        "description": "Search specific playlist",
        "required": false,
        "min_length": 1
    }
    ],
    "integration_types": [
        0
    ],
    "contexts": [
        0
    ],
    "description_localizations": {
        "id": "List playlist kamu yang buat"
    },
},
type: 0,
code: `
$ephemeral
$silent
$interactionReply[$callFunction[loadPlaylistUser;0;$option[name]]]
`
}