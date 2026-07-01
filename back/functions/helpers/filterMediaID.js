module.exports = {
    name: "filterMediaID",
    params: [{
        name: "url", // string
        description: "To gets a ID and Type",
        required: true
    }],
    code: `$let[list;$getCache[initclientmusic;system_file-filterMedia]]
    $jsonLoad[listregex;$get[list]]
    $let[url;$env[url]]
    $jsonLoad[inputregexjson;{"id":null,"type":null}]

    $if[$isValidLink[$get[url]]==false;$return[$jsonStringify[inputregexjson]]]

    $!djsEval[try { 
        const e = new URL(ctx.getKeyword("url"))\\;

        ctx.setKeyword("paths", e.pathname)\\;
        ctx.setKeyword("host", e.host)\\;
    }
        catch { '' }
    ]
    
    $if[$and[$endsWith[$get[host];youtube.com];$startsWith[$get[paths];/playlist]];$let[type;youtubeplaylist];$if[$or[$endsWith[$get[host];youtube.com];$endsWith[$get[host];youtu.be]];$let[type;youtube]]]
    $if[$endsWith[$get[host];soundcloud.com];$let[type;soundcloud]]
    $if[$endsWith[$get[host];open.spotify.com];$let[type;spotify]]
    $if[$endsWith[$get[host];vt.tiktok.com;vm.tiktok.com];$let[type;tiktokmob];$if[$and[$endsWith[$get[host];tiktok.com];$startsWith[$get[paths];/music/]];$let[type;tiktokmusic];$if[$endsWith[$get[host];tiktok.com];$let[type;tiktok]]]]
    $if[$endsWith[$get[host];music.apple.com];$let[type;applemusic]]
    $if[$endsWith[$get[host];deezer.com];$let[type;deezer]]
    $if[$and[$endsWith[$get[host];instagram.com];$startsWith[$get[paths];/reels/audio/]];$let[type;instagramaudio];$if[$endsWith[$get[host];instagram.com];$let[type;instagram]]]
    $if[$endsWith[$get[host];threads.com];$let[type;threads]]
    $if[$endsWith[$get[host];facebook.com];$let[type;facebook]]
    $if[$endsWith[$get[host];bandcamp.com];$let[type;bandcamp]]
    $if[$or[$endsWith[$get[host];x.com];$endsWith[$get[host];twitter.com]];$let[type;twitter]]

    $if[$get[type]!=;
    $let[regex;$env[listregex;$get[type];0]]
    $let[regex_target;$env[listregex;$get[type];1]]
    $let[regex_target_alt;$env[listregex;$get[type];2]]
    $let[res;$djsEval[ctx.getKeyword("url").match(ctx.getKeyword("regex"))?.\\[ctx.getKeyword("regex_target")\\]]]
    $if[$get[res]==undefined;$let[res;$djsEval[ctx.getKeyword("url").match(ctx.getKeyword("regex"))?.\\[ctx.getKeyword("regex_target_alt")\\]]]]
    ]
    $!jsonSet[inputregexjson;id;$if[$or[$get[res]==;$get[res]==undefined];null;"$get[res]"]]
    $!jsonSet[inputregexjson;type;$if[$get[type]==;null;"$get[type]"]]
    $return[$jsonStringify[inputregexjson]]
    `
}