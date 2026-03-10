module.exports = {
    name: "discoverArtistLastFm",
    params: [{
        name: "query", // string
        description: "query",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    }],
    code: `
$let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];$callFunction[configMusic;default_userAgent];$env[userAgent]]]
$let[country;0]
$localFunction[fetchlastfm;
$if[$get[country]>=7;$return]
$if[$env[retry]==true;$letSum[country;1]]
$try[
$let[authorurl;https://www.last.fm/music/$encodeURI[$toLowercase[$env[query]]]]
$httpAddHeader[Accept;text/html, */*]
$httpAddHeader[Accept-Language;en]
$httpAddHeader[User-Agent;$get[agent]]
$httpAddHeader[Sec-Fetch-Dest;document]
$httpAddHeader[Sec-Fetch-Site;none]
$httpSetContentType[Text]
$let[checkhttp;$httpRequest[$get[authorurl]?_pjax=%23content&top_tracks_date_preset=ALL;GET;reslast]]
$c[Last fm has weird anti-bot protect fr]
$if[$or[$get[checkhttp]==502;$get[checkhttp]==416];$callLocalFunction[fetchlastfm;true] $stop]
]
;retry]
$callLocalFunction[fetchlastfm;false]
$onlyIf[$advancedTextSplit[$env[reslast];tnew-title;1;intabbr;1;">;1;</abbr>;0]!=;$return[null]]
$let[actualauthorurl;$advancedTextSplit[$env[reslast];meta property="og:url";1;content=";1;";0;?;0]]
$httpAddHeader[Accept-Language;en]
$httpAddHeader[User-Agent;$get[agent]]
$httpSetContentType[Text]
$!httpRequest[https://www.youtube.com/results?search_query=$advancedTextSplit[$get[actualauthorurl];/;4]&sp=EgIQAkICCAE%253D;GET]
$jsonLoad[a;$advancedTextSplit[$httpResult;ytInitialData =;1;\\;</script>;0]]
$httpAddHeader[Accept-Language;en]
$httpAddHeader[User-Agent;$get[agent]]
$httpSetContentType[Text]
$jsonLoad[findindexch;$env[a;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents]]
$let[mrinyt;$arrayFindIndex[findindexch;p;$checkCondition[$env[p;channelRenderer;ownerBadges;0;metadataBadgeRenderer;icon;iconType]==AUDIO_BADGE]]]
$let[mrinyt;$if[$get[mrinyt]==-1;0;$get[mrinyt]]]
$let[channelyturl;$env[a;contents;twoColumnSearchResultsRenderer;primaryContents;sectionListRenderer;contents;0;itemSectionRenderer;contents;$get[mrinyt];channelRenderer;channelId]]
$if[$get[channelyturl]!=;
$!httpRequest[https://www.youtube.com/channel/$get[channelyturl];GET]
$jsonLoad[b;$advancedTextSplit[$httpResult;ytInitialData =;1;\\;</script>;0]]
$let[bannerchannelurl;$replace[$env[b;header;pageHeaderRenderer;content;pageHeaderViewModel;banner;imageBannerViewModel;image;sources;0;url];w$env[b;header;pageHeaderRenderer;content;pageHeaderViewModel;banner;imageBannerViewModel;image;sources;0;width];s0]]
]
$let[firstcovtop;$advancedTextSplit[$env[reslast];tbody;1;tbody;0;class="cover-art";1;src=";1;";0]]
$let[achexternal;$advancedTextSplit[$env[reslast];ul class="resource-external-links";1;</ul>;0]]
$arrayLoad[achjexternal;href=";$get[achexternal]]
$!arrayShift[achjexternal]
$arrayLoad[l;chartlist-row;$advancedTextSplit[$env[reslast];tbody;1;tbody;0]]
$arrayLoad[res]
$arrayForEach[l;o;$if[$advancedTextSplit[$env[o];class="chartlist-image";1]!=;
$let[lrfsmfm;$advancedTextSplit[$env[o];data-stat-value=";1;";0]]
$arrayPushJSON[res;-# $hyperlink[$bold[$advancedTextSplit[$env[o];alt=";1;loading=;0;";0]];https://www.last.fm$decodeURI[$advancedTextSplit[$env[o];class="chartlist-name";1;href=";1;";0]]]\n-# $if[$isNumber[$get[lrfsmfm]];$separateNumber[$get[lrfsmfm];,];NaN] Listeners]
]]
$let[conttracks;$arrayJoin[res;
]]
$let[conttracks;$djsEval[require("entities").decodeHTML(ctx.getKeyword("conttracks"))]]
$let[checkcolor;$if[$isValidHex[$advancedTextSplit[$env[reslast];"overlayColor";1;";1;";0]];$advancedTextSplit[$env[reslast];"overlayColor";1;";1;";0];$callFunction[useIcon;color_embed]]]
$let[valthumbnail_author;$advancedTextSplit[$env[reslast];property="og:image";1;content=";1;";0]]
$let[desc;$advancedTextSplit[$env[reslast];class="wiki-block-inner";1;wiki-truncate-4-lines;1;tabindex=";0;">
;1;
;1]]
$if[$charCount[$get[desc];</a>]!=0;
$arrayLoad[alk;</a>;$trim[$advancedTextSplit[$get[desc];…;0]]]
$arrayMap[alk;ak;$return[$if[$advancedTextSplit[$env[ak];">;1;</a>;0]!=;$advancedTextSplit[$env[ak];<a href=";0]$hyperlink[$advancedTextSplit[$env[ak];">;1;</a>;0];https://www.last.fm$advancedTextSplit[$env[ak];<a href=";1;">;0;";0]];$env[ak]]$advancedTextSplit[$env[ak];</a>;1]];alk]
$let[desc;$trim[$advancedTextSplit[$arrayJoin[alk;];…;0]]]
]
$let[desc;$djsEval[require("entities").decodeHTML(ctx.getKeyword("desc"))]]
$let[latestre-t;$advancedTextSplit[$env[reslast];item-header;1;class="link-block-target";1;</a>;0;>;1]]
$let[latestre-t;$djsEval[require("entities").decodeHTML(ctx.getKeyword("latestre-t"))]]
$let[latestre;$hyperlink[$get[latestre-t];https://www.last.fm$decodeURI[$advancedTextSplit[$env[reslast];item-header;1;href=";1;";0]]]\n-# $trimLines[$default[$advancedTextSplit[$env[reslast];item-header;1;item-date;1;">;1;</p>;0];Not Available]]]
$let[popweek-t;$advancedTextSplit[$env[reslast];item-header;2;class="link-block-target";1;</a>;0;>;1]]
$let[popweek-t;$djsEval[require("entities").decodeHTML(ctx.getKeyword("popweek-t"))]]
$let[popweek;$hyperlink[$get[popweek-t];https://www.last.fm$decodeURI[$advancedTextSplit[$env[reslast];item-header;2;href=";1;";0]]]\n-# $toTitleCase[$trimLines[$default[$advancedTextSplit[$env[reslast];item-header;2;item-listeners;1;">;1;</p>;0];not available]]]]
$let[simartist-t;$advancedTextSplit[$env[reslast];section class="artist-similar-sidebar";1;</section>;0]]
$let[simartist-t;$djsEval[require("entities").decodeHTML(ctx.getKeyword("simartist-t"))]]
$arrayLoad[simartist-t-d;itemprop="name";$get[simartist-t]]
$!arrayShift[simartist-t-d]
$arrayMap[simartist-t-d;o;$return[$hyperlink[$advancedTextSplit[$env[o];href=";1;>;1;</a;0];https://www.last.fm$advancedTextSplit[$env[o];href=";1;";0]]];simartist-t-d]
$if[$arrayLength[simartist-t-d]!=0;$let[simartist;$arrayJoin[simartist-t-d;, ]]]
$arrayLoad[loadtag;class="tag";$advancedTextSplit[$env[reslast];tags-list--global;1;</li></ul>;0]]
$!arrayShift[loadtag]
$arrayMap[loadtag;tag;$return[$hyperlink[$advancedTextSplit[$env[tag];</a>;0;href=";1;>;1];https://www.last.fm$decodeURI[$advancedTextSplit[$env[tag];href=";1;";0]]]];loadtag]
$author[$advancedTextSplit[$env[reslast];tnew-title;1;intabbr;1;">;1;</abbr>;0] Listened | $advancedTextSplit[$env[reslast];tnew-title;2;intabbr;1;">;1;</abbr>;0] Scrobbles;$advancedTextSplit[$env[reslast];rel="apple-music-app-icon";1;href=";1;";0];;0]
$title[$advancedTextSplit[$env[reslast];resource-name=";1;data-page;0;";0];$get[actualauthorurl];0]
$color[$get[checkcolor];0]
$if[$get[desc]!=;$description[-# $get[desc]]]
$addField[> \`🏷️\` | Tags;$if[$arrayLength[loadtag]==0;-# Not Available;$arrayJoin[loadtag;, ]];false;0]
$addField[> \`🍀\` | Latest Release;$if[$get[latestre-t]==;-# Not Available;$get[latestre]];true;0]
$addField[> \`📈\` | Popular This Week;$if[$get[popweek-t]==;-# Not Available;$get[popweek]];true;0]
$addField[> \`👥\` | Similar Artists;$if[$get[simartist]==;-# Not Available;$get[simartist]];false;0]
$thumbnail[$get[valthumbnail_author];0]
$if[$get[bannerchannelurl]!=;
$image[$get[bannerchannelurl];0]
]
$if[$get[conttracks]!=;
$author[Top Tracks | All time;$advancedTextSplit[$env[reslast];rel="apple-music-app-icon";1;href=";1;";0];;1]
$description[$get[conttracks];1]
$if[$get[firstcovtop]!=;$thumbnail[$get[firstcovtop];1]]
$color[$get[checkcolor];1]
$if[$arrayLength[achjexternal]!=0;
$addActionRow
$arrayForEach[achjexternal;l;
$addButton[$advancedTextSplit[$env[l];";0];$default[$advancedTextSplit[$env[l];">;1;</a>;0];null];Link]
]]
$addActionRow
$addButton[$get[actualauthorurl]/+tracks?date_preset=ALL;Tracks;Link;🎶]
$addButton[$get[actualauthorurl]/+albums?order=most_popular;Albums;Link;💿]
$addButton[$get[actualauthorurl]/+images;Photos;Link;🖼]
]
    `
}