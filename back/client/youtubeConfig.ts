import config from "../config.json" with { type: "json" };
import dotenv from "dotenv";
import { getTable } from "@nationdex/edge/dist/core/utils.js";
const { default_userAgent_desktop, streamTypeYT, useClientYT, cacheTrackYT, skipOnCheckFormat, webClientYT } = config;
import ytClients from "./youtubeClients.ts";
const targetClient = useClientYT?.toUpperCase();
const useClient = ytClients?.[targetClient];
if (!useClient) {
	const available = Object.keys(ytClients).join(", ");
	throw new Error(`YouTube client "${targetClient}" does not exist. Available clients: ${available}`);
}

const forceAuthClients = ["WEB_PARENT", "WEB_CREATOR", "ANDROID_VR", "ANDROID_VR_DOWN"];
const forceLegacyClients = [];

if (["WEB_CREATOR", "WEB_PARENT"].includes(targetClient) && !process.env.YOUTUBE_COOKIES) {
	throw new Error(`Please put youtube cookies first before using this client. (${targetClient})`);
}

const isWebClient = useClient.targetDomain !== "youtubei.googleapis.com";
const usePoToken = isWebClient && webClientYT?.poToken === true;

// Forgescript Logger
import { Logger } from "@tryforge/forgescript";

import { Readable } from "stream";
import { randomBytes } from "crypto";
import fs from "fs";
import path from "path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const cacheDir = path.join(import.meta.dirname, "ytCacheTracks");
fs.mkdirSync(cacheDir, { recursive: true });

import { initBotGuard, refreshBotGuardIntegrity, generateCbPot, generateSessionPoToken, generateAnonPOT, setVisitorData } from "./youtubeBG.ts";
import { searchSoundcloudFallback } from "./soundcloudConfig.ts";

let vt;
let datasyncID = "";
let configInfoPromise = null;
let configInfoAttempted = false;
let signatureTimestamp = null;
let signatureTimestampPromise = null;
let webPlayer = null;
let authRequiredUntil = 0;

let poToken = generateAnonPOT();

const apiEndpoint = isWebClient ? "player" : "get_watch";
const apiFields = isWebClient ? "responseContext(visitorData),playabilityStatus,streamingData(serverAbrStreamingUrl,hlsManifestUrl,formats(url,signatureCipher),adaptiveFormats(itag,url,contentLength,signatureCipher,audioTrack(displayName,id,audioIsDefault))),videoDetails(videoId,isLiveContent,lengthSeconds,title,author),captions(playerCaptionsTracklistRenderer(audioTracks(audioTrackId),defaultAudioTrackIndex))" : "playerResponse(responseContext(visitorData),playabilityStatus,streamingData(serverAbrStreamingUrl,hlsManifestUrl,formats(url),adaptiveFormats(itag,url,contentLength,audioTrack(displayName,id,audioIsDefault))),videoDetails(videoId,isLiveContent,lengthSeconds,title,author),captions(playerCaptionsTracklistRenderer(audioTracks(audioTrackId),defaultAudioTrackIndex)))";
const buildQuery = apiEndpoint + "?prettyPrint=false&alt=json&fields=" + apiFields;

const APIuserAgent = useClient?.userAgent || default_userAgent_desktop;
let ytauth;
let ytcookies;
let tempytcookies;
const hostdomain = useClient.targetDomain;
const sortTargetOpus = [774, 251, 250, 249];
const sortTargetM4a = [141, 140, 139];
var templist = [];

function normalizeCookies(cookies) {
	if (!cookies) return "";
	const list = Array.isArray(cookies) ? cookies : cookies.split(",");
	return list
		.map((c) => c.trim().split(";")[0])
		.filter(Boolean)
		.join("; ");
}

async function readBodyText(res) {
	try {
		return await res.text();
	} catch {
		return "";
	}
}

async function parseJsonGuarded(res, label) {
	const text = await readBodyText(res);
	const snippet = (text || "").slice(0, 160).replace(/\s+/g, " ");
	if (res.status === 403 || res.status === 429) {
		throw new Error(`InnerTube ${label} failed: HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}: ${snippet || "<empty body>"}`);
	}
	try {
		return JSON.parse(text);
	} catch {
		throw new Error(`InnerTube ${label} failed: HTTP ${res.status}${res.statusText ? " " + res.statusText : ""}: ${snippet || "<empty body>"}`);
	}
}

async function fetchJsonGuarded(url, options, label) {
	return parseJsonGuarded(await fetch(url, options), label);
}

function refreshYtAuth() {
	dotenv.config({ override: true, quiet: true });
	if (process.env.YOUTUBE_AUTH) {
		try {
			ytauth = JSON.parse(process.env.YOUTUBE_AUTH);
		} catch {}
	}
	if (process.env.YOUTUBE_COOKIES) {
		ytcookies = process.env.YOUTUBE_COOKIES;
	}
	if (process.env.YOUTUBE_ANONCOOKIES) {
		tempytcookies = process.env.YOUTUBE_ANONCOOKIES;
	}
}
refreshYtAuth();

let actuallk: any = { ...useClient };
let ytcookiesapi;

function getCacheValue(name: string) {
	try {
		return getTable("initclientmusic").get(name);
	} catch {
		return undefined;
	}
}

function getYoutubeSession() {
	return {
		visitorData: getCacheValue("authmusic_youtube_visitor") || vt,
		cookies: getCacheValue("authmusic_youtube_tempcookies") || ytcookiesapi || tempytcookies || ytcookies,
	};
}

function setCachedVisitor(value: string) {
	try {
		getTable("initclientmusic").set("authmusic_youtube_visitor", value);
	} catch {}
}
delete actuallk.targetDomain;
delete actuallk.client_id;
delete actuallk.client_secret;
delete actuallk.embedded;
delete actuallk.embedUrl;
actuallk.hl = "en";
actuallk.gl = "US";
const isEmbeddedClient = useClient.embedded === true;
const embedUrl = useClient.embedUrl;

let visitorPromise = null;
const generateVisitor = async () => {
	if (visitorPromise) return visitorPromise;
	visitorPromise = (async () => {
		try {
			const url = "https://www.youtube.com/sw.js_data";
			const headers: Record<string, string> = {
				"User-Agent": default_userAgent_desktop,
			};
			if (ytcookies || tempytcookies) {
				headers.Cookie = ytcookies || tempytcookies;
			}
			const res = await fetch(url, { method: "GET", headers });
			ytcookiesapi = ytcookies || normalizeCookies(res.headers.getSetCookie());
			const raw = await res.text();
			const jsonPart = raw.split("\n")[2];
			const data = jsonPart ? JSON.parse(jsonPart) : null;
			vt = data?.[0]?.[2]?.[0]?.[0]?.[13] || "";
			actuallk.visitorData = vt;
			setVisitorData(vt);
			const rawSync = data?.[0]?.[3];
			datasyncID = typeof rawSync === "string" ? rawSync.split("||")[0] : "";
			Logger.info(`/ [YoutubeConfig] Fetched Visitor Data`);
		} catch (e) {
			console.error(e);
		} finally {
			visitorPromise = null;
		}
	})();
	return visitorPromise;
};

async function fetchWebConfigInfo() {
	if (!isWebClient || actuallk.configInfo?.coldConfigData || configInfoAttempted) return;
	if (configInfoPromise) return configInfoPromise;

	configInfoPromise = fetch(`https://${hostdomain}/youtubei/v1/config?prettyPrint=false&alt=json`, {
		method: "POST",
		mode: "same-origin",
		headers: {
			"Accept-Language": "en",
			"Content-Type": "application/json",
			Origin: `https://${hostdomain}`,
			"X-Origin": `https://${hostdomain}`,
			"X-Goog-Visitor-Id": vt || "",
			"X-Youtube-Client-Name": String(useClient.clientName),
			"X-Youtube-Client-Version": useClient.clientVersion,
			"User-Agent": APIuserAgent,
			...(ytcookies || tempytcookies ? { Cookie: ytcookies || tempytcookies } : {}),
		},
		body: JSON.stringify({
			context: { client: { ...actuallk } },
			serviceIntegrityDimensions: { poToken },
		}),
	})
		.then((r) => parseJsonGuarded(r, "config"))
		.then((res) => {
			const gcg = res?.responseContext?.globalConfigGroup;
			const configInfo = {
				coldConfigData: gcg?.rawColdConfigGroup?.configData,
				coldHashData: gcg?.coldHashData,
				hotHashData: gcg?.hotHashData,
			};
			if (configInfo.coldConfigData && configInfo.coldHashData && configInfo.hotHashData) {
				actuallk.configInfo = configInfo;
			} else {
				configInfoAttempted = true;
			}
		})
		.catch((e) => {
			Logger.info(`/ [YoutubeConfig] Client config unavailable (${e?.message || e}), continuing without it`);
			configInfoAttempted = true;
		})
		.finally(() => {
			configInfoPromise = null;
			Logger.info(`/ [YoutubeConfig] Fetched Client Config`);
		});

	return configInfoPromise;
}

function extractYtcfg(html) {
	const m = html.match(/ytcfg\.set\(\{([\s\S]*?)\}\)\s*;/);
	if (!m) return null;
	try {
		return JSON.parse("{" + m[1] + "}");
	} catch {
		return null;
	}
}

let embeddedContextCache = null;
let embeddedContextPromise = null;
let embeddedRetried = false;

async function fetchEmbeddedContext(videoId) {
	if (!isEmbeddedClient) return null;
	if (embeddedContextCache) return embeddedContextCache;
	if (embeddedContextPromise) return embeddedContextPromise;

	embeddedContextPromise = (async () => {
		try {
			const url = `https://${hostdomain}/embed/${videoId}?html5=1`;
			const headers: Record<string, string> = {
				"User-Agent": APIuserAgent,
				Referer: embedUrl,
			};
			if (ytcookies || tempytcookies) headers.Cookie = ytcookies || tempytcookies;
			const res = await fetch(url, { method: "GET", headers });
			const html = await res.text();
			const ytcfg = extractYtcfg(html);
			const thirdParty = ytcfg?.INNERTUBE_CONTEXT?.thirdParty || null;
			const encryptedHostFlags = ytcfg?.WEB_PLAYER_CONTEXT_CONFIGS?.WEB_PLAYER_CONTEXT_CONFIG_ID_EMBEDDED_PLAYER?.encryptedHostFlags || null;
			embeddedContextCache = { thirdParty, encryptedHostFlags };
			Logger.info(`/ [YoutubeConfig] Fetched Web Embedded Config${encryptedHostFlags ? "" : " (encryptedHostFlags absent)"}`);
		} catch (e) {
			console.error(e);
			embeddedContextCache = null;
		} finally {
			embeddedContextPromise = null;
		}
	})();

	return embeddedContextPromise;
}

async function fetchSignatureTimestamp(force = false) {
	if (!force && !isWebClient) return;
	if (signatureTimestamp || (webPlayer && !force)) return;
	if (signatureTimestampPromise) return signatureTimestampPromise;

	signatureTimestampPromise = Promise.resolve()
		.then(async () => {
			const { Player, Platform } = require("youtubei.js");
			Platform.shim.eval = (data, env) => {
				return new Function(...Object.keys(env), data.output)(...Object.values(env));
			};
			const player = await Player.create();
			webPlayer = player;
			signatureTimestamp = player?.signature_timestamp;
		})
		.finally(() => {
			signatureTimestampPromise = null;
			Logger.info(`/ [YoutubeConfig] Fetched Youtubei Player`);
		});

	return signatureTimestampPromise;
}

async function decipherYoutubeUrl(url) {
	if (!webPlayer || !url) return url;
	let processedUrl = url;

	const nPathMatch = processedUrl.match(/\/n\/([^\/]+)/);
	if (nPathMatch) {
		const rawN = nPathMatch[1];
		try {
			const dummyUrl = `https://www.youtube.com/watch?n=${encodeURIComponent(rawN)}`;
			const decipheredDummyUrl = await webPlayer.decipher(null, dummyUrl);
			const decipheredN = new URL(decipheredDummyUrl).searchParams.get("n");
			if (decipheredN) {
				processedUrl = processedUrl.replace(`/n/${rawN}/`, `/n/${decipheredN}/`);
			}
		} catch (e) {
			console.error("Error deciphering path-based n-token:", e);
		}
	}

	try {
		// Passing the value as the 2nd arg (signature_cipher) makes youtubei.js
		// also append the deciphered `sig`/signature, not just the `n` token.
		processedUrl = await webPlayer.decipher(null, processedUrl);
	} catch (e) {
		console.error("Error deciphering query-based parameters:", e);
	}

	return processedUrl;
}

function createChunkedStream(url, totalSize, videoId, ext) {
	let start = 0;
	const chunkSize = 1024 * 1024 * 10;
	const concurrency = 5;
	let isEnded = false;
	let abortControllers = [];
	let isReading = false;
	let isSuccess = false;

	const tempFilePath = path.join(cacheDir, `${videoId}.${Date.now()}.${randomBytes(4).toString("hex")}.temp`);
	const finalFilePath = path.join(cacheDir, `${videoId}.${ext}`);

	let writeStream = null;
	let writeErrorOccurred = false;

	if (cacheTrackYT) {
		writeStream = fs.createWriteStream(tempFilePath);
		writeStream.on("error", (err) => {
			console.error("Cache Write Error:", err);
			writeErrorOccurred = true;
		});
	}

	const maxRetries = 3;

	async function fetchChunk(startByte) {
		let end = startByte + chunkSize - 1;
		let chunkIsLast = false;
		if (end >= totalSize) {
			chunkIsLast = true;
			end = totalSize - 1;
		}

		const chunkUrl = `${url}&range=${startByte}-${end}`;
		let lastError = null;

		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			const ac = new AbortController();
			abortControllers.push(ac);

			try {
				const response = await fetch(chunkUrl, {
					headers: { "Content-Length": "0", "User-Agent": APIuserAgent },
					method: "POST",
					signal: ac.signal,
				});

				if (!response.ok) {
					throw new Error(`HTTP ${response.status} for range ${startByte}-${end}`);
				}

				if (!response.body) {
					throw new Error(`No response body for range ${startByte}-${end}`);
				}

				const chunks = [];
				const reader = response.body.getReader();
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					chunks.push(Buffer.from(value));
				}

				const totalLength = chunks.reduce((n, b) => n + b.length, 0);
				const merged = Buffer.allocUnsafe(totalLength);
				let offset = 0;
				for (const buf of chunks) {
					buf.copy(merged, offset);
					offset += buf.length;
				}

				return { buffer: merged, isLast: chunkIsLast, end };
			} catch (err) {
				lastError = err;
				if (err?.name === "AbortError") throw err;
				if (attempt < maxRetries) {
					await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
				}
			}
		}

		throw lastError;
	}

	return new Readable({
		async read() {
			if (isEnded || isReading) return;
			isReading = true;

			try {
				const batchStart = start;
				abortControllers = [];
				const tasks = [];

				for (let i = 0; i < concurrency; i++) {
					const chunkStart = batchStart + i * chunkSize;
					if (chunkStart >= totalSize) break;
					tasks.push(fetchChunk(chunkStart));
				}

				if (tasks.length === 0) {
					isEnded = true;
					this.push(null);
					isReading = false;
					return;
				}

				const results = await Promise.allSettled(tasks);

				for (const result of results) {
					if (result.status === "rejected") {
						const err = result.reason;
						if (writeStream && !isSuccess) {
							writeStream.end(() => {
								fs.unlink(tempFilePath, () => {});
							});
						}
						if (err?.name === "AbortError") {
							this.destroy();
						} else {
							this.destroy(err);
						}
						return;
					}

					const { buffer, isLast, end } = result.value;

					this.push(buffer);
					if (writeStream && !writeErrorOccurred) {
						writeStream.write(buffer);
					}

					if (isLast) {
						isEnded = true;
						isSuccess = true;
						if (writeStream) {
							writeStream.end(() => {
								if (!writeErrorOccurred) {
									fs.rename(tempFilePath, finalFilePath, (err) => {
										if (err) console.error("Cache rename failed:", err);
									});
								} else {
									fs.unlink(tempFilePath, () => {});
								}
							});
						}
						this.push(null);
						return;
					}

					start = end + 1;
				}
			} catch (err) {
				if (writeStream && !isSuccess) {
					writeStream.end(() => {
						fs.unlink(tempFilePath, () => {});
					});
				}
				this.destroy(err);
			} finally {
				isReading = false;
			}
		},
		destroy(err, callback) {
			for (const ac of abortControllers) {
				ac.abort();
			}
			if (writeStream && !isSuccess) {
				writeStream.end(() => {
					fs.unlink(tempFilePath, () => {});
				});
			}
			if (callback) callback(err);
		},
	});
}

function createLiveChunkedStream(baseUrl) {
	let rn = 0;
	let isEnded = false;
	let isReading = false;
	let noContentRetries = 0;
	const maxNoContentRetries = 10;
	let abortControllers = [];

	async function fetchLiveChunk() {
		const chunkUrl = baseUrl.includes("&rn=") ? baseUrl.replace(/&rn=\d+/, `&rn=${rn}`) : `${baseUrl}&rn=${rn}`;

		const ac = new AbortController();
		abortControllers.push(ac);

		const response = await fetch(chunkUrl, {
			headers: { "User-Agent": APIuserAgent },
			signal: ac.signal,
		});
		return response;
	}

	return new Readable({
		highWaterMark: 0,
		async read() {
			if (isEnded || isReading) return;
			isReading = true;

			try {
				abortControllers = [];
				const fetchStart = Date.now();
				const response = await fetchLiveChunk();
				const fetchElapsed = Date.now() - fetchStart;

				if (response.status === 404 || response.status === 410) {
					isEnded = true;
					this.push(null);
					return;
				}

				if (response.status === 204) {
					noContentRetries++;
					if (noContentRetries >= maxNoContentRetries) {
						isEnded = true;
						this.push(null);
						return;
					}
					await new Promise((r) => setTimeout(r, 1000));
					return;
				}

				if (!response.ok) {
					throw new Error(`Live stream chunk fetch failed: HTTP ${response.status}`);
				}

				const arrayBuffer = await response.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);

				if (buffer.length === 0) {
					noContentRetries++;
					if (noContentRetries >= maxNoContentRetries) {
						isEnded = true;
						this.push(null);
						return;
					}
					await new Promise((r) => setTimeout(r, 1000));
					return;
				}

				noContentRetries = 0;
				rn++;
				await new Promise((r) => setTimeout(r, 200));
				this.push(buffer);
			} catch (err) {
				if (err?.name === "AbortError") {
					this.destroy();
				} else {
					console.error("Live chunk fetch error:", err);
					this.destroy(err);
				}
			} finally {
				isReading = false;
			}
		},
		destroy(err, callback) {
			isEnded = true;
			for (const ac of abortControllers) ac.abort();
			if (callback) callback(err);
		},
	});
}

function isHlsUrl(url) {
	return typeof url === "string" && (url.includes("googlevideo.com/api/manifest/") || url.includes(".m3u8"));
}

function getFormatUrl(format) {
	return format?.url || format?.signatureCipher || null;
}

function withStreamParams(url, params) {
	try {
		const u = new URL(url);
		for (const [k, v] of Object.entries(params)) {
			if (v !== undefined && v !== null) u.searchParams.set(k, String(v));
		}
		return u.toString();
	} catch {
		return url;
	}
}

function filterPlayerObject(YTPlayerResponse) {
	return (Array.isArray(YTPlayerResponse) ? YTPlayerResponse[0] : YTPlayerResponse)?.playerResponse || YTPlayerResponse;
}

generateVisitor().then(() =>
	Promise.all([
		Logger.info(`/ [YoutubeConfig] Client ${targetClient} | Web=${isWebClient} | poToken Solving=${usePoToken}`),
		fetchWebConfigInfo(),
		fetchSignatureTimestamp(),
		...(usePoToken
			? [
					initBotGuard()
						.then(() => generateSessionPoToken(actuallk.visitorData))
						.then(() => Logger.info(`/ [YoutubeConfig] Generated Session Token`)),
				]
			: []),
	]),
);

const warmupEmbeddedClient = async () => {
	if (!isEmbeddedClient) return;
	try {
		if (!vt) await generateVisitor();
		await Promise.all([
			fetchEmbeddedContext("dQw4w9WgXcQ"), // You know the rules
			fetchSignatureTimestamp(),
			...(usePoToken ? [initBotGuard().then(() => generateSessionPoToken(actuallk.visitorData))] : []),
		]);
	} catch (e) {
		console.error(`[YoutubeConfig] Embedded warmup failed:`, e?.message || e);
	}
};
warmupEmbeddedClient();

async function createYoutubeStreamFromPlayer(a: any, lstracks: string, trackInfo?: any) {
	const videoId = lstracks.includes("watch?v=") ? lstracks.split("watch?v=")[1].split("&")[0] : lstracks;
	let finalurl;
	let changeLength = false;
	let streamingLength = null;
	let durationLength = null;
	let fr = null;
	const cpn = randomBytes(12).toString("base64url");

	let forceLegacy = false;
	let actualfinalurl;
	let fsFmt: any = {};
	let frso: any = {};
	const isLive = !!a?.videoDetails?.isLiveContent;

	const startAttempt = forceLegacyClients.includes(targetClient) ? 1 : 0;

	for (let attempt = startAttempt; attempt < 2; attempt++) {
		forceLegacy = attempt === 1;
		finalurl = "";
		changeLength = false;
		streamingLength = null;
		durationLength = null;
		fr = null;

		if (isLive && a?.streamingData?.hlsManifestUrl) {
			finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
		} else if (streamTypeYT === 2 && a?.streamingData?.hlsManifestUrl) {
			finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
		} else {
			fsFmt = a.streamingData?.formats?.find(getFormatUrl);
			const capRenderer = a?.captions?.playerCaptionsTracklistRenderer;
			const capAudioTracks = Array.isArray(capRenderer?.audioTracks) ? capRenderer.audioTracks : [];
			const capDefaultIdx = capRenderer?.defaultAudioTrackIndex;
			const originalAudioTrackId = (typeof capDefaultIdx === "number" && capAudioTracks[capDefaultIdx]?.audioTrackId) || null;
			const audioCands = (a.streamingData?.adaptiveFormats || []).filter((c) => [...sortTargetOpus, ...sortTargetM4a].includes(c.itag) && getFormatUrl(c)).sort((x, y) => y.itag - x.itag);
			frso = (originalAudioTrackId && audioCands.find((c) => c?.audioTrack?.id === originalAudioTrackId)) || audioCands[0] || null;
			if (frso && !forceLegacy) {
				const rawFormatUrl = getFormatUrl(frso);
				const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
				finalurl = withStreamParams(decipheredUrl, {
					ratebypass: "true",
					rn: "0",
					alr: "no",
					cver: useClient.clientVersion,
					cpn,
				});
				changeLength = true;
				durationLength = parseInt(a.videoDetails?.lengthSeconds || 0);
				streamingLength = String(frso.contentLength);
			} else {
				const rawFormatUrl = getFormatUrl(fsFmt);
				const decipheredUrl = await decipherYoutubeUrl(rawFormatUrl);
				finalurl = withStreamParams(decipheredUrl, {
					rn: "0",
					alr: "no",
					cver: useClient.clientVersion,
					cpn,
				});
			}
		}

		if (!finalurl && a?.streamingData?.hlsManifestUrl) {
			finalurl = await decipherYoutubeUrl(a.streamingData.hlsManifestUrl);
		}

		if (!finalurl) {
			finalurl = (await searchSoundcloudFallback(trackInfo?.title, trackInfo?.author)) || "";
		}

		if (!finalurl && a?.streamingData?.serverAbrStreamingUrl) {
			throw new Error(`This content unavailable due youtube enforce SABR-only`);
		}

		if (!finalurl) {
			throw new Error(`No playable YouTube and Soundcloud format URL for ${targetClient}`);
		}

		if (isHlsUrl(finalurl)) {
			return finalurl;
		}

		let contentPoToken;
		if (usePoToken) {
			const cbPot = await generateCbPot(videoId, actuallk.visitorData);
			contentPoToken = cbPot.isReal ? encodeURIComponent(cbPot.token) : null;
		}

		let filterlocation;
		let secfinalurl;
		let finalWithPot;
		const maxHeadRetries = 3;
		const headCheck = (url) =>
			fetch(url, {
				method: "HEAD",
				headers: { Range: "bytes=0-", "User-Agent": APIuserAgent },
			});

		if (!skipOnCheckFormat) {
			for (let headAttempt = 0; headAttempt <= maxHeadRetries; headAttempt++) {
				filterlocation = await headCheck(finalurl + (contentPoToken ? "&pot=" + contentPoToken : ""));
				secfinalurl = filterlocation.url;
				finalWithPot = contentPoToken && !secfinalurl.includes("pot=") ? secfinalurl + "&pot=" + contentPoToken : secfinalurl;

				if ((filterlocation.status !== 403 && filterlocation.status !== 429) || !changeLength || skipOnCheckFormat) {
					break;
				}

				if (headAttempt < maxHeadRetries) {
					await new Promise((r) => setTimeout(r, 1000 * (headAttempt + 1)));
				}
			}
		} else {
			filterlocation = { status: 200, url: finalurl };
			secfinalurl = finalurl;
			finalWithPot = finalurl + (contentPoToken ? "&pot=" + contentPoToken : "");
		}

		if ((filterlocation.status === 403 || filterlocation.status === 429) && changeLength) {
			if (isWebClient && !forceLegacy) {
				continue;
			}
			const bytesPerSecond = parseInt(frso.contentLength) / durationLength;
			const previewLength = String(Math.floor(bytesPerSecond * 60));
			actualfinalurl = finalWithPot;
			streamingLength = previewLength;
			changeLength = true;
		} else {
			actualfinalurl = finalWithPot;
		}

		break;
	}

	if (isLive) {
		return createLiveChunkedStream(actualfinalurl);
	}

	const nowRef = Date.now();
	for (let ti = templist.length - 1; ti >= 0; ti--) {
		if (templist[ti].id === lstracks || templist[ti].ref <= nowRef) templist.splice(ti, 1);
	}
	if (templist.length >= 500) templist.splice(0, templist.length - 499);
	templist.push({
		id: lstracks,
		url: actualfinalurl,
		ref: nowRef + 3600000,
		allowLength: changeLength,
		contentLength: streamingLength,
	});

	if (changeLength && streamingLength && parseInt(streamingLength) > 0 && !isHlsUrl(actualfinalurl)) {
		const ext = sortTargetOpus.includes((frso && !forceLegacy ? frso : fsFmt)?.itag) ? "webm" : "m4a";
		return createChunkedStream(actualfinalurl, parseInt(streamingLength), videoId, ext);
	}

	return actualfinalurl;
}

export async function fallbackYTStream(lstracks, trackInfo?: any) {
	refreshYtAuth();
	embeddedRetried = false;

	const videoId = lstracks.includes("watch?v=") ? lstracks.split("watch?v=")[1].split("&")[0] : lstracks;
	poToken = generateAnonPOT();
	const cacheFilePathWebm = path.join(cacheDir, `${videoId}.webm`);
	const cacheFilePathM4a = path.join(cacheDir, `${videoId}.m4a`);
	if (cacheTrackYT) {
		if (fs.existsSync(cacheFilePathWebm)) {
			return fs.createReadStream(cacheFilePathWebm);
		}
		if (fs.existsSync(cacheFilePathM4a)) {
			return fs.createReadStream(cacheFilePathM4a);
		}
	}

	const checkindex = templist.findIndex((l) => l.id === lstracks);
	const checklist = checkindex === -1 ? undefined : templist[checkindex];
	if (checklist) {
		if (Date.now() <= checklist.ref) {
			if (cacheTrackYT) {
				if (fs.existsSync(cacheFilePathWebm)) {
					return fs.createReadStream(cacheFilePathWebm);
				}
				if (fs.existsSync(cacheFilePathM4a)) {
					return fs.createReadStream(cacheFilePathM4a);
				}
			}
			if (isHlsUrl(checklist.url)) return checklist.url;
			const isAllowLength = checklist.allowLength;
			if (isAllowLength && checklist.contentLength) {
				const ext = checklist.url.includes("mime=audio/webm") ? "webm" : "m4a";
				return createChunkedStream(checklist.url, parseInt(checklist.contentLength), videoId, ext);
			}
			return checklist.url;
		} else templist.splice(checkindex, 1);
	}
	try {
		const player = await fetchYoutubePlayerResponse(videoId);
		if (!player) throw new Error("InnerTube Error: player response unavailable");
		return await createYoutubeStreamFromPlayer(player, lstracks, trackInfo);
	} catch (e) {
		Logger.error(`/ [YoutubeConfig] ${e?.message || e}`);
		throw e;
	}
}

async function fetchYoutubeWithRetry(run: () => Promise<Response>, retries = 3) {
	let response: Response;
	for (let attempt = 0; attempt <= retries; attempt++) {
		response = await run();
		if (response.status !== 403 && response.status !== 429) return response;
		if (attempt === retries) return response;
		await generateVisitor();
		await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
	}
	return response!;
}

function parsePlaylistItem(item: any) {
	const lockup = item?.lockupViewModel;
	if (lockup) {
		const type = lockup.contentType;
		if (type !== "LOCKUP_CONTENT_TYPE_VIDEO" && type !== "LOCKUP_CONTENT_TYPE_MUSIC") return null;
		const id = lockup.contentId;
		if (!id) return null;
		const metadata = lockup.metadata?.lockupMetadataViewModel;
		const rawTitle = metadata?.title?.content || metadata?.title?.simpleText || "";
		if (!rawTitle || rawTitle === id || /^\[?(private|deleted) video\]?$/i.test(rawTitle)) return null;
		const title = rawTitle;
		const author = metadata?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || "";
		const overlays = lockup.contentImage?.thumbnailViewModel?.overlays || [];
		let duration = "";
		for (const overlay of overlays) {
			const badges = overlay?.thumbnailBottomOverlayViewModel?.badges || [];
			for (const badge of badges) {
				const text = badge?.thumbnailBadgeViewModel?.text;
				if (text && (text === "LIVE" || /\d+:\d+/.test(text))) {
					duration = text;
					break;
				}
			}
			if (duration) break;
		}
		const thumbnail = lockup.contentImage?.thumbnailViewModel?.image?.sources?.at(-1)?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
		return {
			id,
			title,
			author,
			duration,
			thumbnail,
			live: duration === "LIVE",
		};
	}

	const video = item?.playlistVideoRenderer || item?.videoRenderer;
	if (video?.videoId) {
		const rawTitle = video.title?.runs?.map((run: any) => run.text).join("") || video.title?.simpleText || "";
		if (!rawTitle || rawTitle === video.videoId || /^\[?(private|deleted) video\]?$/i.test(rawTitle)) return null;
		const title = rawTitle;
		const author = video.shortBylineText?.runs?.[0]?.text || video.ownerText?.runs?.[0]?.text || "";
		const duration = video.lengthText?.simpleText || video.lengthText?.runs?.[0]?.text || "";
		const thumbnail = video.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`;
		return {
			id: video.videoId,
			title,
			author,
			duration,
			thumbnail,
			live: !duration,
		};
	}

	return null;
}

function getContinuationToken(items: any[]) {
	for (const item of items) {
		const token = item?.continuationItemViewModel?.continuationCommand?.innertubeCommand?.continuationCommand?.token || item?.continuationItemRenderer?.continuationEndpoint?.continuationCommand?.token;
		if (token) return token;
	}
	return null;
}

export async function fetchYoutubePlaylist(playlistId: string) {
	if (!playlistId) return null;
	try {
		const initial = getYoutubeSession();
		if (!initial.visitorData || !initial.cookies) await generateVisitor();
		const getCookies = () => getYoutubeSession().cookies;
		const buildContext = () => ({
			client: {
				clientName: 2,
				clientVersion: "2.20261231",
				visitorData: getYoutubeSession().visitorData,
				hl: "en",
				gl: "US",
			},
		});
		const request = async (body: any) => {
			const res = await fetchYoutubeWithRetry(() =>
				fetch("https://m.youtube.com/youtubei/v1/browse?prettyPrint=false", {
					method: "POST",
					headers: {
						"Accept-Language": "en",
						"Content-Type": "application/json",
						"User-Agent": APIuserAgent,
						...(getCookies() ? { Cookie: getCookies() } : {}),
					},
					body: JSON.stringify(body),
				}),
			);
			return res.json().catch(() => null);
		};

		const first = await request({
			context: buildContext(),
			browseId: `VL${playlistId}`,
		});
		if (!first) return null;

		const newVt = first.responseContext?.visitorData;
		if (newVt) {
			vt = newVt;
			actuallk.visitorData = newVt;
			setVisitorData(newVt);
			setCachedVisitor(newVt);
		}

		const header = first.header?.pageHeaderRenderer;
		const title = header?.pageTitle || header?.content?.pageHeaderViewModel?.title?.dynamicTextViewModel?.text?.content || first.microformat?.microformatDataRenderer?.title?.replace(/ - YouTube$/, "") || playlistId;
		const author = header?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.avatarStack?.avatarStackViewModel?.text?.content || header?.content?.pageHeaderViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || "";
		const thumbnail = first.microformat?.microformatDataRenderer?.thumbnail?.thumbnails?.at(-1)?.url || "";

		let items = first?.contents?.singleColumnBrowseResultsRenderer?.tabs?.[0]?.tabRenderer?.content?.sectionListRenderer?.contents?.flatMap((section: any) => section?.itemSectionRenderer?.contents || []) || [];
		const tracks: {
			id: string;
			title: string;
			author: string;
			duration: string;
			thumbnail: string;
			live: boolean;
		}[] = [];
		const seen = new Set<string>();
		let token = getContinuationToken(items);

		for (let page = 0; page < 100; page++) {
			for (const item of items) {
				const track = parsePlaylistItem(item);
				if (track && !seen.has(track.id)) {
					seen.add(track.id);
					tracks.push(track);
				}
			}
			if (!token) break;
			await new Promise((resolve) => setTimeout(resolve, 200));
			const next = await request({
				context: buildContext(),
				continuation: token,
			});
			if (!next) break;
			items = next?.onResponseReceivedActions?.flatMap((action: any) => action?.appendContinuationItemsAction?.continuationItems || []) || [];
			token = getContinuationToken(items);
		}

		return { title, author, thumbnail, tracks };
	} catch {
		return null;
	}
}

export async function searchYoutube(query: string, limit = 10) {
	if (!query) return [];
	try {
		const initial = getYoutubeSession();
		if (!initial.visitorData || !initial.cookies) await generateVisitor();
		const getCookies = () => getYoutubeSession().cookies;
		const res = await fetchYoutubeWithRetry(() =>
			fetch("https://m.youtube.com/youtubei/v1/search?prettyPrint=false", {
				method: "POST",
				headers: {
					"Accept-Language": "en-US",
					"Content-Type": "application/json",
					"User-Agent": APIuserAgent,
					...(getCookies() ? { Cookie: getCookies() } : {}),
				},
				body: JSON.stringify({
					context: {
						client: {
							clientName: 2,
							clientVersion: "2.20261231",
							visitorData: getYoutubeSession().visitorData,
							hl: "en",
							gl: "US",
						},
					},
					query,
				}),
			}),
		);
		const json = await res.json().catch(() => null);

		const newVt = json?.responseContext?.visitorData;
		if (newVt) {
			vt = newVt;
			actuallk.visitorData = newVt;
			setVisitorData(newVt);
			setCachedVisitor(newVt);
		}

		const sections = json?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents || json?.contents?.sectionListRenderer?.contents || [];
		const results: {
			id: string;
			title: string;
			author: string;
			duration: string;
			thumbnail: string;
			live: boolean;
		}[] = [];
		for (const section of sections) {
			for (const item of section?.itemSectionRenderer?.contents || []) {
				const video = item?.videoWithContextRenderer || item?.videoRenderer;
				if (!video?.videoId) continue;
				const duration = video.lengthText?.runs?.[0]?.text || video.lengthText?.simpleText || "";
				results.push({
					id: video.videoId,
					title: (video.headline?.runs || video.title?.runs || []).map((r: any) => r.text).join("") || video.title?.simpleText || video.videoId,
					author: video.shortBylineText?.runs?.[0]?.text || video.ownerText?.runs?.[0]?.text || "",
					duration,
					thumbnail: video.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${video.videoId}/hqdefault.jpg`,
					live: !duration,
				});
				if (results.length >= limit) return results;
			}
		}
		return results;
	} catch {
		return [];
	}
}

export async function fetchYoutubePlayerResponse(videoId: string) {
	refreshYtAuth();
	const session = getYoutubeSession();
	if (session.visitorData) vt = session.visitorData;
	if (!vt) await generateVisitor();
	actuallk.visitorData = vt;
	if (isWebClient && !signatureTimestamp) await fetchSignatureTimestamp();
	const embeddedContext = isEmbeddedClient ? await fetchEmbeddedContext(videoId) : null;
	const cpn = randomBytes(12).toString("base64url");
	const anonPoToken = generateAnonPOT();
	const sessionCookies = session.cookies || tempytcookies;

	const isVRnAuth = ytauth?.token && (targetClient === "ANDROID_VR" || targetClient === "ANDROID_VR_DOWN");
	const hasAuth = isVRnAuth || !!ytcookies;
	const mustUseAuth = forceAuthClients.includes(targetClient);
	const clientSupportsAuth = mustUseAuth || isWebClient || isVRnAuth;
	const authModes = mustUseAuth ? [true] : !hasAuth || !clientSupportsAuth ? [false] : [false, true];
	const embeddedThirdParty = embeddedContext?.thirdParty ? { ...embeddedContext.thirdParty, embedUrl } : { embedUrl };

	const authHash = () => {
		const sapisid = ytcookies?.match(/(?:^|;\s*)SAPISID=([^;]*)/)?.[1];
		const secure1psid = ytcookies?.match(/(?:^|;\s*)__Secure-1PAPISID=([^;]*)/)?.[1];
		const secure3psid = ytcookies?.match(/(?:^|;\s*)__Secure-3PAPISID=([^;]*)/)?.[1];
		const t = Math.floor(Date.now() / 1000).toString();
		const dsi = datasyncID && datasyncID !== "null" && datasyncID.trim() !== "" ? datasyncID + " " : "";
		return (
			"SAPISIDHASH " +
			t +
			"_" +
			require("crypto")
				.createHash("sha1")
				.update(dsi + t + " " + sapisid + " " + `https://${hostdomain}`)
				.digest("hex") +
			"_u" +
			" SAPISID1PHASH " +
			t +
			"_" +
			require("crypto")
				.createHash("sha1")
				.update(dsi + t + " " + secure1psid + " " + `https://${hostdomain}`)
				.digest("hex") +
			"_u" +
			" SAPISID3PHASH " +
			t +
			"_" +
			require("crypto")
				.createHash("sha1")
				.update(dsi + t + " " + secure3psid + " " + `https://${hostdomain}`)
				.digest("hex") +
			"_u"
		);
	};

	const buildHeaders = (useAuth: boolean) => {
		const base = {
			"Accept-Language": "en",
			"Content-Type": "application/json",
			"X-Goog-Visitor-Id": vt,
			Origin: `https://${hostdomain}`,
			"X-Origin": `https://${hostdomain}`,
			"X-Youtube-Client-Name": useClient.clientName,
			"X-Youtube-Client-Version": useClient.clientVersion,
			"User-Agent": APIuserAgent,
		};
		if (useAuth && isVRnAuth)
			return {
				...base,
				Authorization: "Bearer " + ytauth.token,
				Cookie: sessionCookies,
			};
		if (useAuth && ytcookies && isWebClient)
			return {
				...base,
				Authorization: authHash(),
				Cookie: ytcookies,
				"X-Youtube-Bootstrap-Logged-In": true,
				"Alt-Used": hostdomain,
				"X-Goog-AuthUser": 0,
			};
		return { ...base, Cookie: sessionCookies };
	};

	const buildRoute = (poTokenValue: string, isRealSessionPo: boolean) => {
		const playbackContext = signatureTimestamp
			? {
					playbackContext: {
						contentPlaybackContext: {
							vis: 0,
							splay: false,
							lactMilliseconds: "-1",
							signatureTimestamp,
							...(embeddedContext?.encryptedHostFlags ? { encryptedHostFlags: embeddedContext.encryptedHostFlags } : {}),
						},
					},
				}
			: {};
		const webIntegrity = isWebClient
			? usePoToken && isRealSessionPo
				? {
						serviceIntegrityDimensions: { poToken: poTokenValue },
						attestationRequest: { omitBotguardData: false },
					}
				: {}
			: {};
		return isWebClient
			? {
					videoId,
					contentCheckOk: true,
					racyCheckOk: true,
					cpn,
					context: {
						client: {
							...actuallk,
							...(isEmbeddedClient
								? {
										originalUrl: `https://${hostdomain}/embed/${videoId}?html5=1`,
									}
								: {}),
						},
						...(isEmbeddedClient ? { thirdParty: embeddedThirdParty } : {}),
					},
					...playbackContext,
					...webIntegrity,
				}
			: {
					playerRequest: { videoId, contentCheckOk: true, racyCheckOk: true },
					disablePlayerResponse: false,
					cpn,
					context: { client: { ...actuallk } },
					serviceIntegrityDimensions: { poToken: poTokenValue },
					attestationRequest: { omitBotguardData: false },
				};
	};

	let usedAuth = false;
	for (const authMode of authModes) {
		for (let attempt = 0; attempt < 4; attempt++) {
			let sessionPoToken = anonPoToken;
			let isRealSessionPo = false;
			if (usePoToken) {
				let data = await generateSessionPoToken(actuallk.visitorData);
				if (data.exp <= Date.now()) data = await generateSessionPoToken(actuallk.visitorData, true);
				sessionPoToken = data.poToken;
				isRealSessionPo = data.isReal;
			}

			let shouldUseAuth = authMode || Date.now() < authRequiredUntil;
			let response;
			try {
				response = filterPlayerObject(
					await fetchJsonGuarded(
						`https://${hostdomain}/youtubei/v1/${buildQuery}`,
						{
							method: "POST",
							body: JSON.stringify(buildRoute(sessionPoToken, isRealSessionPo)),
							headers: buildHeaders(shouldUseAuth),
						},
						"player-metadata",
					),
				);
			} catch {
				await generateVisitor();
				continue;
			}

			const newVt = response?.responseContext?.visitorData;
			if (newVt) {
				vt = newVt;
				actuallk.visitorData = newVt;
				setVisitorData(newVt);
				setCachedVisitor(newVt);
			}

			if (!usedAuth && !shouldUseAuth && hasAuth && response?.playabilityStatus?.status === "LOGIN_REQUIRED") {
				authRequiredUntil = Date.now() + 3600000;
				usedAuth = true;
				shouldUseAuth = true;
				try {
					response = filterPlayerObject(
						await fetchJsonGuarded(
							`https://${hostdomain}/youtubei/v1/${buildQuery}`,
							{
								method: "POST",
								body: JSON.stringify(buildRoute(sessionPoToken, isRealSessionPo)),
								headers: buildHeaders(true),
							},
							"player-metadata-auth",
						),
					);
				} catch {}
			}

			if (response?.videoDetails?.videoId && (response.videoDetails.title || response.videoDetails.author)) return response;
			if (response?.streamingData) return response;
			if (response?.playabilityStatus?.status === "UNPLAYABLE") return response;
			await generateVisitor();
		}
	}

	return null;
}

export async function resolveYoutubeMetadata(videoId: string) {
	if (!videoId) return null;

	const playerResponse = await fetchYoutubePlayerResponse(videoId).catch(() => null);
	const details = playerResponse?.videoDetails;
	const createStream = playerResponse?.streamingData
		? (track: any) => createYoutubeStreamFromPlayer(playerResponse, `https://www.youtube.com/watch?v=${videoId}`, track)
		: undefined;

	if (details?.videoId && (details.title || details.author)) {
		return {
			title: details.title,
			author: details.author,
			lengthSeconds: details.isLiveContent ? 0 : Number(details.lengthSeconds) || 0,
			createStream,
		};
	}

	if (createStream) return { title: "", author: "", lengthSeconds: 0, createStream };
	return null;
}
