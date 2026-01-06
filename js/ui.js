export const searchInput = document.getElementById("search-input");
export const searchButton = document.getElementById("search-button");
const guessDisplay = document.getElementById("guess-counter");
const container = document.getElementById("guesses-container");
const instructionsModal = document.getElementById("instructions-modal");

export function showInstructions() {
    instructionsModal.classList.remove("hidden");
}

export function hideInstructions() {
    instructionsModal.classList.add("hidden");
}

export function showEndScreen(isWin, dailySong, endlessMode) {
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

    const streakDisplay = document.getElementById("streak-display");
    const highestStreak = document.getElementById("highest-streak-display");
    
    streakDisplay.style.display = "none";
    highestStreak.style.display = "none";

    if (endlessMode) {
        streakDisplay.style.display = "block";
        highestStreak.style.display = "block";
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

    modal.classList.remove("hidden");
}

export function hideEndScreen() {
    document.getElementById("win-modal").classList.add("hidden");
}

export function renderGuessRow(trackName, result) {
    const row = document.createElement("div");
    row.className = "guess-row";

    row.innerHTML = `
        <div class="cell ${result.isCorrectTitle ? 'correct' : 'incorrect'}">
            ${trackName}
        </div>
        <div class="cell ${result.albumClass}" id="guess-album-cell">
            <div id="guess-art-hint">
                <img id="guess-album-art" src="pics/${result.albumName.replace(/ /g, "_")}.jpg" alt="Guess album art">
                ${result.albumHint ? `&nbsp;${result.albumHint}` : ''}
            </div>
            <div id="guess-album-name">${result.albumName}</div>
        </div>
        <div class="cell ${result.trackClass}">
            ${result.guessNum}${result.guessNum === result.targetNum ? '' : result.trackHint}
        </div>
        <div class="cell ${result.lenClass}">
            ${formatTrackLength(result.guessLen)}${result.guessLen === result.targetLen ? '' : result.lenHint}
        </div>
    `;

    const header = container.querySelector(".guess-header");
    header.after(row);
}

function formatTrackLength(len) {
    const min = Math.floor(len / 60);
    const sec = len % 60;
    if (sec < 10) {
        return `${min}:0${sec}`;
    }
    return `${min}:${sec}`;
}

export function updateGuessCounter(count, max) {
    guessDisplay.textContent = `Guesses: ${count} / ${max}`;
}

export function clearBoard(maxGuesses) {
    searchInput.disabled = false;
    searchButton.disabled = false;
    searchInput.placeholder = "Enter song title...";
    searchInput.value = "";
    guessDisplay.textContent = `Guesses: 0 / ${maxGuesses}`;

    const existingRows = container.querySelectorAll(".guess-row");
    existingRows.forEach(row => row.remove());
    
    hideEndScreen();
}

export function updateStreakDisplay(streak, highestStreak) {
    document.getElementById("streak-count").textContent = streak;
    document.getElementById("highest-streak-count").textContent = highestStreak;
}

export function setupDropDown(trackNames, onSelect) {
    const dropdown = document.getElementById("track-dropdown");
    dropdown.innerHTML = "";

    const fragment = document.createDocumentFragment();

    trackNames.forEach(name => {
        const item = document.createElement("div");
        item.className = "dropdown-item";
        item.textContent = name;
        item.style.display = "none"
        item.addEventListener("click", () => {
            hideDropDown();
            onSelect(name);
        });
        fragment.appendChild(item);
    });
    dropdown.appendChild(fragment);
}

export function hideDropDown() {
    const dropdown = document.getElementById("track-dropdown");
    dropdown.classList.add("hidden");
    const items = document.querySelectorAll(".dropdown-item");
    items.forEach(i => i.style.display = "none");
}