import { fetchDiscography } from "./api.js";
import * as Game from "./game.js";
import * as Storage from "./storage.js";
import * as UI from "./ui.js";

let endlessMode = false;
let tracks = {};
let albumData = {};
let dailySong = null;
let guessEmojis = [];
let gameOver = false;
let guessCount = 0;

async function init() {
    if (!Storage.checkVisited()) UI.showInstructions();

    document.getElementById("help-button").onclick = UI.showInstructions;
    document.getElementById("close-x").onclick = UI.hideInstructions;
    document.getElementById("close-instructions").onclick = () => {
        UI.hideInstructions();
        Storage.setVisited();
    };
    document.getElementById("close-modal").onclick = UI.hideEndScreen;

    const data = await fetchDiscography();
    tracks = data.track;
    albumData = data.album;

    const alphabetizedTrackNames = Object.keys(tracks).sort((a, b) =>
        a.localeCompare(b, undefined, {sensitivity: 'base'})
    );
    UI.setupDropDown(alphabetizedTrackNames, (name) => {
        UI.searchInput.value = name;
    });

    const stats = Storage.getInitialStreaks();
    UI.updateStreakDisplay(stats.streak, stats.highestStreak);

    startDailyMode();
}

function startDailyMode() {
    endlessMode = false;
    gameOver = false;
    guessCount = 0;
    guessEmojis = [];

    UI.clearBoard(Game.MAX_GUESSES);

    document.getElementById("play-again-button").classList.add("hidden");
    document.getElementById("main-play-again").classList.add("hidden");

    document.getElementById("streak-display").style.display = "none";
    document.getElementById("highest-streak-display").style.display = "none";

    document.getElementById("daily-mode").classList.add("active");
    document.getElementById("endless-mode").classList.remove("active");

    dailySong = Game.getDailySong(tracks);

    const saved = Storage.loadGameState(false);
    if (saved) resumeGame(saved);
}

function startEndlessMode(forceNew = false) {
    endlessMode = true;
    gameOver = false;
    guessCount = 0;
    guessEmojis = [];

    UI.clearBoard(Game.MAX_GUESSES);
    document.getElementById("play-again-button").classList.add("hidden");
    document.getElementById("main-play-again").classList.add("hidden");

    document.getElementById("daily-mode").classList.remove("active");
    document.getElementById("endless-mode").classList.add("active");

    const saved = Storage.loadGameState(true);
    if (saved && !forceNew) {
        resumeGame(saved);
    }
    else {
        dailySong = Game.getEndlessSong(tracks);
        Storage.saveGameState(true, dailySong.title, [], false);
    }
}

function resumeGame(saved) {
    dailySong = {
        title: saved.targetTitle,
        ...tracks[saved.targetTitle]
    };

    guessEmojis = [];
    guessCount = 0;

    saved.guesses.forEach(name => {
        const result = Game.evaluateGuess(name, dailySong, tracks, albumData);
        guessCount++;
        guessEmojis.push(result.rowEmojis);
        UI.renderGuessRow(name, result);
    });

    UI.updateGuessCounter(guessCount, Game.MAX_GUESSES);

    if (saved.gameOver) {
        gameOver = true;
        UI.showEndScreen(saved.guesses.includes(dailySong.title), dailySong, endlessMode);
    }
}

function submitGuess(name) {
    if (gameOver) return;

    const actualTrackName = Object.keys(tracks).find(
        n => n.toLowerCase() === name.toLowerCase()
    );

    if (!actualTrackName) return;

    const result = Game.evaluateGuess(actualTrackName, dailySong, tracks, albumData);
    guessCount++;
    guessEmojis.push(result.rowEmojis);

    UI.renderGuessRow(actualTrackName, result);
    UI.updateGuessCounter(guessCount, Game.MAX_GUESSES);
    UI.searchInput.value = "";

    if (result.isCorrectTitle || guessCount >= Game.MAX_GUESSES) {
        gameOver = true;
        const stats = Storage.updateStreakData(result.isCorrectTitle, gameOver);
        UI.updateStreakDisplay(stats.streak, stats.highestStreak);
        UI.showEndScreen(result.isCorrectTitle, dailySong, endlessMode);
    }

    const currentGuesses = Array.from(document.querySelectorAll(".guess-row"))
        .map(row => row.querySelector(".cell").textContent.trim())
        .filter(text => text !== "" && text !== "Title")
        .reverse();
    
    Storage.saveGameState(endlessMode, dailySong.title, currentGuesses, gameOver);
}

// Event listeners

UI.searchButton.onclick = () => submitGuess(UI.searchInput.value.trim());

UI.searchInput.oninput = () => {
    const filter = UI.searchInput.value.toLowerCase();
    const items = document.querySelectorAll(".dropdown-item");
    const dropdown = document.getElementById("track-dropdown");

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
    hasMatches && filter ? dropdown.classList.remove("hidden") : dropdown.classList.add("hidden");
};

UI.searchInput.onkeydown = (e) => {
    if (e.key === "Enter") UI.searchButton.click();
};

document.getElementById("daily-mode").onclick = startDailyMode;
document.getElementById("endless-mode").onclick = () => startEndlessMode(false);
document.getElementById("play-again-button").onclick = () => startEndlessMode(true);
document.getElementById("main-play-again").onclick = () => startEndlessMode(true);

document.getElementById("share-button").onclick = () => {
    const gameNum = Game.getGameNumber();
    const streak = Storage.getInitialStreaks();

    const header = endlessMode
        ? `Death Gripple Endless | Streak: ${streak.streak} (Best: ${streak.highestStreak})\n`
        : `Death Gripple #${gameNum} | Guess: ${guessCount}/${Game.MAX_GUESSES}\n`;

    navigator.clipboard.writeText(header + guessEmojis.join("\n"));
    alert("Results copied to clipboard!");
};

// Starts game
init();