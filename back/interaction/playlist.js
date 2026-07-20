module.exports = [
    {
        name: "configplaylistuserbutton",
        type: "interactionCreate",
        allowedInteractionTypes: ["button"],
        code: `
$interactionUpdate[$callFunction[loadPlaylistUser;;;true]]
`
    },
    {
        name: "createplaylistuserbutton",
        type: "interactionCreate",
        allowedInteractionTypes: ["button"],
        code: `
$modal[createplaylistuser_create;Create Playlist]
$addTextInput[doplaylistuser_title;Name;Short;true;;;1;350]
$addTextInput[doplaylistuser_desc;Description;Paragraph;false;;;1;1000]
`
    },
    {
        type: "interactionCreate",
        allowedInteractionTypes: ["modal"],
        code: `
$onlyIf[$advancedTextSplit[$customID;_;0]==createplaylistuser]
$let[checkaction;$advancedTextSplit[$customID;_;1]]
$let[checkpl;$callFunction[findPlaylistUser;$md5[$authorID_$toLowercase[$trim[$input[doplaylistuser_title]]]];$authorID]]
$onlyIf[$and[$get[checkpl]!=;$get[checkaction]==create]!=true;$ephemeral
$callFunction[useCustomMusicMessage;config_generalPlaylistExistsUser]
$setTimeout[$async[$!interactionDelete];3s]
]
$if[$get[checkaction]==create;
$let[hash;$md5[$authorID_$toLowercase[$trim[$input[doplaylistuser_title]]]]]
$jsonLoad[storejson;{}]
$!jsonSet[storejson;title;"$input[doplaylistuser_title]"]
$!jsonSet[storejson;description;"$input[doplaylistuser_desc]"]
$!jsonSet[storejson;tracks;\\[\\]]
$!putRecord[user;$jsonStringify[storejson];storeplaylist_user-$get[hash]_$authorID]
;
$let[hash;$md5[$authorID_$toLowercase[$trim[$input[doplaylistuser_title]]]]]
$let[dbuser;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;2];$authorID]]
$onlyIf[$get[dbuser]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$jsonLoad[storejson;$get[dbuser]]
$!jsonSet[storejson;value;title;"$input[doplaylistuser_title]"]
$!jsonSet[storejson;value;description;"$input[doplaylistuser_desc]"]
$!putRecord[user;$env[storejson;value];storeplaylist_user-$get[hash]_$authorID]
]
$if[$get[checkaction]!=create;
$interactionUpdate[
$footer[Migrating playlist;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]]
$if[$get[hash]!=$advancedTextSplit[$customID;_;2];
$!removeRecord[user;storeplaylist_user-$advancedTextSplit[$customID;_;2]_$authorID]
$!removeRecord[user;storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]
]
$interactionUpdate[
$author[$if[$get[checkaction]==create;Created;Edited] Playlist;$callFunction[useIcon;checked]]
$addField[Title;$input[doplaylistuser_title];false]
$addField[Description;$if[$input[doplaylistuser_desc]==;Not provided;$input[doplaylistuser_desc]];false]
$color[$callFunction[useIcon;color_embed]]
$addActionRow
$addButton[listplaylistuser_$get[hash];Back to Playlist;Secondary;↩️]
]
`
    },
    {
        type: "interactionCreate",
        allowedInteractionTypes: ["selectMenu", "button"],
        code: `
$onlyIf[$advancedTextSplit[$customID;_;0]==listplaylistuser]
$ephemeral
$let[hash;$if[$selectMenuValues[0]==;$advancedTextSplit[$customID;_;1];$selectMenuValues[0]]]
$let[ketdata;$callFunction[findPlaylistUser;$get[hash];$authorID]]
$onlyIf[$get[ketdata]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$jsonLoad[ketdata;$get[ketdata]]
$jsonLoad[listracks;$env[ketdata;value;tracks]]
$let[totaltrack;$arrayLength[listracks]]
$let[curpage;$default[$advancedTextSplit[$customID;_;2];1]]
$let[nextpage;$sum[$advancedTextSplit[$divide[$get[totaltrack];24];.;0];1]]
$let[checkdbtempact;$checkCondition[$getRecord[user;;storetempl-act_ls_user-$get[hash]]!={}]]
$arraySlice[listracks;listracks;$multi[24;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]];$multi[24;$sum[1;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]]]]
$let[cotsr;]
$loop[10;$if[$env[listracks;$sub[$env[cotrsls];1]]==;$break]$let[cotsr;$get[cotsr]- $cropText[$default[$env[listracks;$sub[$env[cotrsls];1];title];$env[listracks;$sub[$env[cotrsls];1];url]];0;90;...]\n];cotrsls;true]
$interactionUpdate[
$title[$env[ketdata;value;title]]
$description[$env[ketdata;value;description]]
$addField[List Tracks;$if[$arrayLength[listracks]==0;Seems empty.;$get[cotsr]$if[$arrayLength[listracks]>10;\n...$replace[$sub[10;$arrayLength[listracks]];-;] more]];false]
$color[$callFunction[useIcon;color_embed]]
$thumbnail[$if[$and[$checkContains[$env[listracks;0;url];youtube.com/playlist]==false;$checkContains[$env[listracks;0;url];youtube.com]];https://i.ytimg.com/vi/$advancedTextSplit[$env[listracks;0;url];watch?v=;1]/hq720.jpg;$userAvatar[$authorID;2048]]]
$footer[$separateNumber[$get[totaltrack];.] Tracks;$callFunction[useIcon;null]]
$addActionRow
$addStringSelectMenu[awaitplaytrackplts_$get[hash];Pick Tracks to Play;$checkCondition[$arrayLength[listracks]==0];1;$arrayLength[listracks]]
$let[countpr;$multi[$sub[$get[curpage];1];24]]
$if[$arrayLength[listracks]==0;
$addOption[null;;null]
;
$addOption[Play All;Play $separateNumber[$get[totaltrack]] songs at once.;all;▶️]
$arrayForEach[listracks;lotr;
$addOption[$cropText[$default[$env[lotr;title];$env[lotr;url]];0;100];$cropText[$advancedTextSplit[$env[lotr;url];https://;1;/;0];0;100];$get[countpr];🎼]
$letSum[countpr;1]
]]
$jsonLoad[confplaylistdb;$getRecord[user;;configplaylistuser_vgjra9f_$authorID]]
$addActionRow
$addButton[listplaylistuserall;Back;Secondary;↩️]
$addButton[editplaylistuser_$get[hash];Edit Playlist;Secondary;📂]
$addButton[editplaylistuserh_$get[hash]$if[$get[checkdbtempact];_1_slu];Edit Tracks;Secondary;🎶]
$addButton[deleteplaylistuser_$get[hash]$if[$default[$env[confplaylistdb;confirm];true]==false;_1];Delete Playlist;Danger;🗑️]
$addActionRow
$addButton[listplaylistuser_$get[hash]_1_tr;;Secondary;⏪;$checkCondition[$get[curpage]==1]]
$addButton[listplaylistuser_$get[hash]_$sub[$get[curpage];1];;Secondary;◀️;$checkCondition[$get[curpage]==1]]
$addButton[smoothleftcheck1wnull;Page $get[curpage] / $if[$get[nextpage]==1;1;$get[nextpage]];Secondary;;true]
$addButton[listplaylistuser_$get[hash]_$sum[$get[curpage];1];;Secondary;▶️;$checkCondition[$get[curpage]>=$get[nextpage]]]
$addButton[listplaylistuser_$get[hash]_$get[nextpage]_tr_pv;;Secondary;⏩;$checkCondition[$get[curpage]>=$get[nextpage]]]
]
`
    },
    {
        type: "interactionCreate",
        allowedInteractionTypes: ["button", "selectMenu"],
        code: `
$if[$advancedTextSplit[$customID;_;0]==pageplaylistusertell;
$interactionUpdate[$callFunction[loadPlaylistUser;$advancedTextSplit[$customID;_;1]]]
$stop
]
$if[$advancedTextSplit[$customID;_;0]==deleteplaylistuser;
$let[checkdb;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;1];$authorID]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$if[$advancedTextSplit[$customID;_;2]==1;
$interactionUpdate[
$footer[Deleting playlist;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]
$!removeRecord[user;storeplaylist_user-$advancedTextSplit[$customID;_;1]_$authorID]
$!removeRecord[user;storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]
$interactionUpdate[$callFunction[loadPlaylistUser;0]]
$stop
]
$interactionUpdate[
$author[You sure? This action cannot be undo.]
$color[$callFunction[useIcon;error_color_embed]]
$addActionRow
$addButton[listplaylistuser_$advancedTextSplit[$customID;_;1];Back to Playlist;Secondary;↩️]
$addButton[deleteplaylistuser_$advancedTextSplit[$customID;_;1]_1;Delete;Danger]
]
]
$if[$customID==listplaylistuserall;
$interactionUpdate[$callFunction[loadPlaylistUser;0]]
]
$if[$advancedTextSplit[$customID;_;0]==editplaylistuser;
$let[checkdb;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;1];$authorID]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$jsonLoad[a;$get[checkdb]]
$modal[createplaylistuser_edit_$advancedTextSplit[$customID;_;1];Edit Playlist]
$addTextInput[doplaylistuser_title;Name;Short;true;;$env[a;value;title];1;350]
$addTextInput[doplaylistuser_desc;Description;Paragraph;false;;$env[a;value;description];1;1000]
]
$if[$advancedTextSplit[$customID;_;0]==editplaylistuserh;
$let[checkdb;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;1];$authorID]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$jsonLoad[confplaylistdb;$getRecord[user;;configplaylistuser_vgjra9f_$authorID]]
$jsonLoad[ketdata;$get[checkdb]]
$jsonLoad[listracks;$env[ketdata;value;tracks]]
$let[totaltrack;$arrayLength[listracks]]
$let[curpage;$default[$advancedTextSplit[$customID;_;2];1]]
$let[nextpage;$sum[$advancedTextSplit[$divide[$get[totaltrack];25];.;0];1]]
$arraySlice[listracks;listracks;$multi[25;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]];$multi[25;$sum[1;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]]]]
$let[cotsr;]
$loop[10;$if[$env[listracks;$sub[$env[cotrsls];1]]==;$break]$let[cotsr;$get[cotsr]- $cropText[$default[$env[listracks;$sub[$env[cotrsls];1];title];$env[listracks;$sub[$env[cotrsls];1];url]];0;90;...]\n];cotrsls;true]
$if[$and[$selectMenuValues[0]!=;$advancedTextSplit[$customID;_;3]==slu];$!putRecord[user;{"list":\\[$selectMenuValues[;,]\\]};storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]]
$if[$advancedTextSplit[$customID;_;3]==dlrt;$!removeRecord[user;storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]]
$interactionUpdate[
$title[$env[ketdata;value;title]]
$description[$env[ketdata;value;description]]
$addField[List Tracks;$if[$arrayLength[listracks]==0;Seems empty.;$get[cotsr]$if[$arrayLength[listracks]>10;\n...$replace[$sub[10;$arrayLength[listracks]];-;] more]];false]
$color[$callFunction[useIcon;color_embed]]
$thumbnail[$if[$and[$checkContains[$env[listracks;0;url];youtube.com/playlist]==false;$checkContains[$env[listracks;0;url];youtube.com]];https://i.ytimg.com/vi/$advancedTextSplit[$env[listracks;0;url];watch?v=;1]/hq720.jpg;$userAvatar[$authorID;2048]]]
$footer[$separateNumber[$get[totaltrack];.] Tracks;$callFunction[useIcon;null]]
$addActionRow
$addStringSelectMenu[editplaylistuserh_$advancedTextSplit[$customID;_;1]_1_slu_$get[curpage];Choose $if[$advancedTextSplit[$customID;_;3]==slu;Actions;Tracks for Actions (Modify / Remove)];$or[$advancedTextSplit[$customID;_;3]==slu;$arrayLength[listracks]==0];1;$arrayLength[listracks]]
$let[countpr;$multi[$sub[$get[curpage];1];25]]
$if[$arrayLength[listracks]==0;
$addOption[null;;null]
;
$arrayForEach[listracks;lotr;
$addOption[$cropText[$default[$env[lotr;title];$env[lotr;url]];0;100];$cropText[$advancedTextSplit[$env[lotr;url];https://;1;/;0];0;100];$get[countpr]]
$letSum[countpr;1]
]]
$addActionRow
$if[$advancedTextSplit[$customID;_;3]==slu;
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;1]_$advancedTextSplit[$customID;_;4]_dlrt;Cancel;Secondary;❌]
;
$addButton[listplaylistuser_$advancedTextSplit[$customID;_;1];Back;Secondary;↩️]
]
$addButton[trliplaylistuser_add_$advancedTextSplit[$customID;_;1];Add;Secondary;;$checkCondition[$advancedTextSplit[$customID;_;3]==slu]]
$addButton[trliplaylistuser_mod_$advancedTextSplit[$customID;_;1];Modify;Secondary;;$checkCondition[$advancedTextSplit[$customID;_;3]!=slu]]
$addButton[trliplaylistuser_rmv_$advancedTextSplit[$customID;_;1];Remove;Danger;;$checkCondition[$advancedTextSplit[$customID;_;3]!=slu]]
$addButton[trliplaylistuser_rmva_$advancedTextSplit[$customID;_;1]$if[$default[$env[confplaylistdb;confirm];true]==false;_1];Remove All;Danger;;$or[$arrayLength[listracks]==0;$advancedTextSplit[$customID;_;3]==slu]]
$if[$checkCondition[$advancedTextSplit[$customID;_;3]!=slu];
$addActionRow
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;1]_1_tr;;Secondary;⏪;$checkCondition[$get[curpage]==1]]
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;1]_$sub[$get[curpage];1];;Secondary;◀️;$checkCondition[$get[curpage]==1]]
$addButton[smoothleftcheck1wnull;Page $get[curpage] / $if[$get[nextpage]==1;1;$get[nextpage]];Secondary;;true]
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;1]_$sum[$get[curpage];1];;Secondary;▶️;$checkCondition[$get[curpage]>=$get[nextpage]]]
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;1]_$get[nextpage]_tr_pv;;Secondary;⏩;$checkCondition[$get[curpage]>=$get[nextpage]]]
]
]
]
$if[$advancedTextSplit[$customID;_;0]==toggleplaylistuser;
$jsonLoad[confplaylistdb;$getRecord[user;;configplaylistuser_vgjra9f_$authorID]]
$if[$advancedTextSplit[$customID;_;1]==fm;$!jsonSet[confplaylistdb;title;$if[$default[$env[confplaylistdb;title];false]==false;true;false]]]
$if[$advancedTextSplit[$customID;_;1]==fp;$!jsonSet[confplaylistdb;slice;$if[$default[$env[confplaylistdb;slice];false]==false;true;false]]]
$if[$advancedTextSplit[$customID;_;1]==sc;$!jsonSet[confplaylistdb;confirm;$if[$default[$env[confplaylistdb;confirm];true]==false;true;false]]]
$!putRecord[user;$jsonStringify[confplaylistdb];configplaylistuser_vgjra9f_$authorID]
$interactionUpdate[$callFunction[loadPlaylistUser;;;true]]
]
$if[$advancedTextSplit[$customID;_;0]==trliplaylistuser;
$let[checkdb;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;2];$authorID]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$if[$advancedTextSplit[$customID;_;1]==add;
$modal[crplaylistusertrsl_$advancedTextSplit[$customID;_;2];Add Tracks]
$addTextInput[crplaylistusertrdo;Tracks;Paragraph;true;https://youtu.be/...\nhttps://youtube.com/playlist?list=...\nnever gonna give you;;1;4000]
]
$if[$advancedTextSplit[$customID;_;1]==rmva;
$if[$advancedTextSplit[$customID;_;3]==1;
$interactionUpdate[
$footer[Removing Tracks;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]
$jsonLoad[a;$get[checkdb]]
$!jsonSet[a;value;tracks;\\[\\]]
$!putRecord[user;$env[a;value];storeplaylist_user-$advancedTextSplit[$customID;_;2]_$authorID]
$interactionUpdate[
$footer[Done]
$color[$callFunction[useIcon;color_embed]]
$addActionRow
$addButton[listplaylistuser_$advancedTextSplit[$customID;_;2];Back to Playlist;Secondary;↩️]
]
$stop
]
$interactionUpdate[
$author[You sure? This action cannot be undo.]
$color[$callFunction[useIcon;error_color_embed]]
$addActionRow
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;2];Back to List;Secondary;↩️]
$addButton[trliplaylistuser_rmva_$advancedTextSplit[$customID;_;2]_1;Remove All;Danger]
]
]
$if[$advancedTextSplit[$customID;_;1]==mod;
$jsonLoad[a;$get[checkdb]]
$jsonLoad[a;$env[a;value;tracks]]
$let[checktempdb;$getRecord[user;;storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]]
$jsonLoad[b;$get[checktempdb]]
$jsonLoad[b;$env[b;list]]
$let[storetext;]
$arrayForEach[b;cotns;
$let[storetext;$get[storetext]$default[$env[a;$env[cotns];name];$env[a;$env[cotns];url]]\n]
]
$modal[crplaylistusertrsu_$advancedTextSplit[$customID;_;2];Modify Tracks]
$addTextInput[crplaylistusertrdo;Tracks;Paragraph;false;https://youtu.be/...\nhttps://youtube.com/playlist?list=...\nnever gonna give you;$get[storetext];1;4000]
]
$if[$advancedTextSplit[$customID;_;1]==rmv;
$let[lookmatch;$getRecord[user;;storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]]
$onlyIf[$get[lookmatch]!={};$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistTempNotExistUser]]
$interactionUpdate[
$footer[Updating Tracks;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]
$jsonLoad[a;$get[checkdb]]
$jsonLoad[an;$env[a;value;tracks]]
$jsonLoad[b;$get[lookmatch]]
$jsonLoad[b;$env[b;list]]
$arrayForEach[b;c;
$!jsonDelete[an;$env[c]]
]
$!jsonSet[a;value;tracks;$env[an]]
$!putRecord[user;$env[a;value];storeplaylist_user-$advancedTextSplit[$customID;_;2]_$authorID]
$!removeRecord[user;storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]
$interactionUpdate[
$footer[Done]
$color[$callFunction[useIcon;color_embed]]
$addActionRow
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;2];Back to List;Secondary;↩️]
]
]
]
`
    },
    {
        type: "interactionCreate",
        allowedInteractionTypes: ["modal"],
        code: `
$onlyIf[$advancedTextSplit[$customID;_;0]==crplaylistusertrsl]
$let[checkdb;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;1];$authorID]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$let[userav;$userAvatar[$authorID;1024]]
$let[totalsong;0]
$let[wltype;0]
$jsonLoad[ub;$get[checkdb]]
$jsonLoad[ur;$env[ub;value;tracks]]
$let[playlistsong;$arrayLength[ur]]
$localFunction[loadinteraction;
$if[$and[$env[types]==1;$get[wltype]!=$env[types]];
$interactionUpdate[
$author[Fetching;$get[userav]]
$addField[Total Song;\`$get[totalsong]\`;true]
$addField[Total Playlist Song;\`$sum[$get[totalsong];$get[playlistsong]]\`;true]
$footer[Adding Tracks;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
] $let[wltype;1]]
$if[$and[$env[types]==2;$get[wltype]!=$env[types]];
$interactionUpdate[
$author[Slicing Playlist;$get[userav]]
$addField[Total Song;\`$get[totalsong]\`;true]
$addField[Total Playlist Song;\`$sum[$get[totalsong];$get[playlistsong]]\`;true]
$footer[Adding Tracks;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
] $let[wltype;2]]
$if[$env[types]==3;
$interactionUpdate[
$author[Done;$get[userav]]
$addField[Total Song;\`$get[totalsong]\`;true]
$addField[Total Playlist Song;\`$sum[$get[totalsong];$get[playlistsong]]\`;true]
$color[$callFunction[useIcon;color_embed]]
$addActionRow
$addButton[listplaylistuser_$advancedTextSplit[$customID;_;1];Back to Playlist;Secondary;↩️]
]
]
;types]
$callLocalFunction[loadinteraction;1]
$arrayLoad[listlink;
;$trim[$trimLines[$input[crplaylistusertrdo]]]]
$jsonLoad[confplaylistdb;$getRecord[user;;configplaylistuser_vgjra9f_$authorID]]
$let[isfetch;$default[$env[confplaylistdb;title];false]]
$let[isslice;$default[$env[confplaylistdb;slice];false]]
$arrayUnique[listlink;listlink]
$arrayLoad[finaltest]
$arrayForEach[listlink;l;
$jsonLoad[test;{}]
$if[$isValidLink[$env[l]];
$if[$and[$get[isslice];$checkContains[$env[l];youtube.com/playlist?list=]];
$callLocalFunction[loadinteraction;2]
$jsonLoad[fellow;$callFunction[filterMediaID;$env[l]]]
$jsonLoad[fetchplaylistmusic;$callFunction[slicePlaylistYT;$env[fellow;id]]]
$arrayForEach[fetchplaylistmusic;pushmusic;
$jsonLoad[test;{}]
$!jsonSet[test;title;"$inflate[$env[pushmusic;title];base64]"]
$!jsonSet[test;url;$env[pushmusic;url]]
$arrayPushJSON[finaltest;$env[test]]
]
$letSum[totalsong;$arrayLength[fetchplaylistmusic]]
;
$callLocalFunction[loadinteraction;1]
$let[pulltitle;$callFunction[fetchTitleTrack;$env[l]]]
$if[$get[pulltitle]!=;
$let[mc_title;$if[$get[isfetch];$default[$get[pulltitle];null];null]]
$let[mc_url;$if[$startsWith[$env[l];https://];$env[l];https://$env[l]]]
$letSum[totalsong;1]
$!jsonSet[test;title;"$get[mc_title]"]
$!jsonSet[test;url;$get[mc_url]]
$arrayPushJSON[finaltest;$env[test]]
]]
;
$callLocalFunction[loadinteraction;1]
$if[$get[isfetch];
$jsonLoad[fetchmetamusic;$callFunction[fastMetadataTrack;$env[l];$callFunction[configMusic;playlistmetadata_provider]]]
$if[$env[fetchmetamusic;id]!=;
$let[mc_title;$env[fetchmetamusic;title]]
$let[mc_url;https://www.youtube.com/watch?v=$env[fetchmetamusic;id]]
$letSum[totalsong;1]
$!jsonSet[test;title;"$get[mc_title]"]
$!jsonSet[test;url;$get[mc_url]]
$arrayPushJSON[finaltest;$env[test]]
]
;
$let[mc_title;$env[l]]
$let[mc_url;null]
$letSum[totalsong;1]
$!jsonSet[test;title;"$get[mc_title]"]
$!jsonSet[test;url;$get[mc_url]]
$arrayPushJSON[finaltest;$env[test]]
]
]
]
$arrayConcat[finaltrack;ur;finaltest]
$!jsonSet[ub;value;tracks;$jsonStringify[finaltrack]]
$!putRecord[user;$env[ub;value];storeplaylist_user-$advancedTextSplit[$customID;_;1]_$authorID]
$callLocalFunction[loadinteraction;3]
`
    },
    {
        type: "interactionCreate",
        allowedInteractionTypes: ["modal"],
        code: `
$onlyIf[$advancedTextSplit[$customID;_;0]==crplaylistusertrsu]
$let[checkdb;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;1];$authorID]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$let[lookmatch;$getRecord[user;;storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[lookmatch]!={};$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistTempNotExistUser]]
$interactionUpdate[
$footer[Updating Tracks;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]
$jsonLoad[o;$get[lookmatch]]
$jsonLoad[o;$env[o;list]]
$arrayLoad[trs;
;$input[crplaylistusertrdo]]
$jsonLoad[ot;$get[checkdb]]
$jsonLoad[ltok;$env[ot;value;tracks]]
$loop[$arrayLength[o];
$let[suc;$sub[$env[counting];1]]
$if[$env[trs;$get[suc]]==;
$!jsonDelete[ltok;$env[o;$get[suc]]]
;
$if[$isValidLink[$env[trs;$get[suc]]];
$!jsonSet[ltok;$env[o;$get[suc]];url;$env[trs;$get[suc]]]
;
$!jsonSet[ltok;"$env[o;$get[suc]];title;$env[trs;$get[suc]]"]
]]
;counting;true]
$!jsonSet[ot;value;tracks;$env[ltok]]
$!putRecord[user;$env[ot;value];storeplaylist_user-$advancedTextSplit[$customID;_;1]_$authorID]
$!removeRecord[user;storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]
$interactionUpdate[
$footer[Done]
$color[$callFunction[useIcon;color_embed]]
$addActionRow
$addButton[editplaylistuserh_$advancedTextSplit[$customID;_;1];Back to List;Secondary;↩️]
]
`
    },
    {
        type: "interactionCreate",
        allowedInteractionTypes: ["selectMenu"],
        code: `
$onlyIf[$advancedTextSplit[$customID;_;0]==awaitplaytrackplts]
$onlyIf[$hasPerms[$guildID;$clientID;SendMessages];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Send Messages** - <@$clientID>]
$onlyIf[$hasPerms[$guildID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID>]
$onlyIf[$voiceID!=;$ephemeral $callFunction[useCustomMusicMessage;config_errorJoin]]
$onlyIf[$channelHasPerms[$voiceID;$clientID;Connect];$ephemeral $callFunction[useCustomMusicMessage;config_errorChannelPerm] $callFunction[useCustomMusicMessage;config_errorPerm] **Connect** - <@$clientID> (<#$voiceID>)]
$let[crdjcs_0f;$callFunction[checkDJRoleUser]]
$if[$get[crdjcs_0f]==false;
$onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
;
$let[crdjcr_0f;$advancedTextSplit[$get[crdjcs_0f];|;1]]
$onlyIf[$hasRoles[$guildID;$authorID;$get[crdjcr_0f]];$replace[$callFunction[useCustomMusicMessage;config_errorIsSameDJVC];{role};<@&$get[crdjcr_0f]>]]
]

$onlyIf[$or[$channelUserLimit[$voiceID]==0;$sum[$channelVoiceMemberCount[$voiceID];$if[$voiceID[$guildID;$clientID]==;1;0]]<=$channelUserLimit[$voiceID]];$ephemeral $callFunction[useCustomMusicMessage;config_errorIsLimitVC]]
$onlyIf[$callFunction[checkRadioPlayer;$guildID]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]
$let[cid;$getCache[initclientmusic;musicplayer_message_$guildID_channelid]]
$let[mid;$getCache[initclientmusic;musicplayer_message_$guildID_messageid]]

$let[checkdb;$callFunction[findPlaylistUser;$advancedTextSplit[$customID;_;1];$authorID]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]

$onlyIf[$hasCache[initclientmusic;musicplayer_message_$guildID_ongoingplaylistmusic]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistOnGoingProcessing]]

$setCache[initclientmusic;musicplayer_message_$guildID_ongoingplaylistmusic;true]

$interactionUpdate[
$author[$username[$authorID];$userAvatar[$authorID;1024];;0]
$footer[Fetching;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]

$jsonLoad[trs;$get[checkdb]]
$jsonLoad[listrs;$env[trs;value;tracks]]

$arrayLoad[a;,;$selectMenuValues[;,]]
$let[doespickallsongsinstead;$arrayFindIndex[a;ap;$checkCondition[$env[ap]==all]]]
$if[$get[doespickallsongsinstead]!=-1;
$c[Override other values with all instead]
$arrayLoad[a]
$loop[$arrayLength[listrs];
$let[hnihklk;$sub[$env[hnihkl];1]]
$arrayPush[a;$get[hnihklk]]
;hnihkl;true]]

$let[successplay;0]
$let[errorplay;0]

$if[$and[$get[cid]==;$get[mid]==];
$let[mid2;$sendMessage[$channelID;
$author[$username[$authorID];$userAvatar[$authorID;1024];;0]
$title[Playlist | $cropText[$env[trs;value;title];0;20;...]]
$footer[Fetching;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
;true]]
$setCache[initclientmusic;musicplayer_message_$guildID_channelid;"$channelID"]
$setCache[initclientmusic;musicplayer_message_$guildID_messageid;"$get[mid2]"]
]

$loop[$arrayLength[a];
$if[$getCache[initclientmusic;musicplayer_message_$guildID_ongoingplaylistmusic]!=true;$break]
$let[found;false]
$let[attemptry;0]
$let[donetry;5]

$let[ctrs;$sub[$env[sdgk];1]]
$let[lockprovyt;youtubeVideo]
$if[$and[$env[listrs;$env[a;$get[ctrs]];url]!=;$env[listrs;$env[a;$get[ctrs]];url]!=null;$env[listrs;$env[a;$get[ctrs]];url]!=undefined];
$let[ktnmplaytt;$env[listrs;$env[a;$get[ctrs]];url]]
;
$let[ktnmplaytt;$env[listrs;$env[a;$get[ctrs]];title]]
]

$jsonLoad[whatmusictype;$callFunction[filterMediaID;$get[ktnmplaytt]]]

$while[$and[$get[attemptry]<=$get[donetry];$get[found]==false;$getCache[initclientmusic;musicplayer_message_$guildID_ongoingplaylistmusic]==true];
    $try[
    $if[$env[whatmusictype;type]==youtube;
    $playTrack[$voiceID;$trimLines[$get[ktnmplaytt]];$get[lockprovyt]]
    ;
    $if[$or[$env[whatmusictype;type]==null;$env[whatmusictype;type]==applemusic;$env[whatmusictype;type]==soundcloud;$env[whatmusictype;type]==spotify;$env[whatmusictype;type]==youtubeplaylist]!=true;
    $playTrack[$voiceID;$trimLines[$get[ktnmplaytt]];$env[whatmusictype;type]]
    ;
    $playTrack[$voiceID;$trimLines[$get[ktnmplaytt]];auto]
    ]]
    $let[found;true]
    ;
    $if[$env[whatmusictype;type]==youtube;
    $if[$get[attemptry]==2;$let[lockprovyt;youtube]]
    ]
    $letSum[attemptry;1]
    ;causeplayerror]
]

$if[$get[found]==true;$letSum[successplay;1];$letSum[errorplay;1]]

;sdgk;true]

$deleteCache[initclientmusic;musicplayer_message_$guildID_ongoingplaylistmusic]

$interactionUpdate[
$author[$username[$authorID];$userAvatar[$authorID;1024];;0]
$addField[Success;\`$get[successplay]\`;true]
$addField[Error;\`$get[errorplay]\`;true]
$footer[Done]
$color[$callFunction[useIcon;color_embed]]
]
$wait[2s]
$async[$!interactionDelete]
`
    }]