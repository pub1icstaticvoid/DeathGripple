export const MAX_GUESSES = 6;

export function getDailySong(trackData) {
    const titles = Object.keys(trackData);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dateNum = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    const a = 1664525;
    const c = 1013904223;
    const m = Math.pow(2, 32);

    const scrambledSeed = (a * dateNum + c) % m;
    
    const index = Math.abs(scrambledSeed) % titles.length;
    const targetTitle = titles[index];

    return {
        title: targetTitle,
        ...trackData[targetTitle]
    };
}

export function getEndlessSong(tracks) {
    const titles = Object.keys(tracks);
    const randomIndex = Math.floor(Math.random() * titles.length);
    const targetTitle = titles[randomIndex];

    return {
        title: targetTitle,
        ...tracks[targetTitle]
    };
}

export function evaluateGuess(guessName, targetSong, tracks, albumData) {
    const songInfo = tracks[guessName];
    const targetInfo = targetSong;

    const isCorrectAlbum = guessName === targetSong.album;
    const isCorrectTitle = guessName === targetSong.title;

    console.log(`Submitting: ${guessName} from ${songInfo.album}`);

    const guessAlbumNum = albumData[songInfo.album];
    const targetAlbumNum = albumData[targetInfo.album];
    const albumDist = Math.abs(guessAlbumNum - targetAlbumNum);

    let albumClass = "incorrect";
    if (albumDist === 0) albumClass = "correct";
    else if (albumDist <= 2) albumClass = "near";

    let albumHint = "";
    if (guessAlbumNum < targetAlbumNum) albumHint = "↑";
    else if (guessAlbumNum > targetAlbumNum) albumHint = "↓";

    const guessNum = songInfo.num;
    const targetNum = targetInfo.num;
    const trackDist = Math.abs(guessNum - targetNum);

    let trackClass = "incorrect";
    if (trackDist === 0) trackClass = "correct";
    else if (trackDist <= 2) trackClass = "near";
    
    let trackHint = "";
    if (guessNum < targetNum) trackHint = " ↑";
    else if (guessNum > targetNum) trackHint = " ↓";

    const guessLen = songInfo.length;
    const targetLen = targetInfo.length;
    const lenDist = Math.abs(guessLen - targetLen);

    let lenClass = "incorrect";
    if (lenDist === 0) lenClass = "correct";
    else if (lenDist <= 30) lenClass = "near";

    let lenHint = "";
    if (guessLen < targetLen) lenHint = " ↑";
    else if (guessLen > targetLen) lenHint = " ↓";

    const rowEmojis = [
        isCorrectTitle ? "🟩" : "⬛",
        albumClass === "correct" ? "🟩" : albumClass === "near" ? "🟨" : "⬛",
        trackClass === "correct" ? "🟩" : trackClass === "near" ? "🟨" : "⬛",
        lenClass === "correct" ? "🟩" : lenClass === "near" ? "🟨" : "⬛"
    ].join("");

    return {
        isCorrectTitle,
        isCorrectAlbum,
        albumClass,
        albumHint,
        trackClass,
        trackHint,
        lenClass,
        lenHint,
        rowEmojis,
        guessNum,
        albumName: songInfo.album,
        guessLen,
        targetLen
    }

}

export function getGameNumber() {
    const startDate = new Date(2025, 11, 19);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - startDate);

    return Math.floor(diffTime / 86400000) + 1;
}