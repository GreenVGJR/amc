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
    $jsonLoad[a;$if[$or[$env[tempobject]==;$env[tempobject]==null];$extractTrack[$env[url]];$env[tempobject]]]
    $if[$env[filtype;type]==youtube;
    $let[author;$advancedTextSplit[$env[a;results;author]; - Topic;0]]
    $let[title;$env[a;results;title]]
    ]
    $if[$env[filtype;type]==soundcloud;
    $jsonLoad[b;$env[a;results]]
    $if[$or[$env[b;publisher_metadata;artist]==;$env[b;publisher_metadata;artist]==null];
    $let[author;$env[b;user;username]]
    ;
    $let[author;$env[b;publisher_metadata;artist]]
    ]
    $if[$or[$env[b;publisher_metadata;release_title]==;$env[b;publisher_metadata;release_title]==null];
    $let[title;$env[b;title]]
    ;
    $let[title;$default[$env[b;publisher_metadata;release_title];$env[b;publisher_metadata;album_title]]]
    ]]
    $if[$env[filtype;type]==spotify;
    $if[$env[a;results;props]!=;
    $let[author;$env[a;results;props;pageProps;state;data;entity;artists;0;name]]
    $let[title;$env[a;results;props;pageProps;state;data;entity;name]]
    ;
    $let[author;$env[a;results;artists;0;name]]
    $let[title;$env[a;results;name]]
    ]]
    $if[$env[filtype;type]==applemusic;
    $let[author;$env[a;results;artistName]]
    $if[$env[a;results;trackName]!=;
    $let[title;$env[a;results;trackName]]
    ;
    $let[title;$env[a;results;collectionName]]
    ]]
    $if[$env[filtype;type]==tiktokmob;
    $if[$env[a;results;id_str]!=;
    $if[$env[a;results;mid]!=;
    $let[author;$default[$env[a;results;matched_song;author];$env[a;results;author]]]
    $let[title;$default[$env[a;results;matched_song;title];$env[a;results;title]]]
    ;
    $let[author;$env[a;results;author_info;unique_id]]
    $let[title;$default[$env[a;results;desc];$env[a;results;id_str]]]
    ]
    ;
    $let[author;$default[$env[a;results;author;uniqueId];$env[a;results;author]]]
    $let[title;$default[$env[a;results;desc];$env[a;results;id]]]
    ]]
    $if[$env[filtype;type]==tiktok;
    $if[$env[a;results;id_str]!=;
    $let[author;$env[a;results;author_info;unique_id]]
    $let[title;$default[$env[a;results;desc];$env[a;results;id_str]]]
    ;
    $let[author;$default[$env[a;results;author;uniqueId];$env[a;results;author]]]
    $let[title;$default[$env[a;results;desc];$env[a;results;id]]]
    ]]
    $if[$env[filtype;type]==tiktokmusic;
    $let[author;$default[$env[a;results;matched_song;author];$env[a;results;author]]]
    $let[title;$default[$env[a;results;matched_song;title];$env[a;results;title]]]
    ]
    $if[$env[filtype;type]==facebook;
    $let[author;$env[a;results;owner]]
    $let[title;$default[$env[a;results;text];$env[a;results;video_id]]]
    ]
    $if[$env[filtype;type]==instagram;
    $let[author;$default[$env[a;results;owner;username];$env[a;results;user;username]]]
    $let[title;$default[$env[a;results;edge_media_to_caption;edges;0;node;text];$default[$env[a;results;caption;text];$env[a;results;id]]]]
    ]
    $if[$env[filtype;type]==instagramaudio;
    $if[$and[$env[a;results;metadata;original_sound_info]==null;$env[a;results;metadata;music_info]==null];
    $let[author;$env[a;results;items;0;media;code]]
    $let[title;$env[a;results;items;0;media;caption;text]]
    ;
    $if[$env[a;results;metadata;original_sound_info]!=null;
    $let[author;$default[$env[a;results;metadata;original_sound_info;ig_artist;username];$env[a;results;metadata;original_sound_info;ig_artist;full_name]]]
    $let[title;$default[$env[a;results;metadata;original_sound_info;original_audio_title];$env[a;results;metadata;original_sound_info;original_media_id]]]
    ;
    $let[author;$default[$env[a;results;metadata;music_info;music_asset_info;display_artist];$env[a;results;metadata;music_info;music_asset_info;ig_username]]]
    $let[title;$default[$env[a;results;metadata;music_info;music_asset_info;title];$env[a;results;metadata;music_info;music_asset_info;audio_asset_id]]]
    ]]]
    $if[$env[filtype;type]==bandcamp;
    $if[$env[a;results;artist]!=null;$let[author;$env[a;results;artist]]]
    $let[title;$env[a;results;title]]
    ]
    $if[$env[filtype;type]==twitter;
    $let[author;$env[a;results;core;user_results;result;core;screen_name]]
    $let[title;$default[$advancedTextSplit[$env[a;results;legacy;full_text];https://t.co;0];$default[$env[a;results;post_video_description];$env[a;results;rest_id]]]]
    ]
    $let[author;$trim[$if[$checkContains[$toLowercase[$toCamelCase[$get[title]]];$toLowercase[$toCamelCase[$get[author]]]]==false;$get[author]]]]
    $let[finaltitle;$get[author]$if[$and[$get[author]!=;$get[title]!=]; - ]$get[title]]
    $return[$get[finaltitle]]
    `
}