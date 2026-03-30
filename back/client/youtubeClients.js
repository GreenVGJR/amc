// these clients apparently doesnt support cookies.
// must be via 'Authorization' header but must oauth2 version, and idk how to get it

module.exports = {
    // [ experimental client ]
    // most stable, doesn't support stream kids contents
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
    // can't stream after 1 minute
    "ANDROID": {
        "targetDomain": "youtubei.googleapis.com",
        "clientName": 3,
        "clientVersion": "21.11.480",
        "userAgent": "com.google.android.youtube/21.11.480 (Linux; U; Android 11) gzip",
        "osName": "Android",
        "osVersion": "11"
    },
    // [ "unofficial" client ]
    // some countries may not able to stream after 1 minute
    "ANDROID_REEL": {
        "targetDomain": "youtubei.googleapis.com",
        "clientName": 3,
        "clientVersion": "21.11.480",
        "androidSdkVersion": 30,
        "userAgent": "com.google.android.youtube/21.11.480 (Linux; U; Android 11) gzip",
        "osName": "Android",
        "osVersion": "11"
    },
    // least stable
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
        "targetDomain": "youtubei.googleapis.com",
        "clientName": 5,
        "clientVersion": "21.11.480",
        "deviceMake": "Apple",
        "deviceModel": "iPhone16,2",
        "userAgent": "com.google.ios.youtube/21.11.480 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
        "osName": "iPhone",
        "osVersion": "18.3.2.22D82"
    },
    // [ "unofficial" client ]
    // least stable
    // can't stream live content normally
    // some countries may not able to stream after 1 minute
    "IOS_REEL": {
        "targetDomain": "youtubei.googleapis.com",
        "clientName": 5,
        "clientVersion": "21.11.480",
        "deviceMake": "Apple",
        "deviceModel": "iPhone16,2",
        "userAgent": "com.google.ios.youtube/21.11.480 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
        "osName": "iPhone",
        "osVersion": "18.3.2.22D82"
    }
}
