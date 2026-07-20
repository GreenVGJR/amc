const list_clients = {
    // [ experimental client ]
    // doesn't support stream kids contents
    "VISIONOS": {
        "targetDomain": "youtubei.googleapis.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 101,
        "clientVersion": "1.03",
        "deviceMake": "Apple",
        "deviceModel": "RealityDevice14,1",
        "osName": "visionOS",
        "osVersion": "1.3.21O771"
    },
    // some countries may not able to stream after 1 minute
    // might enforce SABR-only
    "ANDROID": {
        "targetDomain": "youtubei.googleapis.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 3,
        "clientVersion": "21.26.360",
        "androidSdkVersion": 36,
        "userAgent": "com.google.android.youtube/21.26.360 (Linux; U; Android 16; en_US; SM-S908E Build/TP1A.220624.014) gzip",
        "osName": "Android",
        "osVersion": "16"
    },
    // doesn't support stream kids contents
    // might enforce SABR-only
    // support oauth2
    "ANDROID_VR": {
        "targetDomain": "youtubei.googleapis.com",
        "client_id": "652469312169-4lvs9bnhr9lpns9v451j5oivd81vjvu1.apps.googleusercontent.com",
        "client_secret": "3fTWrBJI5Uojm1TK7_iJCW5Z",
        "clientName": 28,
        "clientVersion": "0.1",
        "deviceMake": "Oculus",
        "deviceModel": "Quest 3",
        "androidSdkVersion": 30,
        "userAgent": "com.google.android.apps.youtube.vr.oculus/0.1 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
        "osName": "Android",
        "osVersion": "12L"
    },
    // enforced SABR-only for music video
    // required youtubei.js for solve n challenge
    // required youtube cookies
    "WEB_PARENT": {
        "targetDomain": "www.youtube.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 88,
        "clientVersion": "1.20260720",
    },
    // required youtubei.js for solve n challenge
    // support cookies
    "WEB_MUSIC": {
        "targetDomain": "music.youtube.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 67,
        "clientVersion": "1.20260720"
    },
    // required youtubei.js for solve n challenge
    // required youtube cookies
    "WEB_CREATOR": {
        "targetDomain": "studio.youtube.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 62,
        "clientVersion": "1.20260720"
    },
    // required youtubei.js for solve n challenge
    // might not able to stream after 1 minute
    // support cookies
    "MWEB": {
        "targetDomain": "www.youtube.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 2,
        "clientVersion": "2.20260720"
    }
};

module.exports = list_clients;
