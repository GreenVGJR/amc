// Test replace yt stream
let vt;
(async() => {
vt=await fetch("https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false&fields=responseContext.visitorData", { method: "POST", body: JSON.stringify({context:{client:{clientName:"VISIONOS",clientVersion:"0.1"}}}), headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip"}}).then(a => a.json()).then(b => b.responseContext.visitorData);
})();
async function fallbackYTStream(lstracks) {
    try {
    const pl={videoId:lstracks.split('watch?v=')[1],context:{client:{clientName:"VISIONOS",clientVersion:"0.1",visitorData:vt,clientScreen:"WATCH",clientFormFactor:"UNKNOWN_FORM_FACTOR"},request:{useSsl:true,internalExperimentFlags:[],consistencyTokenJars:[]}},playbackContext:{contentPlaybackContext:{vis:0,splay:true,html5Preference:"HTML5_PREF_WANTS",lactMilliseconds:"-1",signatureTimestamp:"0"}},attestationRequest:{omitBotguardData:true},racyCheckOk:true,contentCheckOk:true};

    let a = await fetch('https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false&fields=streamingData(hlsManifestUrl,adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent)', {method: "POST", body: JSON.stringify(pl), headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip"}}).then(b => b.json());

    if(a.videoDetails.isLiveContent) return await fetch(a.streamingData.hlsManifestUrl, {method: "GET", headers: { "Accept-Encoding": "gzip"}}).then(a => a.text()).then(b => b.split('GROUP-ID="234"')[0].split('URI="')[2].split('"')[0]);
    const fr = a.streamingData.adaptiveFormats.find(c => [251, 140].includes(c.itag));
    return fr.url + "&range=0-" + fr.contentLength;
    }
    catch {
        throw new Error();
    }
}

module.exports = {
    generateWithPoToken: false,
    disablePlayer: true,
    slicePlaylist: true,
    overrideBridgeMode: "yt",
    createStream: async (q, e) => {
    try { return await fallbackYTStream(q.url); }
    catch { return; }
    }
    /*
    streamOptions: {
        useClient: "IOS"
    },
    innertubeConfigRaw: {
        player_id: "0004de42" // https://github.com/LuanRT/YouTube.js/issues/1043#issuecomment-3328154175
    }
    */
}
