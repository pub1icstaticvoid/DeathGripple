/*
LOCAL STORAGE KEY MAP:
dg-visited: Bool - Checks if the user has seen the instructions.
dg-daily-state: Obj - { targetTitle, guesses[], gameOver, date }
dg-endless-state: Obj - { targetTitle, guesses[], gameOver, date }
dg-streak: Int - Current win streak (Endless Mode)
dg-highest-streak: Int - All time best streak (Endless Mode)
*/

export function saveGameState(endlessMode, targetTitle, guesses, gameOver) {
    const state = {
        targetTitle: targetTitle,
        guesses: guesses,
        gameOver: gameOver,
        date: new Date().toDateString()
    };

    const key = endlessMode ? "dg-endless-state" : "dg-daily-state";
    localStorage.setItem(key, JSON.stringify(state));
}

export function loadGameState(endlessMode) {
    const key = endlessMode ? "dg-endless-state" : "dg-daily-state";
    const saved = JSON.parse(localStorage.getItem(key));

    if (!saved) return null;

    if (!endlessMode && saved.date !== new Date().toDateString()) {
        localStorage.removeItem(key);
        return null;
    }

    return saved;
}

export function updateStreakData(isWin, isGameOver) {
    let streak = localStorage.getItem("dg-streak") || 0;
    let highestStreak = localStorage.getItem("dg-highest-streak") || 0;

    if (isWin) {
        streak++;
        if (streak > highestStreak) {
            highestStreak = streak;
            localStorage.setItem("dg-highest-streak", highestStreak);
        }
    }
    else if (isGameOver) {
        streak = 0;
    }

    localStorage.setItem("dg-streak", streak);
    return { streak, highestStreak };
}

export function getInitialStreaks() {
    return {
        streak: localStorage.getItem("dg-streak") || 0,
        highestStreak: localStorage.getItem("dg-highest-streak") || 0
    };
}

export function checkVisited() {
    return localStorage.getItem("dg-visited");
}

export function setVisited() {
    return localStorage.setItem("dg-visited", "true");
}