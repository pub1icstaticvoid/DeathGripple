import { fetchDiscography } from "./api.js";

let tracks = {};

async function init() {
    const data = await fetchDiscography();
    tracks = data.track;

    const alphabetizedTrackNames = Object.keys(tracks).sort((a, b) =>
        a.localeCompare(b, undefined, {sensitivity: 'base'})
    );

    setupDropDown(alphabetizedTrackNames);
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
    const currentGuess = searchInput.value.trim();

    const actualTrackName = Object.keys(tracks).find(
        name => name.toLowerCase() === currentGuess.toLowerCase()
    );

    if (actualTrackName) {
        submitGuess(actualTrackName);
    }
    else {
        triggerGlitchEffect();
        alert("Track not found in discography.");
    }
});

function submitGuess(trackName) {
    const songInfo = tracks[trackName];
    console.log(`Submitting: ${trackName} from ${songInfo.album}`);

    searchInput.value = "";

    // Logic to add the guess to a results table goes here
}

// Starts game
init();