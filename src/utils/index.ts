export const timestampToString = (create_at: number, suffix?: boolean): string => {
    let diffTime: string | number = (new Date().getTime() - (create_at || 0)) / 1000
    if (diffTime < 60) diffTime = 'Just now'
    else if (diffTime > 60 && diffTime < 3600) {
        diffTime = Math.floor(diffTime / 60)
            + (Math.floor(diffTime / 60) > 1 ? (suffix ? ' minutes' : 'm') : (suffix ? ' minute' : 'm')) + (suffix ? ' ago' : '')
    } else if (diffTime > 3600 && diffTime / 3600 < 24) {
        diffTime = Math.floor(diffTime / 3600)
            + (Math.floor(diffTime / 3600) > 1 ? (suffix?' hours':'h') : (suffix?' hour':'h')) + (suffix ? ' ago' : '')
    }
    else if (diffTime > 86400 && diffTime / 86400 < 30) {
        diffTime = Math.floor(diffTime / 86400)
            + (Math.floor(diffTime / 86400) > 1 ? (suffix?' days':'d') :(suffix?' day':'d')) + (suffix ? ' ago' : '')
    } else {
        diffTime = new Date(create_at || 0).toDateString()
    }
    return diffTime
}