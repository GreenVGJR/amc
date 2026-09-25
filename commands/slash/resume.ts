import type { IApplicationCommandData } from "@tryforge/forgescript";
export default {
  data: {
    "name": "resume",
    "description": "Resume the current track",
    "integration_types": [
      0
    ],
    "contexts": [
      0
    ],
    "description_localizations": {
      "id": "Lanjutkan lagu"
    }
  },
  type: 0,
  code: `
    $onlyIf[$guildID!=;]
    $ephemeral
    $onlyIf[$voiceID!=;$callFunction[useCustomMusicMessage;config_errorJoin]]
    $onlyIf[$try[$isPlaying;false];$callFunction[useCustomMusicMessage;config_errorClientPlayer]]
    $let[crdjcs_0f;$callFunction[checkDJRoleUser]]
    $if[$get[crdjcs_0f]==false;
    $onlyIf[$and[$voiceID[$guildID;$clientID]!=;$voiceID[$guildID;$authorID]!=$voiceID[$guildID;$clientID]]!=true;$replace[$callFunction[useCustomMusicMessage;config_errorIsSameVC];{client};<@$clientID>] <#$voiceID[$guildID;$clientID]>.]
    ;
    $let[crdjcr_0f;$advancedTextSplit[$get[crdjcs_0f];|;1]]
    $onlyIf[$hasRoles[$guildID;$authorID;$get[crdjcr_0f]];$replace[$callFunction[useCustomMusicMessage;config_errorIsSameDJVC];{role};<@&$get[crdjcr_0f]>]]
    ]
    $onlyIf[$callFunction[checkRadioPlayer;$guildID]!=true;$ephemeral $callFunction[useCustomMusicMessage;config_errorRadioPlayer]]
    $onlyIf[$isPaused==true;$callFunction[useCustomMusicMessage;config_errorNotPaused]]
    $async[$!resumeTrack]
    $interactionReply[$callFunction[useCustomMusicMessage;config_generalResumeTrack]]
    $setTimeout[$async[$!interactionDelete];1s]
    $callFunction[updateCurrentMusicPlayer;false]
    `
} satisfies IApplicationCommandData;
