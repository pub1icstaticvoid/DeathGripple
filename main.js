import { fetchDiscography } from "./api.js";

let endlessMode = false;
let streak = localStorage.getItem("dg-streak") || 0;
let highestStreak = localStorage.getItem("dg-highest-streak") || 0;
document.getElementById("streak-count").textContent = streak;
document.getElementById("highest-streak-count").textContent = highestStreak;

let tracks = {};
let albumData = {};
let dailySong = null;
let guessEmojis = [];
let gameOver = false;
let guessCount = 0;
const MAX_GUESSES = 6;
const guessDisplay = document.getElementById("guess-counter");

const instructionsModal = document.getElementById("instructions-modal");
const helpButton = document.getElementById("help-button");
const closeInstructions = document.getElementById("close-instructions");

document.getElementById("daily-mode").onclick = () => {
    if (!endlessMode) return;
    endlessMode = false;

    resetInternalState();

    document.getElementById("daily-mode").classList.add("active");
    document.getElementById("endless-mode").classList.remove("active");
    document.getElementById("play-again-button").classList.add("hidden");

    setDailySong(tracks);
    loadGameState();
};

document.getElementById("endless-mode").onclick = () => {
    if (endlessMode) return;
    endlessMode = true;

    resetInternalState();

    document.getElementById("daily-mode").classList.remove("active");
    document.getElementById("endless-mode").classList.add("active");

    const saved = localStorage.getItem("dg-endless-state");
    if (saved) {
        loadGameState();
    } else {
        startEndlessMode();
    }
};

function resetInternalState() {
    gameOver = false;
    guessCount = 0;
    guessEmojis = [];
    searchInput.disabled = false;
    searchButton.disabled = false;
    searchInput.placeholder = "Enter song title...";

    guessDisplay.textContent = `Guesses: 0 / ${MAX_GUESSES}`;

    const container = document.getElementById("guesses-container");
    const existingRows = container.querySelectorAll(".guess-row");
    existingRows.forEach(row => row.remove());

    document.getElementById("win-modal").classList.add("hidden");
    document.getElementById("main-play-again").classList.add("hidden");
}

function startEndlessMode() {
    localStorage.removeItem("dg-endless-state");

    gameOver = false;
    guessCount = 0;
    guessEmojis = [];

    guessDisplay.textContent = `Guesses: 0 / ${MAX_GUESSES}`;

    searchInput.disabled = false;
    searchButton.disabled = false;
    searchInput.value = "";
    searchInput.placeholder = "Enter song title...";

    document.getElementById("win-modal").classList.add("hidden");
    document.getElementById("main-play-again").classList.add("hidden");

    const container = document.getElementById("guesses-container");
    const existingRows = container.querySelectorAll(".guess-row");
    existingRows.forEach(row => row.remove());

    const titles = Object.keys(tracks);
    const randomIndex = Math.floor(Math.random() * titles.length);
    const targetTitle = titles[randomIndex];

    dailySong = {
        title: targetTitle,
        ...tracks[targetTitle]
    };

    document.getElementById("play-again-button").classList.remove("hidden");
    document.getElementById("streak-display").style.display = "block";

    saveGameState();
};

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

function saveGameState() {
    const state = {
        targetTitle: dailySong.title,
        guesses: Array.from(document.querySelectorAll(".guess-row")).map(row => {
            return row.querySelector(".cell").textContent.trim();
        }).reverse(),
        gameOver: gameOver,
        date: new Date().toDateString()
    };

    const key = endlessMode ? "dg-endless-state" : "dg-daily-state";
    localStorage.setItem(key, JSON.stringify(state));
}

function loadGameState() {
    const key = endlessMode ? "dg-endless-state" : "dg-daily-state";
    const saved = JSON.parse(localStorage.getItem(key));

    if (!saved) return;

    if (!endlessMode && saved.date !== new Date().toDateString()) {
        localStorage.removeItem(key);
        return;
    }

    if (endlessMode) {
        dailySong = {
            title: saved.targetTitle,
            ...tracks[saved.targetTitle]
        };
    }

    const container = document.getElementById("guesses-container");
    const existingRows = container.querySelectorAll(".guess-row");
    existingRows.forEach(row => row.remove());
    guessCount = 0;
    guessEmojis = [];
    gameOver = false;

    saved.guesses.forEach(guessTitle => {
        submitGuess(guessTitle);
    });

    if (saved.gameOver && endlessMode) {
        document.getElementById("main-play-again").classList.remove("hidden");

        gameOver = true;
        searchInput.disabled = true;
        searchButton.disabled = true;
    }    
}

async function init() {
    const hasVisited = localStorage.getItem("dg-visited");
    if (!hasVisited) instructionsModal.classList.remove("hidden");

    document.getElementById("close-x").onclick = () => {
        instructionsModal.classList.add("hidden");
    };

    closeInstructions.onclick = () => {
        instructionsModal.classList.add("hidden");
        localStorage.setItem("dg-visited", "true");
    };

    helpButton.onclick = () => {
        instructionsModal.classList.remove("hidden");
    };

    const data = await fetchDiscography();
    tracks = data.track;
    albumData = data.album;

    const alphabetizedTrackNames = Object.keys(tracks).sort((a, b) =>
        a.localeCompare(b, undefined, {sensitivity: 'base'})
    );

    setupDropDown(alphabetizedTrackNames);

    setDailySong(tracks);

    loadGameState();
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
    if (guessNum < targetNum) trackHint = " ↑";
    else if (guessNum > targetNum) trackHint = " ↓";

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

    if (trackName === searchInput.value.trim() || !searchInput.value) {
        saveGameState();
    }
}

function updateStreak(isWin) {
    if (!endlessMode) return;

    if (localStorage.getItem("last-win-title") === dailySong.title) return;

    if (isWin) {
        streak = parseInt(streak) + 1;
        localStorage.setItem("last-win-title", dailySong.title);

        highestStreak = parseInt(highestStreak);
        if (streak > highestStreak) {
            highestStreak = streak;
            localStorage.setItem("dg-highest-streak", highestStreak);
        }
    }
    else {
        streak = 0;
        localStorage.removeItem("last-win-title");
    }

    localStorage.setItem("dg-streak", streak);

    const streakElement = document.getElementById("streak-count");
    if (streakElement) {
        streakElement.textContent = streak;
    }

    const highestElement = document.getElementById("highest-streak-count");
    if (highestElement) {
        highestElement.textContent = highestStreak;
    }
};

function showEndScreen(isWin) {
    gameOver = true;
    updateStreak(isWin);

    const modal = document.getElementById("win-modal");
    const modalContent = modal.querySelector(".modal-content");
    modalContent.classList.toggle("win", isWin);
    modalContent.classList.toggle("lose", !isWin);

    searchInput.disabled = true;
    searchButton.disabled = true;
    searchInput.placeholder = isWin ? "You won!" : "Game over";

    const message = isWin
        ? "Congratulations! You guessed the song!"
        : "Out of guesses! The correct song was:";
    document.getElementById("end-message").textContent = message;
    

    const albumArtImage = document.getElementById("album-art");
    const fallBackArt = document.getElementById("fallback-art");

    albumArtImage.src = `pics/${dailySong.album.replace(/ /g, "_")}.jpg`;
    albumArtImage.classList.remove("hidden");
    fallBackArt.classList.add("hidden");

    document.getElementById("correct-song-title").textContent = dailySong.title;
    document.getElementById("correct-album-name").textContent = dailySong.album;

    const streakDiv = document.getElementById("streak-display");
    if (endlessMode) {
        streakDiv.style.display = "block";
    } else {
        streakDiv.style.display = "none";
    }

    const highestStreakDiv = document.getElementById("highest-streak-display");
    if (endlessMode) {
        highestStreakDiv.style.display = "block";
    } else {
        highestStreakDiv.style.display = "none";
    }

    const playAgainButton = document.getElementById("play-again-button");
    const mainPlayAgainButton = document.getElementById("main-play-again");
    if (endlessMode) {
        playAgainButton.classList.remove("hidden");
        mainPlayAgainButton.classList.remove("hidden");
    } else {
        playAgainButton.classList.add("hidden");
        mainPlayAgainButton.classList.add("hidden");
    }

    document.getElementById("win-modal").classList.remove("hidden");
}

document.getElementById("play-again-button").onclick = () => {
    startEndlessMode();
};

document.getElementById("main-play-again").onclick = () => {
    startEndlessMode();
};

document.getElementById("close-modal").onclick = () => {
    document.getElementById("win-modal").classList.add("hidden");
}

document.getElementById("share-button").onclick = () => {
    const startDate = new Date(2025, 11, 19);
    startDate.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(today - startDate);
    const gameNumber = Math.floor(diffTime / 86400000) + 1;

    let shareHeader = "";
    if (endlessMode) {
        shareHeader = `Death Gripple Endless Mode | Streak: ${streak} (Best: ${highestStreak})\n`;
    } else {
        shareHeader = `Death Gripple #${gameNumber} | Guess: ${guessCount}/${MAX_GUESSES}\n`;
    }

    const fullText = shareHeader + guessEmojis.join("\n");
    navigator.clipboard.writeText(fullText);
    alert("Results copied to clipboard!");
};

searchInput.addEventListener("keydown", (e) => {
    if (gameOver) return;

    if (e.key === "Enter") {
       searchButton.click();
    }
});

window.addEventListener("click", (e) => {
    if (e.target === instructionsModal) {
        instructionsModal.classList.add("hidden");
        localStorage.setItem("dg-visited", "true");
    }
});

// Starts game
init();