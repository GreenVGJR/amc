module.exports = {
    name: "247Button",
    params: [{
        name: "ffgmid",
        required: true
    },
    {
        name: "ffggid",
        required: true
    },
    {
        name: "ffklv",
        required: true
    }],
    code: `
    $addButton[musicplayer_$if[$env[ffklv]==true;247musicidle;247music]_$env[ffgmid];24/7: $if[$getCache[initclientmusic;musicplayer_message_$env[ffggid]_is247music]!=true;Off;On];Secondary;$if[$getCache[initclientmusic;musicplayer_message_$env[ffggid]_is247music]!=true;🌇;🌃];false]   
    `
}