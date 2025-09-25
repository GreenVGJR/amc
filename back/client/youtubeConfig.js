// Test replace yt stream
let vt;
async function fallbackYTStream(lstracks) {
    try {
    vt=vt?vt:await fetch('https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false&fields=responseContext.visitorData',{method:"POST",headers:{"Content-Type":"application/json","Accept-Encoding":"gzip"},body:JSON.stringify({context:{client:{clientName:"ANDROID_VR",clientVersion:"1.00",hl:"en",gl:"US"}}})}).then(r=>r.json()).then(j=>j?.responseContext?.visitorData).catch(()=>undefined);const pl={videoId:lstracks.split('watch?v=')[1],context:{client:{hl:"en",gl:"US",clientName:"ANDROID_VR",clientVersion:"1.00",androidSdkVersion:38,visitorData:vt,clientScreen:"WATCH",clientFormFactor:"UNKNOWN_FORM_FACTOR"},request:{useSsl:true,internalExperimentFlags:[],consistencyTokenJars:[]}},playbackContext:{contentPlaybackContext:{vis:0,splay:true,html5Preference:"HTML5_PREF_WANTS",lactMilliseconds:"-1"}},attestationRequest:{omitBotguardData:true},racyCheckOk:true,contentCheckOk:true};

    let a = await fetch('https://youtubei.googleapis.com/youtubei/v1/player?prettyPrint=false&fields=streamingData(hlsManifestUrl,adaptiveFormats(itag,url))', { method: "POST", body: JSON.stringify(pl), headers: { "Content-Type": "application/json", "Accept-Encoding": "gzip"}}).then(b => b.json());
    if(a.streamingData?.hlsManifestUrl) { return a.streamingData.hlsManifestUrl; }
    a = a.streamingData?.adaptiveFormats?.find(c => c.itag === 251 || c.itag === 140); //Known issue, throttled
    if(!a.url) { throw new Error(); }
        return a.url;
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
