module.exports = {
    type: "connect",
    code: `
    $logger[Info;Waiting to online]
    $logger[Debug;Refreshing cache data]
    $try[$deleteRecords[storecachesearchusersfetch-q]]
    $try[$deleteRecords[storecachesearchusersfetch-p]]
    $try[$deleteRecords[cachesearchistory_user_autocomplete]]
    $try[$deleteRecords[musicplayer_message]]
    $try[$deleteRecords[radioplayer_data]]
    `
}