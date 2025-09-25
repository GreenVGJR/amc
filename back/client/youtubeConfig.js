// Test replace yt stream
async function fallbackYTStream(lstracks) {
    try {
    const pl={videoId:lstracks.split('watch?v=')[1],context:{client:{hl:"en",gl:"US",clientName:"WEB",clientVersion:"2.20250926",clientScreen:"WATCH",clientFormFactor:"UNKNOWN_FORM_FACTOR"},request:{useSsl:true,internalExperimentFlags:[],consistencyTokenJars:[]}},playbackContext:{contentPlaybackContext:{vis:0,splay:true,html5Preference:"HTML5_PREF_WANTS",lactMilliseconds:"-1"}},attestationRequest:{omitBotguardData:true},racyCheckOk:true,contentCheckOk:true};

    let a = await fetch('https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false&fields=streamingData.hlsManifestUrl', { method: "POST", body: JSON.stringify(pl), headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip", "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.5 Safari/605.1.15,gzip(gfe)"}}).then(b => b.json());

    if(!a.streamingData?.hlsManifestUrl) { throw new Error(); }
    const b = await fetch(a.streamingData.hlsManifestUrl, { method: "GET"}).then(c => c.text());

    const bc = b.split("https://manifest.googlevideo.com");
    const c = bc[bc.length - 1];
    
    return "https://manifest.googlevideo.com" + c;
    }
    catch {
        throw new Error();
    }
}

module.exports = {
    generateWithPoToken: false,
    disablePlayer: true,
    slicePlaylist: true,
    createStream: async (q) => {
    try { return await fallbackYTStream(q.url); }
    catch { return; }
    },
    streamOptions: {
        useClient: "ANDROID"
    }
}
