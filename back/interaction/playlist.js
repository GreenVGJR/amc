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
$let[checkpl;$getUserVar[storeplaylist_user-$md5[$toLowercase[$trim[$input[doplaylistuser_title]]]]]]
$onlyIf[$and[$get[checkpl]!=;$get[checkaction]==create]!=true;$ephemeral
$callFunction[useCustomMusicMessage;config_generalPlaylistExistsUser]
$setTimeout[$!interactionDelete;3s]
]
$if[$get[checkaction]==create;
$let[hash;$md5[$toLowercase[$trim[$input[doplaylistuser_title]]]]]
$jsonLoad[storejson;{}]
$!jsonSet[storejson;title;$input[doplaylistuser_title]]
$!jsonSet[storejson;description;$input[doplaylistuser_desc]]
$!jsonSet[storejson;tracks;\\[\\]]
$setUserVar[storeplaylist_user-$get[hash];$jsonStringify[storejson]]
;
$let[hash;$md5[$toLowercase[$trim[$input[doplaylistuser_title]]]]]
$let[dbuser;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;2]]]
$onlyIf[$get[dbuser]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$jsonLoad[storejson;$get[dbuser]]
$!jsonSet[storejson;title;$input[doplaylistuser_title]]
$!jsonSet[storejson;description;$input[doplaylistuser_desc]]
$setUserVar[storeplaylist_user-$get[hash];$jsonStringify[storejson]]
]
$if[$get[checkaction]!=create;
$interactionUpdate[
$footer[Migrating playlist;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]]
$if[$get[hash]!=$advancedTextSplit[$customID;_;2];$!deleteUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;2]] $!deleteUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]]
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
$jsonLoad[a;$searchDB[;$authorID;user]]
$arrayMap[a;ah;$if[$and[$env[ah;id]==$authorID;$startsWith[$env[ah;name];storeplaylist_user-]];$return[$env[ah]]];a]
$let[hash;$if[$selectMenuValues[0]==;$advancedTextSplit[$customID;_;1];$selectMenuValues[0]]]
$let[index;$arrayFindIndex[a;acheck;$checkContains[$advancedTextSplit[$env[acheck;name];storeplaylist_user-;1];$get[hash]]]]
$onlyIf[$get[index]!=-1;$callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$onlyIf[$isJSON[$env[a;$get[index];value]];$callFunction[useCustomMusicMessage;config_generalPlaylistErrorUser]]
$jsonLoad[ketdata;$env[a;$get[index];value]]
$jsonLoad[listracks;$env[ketdata;tracks]]
$let[totaltrack;$arrayLength[listracks]]
$let[curpage;$default[$advancedTextSplit[$customID;_;2];1]]
$let[nextpage;$sum[$advancedTextSplit[$divide[$get[totaltrack];25];.;0];1]]
$let[checkdbtempact;$checkCondition[$getUserVar[storetempl-act_ls_user-$get[hash]]!=]]
$arraySlice[listracks;listracks;$multi[25;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]];$multi[25;$sum[1;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]]]]
$let[cotsr;]
$loop[10;$if[$env[listracks;$sub[$env[cotrsls];1]]==;$break]$let[cotsr;$get[cotsr]- $cropText[$default[$env[listracks;$sub[$env[cotrsls];1];title];$env[listracks;$sub[$env[cotrsls];1];url]];0;90;...]\n];cotrsls;true]
$interactionUpdate[
$title[$env[ketdata;title]]
$description[$env[ketdata;description]]
$addField[List Tracks;$if[$arrayLength[listracks]==0;Seems empty.;$get[cotsr]$if[$arrayLength[listracks]>10;\n...$replace[$sub[10;$arrayLength[listracks]];-;] more]];false]
$color[$callFunction[useIcon;color_embed]]
$thumbnail[$if[$and[$checkContains[$env[listracks;0;url];youtube.com/playlist]==false;$checkContains[$env[listracks;0;url];youtube.com]];https://i.ytimg.com/vi/$advancedTextSplit[$env[listracks;0;url];watch?v=;1]/hq720.jpg;$userAvatar[$authorID;2048]]]
$footer[$separateNumber[$get[totaltrack];.] Tracks;$callFunction[useIcon;null]]
$addActionRow
$addStringSelectMenu[awaitplaytrackplts_$get[hash];Pick Tracks to Play;$checkCondition[$arrayLength[listracks]==0];1;$arrayLength[listracks]]
$let[countpr;$multi[$sub[$get[curpage];1];25]]
$if[$arrayLength[listracks]==0;
$addOption[null;;null]
;
$arrayForEach[listracks;lotr;
$addOption[$cropText[$default[$env[lotr;title];$env[lotr;url]];0;100];$cropText[$advancedTextSplit[$env[lotr;url];https://;1;/;0];0;100];$get[countpr]]
$letSum[countpr;1]
]]
$addActionRow
$addButton[listplaylistuserall;Back;Secondary;↩️]
$addButton[editplaylistuser_$get[hash];Edit Playlist;Secondary;📂]
$addButton[editplaylistuserh_$get[hash]$if[$get[checkdbtempact];_1_slu];Edit Tracks;Secondary;🎶]
$addButton[deleteplaylistuser_$get[hash]$if[$getUserVar[configplaylistuser_vgjra9f_confirm;$authorID;true]==false;_1];Delete Playlist;Danger;🗑️]
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
$let[checkdb;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$if[$advancedTextSplit[$customID;_;2]==1;
$interactionUpdate[
$footer[Deleting playlist;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]
$!deleteUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1]]
$!deleteUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]
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
$let[checkdb;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$jsonLoad[a;$get[checkdb]]
$modal[createplaylistuser_edit_$advancedTextSplit[$customID;_;1];Edit Playlist]
$addTextInput[doplaylistuser_title;Name;Short;true;;$env[a;title];1;350]
$addTextInput[doplaylistuser_desc;Description;Paragraph;false;;$env[a;description];1;1000]
]
$if[$advancedTextSplit[$customID;_;0]==editplaylistuserh;
$let[checkdb;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$jsonLoad[ketdata;$get[checkdb]]
$jsonLoad[listracks;$env[ketdata;tracks]]
$let[totaltrack;$arrayLength[listracks]]
$let[curpage;$default[$advancedTextSplit[$customID;_;2];1]]
$let[nextpage;$sum[$advancedTextSplit[$divide[$get[totaltrack];25];.;0];1]]
$arraySlice[listracks;listracks;$multi[25;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]];$multi[25;$sum[1;$if[$get[curpage]==1;0;$sub[$get[curpage];1]]]]]
$let[cotsr;]
$loop[10;$if[$env[listracks;$sub[$env[cotrsls];1]]==;$break]$let[cotsr;$get[cotsr]- $cropText[$default[$env[listracks;$sub[$env[cotrsls];1];title];$env[listracks;$sub[$env[cotrsls];1];url]];0;90;...]\n];cotrsls;true]
$if[$and[$selectMenuValues[0]!=;$advancedTextSplit[$customID;_;3]==slu];$setUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;1];$selectMenuValues[;,]]]
$if[$advancedTextSplit[$customID;_;3]==dlrt;$deleteUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]]
$interactionUpdate[
$title[$env[ketdata;title]]
$description[$env[ketdata;description]]
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
$addButton[trliplaylistuser_rmva_$advancedTextSplit[$customID;_;1]$if[$getUserVar[configplaylistuser_vgjra9f_confirm;$authorID;true]==false;_1];Remove All;Danger;;$or[$arrayLength[listracks]==0;$advancedTextSplit[$customID;_;3]==slu]]
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
$if[$advancedTextSplit[$customID;_;1]==fm;$setUserVar[configplaylistuser_vgjra9f_title;$if[$getUserVar[configplaylistuser_vgjra9f_title;$authorID;false]==false;true;false];$authorID]]
$if[$advancedTextSplit[$customID;_;1]==fp;$setUserVar[configplaylistuser_vgjra9f_slice;$if[$getUserVar[configplaylistuser_vgjra9f_slice;$authorID;false]==false;true;false];$authorID]]
$if[$advancedTextSplit[$customID;_;1]==sc;$setUserVar[configplaylistuser_vgjra9f_confirm;$if[$getUserVar[configplaylistuser_vgjra9f_confirm;$authorID;true]==false;true;false];$authorID]]
$interactionUpdate[$callFunction[loadPlaylistUser;;;true]]
]
$if[$advancedTextSplit[$customID;_;0]==trliplaylistuser;
$let[checkdb;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;2]]]
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
$!jsonSet[a;tracks;\\[\\]]
$setUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;2];$env[a]]
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
$jsonLoad[a;$env[a;tracks]]
$let[checktempdb;$getUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]]
$arrayLoad[b;,;$get[checktempdb]]
$let[storetext;]
$arrayForEach[b;cotns;
$let[storetext;$get[storetext]$default[$env[a;$env[cotns];name];$env[a;$env[cotns];url]]\n]
]
$modal[crplaylistusertrsu_$advancedTextSplit[$customID;_;2];Modify Tracks]
$addTextInput[crplaylistusertrdo;Tracks;Paragraph;false;https://youtu.be/...\nhttps://youtube.com/playlist?list=...\nnever gonna give you;$get[storetext];1;4000]
]
$if[$advancedTextSplit[$customID;_;1]==rmv;
$let[lookmatch;$getUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]]
$onlyIf[$get[lookmatch]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistTempNotExistUser]]
$interactionUpdate[
$footer[Updating Tracks;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]
$jsonLoad[a;$get[checkdb]]
$jsonLoad[an;$env[a;tracks]]
$arrayLoad[b;,;$get[lookmatch]]
$arrayForEach[b;c;
$!jsonDelete[an;$env[c]]
]
$!jsonSet[a;tracks;$env[an]]
$setUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;2];$env[a]]
$deleteUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;2]]
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
$let[checkdb;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$let[userav;$userAvatar[$authorID;1024]]
$let[totalsong;0]
$let[wltype;0]
$jsonLoad[ub;$get[checkdb]]
$jsonLoad[ur;$env[ub;tracks]]
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
$let[isfetch;$getUserVar[configplaylistuser_vgjra9f_title;$authorID;false]]
$let[isslice;$getUserVar[configplaylistuser_vgjra9f_slice;$authorID;false]]
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
$!jsonSet[test;title;$inflate[$env[pushmusic;title];base64]]
$!jsonSet[test;url;$env[pushmusic;url]]
$arrayPushJSON[finaltest;$env[test]]
]
$letSum[totalsong;$arrayLength[fetchplaylistmusic]]
;
$callLocalFunction[loadinteraction;1]
$let[mc_title;$if[$get[isfetch];$default[$callFunction[fetchTitleTrack;$env[l]];null];null]]
$let[mc_url;$if[$startsWith[$env[l];https://];$env[l];https://$env[l]]]
$letSum[totalsong;1]
$!jsonSet[test;title;$get[mc_title]]
$!jsonSet[test;url;$get[mc_url]]
$arrayPushJSON[finaltest;$env[test]]
]
;
$callLocalFunction[loadinteraction;1]
$if[$get[isfetch];
$jsonLoad[fetchmetamusic;$callFunction[fastMetadataTrack;$env[l];youtubemusic]]
$let[mc_title;$inflate[$env[fetchmetamusic;title];base64]]
$let[mc_url;https://youtube.com/watch?v=$env[fetchmetamusic;id]]
;
$let[mc_title;$env[l]]
$let[mc_url;null]
]
$letSum[totalsong;1]
$!jsonSet[test;title;$get[mc_title]]
$!jsonSet[test;url;$get[mc_url]]
$arrayPushJSON[finaltest;$env[test]]
]
]
$arrayConcat[finaltrack;ur;finaltest]
$!jsonSet[ub;tracks;$env[finaltrack]]
$setUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1];$env[ub]]
$callLocalFunction[loadinteraction;3]
`
},
{
type: "interactionCreate",
allowedInteractionTypes: ["modal"],
code: `
$onlyIf[$advancedTextSplit[$customID;_;0]==crplaylistusertrsu]
$let[checkdb;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$let[lookmatch;$getUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[lookmatch]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistTempNotExistUser]]
$interactionUpdate[
$footer[Updating Tracks;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]
$arrayLoad[o;,;$get[lookmatch]]
$arrayLoad[trs;
;$input[crplaylistusertrdo]]
$jsonLoad[ot;$get[checkdb]]
$jsonLoad[ltok;$env[ot;tracks]]
$loop[$arrayLength[o];
$let[suc;$sub[$env[counting];1]]
$if[$env[trs;$get[suc]]==;
$!jsonDelete[ltok;$env[o;$get[suc]]]
;
$if[$isValidLink[$env[trs;$get[suc]]];
$!jsonSet[ltok;$env[o;$get[suc]];url;$env[trs;$get[suc]]]
;
$!jsonSet[ltok;$env[o;$get[suc]];title;$env[trs;$get[suc]]]
]]
;counting;true]
$!jsonSet[ot;tracks;$env[ltok]]
$setUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1];$env[ot]]
$deleteUserVar[storetempl-act_ls_user-$advancedTextSplit[$customID;_;1]]
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

$onlyIf[$getVar[radioplayer_data;$guildID_playerstatus;false]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]
$let[cid;$getVar[musicplayer_message;$guildID_channelid]]
$let[mid;$getVar[musicplayer_message;$guildID_messageid]]

$let[checkdb;$getUserVar[storeplaylist_user-$advancedTextSplit[$customID;_;1]]]
$onlyIf[$get[checkdb]!=;$ephemeral $callFunction[useCustomMusicMessage;config_generalPlaylistNotExistUser]]
$arrayLoad[a;,;$selectMenuValues[;,]]

$interactionUpdate[
$author[$username[$authorID];$userAvatar[$authorID;1024];;0]
$footer[Fetching;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
]

$jsonLoad[trs;$get[checkdb]]
$jsonLoad[listrs;$env[trs;tracks]]

$let[successplay;0]
$let[errorplay;0]

$if[$and[$get[cid]==;$get[mid]==];
$let[mid2;$sendMessage[$channelID;
$author[$username[$authorID];$userAvatar[$authorID;1024];;0]
$title[Playlist | $cropText[$env[trs;title];0;20;...]]
$footer[Fetching;$callFunction[useIcon;loading]]
$color[$callFunction[useIcon;color_embed]]
;true]]
$setVar[musicplayer_message;$guildID_channelid;$channelID]
$setVar[musicplayer_message;$guildID_messageid;$get[mid2]]
]

$loop[$arrayLength[a];
$let[ctrs;$sub[$env[sdgk];1]]

$try[
$playTrack[$voiceID;$default[$env[listrs;$env[a;$get[ctrs]];url];$env[listrs;$env[a;$get[ctrs]];title]];auto]
$letSum[successplay;1]
;
$letSum[errorplay;1]
]

;sdgk;true]
$interactionUpdate[
$author[$username[$authorID];$userAvatar[$authorID;1024];;0]
$addField[Success;\`$get[successplay]\`;true]
$addField[Error;\`$get[errorplay]\`;true]
$footer[Done]
$color[$callFunction[useIcon;color_embed]]
]
`
}]