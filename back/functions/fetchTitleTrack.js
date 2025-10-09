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
    $let[author;$env[a;results;album;artist;0;name]]
    $let[title;$env[a;results;name]]
    ]
    $if[$env[filtype;type]==tiktokmob;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$default[$env[a;results;author;uniqueId];$env[a;results;author]]]
    $let[title;$default[$env[a;results;desc];$env[a;results;title]]]
    ]
    $if[$env[filtype;type]==tiktok;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$env[a;results;author;uniqueId]]
    $let[title;$env[a;results;desc]]
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
    $let[author;$env[a;results;owner;username]]
    $let[title;$default[$env[a;results;caption;text];$env[a;results;pk]]]
    ]
    $if[$env[filtype;type]==bandcamp;
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $let[author;$env[a;results;artist]]
    $let[title;$env[a;results;title]]
    ]
    $if[$or[$get[title]==;$get[title]==null;$get[title]==undefined]!=true;$if[$or[$get[author]==;$get[author]==null;$get[author]==undefined];$return[$trimLines[$get[title]]];$if[$checkContains[$toLowercase[$trimLines[$get[title]]];$toLowercase[$trimLines[$get[author]]]];$return[$trimLines[$get[title]]];$return[$trimLines[$get[author]] - $trimLines[$get[title]]]]];$return]
    `
}