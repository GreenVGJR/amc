module.exports = {
    name: "extractTrack",
    params: [{
        name: "url", // string
        description: "To provide a information",
        required: true
    },
    {
        name: "userAgent", // string
        description: "Spoof Client",
        required: false
    },
    {
        name: "limitChar", // int
        description: "Limit Character to 2000",
        required: false
    }],
    code: `
    $let[url;$env[url]]
    $let[spliturl;$advancedTextSplit[$get[url];://;1]]
    $let[agent;$if[$or[$env[userAgent]==;$env[userAgent]==null];Mozilla/5.0 (Windows NT 10.0\\; Win64\\; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36;$env[userAgent]]]
    $jsonLoad[filterid;$callFunction[filterMediaID;https://$get[spliturl]]]
    $onlyIf[$or[$env[filterid;id]==null;$env[filterid;type]==null]!=true;$return]
    $arrayLoad[results]
    $try[
    $if[$env[filterid;type]==youtube;
    $let[tryattempt;0]
    $localFunction[refreshyt;
    $if[$env[retry]==true;
    $onlyIf[$get[tryattempt]<5;$return]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetBody[{"videoId":"$env[filterid;id]","context":{"client":{"clientName":"WEB","clientVersion":"2.20261231"}}}]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://m.youtube.com/youtubei/v1/player?prettyPrint=false&fields=videoDetails(videoId,title,lengthSeconds,channelId,isCrawlable,viewCount,author,isPrivate,isLiveContent);POST;reshttp]]
    $jsonLoad[reshttp;$env[reshttp]]
    $onlyIf[$env[reshttp;videoDetails]!=;$callLocalFunction[refreshyt;true]]
    $let[results;{"status":$get[http],"results":$if[$env[reshttp;videoDetails]==;null;$env[reshttp;videoDetails]]}]
    ;retry]
    $callLocalFunction[refreshyt;false]
    ]
    $if[$env[filterid;type]==soundcloud;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://$get[spliturl];GET;reshttp]]
    $let[a;$advancedTextSplit[$env[reshttp];<script>window.__sc_hydration;1;= ;1;\\;</script>;0]]
    $let[results;{"status":$get[http],"results":$if[$get[a]==;null;$replace[$replace[$get[a];/preview/progressive;/preview/progressive?client_id=$getCache[authmusic_soundcloud_fall]];/stream/progressive;/stream/progressive?client_id=$getCache[authmusic_soundcloud_fall]]]}]
    ]
    $if[$env[filterid;type]==spotify;
    $let[tryattempt;0]
    $localFunction[refreshspotify;
    $if[$env[retry]==true;
    $onlyIf[$get[tryattempt]<3;$return]
    $callFunction[generateAuthKeys;spotify;;false]
    $letSum[tryattempt;1]
    ]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[Authorization;Bearer $getCache[authmusic_spotify]]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://api.spotify.com/v1/tracks/$advancedTextSplit[$env[filterid;id];/;1]?market=US;GET;a]]
    $onlyIf[$or[$get[http]==401;$get[http]==400]!=true;$callLocalFunction[refreshspotify;true]]
    $if[$or[$get[http]==403;$get[http]==429];
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://open.spotify.com/embed/$env[filterid;id];GET;a]]
    $if[$get[http]==403;
    $let[a;null]
    ;
    $let[a;$advancedTextSplit[$env[a];type="application/json">;1;</script>;0]]
    ]
    ;
    $let[a;$env[a]]
    ]
    $let[results;{"status":$get[http],"results":$if[$get[a]==;null;$get[a]]}]
    ;retry]
    $callLocalFunction[refreshspotify;false]
    ]]
    $if[$env[filterid;type]==tiktokmob;
    $jsonLoad[filterid;$callFunction[filterMediaID;$djsEval[require("undici").request("$replace[$get[url];vm.tiktok.com;vt.tiktok.com]", { method: 'GET' }).then(a => a.headers.location).catch()]]]
    ]
    $if[$env[filterid;type]==tiktok;
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Cookie;$inflate[$getCache[authmusic_tiktok];base64]]
    $httpSetContentType[Text]
    $let[http;$httpRequest[https://www.tiktok.com/@/video/$env[filterid;id];GET]]
    $onlyIf[$get[http]==200;$return]
    $jsonLoad[a;$advancedTextSplit[$httpResult;"webapp.video-detail":;1;,"webapp;0]]
    $jsonLoad[b;$env[a;itemInfo;itemStruct]]
    $let[results;{"status":$get[http],"results":$if[$env[b]==;null;$env[b]]}]
    ]
    $if[$env[filterid;type]==tiktokmusic;
    $let[tryattempt;0]
    $localFunction[refreshvm;
    $if[$env[retry]==true;
    $onlyIf[$get[tryattempt]<10;$return]
    $letSum[tryattempt;1]
    ]
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Content-Type;application/json]
    $httpAddHeader[Accept;application/json]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[Cookie;$inflate[$getCache[authmusic_tiktok];base64]]
    $!httpRequest[https://api16-normal-quic.tiktokv.com/aweme/v1/music/aweme/?music_id=$env[filterid;id]&aid=1322&device_id=$randomNumber[100000000;999999999;false]$randomNumber[1000000000;9999999999;false];GET;a]
    $onlyIf[$env[a]!=;$callLocalFunction[refreshvm;true]]
    $jsonLoad[a;$env[a]]
    $jsonLoad[a;$env[a;aweme_list]]
    $let[index;$arrayFindIndex[a;b;$checkCondition[$env[b;added_sound_music_info;mid]==$env[filterid;id]]]]
    $if[$get[index]==-1;
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[Accept;*/*]
    $httpAddHeader[User-Agent;Mozilla/5.0 (compatible\\; Discordbot/2.0\\; +https://discordapp.com)]
    $httpSetContentType[Text]
    $onlyIf[$httpRequest[https://www.tiktok.com/music/-$env[filterid;id];GET]==200;$callLocalFunction[refreshvm;true]]
    $if[$checkContains[$advancedTextSplit[$httpResult;property="al:android:url";1;content=";1;";0];//music/detail/];
    $let[cl;$djsEval[require("entities").decodeHTML("$advancedTextSplit[$httpResult;<title>;1;</title>;0]")]]
    $let[stctitle;$toLowercase[$advancedTextSplit[$replace[$get[cl];♬ ;]; | ;0; & ;0] $advancedTextSplit[$replace[$get[cl];♬ ;]; | ;1]]]
    ;
    $return
    ]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[Accept;*/*]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://api16-normal-quic.tiktokv.com/aweme/v1/music/search/?count=10&cursor=0&aid=1180&device_id=$getCache[authmusic_tiktok_did]&keyword=$get[stctitle];GET;c]
    $onlyIf[$env[c]!=;$return]
    $jsonLoad[c;$env[c]]
    $jsonLoad[c;$env[c;music_info_list]]
    $jsonLoad[c;$env[c;$arrayFindIndex[c;k;$checkCondition[$env[k;music;id_str]==$env[filterid;id]]]]]
    $let[results;{"status":null,"results":$if[$env[c]==;null;$env[c;music]]}]
    ;
    $let[results;{"status":null,"results":$if[$env[a;$get[index]]==;null;$env[a;$get[index];music]]}]
    ]
    ;retry]
    $callLocalFunction[refreshvm;false]
    ]
    $if[$env[filterid;type]==facebook;
    $let[url;https://web.facebook.com$advancedTextSplit[$get[url];facebook.com;1]]
    $!djsEval[require("undici").request(ctx.getKeyword("url"), {method:"GET", headers:{"User-Agent":"Mozilla/5.0", "Sec-Fetch-Mode":"navigate"}}).then(a => { a.headers?.location ? ctx.setKeyword("url", a.headers?.location) : "" }).catch()]
    $httpAddHeader[Accept;text/html]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpSetContentType[Text]
    $!httpRequest[https://web.facebook.com/plugins/video.php?href=$get[url]&show_text=true;GET]
    $let[cs;$default[$advancedTextSplit[$httpResult;"videoData":\\[;1;,"player_version;0];{]]
    $jsonLoad[b;$get[cs]}]
    $if[$env[b;video_id]!=;
    $!jsonSet[b;text;$advancedTextSplit[$httpResult;class="text_exposed_root"><p>;1;<;0]]
    $!jsonSet[b;owner;$advancedTextSplit[$httpResult;<a title=";1;" target=;0]]
    ]
    $let[results;{"status":null,"results":$env[b]}]
    ]
    $if[$env[filterid;type]==instagram;
    $httpAddHeader[Accept;*/*]
    $httpAddHeader[Accept-Language;en-US]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[User-Agent;$get[agent]]
    $!httpRequest[https://www.instagram.com/graphql/query/?doc_id=8845758582119845&variables={"shortcode":"$advancedTextSplit[$env[filterid;id];/;$charCount[$env[filterid;id];/]]"};GET]
    $let[results;{"status":null,"results":$if[$httpResult[data;xdt_shortcode_media;id]==;null;$httpResult[data;xdt_shortcode_media]]}]
    ]
    $if[$env[filterid;type]==bandcamp;
    $httpSetContentType[Text]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[Accept-Language;en-US]
    $!httpRequest[$env[filterid;id];GET]
    $let[a;$advancedTextSplit[$httpResult;data-tralbum=";1;";0]]
    $let[a;$djsEval[require("entities").decodeHTML(ctx.getKeyword("a"))]]
    $jsonLoad[a;$default[$get[a];{}]]
    $let[results;{"status":null,"results":$if[$env[a;trackinfo]==;null;$env[a;trackinfo;0]]}]
    ]
    $if[$env[filterid;type]==twitter;
    $let[xr_variables;{"tweetId":"$env[filterid;id]","includePromotedContent":false,"withBirdwatchNotes":false,"withVoice":false,"withCommunity":false}]
    $let[xr_features;{"creator_subscriptions_tweet_preview_api_enabled":false,"premium_content_api_read_enabled":false,"communities_web_enable_tweet_community_results_fetch":false,"c9s_tweet_anatomy_moderator_badge_enabled":false,"responsive_web_grok_analyze_button_fetch_trends_enabled":false,"responsive_web_grok_analyze_post_followups_enabled":false,"responsive_web_jetfuel_frame":false,"responsive_web_grok_share_attachment_enabled":false,"articles_preview_enabled":false,"responsive_web_edit_tweet_api_enabled":false,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":false,"view_counts_everywhere_api_enabled":false,"longform_notetweets_consumption_enabled":false,"responsive_web_twitter_article_tweet_consumption_enabled":false,"tweet_awards_web_tipping_enabled":false,"responsive_web_grok_show_grok_translated_post":false,"responsive_web_grok_analysis_button_from_backend":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":false,"standardized_nudges_misinfo":false,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"longform_notetweets_rich_text_read_enabled":false,"longform_notetweets_inline_media_enabled":false,"payments_enabled":false,"profile_label_improvements_pcf_label_in_post_enabled":false,"responsive_web_profile_redirect_enabled":false,"rweb_tipjar_consumption_enabled":false,"verified_phone_label_enabled":false,"responsive_web_grok_image_annotation_enabled":false,"responsive_web_grok_imagine_annotation_enabled":false,"responsive_web_grok_community_note_auto_translation_is_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":false,"responsive_web_enhance_cards_enabled":false}]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpAddHeader[Sec-Fetch-Site;same-site]
    $httpAddHeader[Referer;https://x.com]
    $httpAddHeader[Origin;https://x.com]
    $httpAddHeader[Accept-Encoding;gzip, deflate, br]
    $httpAddHeader[Authorization;Bearer $getCache[authmusic_twitter]]
    $httpSetContentType[Text]
    $!httpRequest[https://api.x.com/graphql/$getCache[authmusic_twitter_qid]/TweetResultByRestId?variables=$encodeURI[$get[xr_variables]]&features=$encodeURI[$get[xr_features]];GET]
    $jsonLoad[thers;$httpResult]
    $let[results;{"status":null,"results":$if[$env[thers;data;tweetResult]==;null;$env[thers;data;tweetResult;result]]}]
    ]
    $let[resultforeturn;$get[results]]
    $return[$if[$and[$env[limitChar]==true;$env[limitChar]!=false];$cropText[$get[resultforeturn];0;2000;];$get[resultforeturn]]]
    `
}