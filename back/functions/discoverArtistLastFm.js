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
$let[agent;$if[$or[$env[userAgent]==null;$env[userAgent]==];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36;$env[userAgent]]]
$try[
$let[authorurl;https://www.last.fm/music/$env[query]]
$httpAddHeader[Accept-Encoding;gzip, deflate, br, zstd]
$httpAddHeader[Accept;text/html]
$httpAddHeader[User-Agent;$get[agent]]
$httpAddHeader[Sec-Fetch-Site;none]
$httpSetContentType[Text]
$!httpRequest[$get[authorurl]?_pjax=%23content&top_tracks_date_preset=ALL;GET]
]
$onlyIf[$advancedTextSplit[$httpResult;tnew-title;1;intabbr;1;">;1;</abbr>;0]!=;$return[null]]
$let[firstcovtop;$advancedTextSplit[$httpResult;tbody;1;tbody;0;class="cover-art";1;src=";1;";0]]
$arrayLoad[l;chartlist-row;$advancedTextSplit[$httpResult;tbody;1;tbody;0]]
$arrayLoad[res]
$arrayForEach[l;o;$if[$advancedTextSplit[$env[o];class="chartlist-image";1]!=;
$let[lrfsmfm;$advancedTextSplit[$env[o];data-stat-value=";1;";0]]
$arrayPushJSON[res;-# - $hyperlink[$bold[$advancedTextSplit[$env[o];alt=";1;loading=;0;";0]];https://www.last.fm$decodeURI[$advancedTextSplit[$env[o];class="chartlist-name";1;href=";1;";0]]] | $if[$isNumber[$get[lrfsmfm]];$separateNumber[$get[lrfsmfm];,];NaN] Listeners]
]]
$let[conttracks;$arrayJoin[res;
]]
$let[conttracks;$djsEval[require("entities").decodeHTML(ctx.getKeyword("conttracks"))]]
$let[checkcolor;$if[$isValidHex[$advancedTextSplit[$httpResult;"overlayColor";1;";1;";0]];$advancedTextSplit[$httpResult;"overlayColor";1;";1;";0];$callFunction[useIcon;color_embed]]]
$let[valthumbnail_author;$advancedTextSplit[$httpResult;property="og:image";1;content=";1;";0]]
$let[desc;$advancedTextSplit[$httpResult;class="wiki-block-inner";1;wiki-truncate-4-lines;1;tabindex=";0;">
;1;
;1]]
$if[$charCount[$get[desc];</a>]!=0;
$arrayLoad[alk;</a>;$trim[$advancedTextSplit[$get[desc];…;0]]]
$arrayMap[alk;ak;$return[$if[$advancedTextSplit[$env[ak];">;1;</a>;0]!=;$advancedTextSplit[$env[ak];<a href=";0]$hyperlink[$advancedTextSplit[$env[ak];">;1;</a>;0];https://www.last.fm$advancedTextSplit[$env[ak];<a href=";1;">;0;";0]];$env[ak]]$advancedTextSplit[$env[ak];</a>;1]];alk]
$let[desc;$trim[$advancedTextSplit[$arrayJoin[alk;];…;0]]]
]
$let[desc;$djsEval[require("entities").decodeHTML(ctx.getKeyword("desc"))]]
$let[latestre-t;$advancedTextSplit[$httpResult;item-header;1;class="link-block-target";1;</a>;0;>;1]]
$let[latestre-t;$djsEval[require("entities").decodeHTML(ctx.getKeyword("latestre-t"))]]
$let[latestre;$hyperlink[$get[latestre-t];https://www.last.fm$decodeURI[$advancedTextSplit[$httpResult;item-header;1;href=";1;";0]]]\n-# $trimLines[$default[$advancedTextSplit[$httpResult;item-header;1;item-date;1;">;1;</p>;0];Not Available]]]
$let[popweek-t;$advancedTextSplit[$httpResult;item-header;2;class="link-block-target";1;</a>;0;>;1]]
$let[popweek-t;$djsEval[require("entities").decodeHTML(ctx.getKeyword("popweek-t"))]]
$let[popweek;$hyperlink[$get[popweek-t];https://www.last.fm$decodeURI[$advancedTextSplit[$httpResult;item-header;2;href=";1;";0]]]\n-# $toTitleCase[$trimLines[$default[$advancedTextSplit[$httpResult;item-header;2;item-listeners;1;">;1;</p>;0];not available]]]]
$arrayLoad[loadtag;class="tag";$advancedTextSplit[$httpResult;tags-list--global;1;</li></ul>;0]]
$!arrayShift[loadtag]
$arrayMap[loadtag;tag;$return[$hyperlink[$advancedTextSplit[$env[tag];</a>;0;href=";1;>;1];https://www.last.fm$decodeURI[$advancedTextSplit[$env[tag];href=";1;";0]]]];loadtag]
$author[$advancedTextSplit[$httpResult;tnew-title;1;intabbr;1;">;1;</abbr>;0] Listened | $advancedTextSplit[$httpResult;tnew-title;2;intabbr;1;">;1;</abbr>;0] Scrobbles;$advancedTextSplit[$httpResult;rel="apple-music-app-icon";1;href=";1;";0];;0]
$title[$advancedTextSplit[$httpResult;resource-name=";1;data-page;0;";0];$encodeURI[$get[authorurl]];0]
$color[$get[checkcolor];0]
$if[$get[desc]!=;$description[-# $get[desc]]]
$addField[> \`🏷️\` | Tags;$if[$arrayLength[loadtag]==0;-# Not Available;$arrayJoin[loadtag;, ]];false;0]
$addField[> \`🍀\` | Latest Release;$if[$get[latestre-t]==;-# Not Available;$get[latestre]];true;0]
$addField[> \`📈\` | Popular This Week;$if[$get[popweek-t]==;-# Not Available;$get[popweek]];true;0]
$thumbnail[$get[valthumbnail_author];0]
$if[$get[conttracks]!=;
$author[Top Tracks | All time;$advancedTextSplit[$httpResult;rel="apple-music-app-icon";1;href=";1;";0];;1]
$description[$get[conttracks];1]
$if[$get[firstcovtop]!=;$thumbnail[$get[firstcovtop];1]]
$color[$get[checkcolor];1]
]
    `
}