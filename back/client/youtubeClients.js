module.exports = {
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
    "ANDROID": {
        "targetDomain": "youtubei.googleapis.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 3,
        "clientVersion": "21.19.286",
        "androidSdkVersion": 30,
        "userAgent": "com.google.android.youtube/21.19.286 (Linux; U; Android 11) gzip",
        "osName": "Android",
        "osVersion": "11"
    },
    // doesn't support stream kids contents
    // support oauth2
    "ANDROID_VR": {
        "targetDomain": "youtubei.googleapis.com",
        "client_id": "652469312169-4lvs9bnhr9lpns9v451j5oivd81vjvu1.apps.googleusercontent.com",
        "client_secret": "3fTWrBJI5Uojm1TK7_iJCW5Z",
        "clientName": 28,
        "clientVersion": "1.00.0",
        "deviceMake": "Oculus",
        "deviceModel": "Quest 3",
        "androidSdkVersion": 30,
        "userAgent": "com.google.android.apps.youtube.vr.oculus/1.00.0 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
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
        "clientVersion": "21.19.02",
        "deviceMake": "Apple",
        "deviceModel": "iPhone17,2",
        "userAgent": "com.google.ios.youtube/21.19.02 (iPhone17,2; U; CPU iOS 26_5 like Mac OS X;)",
        "osName": "iPhone",
        "osVersion": "26.5"
    },
    // legacy formats only
    // support cookies
    "WEB_PARENT": {
        "targetDomain": "www.youtube.com",
        "client_id": null,
        "client_secret": null,
        "clientName": 88,
        "clientVersion": "1.20260410",
    }
}
