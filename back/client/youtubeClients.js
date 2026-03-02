module.exports = {
    // [ experimental client ]
    // most stable, doesn't support stream kids contents
    // might not support cookies
    // some countries may not able to stream after 1 minute
    "VISIONOS": {
        "targetDomain": "m.youtube.com",
        "clientName": 101,
        "clientVersion": "0.1",
        "deviceMake": "Apple",
        "deviceModel": "RealityDevice14,1",
        "osName": "visionOS",
        "osVersion": "1.3.21O771"
    },
    // least stable
    // might not support cookies
    // can't stream after 1 minute
    "ANDROID": {
        "targetDomain": "m.youtube.com",
        "clientName": 3,
        "clientVersion": "20.40.45",
        "userAgent": "com.google.android.youtube/21.02.35 (Linux; U; Android 11) gzip",
        "osName": "Android",
        "osVersion": "11"
    },
    // [ "unofficial" client ]
    // might not support cookies
    // some countries may not able to stream after 1 minute
    "ANDROID_REEL": {
        "targetDomain": "youtubei.googleapis.com",
        "clientName": 3,
        "clientVersion": "20.40.45",
        "androidSdkVersion": 30,
        "userAgent": "com.google.android.youtube/21.02.35 (Linux; U; Android 11) gzip",
        "osName": "Android",
        "osVersion": "11"
    },
    // doesn't support stream kids contents
    "ANDROID_VR": {
        "targetDomain": "m.youtube.com",
        "clientName": 28,
        "clientVersion": "1.00.0",
        "deviceMake": "Oculus",
        "deviceModel": "Quest 3",
        "androidSdkVersion": 30,
        "userAgent": "com.google.android.apps.youtube.vr.oculus/1.00.0 (Linux; U; Android 12L; eureka-user Build/SQ3A.220605.009.A1) gzip",
        "osName": "Android",
        "osVersion": "12L"
    },
    // least stable
    // can't stream live content normally
    // can't stream after 1 minute
    "IOS": {
        "targetDomain": "m.youtube.com",
        "clientName": 5,
        "clientVersion": "20.40.45",
        "deviceMake": "Apple",
        "deviceModel": "iPhone16,2",
        "userAgent": "com.google.ios.youtube/21.02.35 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
        "osName": "iPhone",
        "osVersion": "18.3.2.22D82"
    },
    // [ "unofficial" client ]
    // least stable
    // might not support cookies
    // can't stream live content normally
    // some countries may not able to stream after 1 minute
    "IOS_REEL": {
        "targetDomain": "youtubei.googleapis.com",
        "clientName": 5,
        "clientVersion": "20.40.45",
        "deviceMake": "Apple",
        "deviceModel": "iPhone16,2",
        "userAgent": "com.google.ios.youtube/21.02.35 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
        "osName": "iPhone",
        "osVersion": "18.3.2.22D82"
    }
}
