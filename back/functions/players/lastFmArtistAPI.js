module.exports = {
    name: "lastFmArtistAPI",
    params: [{
        name: "query", // string
        description: "query",
        required: true
    },
    {
        name: "showEmbed", // bool
        description: "Return embeds version",
        required: false
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    }],
    code: `
$let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent_desktop];$env[userAgent]]]
$let[showEmbed;$if[$or[$env[showEmbed]==null;$env[showEmbed]==];true;$env[showEmbed]]]

$let[lastfmkey;$djsEval[process.env.LASTFM_KEY]]
$if[$or[$get[lastfmkey]==null;$get[lastfmkey]==];$return[null]]
$let[faviconLastFM;https://www.last.fm/static/images/lastfm_avatar_twitter.52a5d69a85ac.png]
$let[cusque;$env[query]]
$let[lookCacheYT;$getCache[initclientmusic;musicplayer_cache-lastfmyt-$md5[$get[cusque]]]]
$let[lookCache;$getCache[initclientmusic;musicplayer_cache-lastfmapi-$md5[$get[cusque]]]]
$jsonLoad[hvhjk;{}]
$if[$or[$get[lookCache]==;$get[lookCache]==undefined];

$let[country;0]
$localFunction[fetchlastfmapi;
$try[
$if[$or[$get[lookCache]==null;$get[country]>=9];$return[{}]]
$httpAddHeader[Accept;application/json]
$httpAddHeader[User-Agent;$get[agent]]
$let[checkhttp;$httpRequest[https://ws.audioscrobbler.com/2.0/$env[putTargetDjf];GET;nishuish]]
$if[$get[checkhttp]==429;$callLocalFunction[fetchlastfmapi;$env[putTargetDjf];true] $return]
]
$return[$default[$env[nishuish];{}]]
;putTargetDjf;retry]

$jsonLoad[lookArts;$callLocalFunction[fetchlastfmapi;?method=artist.getinfo&artist=$get[cusque]&api_key=$get[lastfmkey]&autocorrect=1&format=json;false]]
$if[$env[lookArts;error]!=;
$setCache[initclientmusic;musicplayer_cache-lastfmapi-$md5[$get[cusque]];"null"]
$return[null]
]

$if[$get[lookCacheYT]!=;
$let[bannerchannelurl;$get[lookCacheYT]]
;
$jsonLoad[findindexch;$callFunction[getYoutubeChannel;$get[cusque]]]
$let[mrinyt;$arrayFindIndex[findindexch;p;$checkCondition[$env[p;ownerBadges;0;metadataBadgeRenderer;icon;iconType]==AUDIO_BADGE]]]
$let[mrinyt;$if[$get[mrinyt]==-1;0;$get[mrinyt]]]
$let[checkbannerexistyt;$env[findindexch;$get[mrinyt];tvBanner;thumbnails;0;url]]
$if[$get[checkbannerexistyt]!=;
$let[bannerchannelurl;$advancedTextSplit[$env[findindexch;$get[mrinyt];tvBanner;thumbnails;0;url];=;0]=s0]
$if[$get[lookCacheYT]==;$setCache[initclientmusic;musicplayer_cache-lastfmyt-$md5[$get[cusque]];$get[bannerchannelurl]]]
]]

$!jsonSet[hvhjk;artist_info;$jsonStringify[lookArts]]
$!jsonSet[hvhjk;top_tracks;$callLocalFunction[fetchlastfmapi;?method=artist.gettoptracks&artist=$get[cusque]&api_key=$get[lastfmkey]&autocorrect=1&limit=10&format=json;false]]
$setCache[initclientmusic;musicplayer_cache-lastfmapi-$md5[$get[cusque]];$jsonStringify[hvhjk]]
;
$if[$get[lookCache]==null;$return[null]]
$jsonLoad[hvhjk;$get[lookCache]]
$let[bannerchannelurl;$get[lookCacheYT]]
]

$if[$get[showEmbed]!=true;
$return[$jsonStringify[hvhjk]]
;
$let[actualauthorurl;$env[hvhjk;artist_info;artist;url]]

$arrayLoad[niosnoiio;
;$env[hvhjk;artist_info;artist;bio;summary]]
$let[desc;$arrayJoin[niosnoiio;
-# ]]
$if[$charCount[$get[desc];</a>]!=0;
$arrayLoad[alk;</a>;$trim[$advancedTextSplit[$get[desc];…;0]]]
$arrayMap[alk;ak;$return[$if[$advancedTextSplit[$env[ak];">;1;</a>;0]!=;$advancedTextSplit[$env[ak];<a href=";0]$hyperlink[$advancedTextSplit[$env[ak];">;1;</a>;0];$advancedTextSplit[$env[ak];<a href=";1;">;0;";0]];$env[ak]]$advancedTextSplit[$env[ak];</a>;1]];alk]
$let[desc;$trim[$advancedTextSplit[$arrayJoin[alk;];…;0]]]
]

$let[reslast;$env[hvhjk;artist_info;artist;name]]

$let[domainCdnLastFM_a;$advancedTextSplit[$env[hvhjk;artist_info;artist;image;0;#text];/;2]]
$if[$get[domainCdnLastFM_a]!=;
$let[hashFileImgLastFM_a;$advancedTextSplit[$env[hvhjk;artist_info;artist;image;0;#text];/;$charCount[$env[hvhjk;artist_info;artist;image;0;#text];/]]]
$let[valthumbnail_author;https://$get[domainCdnLastFM_a]/i/u/$get[hashFileImgLastFM_a]]
]

$jsonLoad[niaegndig;$env[hvhjk;top_tracks;toptracks;track]]
$arrayMap[niaegndig;ninsdnb;$return[-# $hyperlink[$bold[$env[ninsdnb;name]];$env[ninsdnb;url]]\n-# $if[$isNumber[$env[ninsdnb;listeners]];$separateNumber[$env[ninsdnb;listeners];,];NaN] Listeners];niaegndig]
$let[conttracks;$arrayJoin[niaegndig;
]]
$jsonLoad[jnnsfob;$env[hvhjk;artist_info;artist;tags;tag]]
$arrayMap[jnnsfob;kklbniua;$return[$hyperlink[$env[kklbniua;name];$env[kklbniua;url]]];loadtag]

$jsonLoad[nosidhn;$env[hvhjk;artist_info;artist;similar;artist]]
$arrayMap[nosidhn;kklbniua;$return[$hyperlink[$env[kklbniua;name];$env[kklbniua;url]]];simartist]

$author[$abbreviateNumber[$env[hvhjk;artist_info;artist;stats;listeners]] Listened | $abbreviateNumber[$env[hvhjk;artist_info;artist;stats;playcount]] Scrobbles;$get[faviconLastFM];;0]
$title[$get[reslast];$get[actualauthorurl];0]
$color[$callFunction[useIcon;color_embed];0]
$if[$get[desc]!=;$description[-# $get[desc]]]
$addField[> \`🏷️\` | Tags;$if[$arrayLength[loadtag]==0;-# Not Available;$arrayJoin[loadtag;, ]];true;0]
$addField[> \`👥\` | Similar To;$if[$arrayLength[simartist]==0;-# Not Available;$arrayJoin[simartist;, ]];true;0]
$if[$get[valthumbnail_author]!=;$thumbnail[$get[valthumbnail_author];0]]
$if[$get[bannerchannelurl]!=;
$image[$get[bannerchannelurl];0]
]
$if[$get[conttracks]!=;
$let[domainCdnLastFM;$advancedTextSplit[$env[hvhjk;top_tracks;toptracks;track;0;image;0;#text];/;2]]
$if[$get[domainCdnLastFM]!=;
$let[hashFileImgLastFM;$advancedTextSplit[$env[hvhjk;top_tracks;toptracks;track;0;image;0;#text];/;$charCount[$env[hvhjk;top_tracks;toptracks;track;0;image;0;#text];/]]]
$let[firstcovtop;https://$get[domainCdnLastFM]/i/u/$get[hashFileImgLastFM]]
]

$author[Top Tracks;$get[faviconLastFM];;1]
$description[$get[conttracks];1]
$if[$get[firstcovtop]!=;$thumbnail[$get[firstcovtop];1]]
$color[$callFunction[useIcon;color_embed];1]
$addActionRow
$addButton[$get[actualauthorurl]/+tracks?date_preset=ALL;Tracks;Link;🎶]
$addButton[$get[actualauthorurl]/+albums?order=most_popular;Albums;Link;💿]
$addButton[$get[actualauthorurl]/+images;Photos;Link;🖼]
]

]
    `
}