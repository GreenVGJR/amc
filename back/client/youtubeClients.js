module.exports = {
    // [ experimental client ]
    // most stable, doesn't support stream kids contents
    // some countries may not able to stream after 1 minute
    "VISIONOS": {
        "clientName": 101,
        "clientVersion": "0.1"
    },
    // least stable
    // doesn't support cookies
    // can't stream after 1 minute
    "ANDROID": {
        "clientName": 3,
        "clientVersion": "20.14.43"
    },
    // stable, doesn't support stream kids contents
    "ANDROID_VR": {
        "clientName": 28,
        "clientVersion": "1.00.0"
    },
    // least stable
    // can't stream live content normally
    // can't stream after 1 minute
    "IOS": {
        "clientName": 5,
        "clientVersion": "20.14.43"
    }
}
