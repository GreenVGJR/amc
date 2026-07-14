const { Logger } = require("@tryforge/forgescript");
const { BG, buildURL, getHeaders } = require('bgutils-js');
const { JSDOM } = require('jsdom');

function generateAnonPOT() {
    const b = Buffer.alloc(10);
    b[0] = 0x22;
    b[1] = 0x08;
    for (let i = 0; i < 8; i++) b[2 + i] = Math.floor(Math.random() * 256);
    return b.toString('base64url');
}

const POTOKEN_REQUEST_KEY = 'O43z0dpjhgX20SCx4KAo';
const POTOKEN_TTL_FALLCACHE = 3600000;
let bgDomInitialized = false;
const poTokenCache = new Map();

let bgProgram = null;
let bgGlobalName = null;
let bgIntegrityTokenData = null;
let bgWebPoSignalOutput = null;
let bgIntegrityExp = 0;
let bgInitPromise = null;
let bgRefreshPromise = null;

function ensureBgDom() {
    if (bgDomInitialized) return;
    const dom = new JSDOM();
    Object.assign(globalThis, { window: dom.window, document: dom.window.document });
    bgDomInitialized = true;
}

const bgConfigFor = (identifier) => ({
    fetch: (input, init) => fetch(input, init),
    globalObj: globalThis,
    identifier,
    requestKey: POTOKEN_REQUEST_KEY
});

async function installBotGuardInterpreter() {
    ensureBgDom();
    const challenge = await BG.Challenge.create(bgConfigFor('init'));
    if (!challenge) throw new Error('BotGuard challenge unavailable');
    const interpreterJs = challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (!interpreterJs) throw new Error('BotGuard interpreter script unavailable');
    new Function(interpreterJs)();
    bgProgram = challenge.program;
    bgGlobalName = challenge.globalName;
}

async function refreshBotGuardIntegrity() {
    if (bgRefreshPromise) return bgRefreshPromise;
    bgRefreshPromise = (async () => {
        if (!bgProgram || !bgGlobalName) await installBotGuardInterpreter();
        const botguard = await BG.BotGuardClient.create({ program: bgProgram, globalName: bgGlobalName, globalObj: globalThis });
        const webPoSignalOutput = [];
        const botguardResponse = await botguard.snapshot({ webPoSignalOutput });
        const payload = [POTOKEN_REQUEST_KEY, botguardResponse];
        const integrityTokenResponse = await fetch(buildURL('GenerateIT', false), {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(payload)
        });
        const integrityTokenJson = await integrityTokenResponse.json();
        const [integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken] = integrityTokenJson;
        if (!integrityToken) throw new Error('BotGuard integrity token unavailable');
        bgIntegrityTokenData = { integrityToken, estimatedTtlSecs, mintRefreshThreshold, websafeFallbackToken };
        bgWebPoSignalOutput = webPoSignalOutput;
        bgIntegrityExp = Date.now() + (estimatedTtlSecs ? estimatedTtlSecs * 1000 : POTOKEN_TTL_FALLCACHE);
    })().finally(() => { bgRefreshPromise = null; });
    return bgRefreshPromise;
}

async function initBotGuard() {
    if (bgProgram && bgGlobalName) return;
    if (bgInitPromise) return bgInitPromise;
    bgInitPromise = (async () => {
        await installBotGuardInterpreter();
        await refreshBotGuardIntegrity();
        Logger.info(`/ [YoutubeConfig] BotGuard initialized`);
    })().finally(() => { bgInitPromise = null; });
    return bgInitPromise;
}

async function generateCbPotFall(videoId) {
    ensureBgDom();
    const bgConfig = bgConfigFor(videoId);
    const challenge = await BG.Challenge.create(bgConfig);
    if (!challenge) throw new Error('BotGuard challenge unavailable');
    const interpreterJs = challenge.interpreterJavascript?.privateDoNotAccessOrElseSafeScriptWrappedValue;
    if (!interpreterJs) throw new Error('BotGuard interpreter script unavailable');
    new Function(interpreterJs)();
    const result = await BG.PoToken.generate({ program: challenge.program, globalName: challenge.globalName, bgConfig });
    const token = result?.poToken;
    if (!token) throw new Error('poToken generation produced no token');
    const ttl = result.integrityTokenData?.estimatedTtlSecs ? result.integrityTokenData.estimatedTtlSecs * 1000 : POTOKEN_TTL_FALLCACHE;
    poTokenCache.set(videoId, { token, exp: Date.now() + ttl });
    return token;
}

async function generateCbPot(videoId) {
    const cached = poTokenCache.get(videoId);
    if (cached && cached.exp > Date.now()) return cached.token;
    try {
        if (!bgProgram || !bgGlobalName || !bgIntegrityTokenData || bgIntegrityExp <= Date.now()) {
            try {
                if (!bgProgram || !bgGlobalName) await initBotGuard();
                else await refreshBotGuardIntegrity();
            } catch (e) {
                return await generateCbPotFall(videoId);
            }
        }
        const webPoMinter = await BG.WebPoMinter.create(bgIntegrityTokenData, bgWebPoSignalOutput);
        const token = await webPoMinter.mintAsWebsafeString(videoId);
        if (!token) throw new Error('poToken generation produced no token');
        const ttl = bgIntegrityTokenData.estimatedTtlSecs ? bgIntegrityTokenData.estimatedTtlSecs * 1000 : POTOKEN_TTL_FALLCACHE;
        poTokenCache.set(videoId, { token, exp: Date.now() + ttl });
        return token;
    } catch (e) {
        console.error('Content-bound poToken generation failed, using anon fallback:', e?.message || e);
        return generateAnonPOT();
    }
}

module.exports = { initBotGuard, generateCbPot, generateAnonPOT };
