const list_clients = {
    // [ experimental client ]
    // doesn't support stream kids contents
    // some countries may not able to stream after 1 minute
    "VISIONOS": {
        "targetDomain": "youtubei.googleapis.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 101,
        "clientVersion": "0.1",
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
        "clientVersion": "21.03.36",
        "androidSdkVersion": 36,
        "userAgent": "com.google.android.youtube/21.03.36 (Linux; U; Android 16; en_US; SM-S908E Build/TP1A.220624.014) gzip",
        "osName": "Android",
        "osVersion": "16"
    },
    // doesn't support stream kids contents
    // support oauth2
    // might enforce SABR-only
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
    // can't stream live content normally
    // can't stream after 1 minute
    "IOS": {
        "targetDomain": "youtubei.googleapis.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 5,
        "clientVersion": "20.11.6",
        "deviceMake": "Apple",
        "deviceModel": "iPhone10,4",
        "userAgent": "com.google.ios.youtube/20.11.6 (iPhone10,4; U; CPU iOS 16_7_7 like Mac OS X)",
        "osName": "iOS",
        "osVersion": "16.7.7"
    },
    // enforced SABR-only for music video
    // required youtubei.js for solve n challenge
    // required youtube cookies
    "WEB_PARENT": {
        "targetDomain": "www.youtube.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 88,
        "clientVersion": "1.20260710",
    },
    // enforced SABR-only for music video
    // merged formats
    // required youtubei.js for solve n challenge
    // support cookies
    "WEB_SAFARI": {
        "targetDomain": "www.youtube.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 1,
        "clientVersion": "2.20260710.01.00",
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15"
    }
};

module.exports = list_clients;
