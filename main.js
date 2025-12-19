import { fetchDiscography } from "./api.js";

let tracks = {};
let albumData = {};
let dailySong = null;
let guessEmojis = [];
let gameOver = false;
let guessCount = 0;
const MAX_GUESSES = 6;
const guessDisplay = document.getElementById("guess-counter");

function setDailySong(trackData) {
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

    dailySong = {
        title: targetTitle,
        ...trackData[targetTitle]
    };

    console.log("Daily song selected.");
}

async function init() {
    const data = await fetchDiscography();
    tracks = data.track;
    albumData = data.album;

    const alphabetizedTrackNames = Object.keys(tracks).sort((a, b) =>
        a.localeCompare(b, undefined, {sensitivity: 'base'})
    );

    setupDropDown(alphabetizedTrackNames);

    setDailySong(tracks);
}

function setupDropDown(trackNames) {
    const dropdown = document.getElementById("track-dropdown");
    dropdown.innerHTML = "";

    const fragment = document.createDocumentFragment();

    trackNames.forEach(name => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = name;
        item.style.display = "none"
        item.addEventListener("click", () => {
            if (gameOver) return;
            searchInput.value = name;
            hideAllDropdownItems();
        });
        fragment.appendChild(item);
    });
    dropdown.appendChild(fragment);
}

const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");

searchInput.addEventListener("input", () => {
    const filter = searchInput.value.toLowerCase();
    const items = document.querySelectorAll(".dropdown-item");
    const dropdown = document.getElementById("track-dropdown");
    dropdown.scrollTop = 0;
    let hasMatches = false;

    items.forEach(i => {
        if (filter && i.textContent.toLowerCase().includes(filter)) {
            i.style.display = "block";
            hasMatches = true;
        }
        else {
            i.style.display = "none";
        }
    });
    if (hasMatches && filter.length > 0) {
        dropdown.classList.remove("hidden");
    }
    else {
        dropdown.classList.add("hidden");
    }
});

function hideAllDropdownItems() {
    const dropdown = document.getElementById("track-dropdown");
    dropdown.classList.add("hidden");
    const items = document.querySelectorAll(".dropdown-item");
    items.forEach(i => i.style.display = "none");
}

searchButton.addEventListener("click", () => {
    if (gameOver) return;

    const currentGuess = searchInput.value.trim();

    const actualTrackName = Object.keys(tracks).find(
        name => name.toLowerCase() === currentGuess.toLowerCase()
    );

    if (actualTrackName) {
        submitGuess(actualTrackName);
    }
    else {
        alert("Track not found in discography.");
    }
});

function submitGuess(trackName) {
    if (gameOver) return;
    guessCount++;

    guessDisplay.textContent = `Guesses: ${guessCount} / ${MAX_GUESSES}`;

    const songInfo = tracks[trackName];
    const targetInfo = dailySong;
    const container = document.getElementById("guesses-container");

    console.log(`Submitting: ${trackName} from ${songInfo.album}`);

    const guessAlbumNum = parseInt(albumData[songInfo.album]);
    const targetAlbumNum = parseInt(albumData[targetInfo.album]);
    const albumDist = Math.abs(guessAlbumNum - targetAlbumNum);
    let albumClass = "incorrect";
    if (albumDist === 0) albumClass = "correct";
    else if (albumDist <= 2) albumClass = "near";
    let albumHint = "";
    if (guessAlbumNum < targetAlbumNum) albumHint = " ↑";
    else if (guessAlbumNum > targetAlbumNum) albumHint = " ↓";

    const guessNum = parseInt(songInfo.num);
    const targetNum = parseInt(targetInfo.num);
    const trackDist = Math.abs(guessNum - targetNum);
    let trackClass = "incorrect";
    if (trackDist === 0) trackClass = "correct";
    else if (trackDist <= 2) trackClass = "near";
    let trackHint = "";
    if (guessNum < targetNum) trackHint = " ↓";
    else if (guessNum > targetNum) trackHint = " ↑";

    const isCorrectAlbum = songInfo.album === targetInfo.album;
    const isCorrectTitle = trackName === targetInfo.title;

    const row = document.createElement("div");
    row.className = "guess-row";

    row.innerHTML = `
        <div class="cell ${isCorrectTitle ? 'correct' : 'incorrect'}">
            ${trackName}
        </div>
        <div class="cell ${albumClass}">
            ${songInfo.album}${isCorrectAlbum ? '' : albumHint}
        </div>
        <div class="cell ${trackClass}">
            ${guessNum}${guessNum === targetNum ? '' : trackHint}
        </div>
    `;

    const rowEmojis = [
        isCorrectTitle ? "🟩" : "⬛",
        albumClass === "correct" ? "🟩" : albumClass === "near" ? "🟨" : "⬛",
        trackClass === "correct" ? "🟩" : trackClass === "near" ? "🟨" : "⬛"
    ].join("");
    guessEmojis.push(rowEmojis);

    const header = container.querySelector(".guess-header");
    header.after(row);
    
    searchInput.value = "";

    if (isCorrectTitle) {
        showEndScreen(true);
    }
    else if (guessCount >= MAX_GUESSES) {
        showEndScreen(false);
    }
}

function showEndScreen(isWin) {
    gameOver = true;

    searchInput.disabled = true;
    searchButton.disabled = true;
    searchInput.placeholder = isWin ? "You won!" : "Game over";

    const message = isWin ? "Congratulations! You guessed the song!" : "Out of guesses! The correct song was:";
    document.getElementById("end-message").textContent = message;

    const albumArtImage = document.getElementById("album-art");
    const fallBackArt = document.getElementById("fallback-art");

    albumArtImage.src = `pics/${dailySong.album.replace(/ /g, "_")}.jpg`;
    albumArtImage.classList.remove("hidden");
    fallBackArt.classList.add("hidden");

    document.getElementById("correct-song-title").textContent = dailySong.title;
    document.getElementById("correct-album-name").textContent = dailySong.album;
    document.getElementById("win-modal").classList.remove("hidden");
}

document.getElementById("close-modal").onclick = () => {
    document.getElementById("win-modal").classList.add("hidden");
}

document.getElementById("share-button").onclick = () => {
    const startDate = new Date(2025, 11, 18);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - startDate);
    const gameNumber = Math.floor(diffTime / 86400000) + 1;

    const text = `Death Gripple #${gameNumber}\n${guessEmojis.join("\n")}`;
    navigator.clipboard.writeText(text);
    alert("Results copied to clipboard!");
};

searchInput.addEventListener("keydown", (e) => {
    if (gameOver) return;

    if (e.key === "Enter") {
       searchButton.click();
    }
});

// Starts game
init();