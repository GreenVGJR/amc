module.exports = {
    name: "fetchTitleTrack",
    params: [{
        name: "url", // string
        description: "To provide a information",
        required: true
    },
    {
        name: "tempobject", // object
        description: "Replacement of objects http response",
        required: false
    }],
    code: `
    $jsonLoad[filtype;$filterMediaID[$env[url]]]
    $if[$env[filtype;type]==youtube;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$advancedTextSplit[$env[a;results;author]; - Topic;0]]
    $let[title;$env[a;results;title]]
    ]
    $if[$env[filtype;type]==soundcloud;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $jsonLoad[b;$env[a;results]]
    $arrayMap[b;bb;$if[$env[bb;hydratable]==sound;$return[$env[bb]]];c]
    $let[author;$env[c;0;data;user;username]]
    $let[title;$env[c;0;data;title]]
    ]
    $if[$env[filtype;type]==spotify;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$env[a;results;artists;0;name]]
    $let[title;$env[a;results;name]]
    ]
    $if[$env[filtype;type]==tiktokmob;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$default[$env[a;results;author;uniqueId];$env[a;results;author]]]
    $let[title;$default[$env[a;results;desc];$env[a;results;id]]]
    ]
    $if[$env[filtype;type]==tiktok;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$default[$env[a;results;author;uniqueId];$env[a;results;author]]]
    $let[title;$default[$env[a;results;desc];$env[a;results;id]]]
    ]
    $if[$env[filtype;type]==tiktokmusic;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$env[a;results;author]]
    $let[title;$env[a;results;title]]
    ]
    $if[$env[filtype;type]==facebook;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$env[a;results;owner]]
    $let[title;$default[$env[a;results;text];$env[a;results;video_id]]]
    ]
    $if[$env[filtype;type]==instagram;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$default[$env[a;results;owner;username];$env[a;results;user;username]]]
    $let[title;$default[$env[a;results;edge_media_to_caption;edges;0;node;text];$env[a;results;id]]]
    ]
    $if[$env[filtype;type]==bandcamp;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$env[a;results;artist]]
    $let[title;$env[a;results;title]]
    ]
    $if[$env[filtype;type]==twitter;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$env[a;results;core;user_results;result;core;screen_name]]
    $let[title;$default[$advancedTextSplit[$env[a;results;legacy;full_text];https://t.co;0];$env[a;results;post_video_description]]]
    ]
    $let[finaltitle;$trim[$get[author]$if[$and[$get[author]!=;$get[title]!=]; - ]$get[title]]]
    $return[$get[finaltitle]]
    `
}