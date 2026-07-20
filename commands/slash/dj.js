module.exports = {
    data: {
    "name": "dj",
    "description": "Configuration for DJ features",
    "integration_types": [
        0
    ],
    "contexts": [
        0
    ],
    "description_localizations": {
        "id": "Ubah fitur DJ"
    },
    "default_member_permissions": "268435472"
},
type: 0,
code: `
$ephemeral
$interactionReply[$callFunction[loadDJUser]]
`
}