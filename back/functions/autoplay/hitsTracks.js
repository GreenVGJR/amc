module.exports = {
    name: "hitsTracks",
    params: [{
        name: "typeplatform",
        required: true
    },
    {
        name: "urlplatform",
        required: true
    },
    {
        name: "limitplatform",
        type: "Number",
        required: false
    }],
    code: `
    $let[limitplatform;$if[$or[$env[limitplatform]==;$env[limitplatform]==null];20;$env[limitplatform]]]
    $jsonLoad[whattype;$callFunction[filterMediaID;$env[urlplatform]]]
    $if[$env[typeplatform]==youtube;
    $jsonLoad[filterfinal;$callFunction[getYoutubeFeed;$env[whattype;id]]]
    $arrayMap[filterfinal;cacfilterfinals;
    $jsonLoad[aac;{}]
    $!jsonSet[aac;id;$env[cacfilterfinals;contentId]]
    $!jsonSet[aac;url;https://www.youtube.com/watch?v=$env[cacfilterfinals;contentId]]
    $!jsonSet[aac;title;$env[cacfilterfinals;metadata;lockupMetadataViewModel;title;content]]
    $!jsonSet[aac;author;$env[cacfilterfinals;metadata;lockupMetadataViewModel;metadata;contentMetadataViewModel;metadataRows;0;metadataParts;0;text;content]]
    $!jsonSet[aac;duration;"$unparseDigital[$env[cacfilterfinals;contentImage;thumbnailViewModel;overlays;0;thumbnailBottomOverlayViewModel;badges;0;thumbnailBadgeViewModel;text]]"]
    $!jsonSet[aac;thumbnail;https://i.ytimg.com/vi/$env[cacfilterfinals;contentId]/hq720.jpg]
    $return[$env[aac]]
    ;filterfinal]
    ]
    $if[$env[typeplatform]==soundcloud;
    $jsonLoad[scTrack;$extractTrack[$env[urlplatform]]]
    $if[$env[scTrack;results;id]==;$return[{}]]
    $!httpRequest[https://api-v2.soundcloud.com/tracks/$env[scTrack;results;id]/related?client_id=$getCache[initclientmusic;authmusic_soundcloud]&limit=$get[limitplatform];GET;jjcm]
    $jsonLoad[filterfinal;$default[$env[jjcm;collection];{}]]
    $arrayMap[filterfinal;cacfilterfinals;
    $jsonLoad[aac;{}]
    $!jsonSet[aac;id;"$env[cacfilterfinals;id]"]
    $!jsonSet[aac;url;$env[cacfilterfinals;permalink_url]]
    $!jsonSet[aac;title;$env[cacfilterfinals;title]]
    $!jsonSet[aac;author;$env[cacfilterfinals;user;permalink]]
    $!jsonSet[aac;duration;"$env[cacfilterfinals;full_duration]"]
    $!jsonSet[aac;thumbnail;$replace[$env[cacfilterfinals;artwork_url];-large;-original]]
    $return[$env[aac]]
    ;filterfinal]
    ]
    $if[$env[typeplatform]==spotify;
    $let[tryattempt;0]
    $localFunction[refreshspotify;
    $try[
    $if[$env[refresh]==true;
    $if[$get[tryattempt]>=3;$return]
    $callFunction[generateAuthKeys;spotify_player;;false]
    $callFunction[generateAuthKeys;spotify_token;;false]
    $letSum[tryattempt;1]
    ]
    $let[mdhedroute_spotify2;{
    "Accept": "application/json",
    "Accept-Language": "en",
    "App-Platform": "WebPlayer",
    "Authorization": "Bearer $getCache[initclientmusic;authmusic_spotify_fall]",
    "Client-Token": "$getCache[initclientmusic;authmusic_spotify_token]",
    "Content-Type": "application/json",
    "Origin": "https://open.spotify.com",
    "User-Agent": "$get[agent]"
    }]
    $jsonLoad[mdbody_spotify;{"variables":{"uri":"spotify:track:$advancedTextSplit[$env[whattype;id];/;1]","limit":$get[limitplatform]},"operationName":"internalLinkRecommenderTrack","extensions":{"persistedQuery":{"version":1,"sha256Hash":"c77098ee9d6ee8ad3eb844938722db60570d040b49f41f5ec6e7be9160a7c86b"}}}]
    $let[mdquery2;https://api-partner.spotify.com/pathfinder/v2/query]
    $let[jsonres2;$djsEval[const { request, Agent } = require("undici")\\; request(ctx.getKeyword("mdquery2"), { dispatcher: new Agent({ connect: { family: 4 } }), body: JSON.stringify(ctx.getEnvironmentKey("mdbody_spotify")), headers: JSON.parse(ctx.getKeyword("mdhedroute_spotify2")), method: "POST" }).then(a => { ctx.setKeyword('httpspo', a.statusCode)\\; return a.body.text() }).catch()]]
    $if[$or[$get[httpspo]==401;$get[httpspo]==400];$callLocalFunction[refreshspotify;true] $return]
    $if[$or[$get[httpspo]==429;$get[httpspo]==403];$return]
    $jsonLoad[filterfinal;$get[jsonres2]]
    $jsonLoad[filterfinal;$env[filterfinal;data;seoRecommendedTrack;items]]
    ]
    ;refresh]
    $callLocalFunction[refreshspotify;false]
    $arrayMap[filterfinal;cacfilterfinals;
    $let[thospthumbnail;$advancedTextSplit[$env[cacfilterfinals;data;albumOfTrack;coverArt;sources;0;url];/;4]]
    $jsonLoad[filterartistssp;$env[cacfilterfinals;data;artists;items]]
    $arrayMap[filterartistssp;spcg;$return[$env[spcg;profile;name]];filterartistssp]
    $jsonLoad[aac;{}]
    $!jsonSet[aac;id;$env[cacfilterfinals;data;id]]
    $!jsonSet[aac;url;https://open.spotify.com/track/$env[cacfilterfinals;data;id]]
    $!jsonSet[aac;title;$env[cacfilterfinals;data;name]]
    $!jsonSet[aac;author;$arrayJoin[filterartistssp;, ]]
    $!jsonSet[aac;duration;"$env[cacfilterfinals;data;duration;totalMilliseconds]"]
    $!jsonSet[aac;thumbnail;https://i.scdn.co/image/$cropText[$get[thospthumbnail];0;12]82c1$cropText[$get[thospthumbnail];16]]
    $return[$env[aac]]
    ;filterfinal]
    ]
    $if[$env[typeplatform]==applemusic;
    $try[
    $arrayLoad[filterfinal]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetContentType[Json]
    $!httpRequest[https://itunes.apple.com/lookup?id=$advancedTextSplit[$env[urlplatform];/;6];GET;rrhttp]
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetContentType[Text]
    $!httpRequest[$env[rrhttp;results;0;collectionViewUrl];GET;rshttp]
    $jsonLoad[fishttp;$advancedTextSplit[$env[rshttp];type="application/json" id="serialized-server-data">;1;</script>;0]]
    $jsonLoad[fishttp;$env[fishttp;data;0;data;sections]]
    $jsonLoad[cacfilterfinal;$env[fishttp;$arrayFindIndex[fishttp;el;$startsWith[$env[el;id];you-might-also-like]];items]]
    $arraySlice[cacfilterfinal;cacfilterfinal;0;5]
    $arrayForEach[cacfilterfinal;cacfilterfinals;
    $httpAddHeader[User-Agent;$get[agent]]
    $httpSetContentType[Text]
    $!httpRequest[$env[cacfilterfinals;contentDescriptor;url];GET;rshttp2]
    $jsonLoad[fishttp2;$advancedTextSplit[$env[rshttp2];type="application/json" id="serialized-server-data">;1;</script>;0]]
    $jsonLoad[fishttp2;$env[fishttp2;data;0;data;sections]]
    $jsonLoad[cacfilterfinal2;$env[fishttp2;$arrayFindIndex[fishttp2;el;$startsWith[$env[el;id];track-list]];items]]
    $arrayForEach[cacfilterfinal2;cacfilterfinals2;
    $jsonLoad[aac;{}]
    $!jsonSet[aac;id;"$advancedTextSplit[$env[cacfilterfinals2;id]; - ;2]"]
    $!jsonSet[aac;url;https://music.apple.com/us/song/$advancedTextSplit[$env[cacfilterfinals2;contentDescriptor;url];/;$sub[$charCount[$env[cacfilterfinals2;contentDescriptor;url];/];1]]/$advancedTextSplit[$env[cacfilterfinals2;contentDescriptor;url];?i=;1]]
    $!jsonSet[aac;title;$env[cacfilterfinals2;title]]
    $!jsonSet[aac;author;$env[cacfilterfinals2;artistName]]
    $!jsonSet[aac;duration;"$env[cacfilterfinals2;duration]"]
    $!jsonSet[aac;thumbnail;$replace[$env[cacfilterfinals;artwork;dictionary;url];{w}x{h}bb.{f};1x1ss.png]]
    $arrayPushJSON[filterfinal;$env[aac]]
    ]]]
    $arrayShuffle[filterfinal]
    ]
    $arraySlice[filterfinal;filterfinal;0;$get[limitplatform]]
    $return[$default[$jsonStringify[filterfinal];{}]]
    `
}