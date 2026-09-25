import type { IForgeFunction } from "@tryforge/forgescript";
export default {
    name: "findPlaylistUser",
    params: [{
        name: "hash",
        required: true
    },
    {
        name: "anuserid",
        required: true
    }],
    code: `
    $jsonLoad[a;$searchDB[user]]
    $let[find;$env[a;$arrayFindIndex[a;c;$checkCondition[$env[c;key]==storeplaylist_user-$env[hash]_$env[anuserid]]]]]
    $return[$get[find]]
    `
} satisfies IForgeFunction;
