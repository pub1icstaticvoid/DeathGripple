# Death Gripple: A Death Grips Wordle Clone
Welcome to Death Gripple, the daily music guessing game based on the experimental band Death Grips. You have 6 attempts to guess the random song from their discography.

[Play the game here](https://deathgripple.pages.dev)

## 🛠️ Tech Stack
This project was built using the following:
- **HTML5** - Structure and semantics.
- **CSS3** - Overall look of the site.
- **JavaScript (ES6)** - Modular architecture including:
  - `api.js`: Fetches discography from JSON file.
  - `game.js`: Calculates random song and compares guess attributes against the random song.
  - `ui.js`: DOM manipulation.
  - `storage.js`: Makes games persistent and saves player streak in Endless Mode.
  - `main.js`: Entry point that initializes the app.

## 🕹️ How to Play
The rules are the same as the original Wordle, except instead of guessing a 5-letter word, you are guessing a song from their discography.
1. **Guess the song** in 6 tries.
2. Each guess must be a **valid song** (using the **drop-down menu** gives you exact valid inputs).
3. The color of the tiles will change to show how close your guess was:
    - **Green:** The attribute of the song is correct.
    - **Yellow:** The album/track is at most two away from your guess. For track length, the range is at most 30 seconds.
    - **Gray:** The attribute is wrong.
4. The arrows indicate which direction the correct song is from your guess.
    - **Album:** Up appears later in their discography while down appears earlier.
    - **Track:** Up appears later in the album while down appears earlier.
    - **Length:** Up means longer song while down means shorter.

## 🚀 Features
- **Daily & Endless Mode:** A new word every 24 hours and a new word whenever you complete a game respectively.
- **Discography:** Includes every track from their first EP *Death Grips* through their most recent release *Gmail and the Restraining Orders*.
- **Smart Search:** Drop-down menu that filters through their discography to make searching faster.
- **Win Streak:** Keeps track of your current and all-time best scores.

## 🤝 Contributors
- [pub1icstaticvoid](https://github.com/pub1icstaticvoid)
- [pr1vatestaticfinal](https://github.com/pr1vatestaticfinal)
