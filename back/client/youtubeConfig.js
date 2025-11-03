// Test replace yt stream
let vt;
const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
const ytcookies = process.env.YOUTUBE_COOKIES;
async function fallbackYTStream(lstracks) {
    try {
    const GTH = (sapisid = ytcookies?.match(/(?:^|;\s*)SAPISID=([^;]*)/)?.[1], secure1psid = ytcookies?.match(/(?:^|;\s*)__Secure-1PAPISID=([^;]*)/)?.[1], secure3psid = ytcookies?.match(/(?:^|;\s*)__Secure-3PAPISID=([^;]*)/)?.[1], origin_url = "https://www.youtube.com") => { const t = Math.floor(Date.now() / 1000).toString(); return "SAPISIDHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + sapisid + " " + origin_url).digest('hex') + "_u" + " SAPISID1PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure1psid + " " + origin_url).digest('hex') + "_u" + " SAPISID3PHASH " + t + "_" + require('crypto').createHash('sha1').update(t + " " + secure3psid + " " + origin_url).digest('hex') + "_u"; };
    vt=vt?vt:await fetch("https://www.youtube.com/embed?html5=1", { method: "GET", headers: { "Accept-Encoding": "gzip", "User-Agent": userAgent, ...(ytcookies && { Cookie: ytcookies })}}).then(a => a.text()).then(b => b.split('"visitorData":"')[1].split('"')[0]);
    const pl={videoId:lstracks.split('watch?v=')[1],context:{client:{clientName:"VISIONOS",clientVersion:"0.1",visitorData:vt,clientScreen:"WATCH",clientFormFactor:"UNKNOWN_FORM_FACTOR"},request:{useSsl:true,internalExperimentFlags:[],consistencyTokenJars:[]}},playbackContext:{contentPlaybackContext:{vis:0,splay:true,html5Preference:"HTML5_PREF_WANTS",lactMilliseconds:"-1",signatureTimestamp:"0"}},attestationRequest:{omitBotguardData:true},racyCheckOk:true,contentCheckOk:true};
    let a = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false&fields=streamingData(hlsManifestUrl,adaptiveFormats(itag,url,contentLength)),videoDetails(isLiveContent)', {method: "POST", body: JSON.stringify(pl), headers: {
    "Content-Type": "application/json",
    "Accept-Encoding": "gzip",
    "Accept-Language": "en-US,en;q=0.9",
    "Origin": "https://www.youtube.com",
    "User-Agent": userAgent,
    ...(ytcookies && {
        "Authorization": GTH(),
        "Cookie": ytcookies,
        "X-Goog-Visitor-Id": vt
        })}
    })
    .then(b => b.json());

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
