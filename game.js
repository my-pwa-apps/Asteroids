// Game constants
const FPS = 60; // frames per second
const FRICTION = 0.7; // friction coefficient (0 = no friction, 1 = lots of friction)
const SHIP_SIZE = 30; // ship height in pixels
const SHIP_THRUST = 5; // acceleration of the ship in pixels per second per second
const TURN_SPEED = 360; // turn speed in degrees per second
const SHIP_EXPLOSION_DUR = 0.3; // duration of ship's explosion
const SHIP_INVULNERABILITY_DUR = 3; // duration of ship's invulnerability in seconds
const SHIP_BLINK_DUR = 0.1; // duration of ship's blink during invulnerability in seconds
const LASER_MAX = 10; // maximum number of lasers on screen at once
const LASER_SPEED = 500; // speed of lasers in pixels per second
const LASER_DIST = 0.6; // max distance laser can travel as fraction of screen width
const LASER_EXPLODE_DUR = 0.1; // duration of laser's explosion in seconds
const ASTEROID_NUM = 3; // starting number of asteroids
const ASTEROID_SIZE = 100; // starting size of asteroids in pixels
const ASTEROID_SPEED = 50; // max starting speed of asteroids in pixels per second
const ASTEROID_VERT = 10; // average number of vertices on each asteroid
const ASTEROID_JAG = 0.4; // jaggedness of the asteroids (0 = none, 1 = lots)
const ASTEROID_POINTS_LRG = 20; // points scored for a large asteroid
const ASTEROID_POINTS_MED = 50; // points scored for a medium asteroid
const ASTEROID_POINTS_SML = 100; // points scored for a small asteroid
const SHOW_BOUNDING = false; // show or hide collision bounding
const TEXT_FADE_TIME = 2.5; // text fade time in seconds
const TEXT_SIZE = 40; // text font height in pixels
const GAME_LIVES = 3; // starting number of lives
const SOUND_ON = true; // turn sound on or off
const MUSIC_ON = true; // turn music on or off
const HIGH_SCORES_COUNT = 10; // number of high scores to save and display
const USE_REQUEST_ANIMATION_FRAME = true; // use requestAnimationFrame for smoother rendering

// Level progression constants
const INITIAL_ASTEROID_SIZE = 60; // Starting size for level 1 asteroids (smaller than default)
const ASTEROID_SIZE_INCREMENT = 5; // Size increase per level
const MAX_ASTEROID_SIZE = 120; // Maximum asteroid size

// Powerup constants
const POWERUP_SIZE = 20; // Size of powerups in pixels
const POWERUP_SPEED = 30; // Speed of powerups in pixels per second
const POWERUP_DURATION = 5; // Duration of powerups in seconds
const POWERUP_PROBABILITY = 0.2; // Probability (0-1) of asteroid dropping a powerup
const POWERUP_TYPES = {
    SHIELD: "shield",        // Temporary invulnerability
    TRIPLE_SHOT: "tripleShot", // Three lasers at once
    RAPID_FIRE: "rapidFire",  // Faster shooting
    EXTRA_LIFE: "extraLife"   // +1 life
};

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAC44w0jgxbGNiJo06mzZ19feHk0aIEaqY",
    authDomain: "asteroids-56101.firebaseapp.com",
    projectId: "asteroids-56101",
    storageBucket: "asteroids-56101.firebasestorage.app",
    messagingSenderId: "235157683310",
    appId: "1:235157683310:web:7327849762ae01d4933a7f",
    measurementId: "G-CY2XKR6GY8"
};

// Firebase variables
let db;
let highScores = [];
let isNewHighScore = false;
let newHighScoreRank = -1;

// Audio variables
let audioContext;
let soundEnabled = SOUND_ON;
let musicEnabled = MUSIC_ON;
let sounds = {};
let thrustSound = null;
let musicLoop = null;

// Game variables
let canvas, ctx;
let ship;
let asteroids = [];
let lasers = [];
let powerups = []; // Array to hold active powerups
let activePowerups = {}; // Object to track active powerup effects
let score = 0;
let level = 0;
let lives = GAME_LIVES;
let gameOver = false;
let gameStarted = false;
let isModernStyle = false;

// Add these variables to the game variables section
let levelAnnouncementActive = false;
let levelAnnouncementTime = 0;
const LEVEL_ANNOUNCEMENT_DURATION = 3.0; // seconds to show the level announcement
let levelIndicatorPulse = 0; // For level indicator pulsing effect

// Enhanced splash screen variables
let splashCanvas, splashCtx;
let splashStars = [];
let titleParticles = [];
let splashAsteroids = [];
let titlePulse = 0;
let logoRotation = 0;
let splashAnimationId;
let buttonHoverEffects = {};

// DOM elementsual effects for modern mode
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");
const finalScoreElement = document.getElementById("finalScore");
const gameOverModal = document.getElementById("gameOverModal");
const restartButton = document.getElementById("restartButton");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const styleToggle = document.getElementById("styleToggle");
const startStyleToggle = document.getElementById("startStyleToggle");
// DOM elements
// Audio controlst = document.getElementById("score");
const soundToggle = document.getElementById("soundToggle");
const musicToggle = document.getElementById("musicToggle");
const startSoundToggle = document.getElementById("startSoundToggle");
const startMusicToggle = document.getElementById("startMusicToggle");
const restartButton = document.getElementById("restartButton");
// High Score elementscument.getElementById("startScreen");
const highScoreInput = document.getElementById("highScoreInput");
const playerNameInput = document.getElementById("playerName");
const submitScoreButton = document.getElementById("submitScore");e");
const viewHighScoresButton = document.getElementById("viewHighScores");
const startHighScoresButton = document.getElementById("startHighScores");
const highScoresModal = document.getElementById("highScoresModal");
const highScoresList = document.getElementById("highScoresList");
const closeHighScoresButton = document.getElementById("closeHighScores");
const startMusicToggle = document.getElementById("startMusicToggle");
// Mobile controls
const mobileControls = document.getElementById("mobileControls");
const thrustButton = document.getElementById("thrustButton");t");
const leftButton = document.getElementById("leftButton");me");
const rightButton = document.getElementById("rightButton");ore");
const fireButton = document.getElementById("fireButton");wHighScores");
const startHighScoresButton = document.getElementById("startHighScores");
// Modern style colors= document.getElementById("highScoresModal");
const MODERN_COLORS = {document.getElementById("highScoresList");
    ship: "#00ffff",sButton = document.getElementById("closeHighScores");
    shipOutline: "#0099ff",
    shipEngine: "#33ccff", // Added for engine glow
    thrust: {ontrols = document.getElementById("mobileControls");
        inner: "#ff3300",ment.getElementById("thrustButton");
        outer: "#ff9900",nt.getElementById("leftButton");
        glow: "#ffcc00"ument.getElementById("rightButton");
    },fireButton = document.getElementById("fireButton");
    asteroid: {
        large: {colors
            fill: "#5555aa",
            outline: "#7777cc"
        },tline: "#0099ff",
        medium: {#33ccff", // Added for engine glow
            fill: "#7777cc", 
            outline: "#9999ee"
        },ter: "#ff9900",
        small: {ffcc00"
            fill: "#9999ee",
            outline: "#aaaaff"
        }arge: {
    },      fill: "#5555aa",
    laser: {outline: "#7777cc"
        core: "#ff00ff",
        glow: "#ff66ff",
        trail: "rgba(255, 0, 255, 0.3)"
    },      outline: "#9999ee"
    explosion: [
        "#ffffff", // center
        "#ffff00", // inner,
        "#ff6600", // middlef"
        "#ff0000", // outer
        "#990000"  // edge
    ],ser: {
    background: "#080820",
    stars: {: "#ff66ff",
        small: "#6666aa", 0, 255, 0.3)"
        medium: "#9999dd", 
        large: "#ffffff",
        twinkle: "#aaccff"er
    },  "#ffff00", // inner
    shield: {600", // middle
        color: "rgba(0, 200, 255, 0.3)",
        border: "rgba(0, 150, 255, 0.8)"
    },
    ui: {round: "#080820",
        highlight: "#00ccff",
        text: "#ffffff",,
        background: "rgba(0, 30, 60, 0.7)",
        border: "rgba(0, 150, 255, 0.5)"
    },  twinkle: "#aaccff"
    levelUp: {
        text: "#00ffcc",
        glow: "rgba(0, 255, 200, 0.5)"",
    }   border: "rgba(0, 150, 255, 0.8)"
};  },
    ui: {
// Particle effects"#00ccff",
const PARTICLES = {fff",
    enabled: true, // turn particle effects on/off
    count: {er: "rgba(0, 150, 255, 0.5)"
        shipExplosion: 40,
        asteroidExplosion: { 
            large: 25, ,
            medium: 15, 55, 200, 0.5)"
            small: 10 
        },
        thrust: 5,
        laserTrail: 2,
        shield: 3 {
    },abled: true, // turn particle effects on/off
    duration: {
        shipExplosion: 1.5,
        asteroidExplosion: 1.0,
        thrust: 0.3,5, 
        laserTrail: 0.4,
        shield: 1.010 
    },  },
    size: {ust: 5,
        shipExplosion: {min: 1, max: 3},
        asteroidExplosion: {min: 0.5, max: 2.5},
        thrust: {min: 0.5, max: 2},
        laserTrail: {min: 0.5, max: 1.5},
        shield: {min: 1, max: 2}
    }   asteroidExplosion: 1.0,
};      thrust: 0.3,
        laserTrail: 0.4,
// Performance optimization variables
let lastTime = 0;
let deltaTime = 0;
let fpsInterval = 1000 / FPS;1, max: 3},
let frameCount = 0;losion: {min: 0.5, max: 2.5},
let currentFps = 0;n: 0.5, max: 2},
let lastFpsUpdate = 0;in: 0.5, max: 1.5},
let offscreenCanvas = null;x: 2}
let offscreenCtx = null;
let asteroidBuffers = {}; // Pre-rendered asteroid graphics

// Enhance Firebase error handlingles
function setupFirebase() {
    try {Time = 0;
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
let currentFps = 0;
        // Initialize Firestore
        db = firebase.firestore();
let offscreenCtx = null;
        // Log Firestore settings for debuggingoid graphics
        console.log("Firestore initialized with settings:", firebaseConfig);
// Enhance Firebase error handling
        // Load high scores initially
        loadHighScores();
    } catch (error) { Firebase
        console.error("Error initializing Firebase:", error);
        alert("Failed to connect to Firebase. High scores will not be saved.");
    }   // Initialize Firestore
}       db = firebase.firestore();

// Enhance error handling and debugging for Firestore requests
function loadHighScores() {ore initialized with settings:", firebaseConfig);
    if (!db) {
        console.error("Firestore database is not initialized.");
        return;hScores();
    } catch (error) {
        console.error("Error initializing Firebase:", error);
    db.collection("highScores")t to Firebase. High scores will not be saved.");
        .orderBy("score", "desc")
        .limit(HIGH_SCORES_COUNT)
        .get()
        .then((querySnapshot) => {gging for Firestore requests
            highScores = [];
            querySnapshot.forEach((doc) => {
                highScores.push({database is not initialized.");
                    id: doc.id,
                    ...doc.data()
                });
            });on("highScores")
        })rderBy("score", "desc")
        .catch((error) => {COUNT)
            console.error("Error loading high scores:", error);
            alert("Failed to load high scores. Please check your network connection and Firestore configuration.");
        }); highScores = [];
}           querySnapshot.forEach((doc) => {
                highScores.push({
// Display high scores in the modal
function displayHighScores() {a()
    // Clear previous content
    highScoresList.innerHTML = '';
        })
    if (highScores.length === 0) {
        highScoresList.innerHTML = '<div class="no-scores">No high scores yet. Be the first!</div>';
        return;rt("Failed to load high scores. Please check your network connection and Firestore configuration.");
    }   });
    
    // Create high score entries
    highScores.forEach((score, index) => {
        const scoreEntry = document.createElement('div');
        scoreEntry.className = 'highscore-entry';
        ScoresList.innerHTML = '';
        // Highlight the new high score
        if (isNewHighScore && index === newHighScoreRank) {
            scoreEntry.classList.add('new');ss="no-scores">No high scores yet. Be the first!</div>';
        }eturn;
        
        scoreEntry.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <span class="name">${score.name}</span>
            <span class="score">${score.score.toLocaleString()}</span>
        `;oreEntry.className = 'highscore-entry';
        
        highScoresList.appendChild(scoreEntry);
    }); if (isNewHighScore && index === newHighScoreRank) {
}           scoreEntry.classList.add('new');
        }
// Check if the current score is a high score
function checkHighScore(score) {
    if (highScores.length < HIGH_SCORES_COUNT) {an>
        // Less than the maximum number of high scores, so this is automatically a high score
        return true;ass="score">${score.score.toLocaleString()}</span>
    }   `;
        
    // Check if the score is higher than the lowest high score
    return score > highScores[highScores.length - 1].score;
}

// Save a new high score to Firebaseigh score
function saveHighScore(name, score) {
    if (!db) return;ength < HIGH_SCORES_COUNT) {
        // Less than the maximum number of high scores, so this is automatically a high score
    db.collection("highScores").add({
        name: name,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })turn score > highScores[highScores.length - 1].score;
    .then(() => {
        // Reload high scores after adding a new one
        loadHighScores();to Firebase
         saveHighScore(name, score) {
        // Hide the input form
        highScoreInput.style.display = "none";
        ollection("highScores").add({
        // Show the high scores
        setTimeout(() => {
            showHighScoresModal();ore.FieldValue.serverTimestamp()
        }, 500);
    })hen(() => {
    .catch((error) => {scores after adding a new one
        console.error("Error saving high score:", error);
        alert("There was an error saving your score. Please try again.");
    }); // Hide the input form
}       highScoreInput.style.display = "none";
        
// Show the high scores modales
function showHighScoresModal() {
    // Load the latest high scores before showing the modal
    if (db) {0);
        db.collection("highScores")
            .orderBy("score", "desc")
            .limit(HIGH_SCORES_COUNT)igh score:", error);
            .get()re was an error saving your score. Please try again.");
            .then((querySnapshot) => {
                highScores = [];
                querySnapshot.forEach((doc) => {
                    highScores.push({
                        id: doc.id,
                        ...doc.data()fore showing the modal
                    });
                });on("highScores")
                erBy("score", "desc")
                // Display the high scores
                displayHighScores();
                n((querySnapshot) => {
                // Show the modal
                highScoresModal.classList.add("active");
            })      highScores.push({
            .catch((error) => {.id,
                console.error("Error loading high scores:", error);
            });     });
    } else {    });
        // Display whatever we have locally if Firebase is not initialized
        displayHighScores();he high scores
        highScoresModal.classList.add("active");
    }           
}               // Show the modal
                highScoresModal.classList.add("active");
// Hide the high scores modal
function hideHighScoresModal() {
    highScoresModal.classList.remove("active");gh scores:", error);
}           });
    } else {
// Initialize audio context and load sounds if Firebase is not initialized
function setupAudio() {es();
    try {ighScoresModal.classList.add("active");
        // Create audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        the high scores modal
        // Apply initial audio settings from UI
        soundEnabled = startSoundToggle.checked;
        musicEnabled = startMusicToggle.checked;
        
        // Update UI buttonsand load sounds
        updateAudioButtonAppearance();
        {
        // Create soundscontext
        if (soundEnabled) { = window.AudioContext || window.webkitAudioContext;
            loadSounds();w AudioContext();
        }
        // Apply initial audio settings from UI
        if (musicEnabled) {tSoundToggle.checked;
            setupMusicLoop();usicToggle.checked;
        }
    } catch (e) { UI buttons
        console.error("Web Audio API not supported in this browser", e);
        soundEnabled = false;
        musicEnabled = false;
        updateAudioButtonAppearance();
    }       loadSounds();
}       }
        
// Update the appearance of audio buttons based on current state
function updateAudioButtonAppearance() {
    // During game
    if (soundEnabled) {
        soundToggle.classList.remove('muted');rted in this browser", e);
        soundToggle.textContent = '🔊';
    } else {cEnabled = false;
        soundToggle.classList.add('muted');
        soundToggle.textContent = '🔇';
    }
    
    if (musicEnabled) {e of audio buttons based on current state
        musicToggle.classList.remove('muted');
        musicToggle.textContent = '🎵';
    } else {dEnabled) {
        musicToggle.classList.add('muted');');
        musicToggle.textContent = '🎵';
    } else {
        soundToggle.classList.add('muted');
    // Start screen.textContent = '🔇';
    startSoundToggle.checked = soundEnabled;
    startMusicToggle.checked = musicEnabled;
}   if (musicEnabled) {
        musicToggle.classList.remove('muted');
// Load all game soundstContent = '🎵';
function loadSounds() {
    // Define the sound types we needted');
    const soundTypes = {Content = '🎵';
        laser: { type: "sine", frequency: 880, duration: 0.1, 
                 attack: 0.01, decay: 0.1, fadeOut: 0.1, volume: 0.3, 
                 pitchRamp: true, rampValue: 1200 },
        tSoundToggle.checked = soundEnabled;
        thrustLoop: { type: "sawtooth", frequency: 65, duration: 0.1, 
                      modulation: true, modFreq: 10, modDepth: 50, 
                      attack: 0.01, decay: 0, fadeOut: 0.05, volume: 0.15 },
        all game sounds
        smallExplosion: { type: "white", duration: 0.3, 
                          attack: 0.01, decay: 0.2, fadeOut: 0.1, 
                          filterFreq: 800, volume: 0.3, pitchRamp: true, rampValue: -400 },
        laser: { type: "sine", frequency: 880, duration: 0.1, 
        mediumExplosion: { type: "white", duration: 0.5, volume: 0.3, 
                           attack: 0.01, decay: 0.3, fadeOut: 0.2, 
                           filterFreq: 500, volume: 0.4, pitchRamp: true, rampValue: -200 },
        thrustLoop: { type: "sawtooth", frequency: 65, duration: 0.1, 
        largeExplosion: { type: "white", duration: 0.7, Depth: 50, 
                          attack: 0.01, decay: 0.5, fadeOut: 0.2, e: 0.15 },
                          filterFreq: 300, volume: 0.5, pitchRamp: true, rampValue: -100 },
        smallExplosion: { type: "white", duration: 0.3, 
        extraLife: { type: "sine", frequency: 440, duration: 0.6, 
                     attack: 0.01, decay: 0.3, fadeOut: 0.1, volume: 0.5, sequence: [440, 660, 880] },
        
        levelUp: { type: "triangle", frequency: 220, duration: 0.8, 
                   attack: 0.01, decay: 0.5, fadeOut: 0.1, volume: 0.4, sequence: [220, 330, 440, 550, 660] }
    };                     filterFreq: 500, volume: 0.4, pitchRamp: true, rampValue: -200 },
        
    // Generate all soundstype: "white", duration: 0.7, 
    for (const [name, params] of Object.entries(soundTypes)) {.2, 
        sounds[name] = (params.sequence) ? volume: 0.5, pitchRamp: true, rampValue: -100 },
            createSequenceSound(params) : 
            createSound(params);", frequency: 440, duration: 0.6, 
    }                attack: 0.01, decay: 0.3, fadeOut: 0.1, volume: 0.5, sequence: [440, 660, 880] },
}       
        levelUp: { type: "triangle", frequency: 220, duration: 0.8, 
// Create a sound generator based on parametersdeOut: 0.1, volume: 0.4, sequence: [220, 330, 440, 550, 660] }
function createSound(params) {
    return function() {
        if (!soundEnabled || !audioContext) return;
        (const [name, params] of Object.entries(soundTypes)) {
        const startTime = audioContext.currentTime;
        const endTime = startTime + params.duration;
            createSound(params);
        // Create oscillator or noise source
        let source;
        if (params.type === "white") {
            // Create noise based on parameters
            const bufferSize = audioContext.sampleRate * params.duration;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);;
            
            for (let i = 0; i < bufferSize; i++) {;
                data[i] = Math.random() * 2 - 1;ion;
            }
            reate oscillator or noise source
            source = audioContext.createBufferSource();
            source.buffer = buffer;) {
        } else {reate noise
            // Create oscillatorudioContext.sampleRate * params.duration;
            source = audioContext.createOscillator();1, bufferSize, audioContext.sampleRate);
            source.type = params.type;nnelData(0);
            source.frequency.setValueAtTime(params.frequency, startTime);
            for (let i = 0; i < bufferSize; i++) {
            // Apply pitch ramp if needed 2 - 1;
            if (params.pitchRamp) {
                source.frequency.linearRampToValueAtTime(
                    params.frequency + params.rampValue, 
                    endTime buffer;
                );
            }/ Create oscillator
        }   source = audioContext.createOscillator();
            source.type = params.type;
        // Create gain node for volume controlrams.frequency, startTime);
        const gainNode = audioContext.createGain();
            // Apply pitch ramp if needed
        // Set up envelopechRamp) {
        const attackTime = startTime + params.attack;ime(
        const decayTime = attackTime + params.decay;lue, 
        const fadeTime = endTime - params.fadeOut;
                );
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(params.volume, attackTime);
        gainNode.gain.linearRampToValueAtTime(params.volume * 0.7, decayTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, fadeTime);
        gainNode.gain.linearRampToValueAtTime(0, endTime);
        
        // Apply filter for noise sounds
        if (params.type === "white" && params.filterFreq) {
            const filter = audioContext.createBiquadFilter();
            filter.type = "lowpass";arams.fadeOut;
            filter.frequency.value = params.filterFreq;
            source.connect(filter);e(0, startTime);
            filter.connect(gainNode);ueAtTime(params.volume, attackTime);
        } else {.gain.linearRampToValueAtTime(params.volume * 0.7, decayTime);
            source.connect(gainNode);gainNode.gain.value, fadeTime);
        }ainNode.gain.linearRampToValueAtTime(0, endTime);
        
        // Apply modulation if needednds
        if (params.modulation) {te" && params.filterFreq) {
            const modulator = audioContext.createOscillator();
            modulator.frequency.value = params.modFreq;
            filter.frequency.value = params.filterFreq;
            const modulatorGain = audioContext.createGain();
            modulatorGain.gain.value = params.modDepth;
            se {
            modulator.connect(modulatorGain);
            modulatorGain.connect(source.frequency);
            modulator.start(startTime);
            modulator.stop(endTime);d
        }f (params.modulation) {
            const modulator = audioContext.createOscillator();
        gainNode.connect(audioContext.destination);req;
            
        // Start and stop the soundudioContext.createGain();
        source.start(startTime);alue = params.modDepth;
        source.stop(endTime);
            modulator.connect(modulatorGain);
        // Return the source for potential early stopping
        return source;start(startTime);
    };      modulator.stop(endTime);
}       }
        
// Create a sequence of tonesoContext.destination);
function createSequenceSound(params) {
    return function() {op the sound
        if (!soundEnabled || !audioContext) return;
        source.stop(endTime);
        let startTime = audioContext.currentTime;
        const toneDuration = params.duration / params.sequence.length;
        return source;
        params.sequence.forEach((frequency, i) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = params.type;
            oscillator.frequency.value = frequency;
            ateSequenceSound(params) {
            const gainNode = audioContext.createGain();
            const noteStart = startTime + (i * toneDuration);
            const noteEnd = noteStart + toneDuration;
            const attackTime = noteStart + params.attack;
            const decayTime = attackTime + params.decay;quence.length;
            const fadeTime = noteEnd - params.fadeOut;
            ms.sequence.forEach((frequency, i) => {
            gainNode.gain.setValueAtTime(0, noteStart);lator();
            gainNode.gain.linearRampToValueAtTime(params.volume, attackTime);
            gainNode.gain.linearRampToValueAtTime(params.volume * 0.7, decayTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, fadeTime);
            gainNode.gain.linearRampToValueAtTime(0, noteEnd);
            const noteStart = startTime + (i * toneDuration);
            oscillator.connect(gainNode);oneDuration;
            gainNode.connect(audioContext.destination);k;
            const decayTime = attackTime + params.decay;
            oscillator.start(noteStart);arams.fadeOut;
            oscillator.stop(noteEnd);
        }); gainNode.gain.setValueAtTime(0, noteStart);
    };      gainNode.gain.linearRampToValueAtTime(params.volume, attackTime);
}           gainNode.gain.linearRampToValueAtTime(params.volume * 0.7, decayTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, fadeTime);
// Create and start thrust sound (continuous while thrusting);
function startThrustSound() {
    if (!soundEnabled || thrustSound !== null || !audioContext) return;
            gainNode.connect(audioContext.destination);
    // Create continuous sound for thruster
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sawtooth";nd);
    oscillator.frequency.value = 65;
    };
    // Add modulation for rumble effect
    const modulator = audioContext.createOscillator();
    modulator.frequency.value = 10;ontinuous while thrusting)
    tion startThrustSound() {
    const modulatorGain = audioContext.createGain();dioContext) return;
    modulatorGain.gain.value = 50;
    // Create continuous sound for thruster
    modulator.connect(modulatorGain);reateOscillator();
    modulatorGain.connect(oscillator.frequency);
    oscillator.frequency.value = 65;
    // Add noise for texture
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0););
    for (let i = 0; i < noiseBuffer.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }onst modulatorGain = audioContext.createGain();
    modulatorGain.gain.value = 50;
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;Gain);
    noise.loop = true;ect(oscillator.frequency);
    
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "highpass";xt.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    noiseFilter.frequency.value = 1000;annelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.05;
    
    // Main gain nodeioContext.createBufferSource();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;
    
    // Connect all nodesaudioContext.createBiquadFilter();
    oscillator.connect(gainNode);;
    noise.connect(noiseFilter); = 1000;
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNode);xt.createGain();
    gainNode.connect(audioContext.destination);
    
    // Start soundsde
    oscillator.start();dioContext.createGain();
    modulator.start();e = 0.15;
    noise.start();
    // Connect all nodes
    // Store references to stop later
    thrustSound = {oiseFilter);
        oscillator,nect(noiseGain);
        modulator,ect(gainNode);
        noise,onnect(audioContext.destination);
        gainNode
    }; Start sounds
}   oscillator.start();
    modulator.start();
// Stop the thrust sound
function stopThrustSound() {
    if (!thrustSound) return;op later
    thrustSound = {
    // Apply a short fade out
    const now = audioContext.currentTime;
    thrustSound.gainNode.gain.setValueAtTime(thrustSound.gainNode.gain.value, now);
    thrustSound.gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
    };
    // Schedule stop after fade
    setTimeout(() => {
        thrustSound.oscillator.stop();
        thrustSound.modulator.stop();
        thrustSound.noise.stop();
        thrustSound = null;
    }, 100); a short fade out
}   const now = audioContext.currentTime;
    thrustSound.gainNode.gain.setValueAtTime(thrustSound.gainNode.gain.value, now);
// Set up background musicain.linearRampToValueAtTime(0, now + 0.1);
function setupMusicLoop() {
    if (!musicEnabled || !audioContext) return;
    setTimeout(() => {
    // Create a simple, ambient background loop
    const createLoop = () => {stop();
        const numNotes = 4;top();
        const loopDuration = 10; // 10 seconds loop
        const noteDuration = loopDuration / numNotes;
        
        // Base frequencies for ambient notes (A minor scale)
        const baseFreqs = [55, 58.27, 69.30, 82.41]; // A, C, A1, E1
         setupMusicLoop() {
        // Create oscillators for each noteurn;
        for (let i = 0; i < numNotes; i++) {
            const noteStart = i * noteDuration;
            eateLoop = () => {
            // Create multiple layers for each note for rich texture
            for (let octave = 0; octave < 3; octave++) {
                const osc = audioContext.createOscillator();
                osc.type = ["sine", "triangle", "sine"][octave];
                frequencies for ambient notes (A minor scale)
                // Calculate frequency (different octaves) C, A1, E1
                const freq = baseFreqs[i] * Math.pow(2, octave);
                osc.frequency.value = freq;
                 i = 0; i < numNotes; i++) {
                // Create gain node with long fade in/out for smooth transitions
                const gain = audioContext.createGain();
                gain.gain.value = 0;s for each note for rich texture
                (let octave = 0; octave < 3; octave++) {
                // Volume based on octavecreateOscillator();
                const maxVolume = [0.05, 0.03, 0.01][octave];e];
                
                // Create long envelope(different octaves)
                const fadeInTime = 1; // 1 second fade inctave);
                const fadeOutTime = 1; // 1 second fade out
                
                gain.gain.setValueAtTime(0, noteStart);ut for smooth transitions
                gain.gain.linearRampToValueAtTime(maxVolume, noteStart + fadeInTime);
                gain.gain.setValueAtTime(maxVolume, noteStart + noteDuration - fadeOutTime);
                gain.gain.linearRampToValueAtTime(0, noteStart + noteDuration);
                // Volume based on octave
                // Add a little chorus/detune effect[octave];
                osc.detune.value = (Math.random() * 10) - 5;
                // Create long envelope
                // Connect nodes = 1; // 1 second fade in
                osc.connect(gain);= 1; // 1 second fade out
                gain.connect(audioContext.destination);
                gain.gain.setValueAtTime(0, noteStart);
                // Schedule playbackToValueAtTime(maxVolume, noteStart + fadeInTime);
                osc.start(audioContext.currentTime + noteStart);noteDuration - fadeOutTime);
                osc.stop(audioContext.currentTime + noteStart + noteDuration);;
            }   
        }       // Add a little chorus/detune effect
                osc.detune.value = (Math.random() * 10) - 5;
        // Schedule the next loop
        musicLoop = setTimeout(createLoop, loopDuration * 1000);
    };          osc.connect(gain);
                gain.connect(audioContext.destination);
    // Start the loop
    createLoop();/ Schedule playback
}               osc.start(audioContext.currentTime + noteStart);
                osc.stop(audioContext.currentTime + noteStart + noteDuration);
// Stop background music
function stopMusicLoop() {
    if (musicLoop) {
        clearTimeout(musicLoop);p
        musicLoop = null;meout(createLoop, loopDuration * 1000);
    };
}   
    // Start the loop
// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    top background music
    if (!soundEnabled && thrustSound) {
        stopThrustSound();
    }   clearTimeout(musicLoop);
        musicLoop = null;
    updateAudioButtonAppearance();
    return soundEnabled;
}
// Toggle sound on/off
// Toggle music on/off {
function toggleMusic() {dEnabled;
    musicEnabled = !musicEnabled;
    if (!soundEnabled && thrustSound) {
    if (musicEnabled) {();
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }eAudioButtonAppearance();
        setupMusicLoop();
    } else {
        stopMusicLoop();
    }ggle music on/off
    tion toggleMusic() {
    updateAudioButtonAppearance();
    return musicEnabled;
}   if (musicEnabled) {
        if (audioContext && audioContext.state === 'suspended') {
// Play appropriate explosion sound based on size
function playExplosionSound(size) {
    if (!soundEnabled) return;
    } else {
    // Ensure audio context is running
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }pdateAudioButtonAppearance();
    return musicEnabled;
    if (size === ASTEROID_SIZE) {
        sounds.largeExplosion();
    } else if (size === ASTEROID_SIZE / 2) { size
        sounds.mediumExplosion(); {
    } else {ndEnabled) return;
        sounds.smallExplosion();
    }/ Ensure audio context is running
}   if (audioContext.state === 'suspended') {
        audioContext.resume();
// Set up the canvas and context
function setupCanvas() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    } else if (size === ASTEROID_SIZE / 2) {
    // Set canvas to full window size
    resizeCanvas();
    window.addEventListener("resize", debounce(resizeCanvas, 250));
    }
    // Create offscreen canvas for better performance
    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');
    tion setupCanvas() {
    // Initialize stars for backgroundgameCanvas");
    initializeStars();ntext("2d");
}   
    // Set canvas to full window size
// Debounce function to limit resize events
function debounce(func, wait) {size", debounce(resizeCanvas, 250));
    let timeout;
    return function() { canvas for better performance
        const context = this, args = arguments;anvas');
        clearTimeout(timeout);nvas.getContext('2d');
        timeout = setTimeout(() => func.apply(context, args), wait);
    }; Initialize stars for background
}   initializeStars();
}
// Resize canvas to fit window with performance optimizations
function resizeCanvas() {imit resize events
    // Get the actual display size
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
        const context = this, args = arguments;
    // Set canvas sizeimeout);
    canvas.width = containerWidth; func.apply(context, args), wait);
    canvas.height = containerHeight;
    
    // Also resize the offscreen canvas
    if (offscreenCanvas) {ndow with performance optimizations
        offscreenCanvas.width = containerWidth;
        offscreenCanvas.height = containerHeight;
    }onst containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
    // Reinitialize stars when canvas size changes
    if (isModernStyle) {
        initializeStars();erWidth;
        // Re-render asteroids for the new size
        preRenderAsteroids();
    }/ Also resize the offscreen canvas
}   if (offscreenCanvas) {
        offscreenCanvas.width = containerWidth;
// Pre-render asteroids for better performanceht;
function preRenderAsteroids() {
    const sizes = [ASTEROID_SIZE, ASTEROID_SIZE/2, ASTEROID_SIZE/4];
    const types = Object.values(ASTEROID_TYPES);es
    if (isModernStyle) {
    // Clear existing buffers
    asteroidBuffers = {};roids for the new size
        preRenderAsteroids();
    // Create a buffer for each asteroid size and type combination
    sizes.forEach(size => {
        types.forEach(type => {
            const key = `${size}-${type}`;ance
            RenderAsteroids() {
            // Create buffer canvasSTEROID_SIZE/2, ASTEROID_SIZE/4];
            const buffer = document.createElement('canvas');
            const bufferSize = size * 2.5; // Add padding for jaggedness
            buffer.width = bufferSize;
            buffer.height = bufferSize;
            
            const bCtx = buffer.getContext('2d'); type combination
            rEach(size =>:
            // Create a sample asteroid
            const sampleAsteroid = {ype}`;
                x: bufferSize / 2,
                y: bufferSize / 2,s
                radius: size / 2,nt.createElement('canvas');
                angle: 0,ize = size * 2.5; // Add padding for jaggedness
                type: type,bufferSize;
                vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
                offs: []
            };nst bCtx = buffer.getContext('2d');
            
            // Generate random vertices
            for (let i = 0; i < sampleAsteroid.vert; i++) {
                sampleAsteroid.offs.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
            }   y: bufferSize / 2,
                radius: size / 2,
            // Get colors based on size and type
            let sizeCategory;
            if (size === ASTEROID_SIZE) sizeCategory = 'large'; + 1) + ASTEROID_VERT / 2),
            else if (size === ASTEROID_SIZE / 2) sizeCategory = 'medium';
            else sizeCategory = 'small';
            
            const typeColors = ASTEROID_TYPE_COLORS[type][sizeCategory];
            for (let i = 0; i < sampleAsteroid.vert; i++) {
            // Draw the asteroid bodyush(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
            bCtx.fillStyle = typeColors.fill;
            bCtx.strokeStyle = typeColors.outline;
            bCtx.lineWidth = SHIP_SIZE / 20;type
            let sizeCategory;
            // Draw the asteroid pathE) sizeCategory = 'large';
            bCtx.beginPath(); ASTEROID_SIZE / 2) sizeCategory = 'medium';
            for (let i = 0; i < sampleAsteroid.vert; i++) {
                let angle = sampleAsteroid.angle + (i * Math.PI * 2 / sampleAsteroid.vert);
                let radius = sampleAsteroid.radius * (1 + sampleAsteroid.offs[i]);
                
                if (i === 0) {id body
                    bCtx.moveTo(eColors.fill;
                        sampleAsteroid.x + radius * Math.cos(angle),
                        sampleAsteroid.y + radius * Math.sin(angle)
                    );
                } else {asteroid path
                    bCtx.lineTo(
                        sampleAsteroid.x + radius * Math.cos(angle),
                        sampleAsteroid.y + radius * Math.sin(angle) / sampleAsteroid.vert);
                    );dius = sampleAsteroid.radius * (1 + sampleAsteroid.offs[i]);
                }
            }   if (i === 0) {
            bCtx.closePath();To(
            bCtx.fill();sampleAsteroid.x + radius * Math.cos(angle),
            bCtx.stroke();mpleAsteroid.y + radius * Math.sin(angle)
                    );
            // Add type-specific details
            if (type === ASTEROID_TYPES.ROCKY || type === ASTEROID_TYPES.METALLIC) {
                // Add craters for rocky and metallic typess(angle),
                const craterCount = Math.floor(sampleAsteroid.radius / 6);
                bCtx.fillStyle = typeColors.craters;
                }
                for (let i = 0; i < craterCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * sampleAsteroid.radius * 0.7;
                    const craterX = sampleAsteroid.x + Math.cos(angle) * distance;
                    const craterY = sampleAsteroid.y + Math.sin(angle) * distance;
                    const craterSize = Math.random() * sampleAsteroid.radius * 0.2 + sampleAsteroid.radius * 0.05;
                     === ASTEROID_TYPES.ROCKY || type === ASTEROID_TYPES.METALLIC) {
                    bCtx.beginPath();cky and metallic types
                    bCtx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
                    bCtx.fill(); typeColors.craters;
                }
                for (let i = 0; i < craterCount; i++) {
                // Add a subtle highlight (different for each type)
                if (type === ASTEROID_TYPES.ROCKY) { sampleAsteroid.radius * 0.7;
                    bCtx.fillStyle = "rgba(255, 255, 255, 0.07)";ngle) * distance;
                } else { // METALLICsampleAsteroid.y + Math.sin(angle) * distance;
                    bCtx.fillStyle = "rgba(255, 220, 150, 0.15)";roid.radius * 0.2 + sampleAsteroid.radius * 0.05;
                }   
            } else {bCtx.beginPath();
                // ICY type - add crystalline patternsize, 0, Math.PI * 2);
                bCtx.fillStyle = "rgba(255, 255, 255, 0.15)";
                }
                // Add shine lines
                for (let i = 0; i < 4; i++) {fferent for each type)
                    const angle = Math.random() * Math.PI * 2;
                    const startX = sampleAsteroid.x + Math.cos(angle) * (sampleAsteroid.radius * 0.2);
                    const startY = sampleAsteroid.y + Math.sin(angle) * (sampleAsteroid.radius * 0.2);
                    const endX = sampleAsteroid.x + Math.cos(angle) * sampleAsteroid.radius * 0.8;
                    const endY = sampleAsteroid.y + Math.sin(angle) * sampleAsteroid.radius * 0.8;
                    
                    bCtx.beginPath();stalline patterns
                    bCtx.moveTo(startX, startY); 255, 0.15)";
                    bCtx.lineTo(endX, endY);
                    bCtx.lineWidth = sampleAsteroid.radius * 0.1;
                    bCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                    bCtx.stroke();Math.random() * Math.PI * 2;
                }   const startX = sampleAsteroid.x + Math.cos(angle) * (sampleAsteroid.radius * 0.2);
            }       const startY = sampleAsteroid.y + Math.sin(angle) * (sampleAsteroid.radius * 0.2);
                    const endX = sampleAsteroid.x + Math.cos(angle) * sampleAsteroid.radius * 0.8;
            // Add a highlight to all asteroid typesMath.sin(angle) * sampleAsteroid.radius * 0.8;
            bCtx.beginPath();
            bCtx.arc(Ctx.beginPath();
                sampleAsteroid.x - sampleAsteroid.radius * 0.3, 
                sampleAsteroid.y - sampleAsteroid.radius * 0.3, 
                sampleAsteroid.radius * 0.4, teroid.radius * 0.1;
                0,  bCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                Math.PI * 2roke();
            );  }
            bCtx.fill();
            
            // Store the bufferto all asteroid types
            asteroidBuffers[key] = {
                canvas: buffer,
                asteroid: sampleAsteroideAsteroid.radius * 0.3, 
            };  sampleAsteroid.y - sampleAsteroid.radius * 0.3, 
        });     sampleAsteroid.radius * 0.4, 
    });         0, 
}               Math.PI * 2
            );
// Draw the optimized asteroids
function drawAsteroid(asteroid) {
    const size = asteroid.radius * 2;
            asteroidBuffers[key] = {
    if (isModernStyle) {buffer,
        // Update asteroid angle based on rotation speed
        asteroid.angle += asteroid.rotationSpeed || 0;
        });
        // Use pre-rendered asteroid if available
        const bufferKey = `${size}-${asteroid.type || ASTEROID_TYPES.ROCKY}`;
        
        if (asteroidBuffers[bufferKey]) {
            // Draw the pre-rendered asteroid with rotation
            ctx.save();id.radius * 2;
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.angle);
            ctx.drawImage( angle based on rotation speed
                asteroidBuffers[bufferKey].canvas,  0;
                -asteroidBuffers[bufferKey].canvas.width/2, 
                -asteroidBuffers[bufferKey].canvas.height/2
            );bufferKey = `${size}-${asteroid.type || ASTEROID_TYPES.ROCKY}`;
            ctx.restore();
            asteroidBuffers[bufferKey]) {
            // Add type-specific glow effects with rotation
            ctx.save();
            ctx.globalAlpha = asteroid.glowIntensity || 0.1;
            ctx.shadowBlur = 8;.angle);
            ctx.drawImage(
            if (asteroid.type === ASTEROID_TYPES.ICY) {
                ctx.shadowColor = "rgba(100, 150, 255, 0.8)";
                ctx.beginPath();[bufferKey].canvas.height/2
                ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 1.1, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(100, 150, 255, 0.1)";
                ctx.fill();
            } else if (asteroid.type === ASTEROID_TYPES.METALLIC) {
                ctx.shadowColor = "rgba(255, 200, 100, 0.6)";
                ctx.beginPath();teroid.glowIntensity || 0.1;
                ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 1.05, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(255, 200, 100, 0.05)";
                ctx.fill();pe === ASTEROID_TYPES.ICY) {
            } else {shadowColor = "rgba(100, 150, 255, 0.8)";
                ctx.shadowColor = "rgba(150, 120, 200, 0.4)";
            }   ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 1.1, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(100, 150, 255, 0.1)";
            ctx.beginPath();
            ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 0.9, 0, Math.PI * 2);
            ctx.closePath();lor = "rgba(255, 200, 100, 0.6)";
            ctx.restore();ath();
        } else {ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 1.05, 0, Math.PI * 2);
            // Fallback to direct drawing if buffer not available
            // Get colors based on type and size
            let sizeCategory;
            if (size === ASTEROID_SIZE) sizeCategory = 'large';
            else if (size === ASTEROID_SIZE / 2) sizeCategory = 'medium';
            else sizeCategory = 'small';
            ctx.beginPath();
            const type = asteroid.type || ASTEROID_TYPES.ROCKY;.9, 0, Math.PI * 2);
            const colors = ASTEROID_TYPE_COLORS[type][sizeCategory];
            ctx.restore();
            ctx.fillStyle = colors.fill;
            ctx.strokeStyle = colors.outline;buffer not available
            ctx.lineWidth = SHIP_SIZE / 20; size
            let sizeCategory;
            // Draw the asteroid pathE) sizeCategory = 'large';
            ctx.beginPath();= ASTEROID_SIZE / 2) sizeCategory = 'medium';
            for (let i = 0; i < asteroid.vert; i++) {
                let angle = asteroid.angle + (i * Math.PI * 2 / asteroid.vert);
                let radius = asteroid.radius * (1 + asteroid.offs[i]);
                t colors = ASTEROID_TYPE_COLORS[type][sizeCategory];
                if (i === 0) {
                    ctx.moveTo(ors.fill;
                        asteroid.x + radius * Math.cos(angle),
                        asteroid.y + radius * Math.sin(angle)
                    );
                } else {asteroid path
                    ctx.lineTo(
                        asteroid.x + radius * Math.cos(angle),
                        asteroid.y + radius * Math.sin(angle) / asteroid.vert);
                    );dius = asteroid.radius * (1 + asteroid.offs[i]);
                }
            }   if (i === 0) {
            ctx.closePath();To(
            ctx.fill(); asteroid.x + radius * Math.cos(angle),
            ctx.stroke();steroid.y + radius * Math.sin(angle)
        }           );
    } else {    } else {
        // Original retro style drawing (unchanged)
        ctx.strokeStyle = "slategrey";adius * Math.cos(angle),
        ctx.lineWidth = SHIP_SIZE / 20;dius * Math.sin(angle)
                    );
        // Draw the asteroid path
        ctx.beginPath();
        for (let i = 0; i < asteroid.vert; i++) {
            let angle = asteroid.angle + (i * Math.PI * 2 / asteroid.vert);
            let radius = asteroid.radius * (1 + asteroid.offs[i]);
            
            if (i === 0) {
                ctx.moveTo(tyle drawing (unchanged)
                    asteroid.x + radius * Math.cos(angle),
                    asteroid.y + radius * Math.sin(angle)
                );
            } else {asteroid path
                ctx.lineTo(
                    asteroid.x + radius * Math.cos(angle),
                    asteroid.y + radius * Math.sin(angle) / asteroid.vert);
                );dius = asteroid.radius * (1 + asteroid.offs[i]);
            }
        }   if (i === 0) {
        ctx.closePath();To(
        ctx.stroke();steroid.x + radius * Math.cos(angle),
    }               asteroid.y + radius * Math.sin(angle)
                );
    // Show collision circle
    if (SHOW_BOUNDING) {To(
        ctx.strokeStyle = "lime";radius * Math.cos(angle),
        ctx.beginPath();roid.y + radius * Math.sin(angle)
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.stroke();
    }   }
}       ctx.closePath();
        ctx.stroke();
// Draw lasers
function drawLasers() {
    for (let i = 0; i < lasers.length; i++) {
        if (lasers[i].explodeTime === 0) {
            if (isModernStyle) {;
                // Modern laser with glow
                ctx.shadowBlur = 15;.y, asteroid.radius, 0, Math.PI * 2);
                ctx.shadowColor = MODERN_COLORS.laser.glow;
                
                // Draw outer glow
                ctx.fillStyle = MODERN_COLORS.laser.glow;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 8, 0, Math.PI * 2);
                ctx.fill();ers.length; i++) {
                rs[i].explodeTime === 0) {
                // Draw inner core
                ctx.fillStyle = MODERN_COLORS.laser.core;
                ctx.beginPath(); 15;
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2);
                ctx.fill();
                // Draw outer glow
                ctx.shadowBlur = 0;ERN_COLORS.laser.glow;
            } else {beginPath();
                // Retro laser[i].x, lasers[i].y, SHIP_SIZE / 8, 0, Math.PI * 2);
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2);
                ctx.fill();le = MODERN_COLORS.laser.core;
            }   ctx.beginPath();
        } else {ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2);
            // Draw the explosion
            if (isModernStyle) {
                // Modern explosion
                const explosionProgress = lasers[i].explodeTime / LASER_EXPLODE_DUR;
                const radius = ship.radius * 0.75 * (0.75 + 0.5 * explosionProgress);
                ctx.fillStyle = "salmon";
                // Create a radial gradient for the explosion
                const gradient = ctx.createRadialGradient(E / 15, 0, Math.PI * 2);
                    lasers[i].x, lasers[i].y, 0,
                    lasers[i].x, lasers[i].y, radius
                );
                gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
                gradient.addColorStop(0.3, "rgba(255, 255, 0, 0.8)");
                gradient.addColorStop(0.7, "rgba(255, 100, 0, 0.5)");
                gradient.addColorStop(1, "rgba(255, 0, 0, 0)"); / LASER_EXPLODE_DUR;
                const radius = ship.radius * 0.75 * (0.75 + 0.5 * explosionProgress);
                ctx.fillStyle = gradient;
                ctx.beginPath();al gradient for the explosion
                ctx.arc(lasers[i].x, lasers[i].y, radius, 0, Math.PI * 2);
                ctx.fill();i].x, lasers[i].y, 0,
                    lasers[i].x, lasers[i].y, radius
                // Add some explosion particles
                if (explosionProgress < 0.3 && PARTICLES.enabled) {
                    const particleCount = 3;rgba(255, 255, 0, 0.8)");
                    for (let j = 0; j < particleCount; j++) { 0.5)");
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.5 + Math.random() * 1.5;
                        const size = 1 + Math.random();
                        nPath();
                        particles.push(createParticle(us, 0, Math.PI * 2);
                            lasers[i].x, 
                            lasers[i].y, 
                            Math.cos(angle) * speed, 
                            Math.sin(angle) * speed, LES.enabled) {
                            size,eCount = 3;
                            explosionProgress < 0.15 ? "#ffffff" : "#ffcc00",
                            0.3ngle = Math.random() * Math.PI * 2;
                        ));st speed = 0.5 + Math.random() * 1.5;
                    }   const size = 1 + Math.random();
                }       
            } else {    particles.push(createParticle(
                // Retro explosion[i].x, 
                ctx.fillStyle = "orangered";
                ctx.beginPath();.cos(angle) * speed, 
                ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.75, 0, Math.PI * 2);
                ctx.fill(); size,
                ctx.fillStyle = "salmon";ress < 0.15 ? "#ffffff" : "#ffcc00",
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "pink";
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.25, 0, Math.PI * 2);
                ctx.fill();le = "orangered";
            }   ctx.beginPath();
        }       ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.75, 0, Math.PI * 2);
    }           ctx.fill();
}               ctx.fillStyle = "salmon";
                ctx.beginPath();
// Detect collision between objects, lasers[i].y, ship.radius * 0.5, 0, Math.PI * 2);
function detectCollision(obj1, obj2) {
    return distBetweenPoints(obj1.x, obj1.y, obj2.x, obj2.y) < obj1.radius + obj2.radius;
}               ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.25, 0, Math.PI * 2);
// Handle game over.fill();
function handleGameOver() {
    gameOver = true;
    finalScoreElement.textContent = score;
    
    // Check if this is a high score
    isNewHighScore = checkHighScore(score);
    tion detectCollision(obj1, obj2) {
    if (isNewHighScore) {nts(obj1.x, obj1.y, obj2.x, obj2.y) < obj1.radius + obj2.radius;
        // Find the rank of the new high score
        newHighScoreRank = highScores.findIndex(entry => score > entry.score);
        if (newHighScoreRank === -1) {
            newHighScoreRank = highScores.length;
        }ver = true;
        lScoreElement.textContent = score;
        // Show high score input
        highScoreInput.style.display = "block";
        wHighScore = checkHighScore(score);
        // Focus the input field
        setTimeout(() => {
            playerNameInput.focus();high score
        }, 500);coreRank = highScores.findIndex(entry => score > entry.score);
    } else {newHighScoreRank === -1) {
        // Hide high score inputighScores.length;
        highScoreInput.style.display = "none";
    }   
        // Show high score input
    // Show the game over modalsplay = "block";
    gameOverModal.classList.add("active");
        // Focus the input field
    // Play a dramatic explosion sound
    if (soundEnabled && sounds.largeExplosion) {
        sounds.largeExplosion();
    } else {
           // Hide high score input
    // Add intense screen shake for game over        highScoreInput.style.display = "none";
    if (isModernStyle) {
        addScreenShake(8);
    }
}e");

// Update game objects
function update() {geExplosion) {
    let exploding = ship.exploding;
    let wasThrusting = ship.thrusting;
    
    // Update level announcement timing
    if (levelAnnouncementActive) {date game objects
        levelAnnouncementTime += 1 / FPS;tion update() {
        if (levelAnnouncementTime > LEVEL_ANNOUNCEMENT_DURATION) {
            levelAnnouncementActive = false;ing;
        }
    }
    
    // Update level indicator pulse effectevelAnnouncementTime += 1 / FPS;
    if (levelIndicatorPulse > 0) {   if (levelAnnouncementTime > LEVEL_ANNOUNCEMENT_DURATION) {
        levelIndicatorPulse -= 0.01;        levelAnnouncementActive = false;
        if (levelIndicatorPulse <= 0) {
            levelIndicatorPulse = 0;
        }
    }cator pulse effect
    
    // Apply control inputs to ship.01;
    if (!exploding) {
        // Set ship rotation based on left/right keyslIndicatorPulse = 0;
        if (keys.left) {
            ship.rotation = TURN_SPEED / 180 * Math.PI / FPS * -1;
        } else if (keys.right) {
            ship.rotation = TURN_SPEED / 180 * Math.PI / FPS;
        } else {
            ship.rotation = 0;// Set ship rotation based on left/right keys
        }
         = TURN_SPEED / 180 * Math.PI / FPS * -1;
        // Set ship thrusting based on up keyight) {
        ship.thrusting = keys.up;S;
        
        // Fire lasers with space key   ship.rotation = 0;
        if (keys.space) {   }
            shootLaser();    
            // Reset space key to prevent continuous firingng based on up key
            keys.space = false;g = keys.up;
        }
    }y
    if (keys.space) {
    // Update ship position;
    if (!exploding) {y to prevent continuous firing
        // Rotate the ship
        ship.angle += ship.rotation;
        
        // Move the ship
        if (ship.thrusting) {
            ship.thrust.x += SHIP_THRUST * Math.cos(ship.angle) / FPS;
            ship.thrust.y -= SHIP_THRUST * Math.sin(ship.angle) / FPS;tate the ship
            le += ship.rotation;
            // Ensure thrust sound is playing
            if (soundEnabled && !thrustSound) {
                startThrustSound();
            }ship.thrust.x += SHIP_THRUST * Math.cos(ship.angle) / FPS;
        } else {p.angle) / FPS;
            // Apply friction to slow the ship
            ship.thrust.x -= FRICTION * ship.thrust.x / FPS; is playing
            ship.thrust.y -= FRICTION * ship.thrust.y / FPS;f (soundEnabled && !thrustSound) {
                   startThrustSound();
            // Stop thrust sound if no longer thrusting    }
            if (wasThrusting && soundEnabled && thrustSound) {
                stopThrustSound(); slow the ship
            }CTION * ship.thrust.x / FPS;
        }    ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
        
        // Update ship positionlonger thrusting
        ship.x += ship.thrust.x;thrustSound) {
        ship.y += ship.thrust.y;
        
        // Handle ship going off screen
        if (ship.x < 0 - ship.radius) {
            ship.x = canvas.width + ship.radius;
        } else if (ship.x > canvas.width + ship.radius) {
            ship.x = 0 - ship.radius;
        }
        if (ship.y < 0 - ship.radius) {   // Handle ship going off screen
            ship.y = canvas.height + ship.radius;    if (ship.x < 0 - ship.radius) {
        } else if (ship.y > canvas.height + ship.radius) {width + ship.radius;
            ship.y = 0 - ship.radius;hip.x > canvas.width + ship.radius) {
        }
    }
    radius) {
    // Update ship explosion   ship.y = canvas.height + ship.radius;
    if (exploding) {} else if (ship.y > canvas.height + ship.radius) {
        // Stop thrust sound if exploding;
        if (thrustSound) {}
            stopThrustSound();
        }
        
        ship.explodeTime += 1 / FPS;oding) {
        f exploding
        if (ship.explodeTime > SHIP_EXPLOSION_DUR) {
            lives--;stSound();
            livesElement.textContent = lives;
            
            if (lives === 0) {
                handleGameOver();
            } else {LOSION_DUR) {
                ship = createShip();--;
                ivesElement.textContent = lives;
                // Play extra life sound when respawning (but not at game over)   
                if (soundEnabled && sounds.extraLife) {       if (lives === 0) {
                    sounds.extraLife();            handleGameOver();
                }
            }eShip();
        }
    }        // Play extra life sound when respawning (but not at game over)
     sounds.extraLife) {
    // Update ship blinking (invulnerability after respawn)
    if (ship.blinkNum > 0) {
        ship.blinkTime--;   }
           }
        if (ship.blinkTime === 0) {}
            ship.blinkTime = Math.ceil(SHIP_INVULNERABILITY_DUR / SHIP_BLINK_DUR);
            ship.blinkNum--;er respawn)
        }
    }
    
    // Update asteroidsif (ship.blinkTime === 0) {
    for (let i = 0; i < asteroids.length; i++) {_INVULNERABILITY_DUR / SHIP_BLINK_DUR);
        // Move the asteroid
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;
        
        // Handle asteroid going off screendate asteroids
        if (asteroids[i].x < 0 - asteroids[i].radius) {
            asteroids[i].x = canvas.width + asteroids[i].radius;
        } else if (asteroids[i].x > canvas.width + asteroids[i].radius) {
            asteroids[i].x = 0 - asteroids[i].radius;
        }
        if (asteroids[i].y < 0 - asteroids[i].radius) {// Handle asteroid going off screen
            asteroids[i].y = canvas.height + asteroids[i].radius;ds[i].radius) {
        } else if (asteroids[i].y > canvas.height + asteroids[i].radius) {
            asteroids[i].y = 0 - asteroids[i].radius;> canvas.width + asteroids[i].radius) {
        }asteroids[i].radius;
        
        // Check for collision with shipds[i].radius) {
        if (!exploding && ship.blinkNum === 0 && detectCollision(ship, asteroids[i])) {].radius;
            ship.exploding = true;as.height + asteroids[i].radius) {
            ship.explodeTime = 0;steroids[i].y = 0 - asteroids[i].radius;
            
            // Play ship explosion sound   
            if (soundEnabled && sounds.largeExplosion) {    // Check for collision with ship
                sounds.largeExplosion();ng && ship.blinkNum === 0 && detectCollision(ship, asteroids[i])) {
            }
        }
    }
    
    // Update lasersif (soundEnabled && sounds.largeExplosion) {
    for (let i = lasers.length - 1; i >= 0; i--) {
        // Check for laser explosion
        if (lasers[i].explodeTime > 0) {
            lasers[i].explodeTime += 1 / FPS;
            
            // Remove the laser after the explosion durationsers
            if (lasers[i].explodeTime > LASER_EXPLODE_DUR) {h - 1; i >= 0; i--) {
                lasers.splice(i, 1);
                continue;
            }lasers[i].explodeTime += 1 / FPS;
        } else {
            // Move the laser
            lasers[i].x += lasers[i].xv;if (lasers[i].explodeTime > LASER_EXPLODE_DUR) {
            lasers[i].y += lasers[i].yv;
            
            // Calculate the distance traveled
            lasers[i].dist += Math.sqrt(Math.pow(lasers[i].xv, 2) + Math.pow(lasers[i].yv, 2));
            / Move the laser
            // Remove the laser if it goes too farlasers[i].x += lasers[i].xv;
            if (lasers[i].dist > LASER_DIST * canvas.width) {
                lasers.splice(i, 1);
                continue;led
            }ers[i].xv, 2) + Math.pow(lasers[i].yv, 2));
            
            // Handle laser going off screen/ Remove the laser if it goes too far
            if (lasers[i].x < 0) {ASER_DIST * canvas.width) {
                lasers[i].x = canvas.width;
            } else if (lasers[i].x > canvas.width) {
                lasers[i].x = 0;
            }
            if (lasers[i].y < 0) {// Handle laser going off screen
                lasers[i].y = canvas.height;
            } else if (lasers[i].y > canvas.height) {
                lasers[i].y = 0;
            }
            
            // Check for collision with asteroidsrs[i].y < 0) {
            for (let j = asteroids.length - 1; j >= 0; j--) {
                if (detectCollision({x: lasers[i].x, y: lasers[i].y, radius: SHIP_SIZE / 15}, asteroids[j])) {nvas.height) {
                    // Mark the laser as exploding
                    lasers[i].explodeTime = 1;
                    
                    // Play explosion sound based on asteroid sizesteroids
                    if (soundEnabled) {th - 1; j >= 0; j--) {
                        playExplosionSound(asteroids[j].radius * 2);detectCollision({x: lasers[i].x, y: lasers[i].y, radius: SHIP_SIZE / 15}, asteroids[j])) {
                    }k the laser as exploding
                       lasers[i].explodeTime = 1;
                    // Break the asteroid       
                    destroyAsteroid(j);           // Play explosion sound based on asteroid size
                                   if (soundEnabled) {
                    break;                    playExplosionSound(asteroids[j].radius * 2);
                }
            }
        }    // Break the asteroid
    }yAsteroid(j);
                   
    // Check if all asteroids are destroyed                break;
    if (asteroids.length === 0) {
        level++;
        createAsteroids();
    }
    
    // Update particlesteroids are destroyed
    if (isModernStyle && PARTICLES.enabled) {gth === 0) {
        updateParticles();       level++;
    }        createAsteroids();
    
    // Update powerups
    updatePowerups();
    bled) {
    // Update visual effects for modern mode    updateParticles();
    if (isModernStyle) {
        updateParallaxStars();
    }
}

// Destroy an asteroid and create smaller ones
function destroyAsteroid(index) {
    let asteroid = asteroids[index];Asteroid(index) {
    let newSize = asteroid.radius * 2;
    ewSize = asteroid.radius * 2;
    // Add explosion particles
    if (isModernStyle && PARTICLES.enabled) {
        let particleCount;RTICLES.enabled) {
        if (newSize === ASTEROID_SIZE) {
            particleCount = PARTICLES.count.asteroidExplosion.large;
        } else if (newSize === ASTEROID_SIZE / 2) {dExplosion.large;
            particleCount = PARTICLES.count.asteroidExplosion.medium;
        } else {icleCount = PARTICLES.count.asteroidExplosion.medium;
            particleCount = PARTICLES.count.asteroidExplosion.small;
        }   particleCount = PARTICLES.count.asteroidExplosion.small;
        }
        // Get the appropriate color
        let particleColors;opriate color
        if (newSize === ASTEROID_SIZE) {ors;
            particleColors = [MODERN_COLORS.asteroid.large.fill, MODERN_COLORS.asteroid.large.outline, "#ffffff"];ROID_SIZE) {
        } else if (newSize === ASTEROID_SIZE / 2) { = [MODERN_COLORS.asteroid.large.fill, MODERN_COLORS.asteroid.large.outline, "#ffffff"];
            particleColors = [MODERN_COLORS.asteroid.medium.fill, MODERN_COLORS.asteroid.medium.outline, "#ffffff"];=== ASTEROID_SIZE / 2) {
        } else {oid.medium.fill, MODERN_COLORS.asteroid.medium.outline, "#ffffff"];
            particleColors = [MODERN_COLORS.asteroid.small.fill, MODERN_COLORS.asteroid.small.outline, "#ffffff"];{
        }  particleColors = [MODERN_COLORS.asteroid.small.fill, MODERN_COLORS.asteroid.small.outline, "#ffffff"];
           }
        createExplosion(    
            asteroid.x,
            asteroid.y,
            asteroid.radius,
            particleCount,
            particleColors,
            PARTICLES.duration.asteroidExplosion,particleColors,
            1.2idExplosion,
        );       1.2
    }    );
    
    // Calculate score based on asteroid size
    if (newSize === ASTEROID_SIZE) {// Calculate score based on asteroid size
        score += ASTEROID_POINTS_LRG;
    } else if (newSize === ASTEROID_SIZE / 2) {
        score += ASTEROID_POINTS_MED;_SIZE / 2) {
    } else {
        score += ASTEROID_POINTS_SML;
    }OINTS_SML;
    
    // Update the score display
    scoreElement.textContent = score;he score display
    Element.textContent = score;
    // Split the asteroid if it's large enough
    if (asteroid.radius > ASTEROID_SIZE / 8) {// Split the asteroid if it's large enough
        // Create two new asteroidsSIZE / 8) {
        for (let i = 0; i < 2; i++) {oids
            asteroids.push(createAsteroid(    for (let i = 0; i < 2; i++) {
                asteroid.x,ateAsteroid(
                asteroid.y,
                newSize / 2
            ));           newSize / 2
        }           ));
    }        }
    
    // Remove the original asteroid
    asteroids.splice(index, 1); original asteroid
    
    // Randomly drop a powerup
    if (Math.random() < POWERUP_PROBABILITY) {// Randomly drop a powerup
        powerups.push(createPowerup(asteroid.x, asteroid.y));ABILITY) {
    }eatePowerup(asteroid.x, asteroid.y));
    
    // Add screen shake based on asteroid size
    if (newSize === ASTEROID_SIZE) {
        addScreenShake(3);
    } else if (newSize === ASTEROID_SIZE / 2) {
        addScreenShake(1.5);
    } else {tx.fillStyle = isModernStyle ? MODERN_COLORS.background : "black";
        addScreenShake(0.5);ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}odern mode

// Draw the game
function draw() {
    // Apply screen shake if active
    if (screenShake > 0) {hind ship and asteroids)
        ctx.save();TICLES.enabled) {
        applyScreenShake();
    }

    // Draw enhanced background instead of simple starfield
    if (isModernStyle) {
        drawEnhancedBackground(); ship.blinkNum % 2 === 0) {
    } else {
        // Original background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw particles (behind ship and asteroids)IP_EXPLOSION_DUR;
    if (isModernStyle && PARTICLES.enabled) {
        drawParticles();nt for the explosion
    } ctx.createRadialGradient(
    
    // Draw the ship if not blinking ship.y, ship.radius * (1.7 + explosionProgress)
    if (!ship.exploding) {);
        if (ship.blinkNum === 0 || ship.blinkNum % 2 === 0) {
            drawShip(ship.x, ship.y, ship.angle););
        }
    } else {p(0.7, "rgba(255, 0, 0, 0.4)");
        // Draw explosion, "rgba(100, 0, 0, 0)");
        if (isModernStyle) {
            // Modern explosion
            const explosionProgress = ship.explodeTime / SHIP_EXPLOSION_DUR;
            7 + explosionProgress), 0, Math.PI * 2);
            // Create a radial gradient for the explosion
            const gradient = ctx.createRadialGradient(
                ship.x, ship.y, 0,/ Create explosion particles if not already created
                ship.x, ship.y, ship.radius * (1.7 + explosionProgress)explosionProgress < 0.2 && PARTICLES.enabled) {
            ); particles once at the beginning of the explosion
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.2, "rgba(255, 255, 0, 0.8)");ship.y,
            gradient.addColorStop(0.4, "rgba(255, 100, 0, 0.6)");
            gradient.addColorStop(0.7, "rgba(255, 0, 0, 0.4)");TICLES.count.shipExplosion,
            gradient.addColorStop(1, "rgba(100, 0, 0, 0)");        MODERN_COLORS.explosion,
            tion.shipExplosion,
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * (1.7 + explosionProgress), 0, Math.PI * 2);
            ctx.fill();se {
            
            // Create explosion particles if not already created"darkred";
            if (explosionProgress < 0.2 && PARTICLES.enabled) {
                // Only create particles once at the beginning of the explosionp.x, ship.y,
                createExplosion(ship.radius * 2,
                    ship.x, ship.y,
                    ship.radius * 2,"red";
                    PARTICLES.count.shipExplosion,
                    MODERN_COLORS.explosion,p.x, ship.y, ship.radius * 1.4, 0, Math.PI * 2);
                    PARTICLES.duration.shipExplosion,ctx.fill();
                    1.5
                );"orange";
            }
        } else {p.x, ship.y, ship.radius * 1.1, 0, Math.PI * 2);
            // Retro explosion   ctx.fill();
            ctx.fillStyle = "darkred";       
            ctx.beginPath();        ctx.fillStyle = "yellow";
            ctx.arc(ship.x, ship.y, ship.radius * 1.7, 0, Math.PI * 2);
            ctx.fill();.x, ship.y, ship.radius * 0.8, 0, Math.PI * 2);
            
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 1.4, 0, Math.PI * 2);Path();
            ctx.fill();       ctx.arc(ship.x, ship.y, ship.radius * 0.5, 0, Math.PI * 2);
                    ctx.fill();
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 1.1, 0, Math.PI * 2);
            ctx.fill();/ Draw collision circle for ship
            if (SHOW_BOUNDING) {
            ctx.fillStyle = "yellow";e = "lime";
            ctx.beginPath();Path();
            ctx.arc(ship.x, ship.y, ship.radius * 0.8, 0, Math.PI * 2);    ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 0.5, 0, Math.PI * 2);length; i++) {
            ctx.fill();]);
        }
    }   
        // Draw the lasers
    // Draw collision circle for ship
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime"; powerups
        ctx.beginPath();    drawPowerups();
        ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2);
        ctx.stroke();nt if active
    }tive) {
    elAnnouncement();
    // Draw the asteroids}
    for (let i = 0; i < asteroids.length; i++) {
        drawAsteroid(asteroids[i]);
    }article system
    
    // Draw the lasers
    drawLasers();
    
    // Draw the powerups
    drawPowerups();
    
    // Draw level announcement if active
    if (levelAnnouncementActive) {
        drawLevelAnnouncement();tarCount = Math.floor((canvas.width * canvas.height) / 2500); // Adjusted for better density
    }
       for (let i = 0; i < starCount; i++) {
    // Draw enhanced HUD if in modern mode        stars.push({
    if (isModernStyle) {) * canvas.width,
        drawEnhancedHUD();
    }size: Math.random() * 2 + 0.5,
    ype: Math.random() > 0.9 ? "large" : (Math.random() > 0.6 ? "medium" : "small"),
    // Restore context if screen shake was appliedwinkleSpeed: Math.random() * 0.05 + 0.01,
    if (screenShake > 0) {nkleAmount: Math.random() * 0.7 + 0.3,
        ctx.restore();nklePhase: Math.random() * Math.PI * 2
    }
}

// Particle system
let particles = [];ate a single particle
let stars = [];unction createParticle(x, y, xv, yv, size, color, duration = 1.0) {
    return {
// Initialize stars for background
function initializeStars() {
    // Clear existing stars
    stars = [];
    
    // Create new stars based on canvas size
    const starCount = Math.floor((canvas.width * canvas.height) / 2500); // Adjusted for better densitylife: 1.0,
    
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height, particles
            size: Math.random() * 2 + 0.5,
            type: Math.random() > 0.9 ? "large" : (Math.random() > 0.6 ? "medium" : "small"),(let i = 0; i < count; i++) {
            twinkleSpeed: Math.random() * 0.05 + 0.01,ter
            twinkleAmount: Math.random() * 0.7 + 0.3,
            twinklePhase: Math.random() * Math.PI * 2const speed = (Math.random() * radius / 15 + radius / 30) * speedMultiplier;
        });
    }
}   const xv = Math.cos(angle) * speed;
       const yv = Math.sin(angle) * speed;
// Create a single particle        
function createParticle(x, y, xv, yv, size, color, duration = 1.0) {ze
    return {ndom() * (PARTICLES.size.asteroidExplosion.max - PARTICLES.size.asteroidExplosion.min) + PARTICLES.size.asteroidExplosion.min;
        x: x,
        y: y,[Math.floor(Math.random() * colors.length)];
        xv: xv,
        yv: yv,
        size: size,
        color: color,particles.push(createParticle(x, y, xv, yv, size, color, duration));
        life: 1.0,
        decay: 1.0 / (FPS * duration)
    };
}e all particles
es() {
// Create an explosion of particlesficient removal
function createExplosion(x, y, radius, count, colors, duration = 1.0, speedMultiplier = 1.0) {(let i = particles.length - 1; i >= 0; i--) {
    for (let i = 0; i < count; i++) {
        // Random angle and distance from center].xv;
        const angle = Math.random() * Math.PI * 2;[i].yv;
        const speed = (Math.random() * radius / 15 + radius / 30) * speedMultiplier;
           // Apply drag to slow down particles
        // Calculate velocity components    particles[i].xv *= 0.98;
        const xv = Math.cos(angle) * speed;
        const yv = Math.sin(angle) * speed;
        
        // Randomize size
        const size = Math.random() * (PARTICLES.size.asteroidExplosion.max - PARTICLES.size.asteroidExplosion.min) + PARTICLES.size.asteroidExplosion.min;   
               // Remove dead particles
        // Pick a random color from the array        if (particles[i].life <= 0) {
        const color = colors[Math.floor(Math.random() * colors.length)];.splice(i, 1);
        
        // Create the particle
        particles.push(createParticle(x, y, xv, yv, size, color, duration));
    }rticles for performance
}t maxParticles = 300;

// Update all particles- maxParticles);
function updateParticles() {
    // Process particles in reverse order for efficient removal
    for (let i = particles.length - 1; i >= 0; i--) {
        // Move the particle
        particles[i].x += particles[i].xv;
        particles[i].y += particles[i].yv;rticle
        or (let i = 0; i < particles.length; i++) {
        // Apply drag to slow down particles    const p = particles[i];
        particles[i].xv *= 0.98;
        particles[i].yv *= 0.98; on remaining life
               ctx.globalAlpha = p.life * 0.8 + 0.2;
        // Reduce life        
        particles[i].life -= particles[i].decay;
        = p.color;
        // Remove dead particles
        if (particles[i].life <= 0) { p.life, 0, Math.PI * 2);
            particles.splice(i, 1);    ctx.fill();
        }
    }
    eset global alpha
    // Limit total number of particles for performance
    const maxParticles = 300;
    if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles);
    }
}

// Draw all particles
function drawParticles() {
    // Draw each particle
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
         * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase) + 1 - star.twinkleAmount;
        // Set alpha based on remaining life
        ctx.globalAlpha = p.life * 0.8 + 0.2;
        e") {
        // Draw the particle   // Large stars twinkle more and can change color slightly
        ctx.fillStyle = p.color;    ctx.fillStyle = MODERN_COLORS.stars.large;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);lor = MODERN_COLORS.stars.twinkle;
        ctx.fill();
    }lStyle = MODERN_COLORS.stars.medium; 
           ctx.shadowBlur = 2 * twinkle;
    // Reset global alpha        ctx.shadowColor = MODERN_COLORS.stars.medium;
    ctx.globalAlpha = 1.0;
}le = MODERN_COLORS.stars.small;
           ctx.shadowBlur = 0;
// Draw stars for background        }
function drawStars() {
    // Update and draw each star variation based on twinkle
    const now = Date.now() / 1000;
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Calculate twinkle effecteset shadow effects
        const twinkle = star.twinkleAmount * Math.sin(now * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase) + 1 - star.twinkleAmount;
        
        // Set color and size based on star type
        if (star.type === "large") {shield particles around ship
            // Large stars twinkle more and can change color slightly
            ctx.fillStyle = MODERN_COLORS.stars.large;um === 0) return;
            ctx.shadowBlur = 5 * twinkle;
            ctx.shadowColor = MODERN_COLORS.stars.twinkle;
        } else if (star.type === "medium") {e
            ctx.fillStyle = MODERN_COLORS.stars.medium;  to add per frame
            ctx.shadowBlur = 2 * twinkle;
            ctx.shadowColor = MODERN_COLORS.stars.medium;(let i = 0; i < count; i++) {
        } else {h.random() * Math.PI * 2;
            ctx.fillStyle = MODERN_COLORS.stars.small;
            ctx.shadowBlur = 0;
        }const px = ship.x + Math.cos(angle) * distance;
        istance;
        // Draw the star with size variation based on twinkle
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);const speed = 0.5 + Math.random() * 0.5;
        ctx.fill();
    }peed;
    
    // Reset shadow effects
    ctx.shadowBlur = 0;hield.min + 
}      Math.random() * (PARTICLES.size.shield.max - PARTICLES.size.shield.min);
   
// Generate shield particles around ship       // Add some variety to the shield color
function createShieldParticles() {           const blueShift = Math.floor(Math.random() * 55);
    if (!PARTICLES.enabled || !isModernStyle || ship.blinkNum === 0) return;            const color = `rgba(0, ${150 + blueShift}, 255, ${0.3 + Math.random() * 0.3})`;
    
    if (ship.blinkNum % 2 === 0) { with shorter life
        // Only create particles if shield is visible
        const count = 2; // Number of particles to add per frame            px, py, vx, vy, size, color, 
         * (0.3 + Math.random() * 0.3),
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = ship.radius * 1.2;
            }
            const px = ship.x + Math.cos(angle) * distance;
            const py = ship.y + Math.sin(angle) * distance;
            
            // Minimal velocity, mainly for slight movement
            const speed = 0.5 + Math.random() * 0.5;!PARTICLES.enabled || !isModernStyle || ship.exploding || !ship.thrusting) return;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            gle
            // Randomize sizet distance = ship.radius * 0.6;
            const size = PARTICLES.size.shield.min + 
                     Math.random() * (PARTICLES.size.shield.max - PARTICLES.size.shield.min);
            
            // Add some variety to the shield color) {
            const blueShift = Math.floor(Math.random() * 55);// Vary the angle slightly to create a fan effect
            const color = `rgba(0, ${150 + blueShift}, 255, ${0.3 + Math.random() * 0.3})`;ngle + (Math.random() * spread * 2 - spread);
            
            // Create the particle with shorter lifeconst px = ship.x + Math.cos(particleAngle) * distance;
            particles.push(createParticle(distance;
                px, py, vx, vy, size, color, (Math.random() - 0.5) * 0.5;
                PARTICLES.duration.shield * (0.3 + Math.random() * 0.3)st vy = -laser.yv * 0.1 + (Math.random() - 0.5) * 0.5;
            ));
        }) * speed;
    }
}

// Create thruster particlesonst size = PARTICLES.size.thrust.min + 
function createThrustParticles() {         Math.random() * (PARTICLES.size.thrust.max - PARTICLES.size.thrust.min);
    if (!PARTICLES.enabled || !isModernStyle || ship.exploding || !ship.thrusting) return;
    the thrust (hotter in the middle)
    // Calculate position behind the ship
    const angle = ship.angle + Math.PI; // Reverse of ship's angle
    const distance = ship.radius * 0.6; color = MODERN_COLORS.thrust.inner; // Center/inner color
    const spread = 0.5; // How wide the thrust fan is   } else if (Math.random() < 0.6) {
               color = MODERN_COLORS.thrust.outer; // Outer color
    // Create multiple particles for the thrust        } else {
    for (let i = 0; i < PARTICLES.count.thrust; i++) {RS.thrust.glow; // Edges
        // Vary the angle slightly to create a fan effect
        const particleAngle = angle + (Math.random() * spread * 2 - spread);
            // Create the particle with randomized life duration
        // Position at the back of the ship
        const px = ship.x + Math.cos(particleAngle) * distance;, size, color, 
        const py = ship.y + Math.sin(particleAngle) * distance;h.random() * 0.5)
            ));
        // Velocity in the opposite direction of ship movement
        const speed = 1 + Math.random() * 2;
        const vx = Math.cos(particleAngle) * speed;
        const vy = Math.sin(particleAngle) * speed;cles
        
        // Size of the particle!PARTICLES.enabled || !isModernStyle || laser.explodeTime > 0) return;
        const size = PARTICLES.size.thrust.min + 
                 Math.random() * (PARTICLES.size.thrust.max - PARTICLES.size.thrust.min);
        t trailLength = 5;
        // Color based on position in the thrust (hotter in the middle)
        let color;
        if (Math.random() < 0.3) {
            color = MODERN_COLORS.thrust.inner; // Center/inner color// Position behind the laser with some randomness
        } else if (Math.random() < 0.6) {
            color = MODERN_COLORS.thrust.outer; // Outer color
        } else {
            color = MODERN_COLORS.thrust.glow; // Edges
        }th.cos(perpAngle) * Math.random();
        angle) * distance + Math.sin(perpAngle) * Math.random();
        // Create the particle with randomized life duration
        particles.push(createParticle(omness
            px, py, vx, vy, size, color, (Math.random() - 0.5) * 0.5;
            PARTICLES.duration.thrust * (0.5 + Math.random() * 0.5)st vy = -laser.yv * 0.1 + (Math.random() - 0.5) * 0.5;
        ));   
    }       // Size based on position in the trail (smaller further back)
}        const size = PARTICLES.size.laserTrail.min + 
andom() * (PARTICLES.size.laserTrail.max - PARTICLES.size.laserTrail.min);
// Create laser trail particles
function createLaserTrailParticles(laser) {uration
    if (!PARTICLES.enabled || !isModernStyle || laser.explodeTime > 0) return;    particles.push(createParticle(
    , MODERN_COLORS.laser.trail, 
    // Calculate position slightly behind the laserth.random() * 0.7),
    const trailLength = 5; * 0.4
    const angle = Math.atan2(-laser.yv, laser.xv);));
    
    for (let i = 0; i < PARTICLES.count.laserTrail; i++) {
        // Position behind the laser with some randomness
        const distance = Math.random() * trailLength;e all particles
        const spread = 0.8;es() {
        const perpAngle = angle + (Math.random() * spread - spread/2); || !isModernStyle) return;
        
        const px = laser.x - Math.cos(angle) * distance + Math.cos(perpAngle) * Math.random();
        const py = laser.y - Math.sin(angle) * distance + Math.sin(perpAngle) * Math.random();.length - 1; i >= 0; i--) {
        
        // Small velocity, mostly following the laser but with some randomness
        const vx = -laser.xv * 0.1 + (Math.random() - 0.5) * 0.5;/ Update position
        const vy = -laser.yv * 0.1 + (Math.random() - 0.5) * 0.5;p.x += p.vx;
        
        // Size based on position in the trail (smaller further back)
        const size = PARTICLES.size.laserTrail.min + 
                 Math.random() * (PARTICLES.size.laserTrail.max - PARTICLES.size.laserTrail.min);.life -= 1 / FPS;
        
        // Create the particle with very short life duration
        particles.push(createParticle(0) {
            px, py, vx, vy, size, MODERN_COLORS.laser.trail,  1);
            PARTICLES.duration.laserTrail * (0.3 + Math.random() * 0.7),
            0.3 + Math.random() * 0.4
        ));// Fade out based on remaining life
    } {
.fullLife * p.alpha;
// Update all particles
function updateParticles() {
    if (!PARTICLES.enabled || !isModernStyle) return;/ Wrap particles around the screen edges
       if (p.x < 0) {
    // Update existing particles        p.x = canvas.width;
    for (let i = particles.length - 1; i >= 0; i--) {{
        const p = particles[i];
        
        // Update position
        p.x += p.vx;f (p.y < 0) {
        p.y += p.vy;    p.y = canvas.height;
        height) {
        // Update life
        p.life -= 1 / FPS;
        
        // Remove dead particles
        if (p.life <= 0) {eded
            particles.splice(i, 1);ng) {
            continue;
        }     createThrustParticles();
               }
        // Fade out based on remaining life        
        if (p.fadeOut) {kNum > 0) {
            p.alpha = p.life / p.fullLife * p.alpha;rticles();
        }
        }
        // Wrap particles around the screen edges
        if (p.x < 0) {cles
            p.x = canvas.width;rs.forEach(laser =>:
        } else if (p.x > canvas.width) {
            p.x = 0;
        }
        
        if (p.y < 0) {
            p.y = canvas.height;
        } else if (p.y > canvas.height) {ES.enabled || !isModernStyle) return;
            p.y = 0;
        }let i = 0; i < particles.length; i++) {
    }const p = particles[i];
    
    // Generate new particles as needed
    if (ship && !ship.exploding) {lpha = p.alpha;
        if (ship.thrusting) {   
            createThrustParticles();    // Draw the particle
        }startsWith("rgba")) {
        e = p.color;
        if (ship.blinkNum > 0) {       } else {
            createShieldParticles();            ctx.fillStyle = p.color;
        }
    }
    
    // Create laser trail particles(p.x, p.y, p.size, 0, Math.PI * 2);
    lasers.forEach(laser => {
        createLaserTrailParticles(laser);
    });
}
= 1;
// Draw all particles
function drawParticles() {
    if (!PARTICLES.enabled || !isModernStyle) return;
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        pixel
        // Set opacity based on remaining lifensity);
        ctx.globalAlpha = p.alpha;
        t i = 0; i < starCount; i++) {
        // Draw the particle   stars.push({
        if (p.color.startsWith("rgba")) {           x: Math.random() * canvas.width,
            ctx.fillStyle = p.color;            y: Math.random() * canvas.height,
        } else {h.random() * 2 + 0.5,
            ctx.fillStyle = p.color;3 + Math.random() * 0.7,
        } Math.random() * 0.7,
                twinklePhase: Math.random() * Math.PI * 2,
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);accff" : "#ffaaaa") : 
        ctx.fill();MODERN_COLORS.stars.small;
    }});
    
    // Reset opacity
    ctx.globalAlpha = 1;
}
drawStarfield() {
// Stars for the background!isModernStyle) return;
// Initialize starfield
function initializeStars() {
    stars = [];(let i = 0; i < stars.length; i++) {
    const density = 0.0001; // Stars per pixelrs[i];
    const starCount = Math.floor(canvas.width * canvas.height * density);
    
    for (let i = 0; i < starCount; i++) {nklePhase += star.twinkleSpeed / FPS;
        stars.push({ * 2) {
            x: Math.random() * canvas.width,   star.twinklePhase -= Math.PI * 2;
            y: Math.random() * canvas.height;}
            size: Math.random() * 2 + 0.5,
}        }

// Draw the starfieldha = brightness;
function drawStarfield() {eginPath();
    if (!isModernStyle) return;.arc(star.x, star.y, star.size * twinkleFactor, 0, Math.PI * 2);
        ctx.fill();
    // Draw each star with twinkling effect
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];/ Reset opacity
           ctx.globalAlpha = 1.0;
        // Calculate twinkling effect}
        star.twinklePhase += star.twinkleSpeed / FPS;
        if (star.twinklePhase > Math.PI * 2) {
            star.twinklePhase -= Math.PI * 2;) {
        }
        
        const twinkleFactor = 0.7 + 0.3 * Math.sin(star.twinklePhase);
        const brightness = star.brightness * twinkleFactor;if (!gameOver) {
        
        // Draw the star
        if (star.color === "#ffffff") {
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        } else {
            ctx.fillStyle = star.color;) {
        }s();
        e();
        ctx.globalAlpha = brightness;
        ctx.beginPath();steners();
        ctx.arc(star.x, star.y, star.size * twinkleFactor, 0, Math.PI * 2);  
        ctx.fill();    // Initialize stars for the background
    }
    
    // Reset opacity
    ctx.globalAlpha = 1.0;
}
p: false,
// Game loopleft: false,
function gameLoop() {
    update();
    draw();
    
    if (!gameOver) {events for game controls
        requestAnimationFrame(gameLoop);
    }havior for arrow keys to avoid page scrolling
}indexOf(e.keyCode) > -1) {
efault();
// Initialize the game
function init() {
    setupCanvas(); keyCode
    setupFirebase();de) {
    setupAudio();
    setupEventListeners();true;
    
    // Initialize stars for background/ Left arrow
    initializeStars();   case 65: // A key
               keys.left = true;
    // Generate nebula background for modern mode            break;
    generateNebulaBackground();
    
    // Initialize parallax stars for modern moderue;
    initializeParallaxStars();
}
/ D key
// Object to track pressed keys
const keys = {
    up: false,
    left: false,
    right: false,
    space: falser game controls
};
de) {
// Handle keydown events for game controls
function handleKeyDown(e) {false;
    // Prevent default behavior for arrow keys to avoid page scrolling
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {/ Left arrow
        e.preventDefault();   case 65: // A key
    }           keys.left = false;
                break;
    // Update keys based on keyCode
    switch(e.keyCode) {
        case 32: // Spacebarlse;
            keys.space = true;
            break;
        case 37: // Left arrow    case 68: // D key
        case 65: // A key = false;
            keys.left = true;
            break;
        case 38: // Up arrow
        case 87: // W key
            keys.up = true;ners for game controls and UI interactions
            break;n setupEventListeners() {
        case 39: // Right arrow// Keyboard controls
        case 68: // D key
            keys.right = true;er('keyup', handleKeyUp);
            break;
    }
}d('thrustButton').addEventListener('touchstart', () => {
 keys.up = true;
// Handle keyup events for game controls});
function handleKeyUp(e) {
    switch(e.keyCode) {
        case 32: // Spacebar
            keys.space = false;
            break;('leftButton').addEventListener('touchstart', () => {
        case 37: // Left arrow keys.left = true;
        case 65: // A key});
            keys.left = false;
            break;
        case 38: // Up arrow
        case 87: // W key
            keys.up = false;('rightButton').addEventListener('touchstart', () => {
            break; keys.right = true;
        case 39: // Right arrow});
        case 68: // D keymentById('rightButton').addEventListener('touchend', () => {
            keys.right = false;
            break;
    }
}document.getElementById('fireButton').addEventListener('touchstart', () => {
true;
// Setup all event listeners for game controls and UI interactions
function setupEventListeners() {
    // Keyboard controls    keys.space = false;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Mobile controls
    document.getElementById('thrustButton').addEventListener('touchstart', () => {    modernStyle = e.target.checked;
        keys.up = true;
    });
    document.getElementById('thrustButton').addEventListener('touchend', () => {
        keys.up = false;
    });e').addEventListener('click', toggleMusic);
    
    document.getElementById('leftButton').addEventListener('touchstart', () => {Game over modal
        keys.left = true;;
    });res').addEventListener('click', showHighScores);
    document.getElementById('leftButton').addEventListener('touchend', () => {'submitScore').addEventListener('click', submitHighScore);
        keys.left = false;
    });
    ').addEventListener('click', startGame);
    document.getElementById('rightButton').addEventListener('touchstart', () => {'startHighScores').addEventListener('click', showHighScores);
        keys.right = true;('startStyleToggle').addEventListener('change', (e) => {
    });cked;
    document.getElementById('rightButton').addEventListener('touchend', () => {.getElementById('styleToggle').checked = modernStyle;
        keys.right = false;
    });ent.getElementById('startSoundToggle').addEventListener('change', (e) => {
     soundEnabled = e.target.checked;
    document.getElementById('fireButton').addEventListener('touchstart', () => {    updateSoundButton();
        keys.space = true;
    });
    document.getElementById('fireButton').addEventListener('touchend', () => {       musicEnabled = e.target.checked;
        keys.space = false;        updateMusicButton();
    });
    roundMusic();
    // Style toggle        } else {
    document.getElementById('styleToggle').addEventListener('change', (e) => {groundMusic();
        modernStyle = e.target.checked;
    });
    
    // Sound controls
    document.getElementById('soundToggle').addEventListener('click', toggleSound);loseHighScores').addEventListener('click', closeHighScores);
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    
    // Game over modale page loads
    document.getElementById('restartButton').addEventListener('click', restartGame);nit;
    document.getElementById('viewHighScores').addEventListener('click', showHighScores);
    document.getElementById('submitScore').addEventListener('click', submitHighScore);ship
    reateShip() {
    // Start screen
    document.getElementById('startButton').addEventListener('click', startGame); / 2,
    document.getElementById('startHighScores').addEventListener('click', showHighScores);
    document.getElementById('startStyleToggle').addEventListener('change', (e) => {
        modernStyle = e.target.checked;  angle: 90 / 180 * Math.PI, // convert to radians
        document.getElementById('styleToggle').checked = modernStyle;       rotation: 0,
    });        thrusting: false,
    document.getElementById('startSoundToggle').addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        updateSoundButton();
    });
    document.getElementById('startMusicToggle').addEventListener('change', (e) => {,
        musicEnabled = e.target.checked;      explodeTime: 0,
        updateMusicButton();        blinkNum: Math.ceil(SHIP_INVULNERABILITY_DUR / SHIP_BLINK_DUR),
        if (musicEnabled) {VULNERABILITY_DUR / SHIP_BLINK_DUR)
            playBackgroundMusic();
        } else {
            stopBackgroundMusic();
        } visualization
    });
    
    // High scores modalicy",
    document.getElementById('closeHighScores').addEventListener('click', closeHighScores);tallic"
}

// Start the game when the page loads
window.onload = init;ROID_TYPE_COLORS = {

// Create a new ship
function createShip() {
    return {
        x: canvas.width / 2,   craters: "rgba(30, 30, 50, 0.4)"
        y: canvas.height / 2,  },
        radius: SHIP_SIZE / 2,dium: {
        angle: 90 / 180 * Math.PI, // convert to radians: "#6a5f80", 
        rotation: 0,e",
        thrusting: false,40, 60, 0.4)"
        thrust: {
            x: 0,all: {
            y: 0 "#8a7f90",
        },",
        exploding: false,50, 70, 0.4)"
        explodeTime: 0,
        blinkNum: Math.ceil(SHIP_INVULNERABILITY_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_INVULNERABILITY_DUR / SHIP_BLINK_DUR)
    };
}

// Asteroid types for modern visualization   craters: "rgba(200, 230, 255, 0.3)"
const ASTEROID_TYPES = {  },
    ROCKY: "rocky", {
    ICY: "icy",: "#5f7e9c", 
    METALLIC: "metallic"f",
}; 240, 255, 0.3)"

// Modern style asteroid type colorsall: {
const ASTEROID_TYPE_COLORS = { "#6f8eac",
    rocky: {",
        large: { 250, 255, 0.3)"
            fill: "#5a4f70",
            outline: "#7777cc",
            craters: "rgba(30, 30, 50, 0.4)"
        },
        medium: {
            fill: "#6a5f80", 
            outline: "#9999ee",   craters: "rgba(60, 40, 20, 0.5)"
            craters: "rgba(40, 40, 60, 0.4)"   },
        },      medium: {
        small: {            fill: "#7b6846", 
            fill: "#8a7f90",
            outline: "#aaaaff",
            craters: "rgba(50, 50, 70, 0.4)"
        }
    },
    icy: {        outline: "#ddaa66",
        large: {
            fill: "#4f6e8c",
            outline: "#77aadd",
            craters: "rgba(200, 230, 255, 0.3)"
        },
        medium: {and jaggedness multipliers
            fill: "#5f7e9c", nessMultiplier = 1) {
            outline: "#99ccff",/ Pre-calculate radius for efficiency
            craters: "rgba(210, 240, 255, 0.3)"const radius = size / 2;
        },ROID_VERT + 1) + ASTEROID_VERT / 2);
        small: {
            fill: "#6f8eac",ray more efficiently
            outline: "#bbddff",rray(vertCount);
            craters: "rgba(220, 250, 255, 0.3)"lier;
        }G * jaggednessMultiplier;
    },
    metallic: { i = 0; i < vertCount; i++) {
        large: {jagOffset;
            fill: "#6b5836",
            outline: "#aa8844",
            craters: "rgba(60, 40, 20, 0.5)"
        },
        medium: {
            fill: "#7b6846", 
            outline: "#cc9955",
            craters: "rgba(70, 50, 30, 0.5)"} else if (typeRoll < 0.85) {
        },IC; // 25% metallic
        small: {
            fill: "#8b7856", 15% icy
            outline: "#ddaa66",
            craters: "rgba(80, 60, 40, 0.5)"
        }
    } = (Math.random() * 0.02 - 0.01) * (1 + level * 0.05); // Rotation speed affected by level
};for texture variation
Math.floor(Math.random() * (radius / 10) + radius / 20);
// Modify createAsteroid to accept speed and jaggedness multipliershness = Math.random() * 0.5 + 0.3; // How smooth the asteroid surface is (0-1)
function createAsteroid(x, y, size, speedMultiplier = 1, jaggednessMultiplier = 1) {
    // Pre-calculate radius for efficiency object
    const radius = size / 2;
    const vertCount = Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2);h,
    anvas.height,
    // Create the vertex offsets array more efficiently speedMultiplier / FPS) * (Math.random() < 0.5 ? 1 : -1),
    const offsets = new Array(vertCount);
    const jagFactor = ASTEROID_JAG * 2 * jaggednessMultiplier;
    const jagOffset = ASTEROID_JAG * jaggednessMultiplier;  angle: Math.random() * Math.PI * 2, // in radians
           vert: vertCount,
    for (let i = 0; i < vertCount; i++) {        offs: offsets,
        offsets[i] = Math.random() * jagFactor + 1 - jagOffset;
    }ionSpeed,
    oidType,
    // Determine asteroid type - weighted distribution
    let asteroidType;    craterCount: craterCount,
    const typeRoll = Math.random();
    if (typeRoll < 0.6) {== ASTEROID_TYPES.ICY ? 0.4 + Math.random() * 0.3 : 0.1 + Math.random() * 0.1,
        asteroidType = ASTEROID_TYPES.ROCKY; // 60% rocky
    } else if (typeRoll < 0.85) {};
        asteroidType = ASTEROID_TYPES.METALLIC; // 25% metallic
    } else {
        asteroidType = ASTEROID_TYPES.ICY; // 15% icygedness
    }tion createAsteroids() {
    
    // Add visual variation parameters for modern stylepowerups when creating new level
    const rotationSpeed = (Math.random() * 0.02 - 0.01) * (1 + level * 0.05); // Rotation speed affected by level
    const textureVariation = Math.random(); // 0-1 value for texture variationsions for better performance
    const craterCount = Math.floor(Math.random() * (radius / 10) + radius / 20);nst canvasWidth = canvas.width;
    const surfaceSmoothness = Math.random() * 0.5 + 0.3; // How smooth the asteroid surface is (0-1)const canvasHeight = canvas.height;
    
    // Create and return the asteroid objectoids based on level with a maximum limit
    return {const MAX_ASTEROIDS = 15; // Prevent too many asteroids causing performance issues
        x: x || Math.random() * canvas.width,MAX_ASTEROIDS);
        y: y || Math.random() * canvas.height,
        xv: (Math.random() * ASTEROID_SPEED * speedMultiplier / FPS) * (Math.random() < 0.5 ? 1 : -1),// Calculate asteroid size based on level with a minimum and maximum size
        yv: (Math.random() * ASTEROID_SPEED * speedMultiplier / FPS) * (Math.random() < 0.5 ? 1 : -1),
        radius: radius,T),
        angle: Math.random() * Math.PI * 2, // in radians
        vert: vertCount,
        offs: offsets,
        // Visual properties for modern stylehlight effect
        rotationSpeed: rotationSpeed,
        type: asteroidType,
        textureVariation: textureVariation,ement when starting a new level
        craterCount: craterCount,
        surfaceSmoothness: surfaceSmoothness,
        glowIntensity: asteroidType === ASTEROID_TYPES.ICY ? 0.4 + Math.random() * 0.3 : 0.1 + Math.random() * 0.1,late safe spawn distance from ship (increases slightly with level)
        surfaceDetail: []dSize * 2 + (level * 5);
    };
}

// Enhance level progression by increasing asteroid size, speed and jaggednesse asteroids more efficiently
function createAsteroids() {
    asteroids = [];
    powerups = []; // Clear any existing powerups when creating new level
    
    // Cache canvas dimensions for better performance
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;/ Generate random position
    ath.random() * canvasWidth;
    // Calculate number of asteroids based on level with a maximum limit
    const MAX_ASTEROIDS = 15; // Prevent too many asteroids causing performance issues
    const numAsteroids = Math.min(ASTEROID_NUM + level, MAX_ASTEROIDS);  
        // Break after maximum attempts to avoid infinite loops
    // Calculate asteroid size based on level with a minimum and maximum size
    const currentAsteroidSize = Math.min( find a good spot
        INITIAL_ASTEROID_SIZE + (level * ASTEROID_SIZE_INCREMENT),eroidSize : canvasWidth - currentAsteroidSize;
        MAX_ASTEROID_SIZE        y = (Math.random() < 0.5) ? currentAsteroidSize : canvasHeight - currentAsteroidSize;
    );
           }
    // Update the level display with highlight effect    } while (
    updateLevelIndicator(level);lose to the ship
    feDistance
    // Show level announcement when starting a new level
    showLevelAnnouncement();   
           // Increase asteroid speed and jaggedness with level
    // Calculate safe spawn distance from ship (increases slightly with level)        const speedMultiplier = 1 + level * 0.1;
    const safeDistance = currentAsteroidSize * 2 + (level * 5); level * 0.05;
    const shipX = ship.x;
    const shipY = ship.y;peedMultiplier, jaggednessMultiplier));
       }
    // Create asteroids more efficiently    
    for (let i = 0; i < numAsteroids; i++) {l up sound if not the first level
        let x, y;d && sounds.levelUp) {
        let attempts = 0;;
        const MAX_ATTEMPTS = 10; // Prevent infinite loops
        
        do {
            // Generate random position
            x = Math.random() * canvasWidth; distBetweenPoints(x1, y1, x2, y2) {
            y = Math.random() * canvasHeight;(x2 - x1, 2) + Math.pow(y1 - y2, 2));
            attempts++;
            
            // Break after maximum attempts to avoid infinite loops
            if (attempts >= MAX_ATTEMPTS) {
                // Place at a corner if we can't find a good spotModernStyle) {
                x = (Math.random() < 0.5) ? currentAsteroidSize : canvasWidth - currentAsteroidSize;hip
                y = (Math.random() < 0.5) ? currentAsteroidSize : canvasHeight - currentAsteroidSize;
                break;
            }x.fillStyle = MODERN_COLORS.ship;
        } while (
            // Ensure asteroids don't spawn too close to the ship
            distBetweenPoints(shipX, shipY, x, y) < safeDistance
        );x.moveTo(
        ip.radius * Math.cos(angle), 
        // Increase asteroid speed and jaggedness with level * ship.radius * Math.sin(angle)
        const speedMultiplier = 1 + level * 0.1;
        const jaggednessMultiplier = 1 + level * 0.05;ctx.lineTo(
         * (2/3 * Math.cos(angle) + Math.sin(angle)),
        asteroids.push(createAsteroid(x, y, currentAsteroidSize, speedMultiplier, jaggednessMultiplier)); (2/3 * Math.sin(angle) - Math.cos(angle))
    }
    lineTo(
    // Play level up sound if not the first level (2/3 * Math.cos(angle) - Math.sin(angle)),
    if (level > 0 && soundEnabled && sounds.levelUp) {* (2/3 * Math.sin(angle) + Math.cos(angle))
        sounds.levelUp();
    }
}
roke();
// Calculate distance between two points
function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y1 - y2, 2));
}x.fillStyle = MODERN_COLORS.thrust.inner;

// Draw the ship
function drawShip(x, y, angle) {
    if (isModernStyle) {x.moveTo(
        // Modern shipp.radius * (2/3 * Math.cos(angle)),
        ctx.strokeStyle = MODERN_COLORS.shipOutline;
        ctx.lineWidth = SHIP_SIZE / 15;
        ctx.fillStyle = MODERN_COLORS.ship;x.lineTo(
        ius * (4/3 * Math.cos(angle) + 0.5 * Math.sin(angle)),
        // Draw the ship bodyp.radius * (4/3 * Math.sin(angle) - 0.5 * Math.cos(angle))
        ctx.beginPath(););
        ctx.moveTo(
            x + 4/3 * ship.radius * Math.cos(angle), * (5/3 * Math.cos(angle)),
            y - 4/3 * ship.radius * Math.sin(angle))
        );
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) + Math.sin(angle)),ship.radius * (4/3 * Math.cos(angle) - 0.5 * Math.sin(angle)),
            y + ship.radius * (2/3 * Math.sin(angle) - Math.cos(angle))angle) + 0.5 * Math.cos(angle))
        );
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) - Math.sin(angle)),ll();
            y + ship.radius * (2/3 * Math.sin(angle) + Math.cos(angle))
        ); Engine glow effect
        ctx.closePath();lur = 10;
        ctx.fill();ODERN_COLORS.thrust.glow;
        ctx.stroke();7;
           ctx.beginPath();
        // Draw engine glow    ctx.arc(
        if (ship.thrusting) {s(angle),
            ctx.fillStyle = MODERN_COLORS.thrust.inner;* Math.sin(angle),
            
            // Draw the flame
            ctx.beginPath();
            ctx.moveTo(
                x - ship.radius * (2/3 * Math.cos(angle)),
                y + ship.radius * (2/3 * Math.sin(angle))r = 0;
            );ctx.globalAlpha = 1;
            ctx.lineTo(
                x - ship.radius * (4/3 * Math.cos(angle) + 0.5 * Math.sin(angle)),
                y + ship.radius * (4/3 * Math.sin(angle) - 0.5 * Math.cos(angle))nerable
            );0) {
            ctx.lineTo(
                x - ship.radius * (5/3 * Math.cos(angle)),th = SHIP_SIZE / 15;
                y + ship.radius * (5/3 * Math.sin(angle))7;
            );   ctx.beginPath();
            ctx.lineTo(ctx.arc(x, y, ship.radius * 1.2, 0, Math.PI * 2);
                x - ship.radius * (4/3 * Math.cos(angle) - 0.5 * Math.sin(angle)),);
                y + ship.radius * (4/3 * Math.sin(angle) + 0.5 * Math.cos(angle))
            );
            ctx.closePath();    ctx.fillStyle = MODERN_COLORS.shield.color;
            ctx.fill();pha = 0.2;
            ;
            // Engine glow effect(x, y, ship.radius * 1.1, 0, Math.PI * 2);
            ctx.shadowBlur = 10;
            ctx.shadowColor = MODERN_COLORS.thrust.glow;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(ship
                x - ship.radius * Math.cos(angle),
                y + ship.radius * Math.sin(angle),
                ship.radius * 0.6,
                0,();
                Math.PI * 2the ship
            );
            ctx.fill();
            ctx.shadowBlur = 0;  y - 4/3 * ship.radius * Math.sin(angle)
            ctx.globalAlpha = 1;
        }
        ctx.lineTo(
        // Draw shield while invulnerable* (2/3 * Math.cos(angle) + Math.sin(angle)),
        if (ship.blinkNum > 0) { (2/3 * Math.sin(angle) - Math.cos(angle))
            ctx.strokeStyle = MODERN_COLORS.shield.border;
            ctx.lineWidth = SHIP_SIZE / 15;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();dius * (2/3 * Math.cos(angle) - Math.sin(angle)),
            ctx.arc(x, y, ship.radius * 1.2, 0, Math.PI * 2);h.cos(angle))
            ctx.stroke();
            osePath();
            // Shield bubble
            ctx.fillStyle = MODERN_COLORS.shield.color;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(x, y, ship.radius * 1.1, 0, Math.PI * 2);x.strokeStyle = "yellow";
            ctx.fill();
            ctx.globalAlpha = 1;ter
        }
    } else {
        // Classic ship  y + ship.radius * (2/3 * Math.sin(angle))
        ctx.strokeStyle = "white";
        ctx.lineWidth = SHIP_SIZE / 20;eft
           ctx.lineTo(
        ctx.beginPath();           x - ship.radius * (4/3 * Math.cos(angle) + 0.5 * Math.sin(angle)),
        // Nose of the ship               y + ship.radius * (4/3 * Math.sin(angle) - 0.5 * Math.cos(angle))
        ctx.moveTo(            );
            x + 4/3 * ship.radius * Math.cos(angle), 
            y - 4/3 * ship.radius * Math.sin(angle)
        ); Math.cos(angle) - 0.5 * Math.sin(angle)),
        // Rear left/3 * Math.sin(angle) + 0.5 * Math.cos(angle))
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) + Math.sin(angle)),
            y + ship.radius * (2/3 * Math.sin(angle) - Math.cos(angle))    ctx.stroke();
        );
        // Rear right
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) - Math.sin(angle)),
            y + ship.radius * (2/3 * Math.sin(angle) + Math.cos(angle))hip
        );
        ctx.closePath();
        ctx.stroke();
        
        // Draw the thrusterRUP_TYPES.RAPID_FIRE] > 0 ? 1.5 : 1);
        if (ship.thrusting) {
            ctx.strokeStyle = "yellow";ERUP_TYPES.TRIPLE_SHOT] > 0) {
            ctx.beginPath();Triple shot - shoot three lasers at different angles
            // Rear centerconst spreadAngle = Math.PI / 16; // 11.25 degrees spread
            ctx.moveTo(
                x - ship.radius * (2/3 * Math.cos(angle)),er
                y + ship.radius * (2/3 * Math.sin(angle))
            );
            // Thruster left
            ctx.lineTo(
                x - ship.radius * (4/3 * Math.cos(angle) + 0.5 * Math.sin(angle)),erSpeed * Math.sin(ship.angle) / FPS,
                y + ship.radius * (4/3 * Math.sin(angle) - 0.5 * Math.cos(angle))
            ); explodeTime: 0
            // Thruster right});
            ctx.lineTo(
                x - ship.radius * (4/3 * Math.cos(angle) - 0.5 * Math.sin(angle)),
                y + ship.radius * (4/3 * Math.sin(angle) + 0.5 * Math.cos(angle))
            );
            ctx.closePath();adAngle),
            ctx.stroke();
        }erSpeed * Math.sin(ship.angle + spreadAngle) / FPS,
    }
} explodeTime: 0

// Shoot a laser from the ship
function shootLaser() {r
    // Check if we can shoot more lasers
    if (lasers.length < LASER_MAX) { spreadAngle),
        // Regular shotp.angle - spreadAngle),
        const laserSpeed = LASER_SPEED * (activePowerups[POWERUP_TYPES.RAPID_FIRE] > 0 ? 1.5 : 1);Angle) / FPS,
        erSpeed * Math.sin(ship.angle - spreadAngle) / FPS,
        if (activePowerups[POWERUP_TYPES.TRIPLE_SHOT] > 0) {
            // Triple shot - shoot three lasers at different angles explodeTime: 0
            const spreadAngle = Math.PI / 16; // 11.25 degrees spread   });
            } else {
            // Center laserle shot
            lasers.push({
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle), 4/3 * ship.radius * Math.cos(ship.angle),
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),       y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
                xv: laserSpeed * Math.cos(ship.angle) / FPS,        xv: laserSpeed * Math.cos(ship.angle) / FPS,
                yv: -laserSpeed * Math.sin(ship.angle) / FPS,
                dist: 0,
                explodeTime: 0
            });
            
            // Left laser
            lasers.push({laser sound
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle + spreadAngle),s.laser) {
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle + spreadAngle),
                xv: laserSpeed * Math.cos(ship.angle + spreadAngle) / FPS,
                yv: -laserSpeed * Math.sin(ship.angle + spreadAngle) / FPS,   
                dist: 0,       // Allow rapid fire by not resetting the space key if that powerup is active
                explodeTime: 0        if (activePowerups[POWERUP_TYPES.RAPID_FIRE] > 0) {
            });a shorter timeout before allowing next shot
            (() => {
            // Right laserse;
            lasers.push({ 100); // 100ms delay for rapid fire
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle - spreadAngle), {
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle - spreadAngle),iring rate
                xv: laserSpeed * Math.cos(ship.angle - spreadAngle) / FPS,e = false;
                yv: -laserSpeed * Math.sin(ship.angle - spreadAngle) / FPS,    }
                dist: 0,
                explodeTime: 0
            });
        } else {tart a new game
            // Regular single shot
            lasers.push({me state
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
                xv: laserSpeed * Math.cos(ship.angle) / FPS,;
                yv: -laserSpeed * Math.sin(ship.angle) / FPS,gameOver = false;
                dist: 0,
                explodeTime: 0
            });scoreElement.textContent = score;
        }
        
        // Play laser sound
        if (soundEnabled && sounds.laser) {ship = createShip();
            sounds.laser();
        }
        reateAsteroids();
        // Allow rapid fire by not resetting the space key if that powerup is active
        if (activePowerups[POWERUP_TYPES.RAPID_FIRE] > 0) {screen
            // Set a shorter timeout before allowing next shot
            setTimeout(() => {
                keys.space = false;/ Set modern style based on checkbox
            }, 100); // 100ms delay for rapid fireisModernStyle = startStyleToggle.checked;
        } else {d = isModernStyle;
            // Normal firing rate
            keys.space = false;if (isModernStyle) {
        }oids();
    }
}
   // Start audio
// Start a new game    if (audioContext && audioContext.state === 'suspended') {
function startGame() {
    // Set up initial game state
    score = 0;
    level = 0;
    lives = GAME_LIVES;particles = [];
    gameOver = false;
    e loop
    // Update displays   gameStarted = true;
    scoreElement.textContent = score;    gameLoop();
    livesElement.textContent = lives;
    
    // Create ship and asteroidsgame over
    ship = createShip();unction restartGame() {
    asteroids = [];    // Hide game over modal
    lasers = [];sList.remove("active");
    createAsteroids();
    
    // Hide start screen
    startScreen.classList.remove("active");
    
    // Set modern style based on checkbox
    isModernStyle = startStyleToggle.checked;ghScores() {
    styleToggle.checked = isModernStyle;howHighScoresModal();
    
    if (isModernStyle) {
        preRenderAsteroids();
        initializeParallaxStars(); // Initialize parallax stars if neededunction submitHighScore() {
        if (!nebulaBackground) {    // Get the player name (with validation)
            generateNebulaBackground();eInput.value.trim();
        }
    }
           alert("Please enter your name!");
    // Start audio        return;
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Reset particles
    particles = [];
    
    // Start game loop
    gameStarted = true;ighScoresModal.classList.remove("active");
    gameLoop();
}

// Restart the game after game over
function restartGame() {
    // Hide game over modal
    gameOverModal.classList.remove("active");
    
    // Set up a new game
    startGame();
}

// Show high scores
function showHighScores() {// Update the music button appearance
    showHighScoresModal();n() {
}

// Submit a high scoreList.remove("muted");
function submitHighScore() { else {
    // Get the player name (with validation)       musicToggle.textContent = "🎵";
    const name = playerNameInput.value.trim();        musicToggle.classList.add("muted");
    sList.add("muted");
    if (name === "") {
        alert("Please enter your name!");
        return;
    }// Start background music
    Music() {
    // Save the scoreontext) {
    saveHighScore(name, score);
}

// Close high scores modal
function closeHighScores() {ground music
    highScoresModal.classList.remove("active");BackgroundMusic() {
}Loop();

// Update the sound button appearance
function updateSoundButton() {
    if (soundEnabled) {rup(x, y) {
        soundToggle.textContent = "🔊";
        soundToggle.classList.remove("muted"); Object.values(POWERUP_TYPES);
    } else {() * types.length)];
        soundToggle.textContent = "🔇";
        soundToggle.classList.add("muted");   return {
    }        x: x,
}
) * POWERUP_SPEED / FPS) * (Math.random() < 0.5 ? 1 : -1),
// Update the music button appearanceP_SPEED / FPS) * (Math.random() < 0.5 ? 1 : -1),
function updateMusicButton() {    radius: POWERUP_SIZE / 2,
    if (musicEnabled) {
        musicToggle.textContent = "🎵"; FPS,
        musicToggle.classList.remove("muted");angle: 0,
    } else {.03
        musicToggle.textContent = "🎵";
        musicToggle.classList.add("muted");
        musicToggle.classList.add("muted");
    }
}

// Start background music
function playBackgroundMusic() {
    if (musicEnabled && audioContext) {
        setupMusicLoop();
    }
}r, glowColor;

// Stop background musicLD) {
function stopBackgroundMusic() {   color = "rgba(0, 200, 255, 0.8)";
    stopMusicLoop();            glowColor = "rgba(0, 150, 255, 0.5)";
}ype === POWERUP_TYPES.TRIPLE_SHOT) {
 255, 0.8)";
// Create a new powerup 0, 255, 0.5)";
function createPowerup(x, y) {IRE) {
    // Randomly select powerup typecolor = "rgba(255, 200, 0, 0.8)";
    const types = Object.values(POWERUP_TYPES);55, 150, 0, 0.5)";
    const type = types[Math.floor(Math.random() * types.length)];
    )";
    return {glowColor = "rgba(0, 200, 0, 0.5)";
        x: x,
        y: y,
        xv: (Math.random() * POWERUP_SPEED / FPS) * (Math.random() < 0.5 ? 1 : -1),le) {
        yv: (Math.random() * POWERUP_SPEED / FPS) * (Math.random() < 0.5 ? 1 : -1),le powerup
        radius: POWERUP_SIZE / 2,ctx.fillStyle = color;
        type: type,255, 0.8)";
        duration: POWERUP_DURATION * FPS,
        angle: 0,w effect
        rotation: Math.random() * 0.06 - 0.03
    };r;
}

// Draw powerups powerup.y, powerup.radius, 0, Math.PI * 2);
function drawPowerups() {
    ctx.lineWidth = SHIP_SIZE / 20;
    
    for (let i = 0; i < powerups.length; i++) {
        const powerup = powerups[i];55, 255, 255, 0.9)";
        
        // Set color based on powerup type
        let color, glowColor;
        
        if (powerup.type === POWERUP_TYPES.SHIELD) { POWERUP_TYPES.SHIELD) {
            color = "rgba(0, 200, 255, 0.8)";n
            glowColor = "rgba(0, 150, 255, 0.5)";ctx.beginPath();
        } else if (powerup.type === POWERUP_TYPES.TRIPLE_SHOT) {p.radius * 0.6, 0, Math.PI * 2);
            color = "rgba(255, 100, 255, 0.8)";
            glowColor = "rgba(200, 0, 255, 0.5)";ype === POWERUP_TYPES.TRIPLE_SHOT) {
        } else if (powerup.type === POWERUP_TYPES.RAPID_FIRE) {
            color = "rgba(255, 200, 0, 0.8)";th();
            glowColor = "rgba(255, 150, 0, 0.5)";owerup.radius * 0.5);
        } else {up.radius * 0.5);
            color = "rgba(0, 255, 0, 0.8)";powerup.radius * 0.4, powerup.radius * 0.5);
            glowColor = "rgba(0, 200, 0, 0.5)";
        }

        if (isModernStyle) {
            // Modern style powerup15;
            ctx.fillStyle = color;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";);
            
            // Draw glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = glowColor;
            beginPath();
            ctx.beginPath();.3, 0, dotSize, 0, Math.PI * 2);
            ctx.arc(powerup.x, powerup.y, powerup.radius, 0, Math.PI * 2);
            ctx.fill();ype === POWERUP_TYPES.RAPID_FIRE) {
            ctx.stroke();htning bolt)
            
            // Draw icon based on powerup type
            ctx.fillStyle = "rgba(255, 255, 255, 0.9)";powerup.radius * 0.2, 0);
            ctx.save();   ctx.lineTo(-powerup.radius * 0.2, 0);
            ctx.translate(powerup.x, powerup.y);    ctx.lineTo(powerup.radius * 0.2, powerup.radius * 0.6);
            ctx.rotate(powerup.angle);();
            
            if (powerup.type === POWERUP_TYPES.SHIELD) {// Extra life icon (heart)
                // Shield iconradius * 0.4;
                ctx.beginPath();
                ctx.arc(0, 0, powerup.radius * 0.6, 0, Math.PI * 2);    ctx.moveTo(0, r * 0.8);
                ctx.stroke();CurveTo(r * 1.5, -r * 1.5, r * 3, 0, 0, r * 2);
            } else if (powerup.type === POWERUP_TYPES.TRIPLE_SHOT) {rveTo(-r * 3, 0, -r * 1.5, -r * 1.5, 0, r * 0.8);
                // Triple shot icon
                ctx.beginPath();
                ctx.moveTo(0, -powerup.radius * 0.5);
                ctx.lineTo(-powerup.radius * 0.4, powerup.radius * 0.5);
                ctx.lineTo(powerup.radius * 0.4, powerup.radius * 0.5);
                ctx.closePath();
                ctx.stroke();
                
                // Draw 3 small dots
                const dotSize = powerup.radius * 0.15;
                ctx.beginPath();
                ctx.arc(-powerup.radius * 0.3, 0, dotSize, 0, Math.PI * 2);, powerup.y, powerup.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(0, 0, dotSize, 0, Math.PI * 2);
                ctx.fill();white";
                ctx.beginPath();Align = "center";
                ctx.arc(powerup.radius * 0.3, 0, dotSize, 0, Math.PI * 2);= "middle";
                ctx.fill();tx.font = "bold " + powerup.radius + "px Arial";
            } else if (powerup.type === POWERUP_TYPES.RAPID_FIRE) {
                // Rapid fire icon (lightning bolt)
                ctx.beginPath();   if (powerup.type === POWERUP_TYPES.SHIELD) {
                ctx.moveTo(-powerup.radius * 0.2, -powerup.radius * 0.6);           letter = "S";
                ctx.lineTo(powerup.radius * 0.2, 0);           } else if (powerup.type === POWERUP_TYPES.TRIPLE_SHOT) {
                ctx.lineTo(-powerup.radius * 0.2, 0);                letter = "T";
                ctx.lineTo(powerup.radius * 0.2, powerup.radius * 0.6); if (powerup.type === POWERUP_TYPES.RAPID_FIRE) {
                ctx.stroke();";
            } else {
                // Extra life icon (heart)
                const r = powerup.radius * 0.4;
                ctx.beginPath();
                ctx.moveTo(0, r * 0.8);.x, powerup.y);
                ctx.bezierCurveTo(r * 1.5, -r * 1.5, r * 3, 0, 0, r * 2);}
                ctx.bezierCurveTo(-r * 3, 0, -r * 1.5, -r * 1.5, 0, r * 0.8);
                ctx.fill();
            }
            
            ctx.restore();
            ctx.shadowBlur = 0;
        } else {
            // Retro style powerup
            ctx.strokeStyle = "white";owerups[i].x += powerups[i].xv;
            
            // Draw circle
            ctx.beginPath();
            ctx.arc(powerup.x, powerup.y, powerup.radius, 0, Math.PI * 2);
            ctx.stroke();
            // Handle powerup going off screen with wrapping
            // Draw identifying letter based on powerup type
            ctx.fillStyle = "white";
            ctx.textAlign = "center";canvas.width + powerups[i].radius) {
            ctx.textBaseline = "middle";dius;
            ctx.font = "bold " + powerup.radius + "px Arial";
            owerups[i].radius) {
            let letter = "";.height + powerups[i].radius;
            if (powerup.type === POWERUP_TYPES.SHIELD) {se if (powerups[i].y > canvas.height + powerups[i].radius) {
                letter = "S";owerups[i].radius;
            } else if (powerup.type === POWERUP_TYPES.TRIPLE_SHOT) {
                letter = "T";
            } else if (powerup.type === POWERUP_TYPES.RAPID_FIRE) {eck for collision with ship if not exploding
                letter = "R";f (!ship.exploding && detectCollision(ship, powerups[i])) {
            } else {       // Apply powerup effect
                letter = "L";        activatePowerup(powerups[i].type);
            }
            
            ctx.fillText(letter, powerup.x, powerup.y);
        }
    }// Play powerup sound
}

// Update powerups
function updatePowerups() {
    // Update existing powerup positions
    for (let i = powerups.length - 1; i >= 0; i--) {
        // Move the powerup   // Update active powerup timers
        powerups[i].x += powerups[i].xv;    for (let type in activePowerups) {
        powerups[i].y += powerups[i].yv;erups[type] > 0) {
        --;
        // Update rotation for visual effect
        powerups[i].angle += powerups[i].rotation;up when time runs out
        
        // Handle powerup going off screen with wrapping deactivatePowerup(type);
        if (powerups[i].x < 0 - powerups[i].radius) {       }
            powerups[i].x = canvas.width + powerups[i].radius;    }
        } else if (powerups[i].x > canvas.width + powerups[i].radius) {
            powerups[i].x = 0 - powerups[i].radius;
        }
        if (powerups[i].y < 0 - powerups[i].radius) {
            powerups[i].y = canvas.height + powerups[i].radius;
        } else if (powerups[i].y > canvas.height + powerups[i].radius) {
            powerups[i].y = 0 - powerups[i].radius;
        }
        
        // Check for collision with ship if not exploding
        if (!ship.exploding && detectCollision(ship, powerups[i])) {
            // Apply powerup effect
            activatePowerup(powerups[i].type);vePowerups[type] = POWERUP_DURATION * FPS;
            
            // Remove the powerup
            powerups.splice(i, 1);f (type === POWERUP_TYPES.SHIELD) {
                   // Activate shield (give invulnerability)
            // Play powerup sound        ship.blinkNum = Math.ceil(POWERUP_DURATION / SHIP_BLINK_DUR); // This will keep shield visual active
            if (soundEnabled) {= Math.ceil(POWERUP_DURATION / SHIP_BLINK_DUR);
                sounds.extraLife();PES.EXTRA_LIFE) {
            }
        }
    }
    
    // Update active powerup timerser for this one-time effect
    for (let type in activePowerups) {ctivePowerups[type] = 0;
        if (activePowerups[type] > 0) {
            activePowerups[type]--;
            
            // Deactivate powerup when time runs out
            if (activePowerups[type] <= 0) {unction deactivatePowerup(type) {
                deactivatePowerup(type);    // Reset powerup effects when they expire
            }
        } was from a powerup, not from respawn
    }
}
    }
// Activate a powerup
function activatePowerup(type) {
    // Reset timer if powerup already active powerups
    if (activePowerups[type]) {ctivePowerups[type] = 0;
        activePowerups[type] = POWERUP_DURATION * FPS;
        return;
    }
    
    // Set powerup active
    activePowerups[type] = POWERUP_DURATION * FPS;levelAnnouncementTime = 0;
    
    // Apply immediate effectsound
    if (type === POWERUP_TYPES.SHIELD) {dEnabled && sounds.levelUp) {
        // Activate shield (give invulnerability)elUp();
        ship.blinkNum = Math.ceil(POWERUP_DURATION / SHIP_BLINK_DUR); // This will keep shield visual active
        ship.blinkTime = Math.ceil(POWERUP_DURATION / SHIP_BLINK_DUR);
    } else if (type === POWERUP_TYPES.EXTRA_LIFE) {
        // Add extra lifenouncement
        lives++;ion drawLevelAnnouncement() {
        livesElement.textContent = lives;const progress = levelAnnouncementTime / LEVEL_ANNOUNCEMENT_DURATION;
        
        // No need to keep timer for this one-time effectcity - fade in and out
        activePowerups[type] = 0;
    }
}   // Fade in
    opacity = progress / 0.2;
// Deactivate a powerup> 0.8) {
function deactivatePowerup(type) {
    // Reset powerup effects when they expireopacity = (1.0 - progress) / 0.2;
    if (type === POWERUP_TYPES.SHIELD) {
        // Only reset shield if it was from a powerup, not from respawn
        if (ship.blinkNum > 0) {n stabilize
            ship.blinkNum = 0;
        }{
    }
    
    // Remove from active powerups
    activePowerups[type] = 0;isModernStyle) {
}nnouncement

// Add this function to display level announcements
function showLevelAnnouncement() {
    levelAnnouncementActive = true;
    levelAnnouncementTime = 0;LORS.levelUp.glow;
    
    // Play level up soundctx.arc(canvas.width / 2, canvas.height / 2, 150 * scale, 0, Math.PI * 2);
    if (level > 0 && soundEnabled && sounds.levelUp) {
        sounds.levelUp();
    }
}// Text shadow and glow

// Add this function to draw the level announcement
function drawLevelAnnouncement() {
    const progress = levelAnnouncementTime / LEVEL_ANNOUNCEMENT_DURATION;
    ctx.textAlign = "center";
    // Calculate opacity - fade in and outle";
    let opacity = 1.0;
    if (progress < 0.2) {
        // Fade in
        opacity = progress / 0.2;ctx.shadowBlur = 15;
    } else if (progress > 0.8) {
        // Fade out// Draw level text with a pulsing effect
        opacity = (1.0 - progress) / 0.2; * 5);
    }ial, sans-serif`;
    as.width / 2, canvas.height / 2 - 15);
    // Calculate scale - zoom in and then stabilize
    let scale = 1.0;// Draw smaller subtitle
    if (progress < 0.3) {shadowBlur = 5;
        scale = 0.5 + 0.5 * (progress / 0.3);le)}px Arial, sans-serif`;
    }t("GET READY", canvas.width / 2, canvas.height / 2 + 30);
    
    if (isModernStyle) {
        // Modern style level announcement
        round the text for modern mode
        // Background glowelAnnouncementTime < 0.5) {
        ctx.save();
        ctx.globalAlpha = opacity * 0.3;
        ctx.fillStyle = MODERN_COLORS.levelUp.glow;   
        ctx.beginPath();   } else {
        ctx.arc(canvas.width / 2, canvas.height / 2, 150 * scale, 0, Math.PI * 2);        // Retro style level announcement
        ctx.fill();
        ctx.restore();
        
        // Text shadow and glow    ctx.font = `bold ${Math.floor(50 * scale)}px Arial, sans-serif`;
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = MODERN_COLORS.levelUp.text;1}`, canvas.width / 2, canvas.height / 2);
        ctx.font = `bold ${Math.floor(60 * scale)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Add shadow effect
        ctx.shadowColor = MODERN_COLORS.levelUp.glow;
        ctx.shadowBlur = 15;!isModernStyle || !PARTICLES.enabled) return;
        
        // Draw level text with a pulsing effect
        const pulse = 1 + 0.05 * Math.sin(levelAnnouncementTime * 5);t centerX = canvas.width / 2;
        ctx.font = `bold ${Math.floor(60 * scale * pulse)}px Arial, sans-serif`;
        ctx.fillText(`LEVEL ${level + 1}`, canvas.width / 2, canvas.height / 2 - 15);
        articles to generate per frame
        // Draw smaller subtitle
        ctx.shadowBlur = 5;(let i = 0; i < particleCount; i++) {
        ctx.font = `${Math.floor(20 * scale)}px Arial, sans-serif`;h.random() * Math.PI * 2;
        ctx.fillText("GET READY", canvas.width / 2, canvas.height / 2 + 30); * 50;
        
        ctx.restore();gle) * distance;
        angle) * distance;
        // Add particle effects around the text for modern mode
        if (PARTICLES.enabled && levelAnnouncementTime < 0.5) { moving away from center
            createLevelAnnouncementParticles();nst speed = 0.5 + Math.random() * 1;
        }
        const vy = Math.sin(angle) * speed;
    } else {
        // Retro style level announcement
        ctx.save();* 2;
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "white"; MODERN_COLORS.levelUp.text,
        ctx.font = `bold ${Math.floor(50 * scale)}px Arial, sans-serif`;       "rgba(0, 255, 200, 0.8)",
        ctx.textAlign = "center";           "rgba(100, 255, 230, 0.7)",
        ctx.textBaseline = "middle";            "white"
        ctx.fillText(`LEVEL ${level + 1}`, canvas.width / 2, canvas.height / 2);
        ctx.restore();ath.random() * colors.length)];
    }
}
particles.push(createParticle(
// Add particles for level announcement
function createLevelAnnouncementParticles() {
    if (!isModernStyle || !PARTICLES.enabled) return;));
    
    // Create burst particles around the level text
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;tor(newLevel) {
    const particleCount = 3; // Number of particles to generate per frame
    ent.textContent = newLevel + 1; // Display level starting from 1 instead of 0
    for (let i = 0; i < particleCount; i++) {   
        const angle = Math.random() * Math.PI * 2;       // Add visual highlight effect to the level indicator
        const distance = 50 + Math.random() * 50;        levelIndicatorPulse = 1.0; // Start pulse effect
        
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;      levelElement.classList.add('level-highlight');
        
        // Velocity moving away from centerr animation completes
        const speed = 0.5 + Math.random() * 1;() => {
        const vx = Math.cos(angle) * speed;-highlight');
        const vy = Math.sin(angle) * speed;       }, 2000);
            }
        // Size and color
        const size = 1 + Math.random() * 2;
        const colors = [ styles for the level indicator highlight
            MODERN_COLORS.levelUp.text,CSS file or inline styles
            "rgba(0, 255, 200, 0.8)",
            "rgba(100, 255, 230, 0.7)",
            "white"out;
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];255, 200, 0.8);
        
        // Create particle with longer duration

















































































































































































































































































































































































}    ctx.closePath();    ctx.arcTo(x, y, x + width, y, radius);    ctx.arcTo(x, y + height, x, y, radius);    ctx.arcTo(x + width, y + height, x, y + height, radius);    ctx.arcTo(x + width, y, x + width, y + height, radius);    ctx.moveTo(x + radius, y);    ctx.beginPath();function roundedRect(ctx, x, y, width, height, radius) {// Helper function to draw rounded rectangles}    ctx.restore();        ctx.stroke();    ctx.shadowColor = MODERN_COLORS.ship;    ctx.shadowBlur = 5;    // Add glow effect        ctx.fill();        ctx.closePath();    ctx.lineTo(x - miniShipSize/2, y + miniShipSize/2);    ctx.lineTo(x - miniShipSize/2, y - miniShipSize/2);    ctx.moveTo(x + miniShipSize, y);    ctx.beginPath();        const miniShipSize = 8;    // Draw a mini version of the ship        ctx.lineWidth = 1;    ctx.fillStyle = MODERN_COLORS.ship;    ctx.strokeStyle = MODERN_COLORS.shipOutline;    // Ship body        ctx.save();function drawMiniShip(x, y) {// Helper function to draw mini ships for lives}    ctx.restore();        }        drawMiniShip(canvas.width - 90 + i * 25, 30);    for (let i = 0; i < lives; i++) {    // Draw ship icons for lives        ctx.fillText('LIVES', canvas.width - 145, 30);    ctx.textAlign = 'left';    ctx.font = '16px "Russo One", sans-serif';    ctx.fillStyle = '#ffffff';    ctx.shadowColor = MODERN_COLORS.ui.highlight;    ctx.shadowBlur = 3;    // Reset for lives        ctx.fillText((level + 1).toString(), canvas.width/2, 38);    }        ctx.fillStyle = '#ffffff';        ctx.font = 'bold 22px "Russo One", sans-serif';    } else {        ctx.fillStyle = MODERN_COLORS.levelUp.text;        ctx.shadowBlur = 10 * levelIndicatorPulse;        ctx.shadowColor = MODERN_COLORS.levelUp.text;        ctx.font = `bold ${Math.floor(22 * pulseScale)}px "Russo One", sans-serif`;        const pulseScale = 1 + levelIndicatorPulse * 0.5;    if (levelIndicatorPulse > 0) {    // Draw level with pulsing effect if recently changed        ctx.fillText('LEVEL', canvas.width/2, 25);    ctx.textAlign = 'center';    ctx.font = '16px "Russo One", sans-serif';        ctx.fillText(score.toLocaleString(), 145, 30);    ctx.textAlign = 'right';    ctx.font = 'bold 18px "Russo One", sans-serif';        ctx.fillText('SCORE', 25, 30);    ctx.textBaseline = 'middle';    ctx.textAlign = 'left';    ctx.font = '16px "Russo One", sans-serif';    ctx.fillStyle = '#ffffff';    // Draw labels and values with modern font        ctx.shadowBlur = 3;    // Reset shadow for text        ctx.stroke();    ctx.fill();    roundedRect(ctx, canvas.width - 160, 10, 150, hudHeight, cornerRadius);    // Top-right rounded rectangle for lives        ctx.stroke();    ctx.fill();    roundedRect(ctx, canvas.width/2 - 50, 10, 100, hudHeight, cornerRadius);    // Top-center rounded rectangle for level        ctx.stroke();    ctx.fill();    roundedRect(ctx, 10, 10, 150, hudHeight, cornerRadius);    // Top-left rounded rectangle for score        const cornerRadius = 10;    const hudHeight = 40;    // Draw HUD background        ctx.shadowBlur = visualEffects.hudGlowIntensity;    ctx.shadowColor = MODERN_COLORS.ui.highlight;    ctx.lineWidth = 2;    ctx.strokeStyle = MODERN_COLORS.ui.border;    ctx.fillStyle = 'rgba(0, 20, 40, 0.7)';    // HUD Container styles (top bar)        ctx.save();    // Apply HUD style        visualEffects.hudGlowIntensity = 5 + 2 * Math.sin(Date.now() / 1000);    // Pulse the HUD glow effect        if (!isModernStyle) return;function drawEnhancedHUD() {// Draw enhanced HUD with glowing effects}    }        if (screenShake < 0.1) screenShake = 0;        screenShake *= 0.9;        // Reduce shake over time                ctx.translate(shakeX, shakeY);        const shakeY = (Math.random() - 0.5) * screenShake;        const shakeX = (Math.random() - 0.5) * screenShake;        // Apply shake transformation    if (screenShake > 0) {function applyScreenShake() {// Apply screen shake effect in draw function}    screenShake = Math.min(screenShake + intensity, 10); // Cap at reasonable valuefunction addScreenShake(intensity) {// Add screen shake when asteroids are destroyed or ship is hit}    ctx.globalAlpha = 1.0;        }        }            ctx.shadowBlur = 0;                        ctx.fill();            ctx.arc(star.x, star.y, star.size * twinkleFactor, 0, Math.PI * 2);            ctx.beginPath();                        }                ctx.shadowColor = star.color;                ctx.shadowBlur = star.size * 2;            if (star.size > 1.5) {            // Add glow to larger stars                        ctx.fillStyle = star.color;            // Draw the star                        ctx.globalAlpha = star.alpha * twinkleFactor;            // Set alpha based on layer and twinkle                            Math.sin(star.twinkle.phase);            const twinkleFactor = 1 - star.twinkle.amount + star.twinkle.amount *             // Calculate twinkle effect                        const star = parallaxStars[i];        for (let i = 0; i < parallaxStars.length; i++) {    if (parallaxStars.length) {    // Draw parallax stars        }        ctx.globalAlpha = 1.0;        ctx.drawImage(nebulaBackground, 0, 0, canvas.width, canvas.height);        ctx.globalAlpha = visualEffects.nebulaBrightness;    if (nebulaBackground) {    // Draw pre-rendered nebula with animated brightness        ctx.fillRect(0, 0, canvas.width, canvas.height);    ctx.fillStyle = MODERN_COLORS.background;    // Fill with base color        if (!isModernStyle) return;function drawEnhancedBackground() {// Draw parallax starfield (enhanced background)}    visualEffects.nebulaBrightness = 0.5 + Math.sin(Date.now() / 10000) * 0.1;    visualEffects.backgroundHue = (visualEffects.backgroundHue + 0.05) % 360;    // Slowly change background hue for subtle color shifts        }        }            star.y = 0;        } else if (star.y > canvas.height) {            star.y = canvas.height;        if (star.y < 0) {        }            star.x = 0;        } else if (star.x > canvas.width) {            star.x = canvas.width;        if (star.x < 0) {        // Wrap stars around the screen edges                }            star.twinkle.phase -= Math.PI * 2;        if (star.twinkle.phase > Math.PI * 2) {        star.twinkle.phase += star.twinkle.speed / FPS;        // Update twinkle effect                star.y += parallaxY * star.speed;        star.x += parallaxX * star.speed;        // Move star based on speed (layer factor) and ship movement                const star = parallaxStars[i];    for (let i = 0; i < parallaxStars.length; i++) {    // Update each star        const parallaxY = ship ? -ship.thrust.y * 0.5 : 0;    const parallaxX = ship ? -ship.thrust.x * 0.5 : 0;    // Move stars based on ship movement (creates parallax effect)        if (!isModernStyle || !parallaxStars.length) return;function updateParallaxStars() {// Update parallax stars (called in the update function)}    });        }            });                      (Math.random() > 0.5 ? "#8af" : "#faa") : "#fff"                color: Math.random() > 0.9 ?                 },                    phase: Math.random() * Math.PI * 2                    amount: 0.2 + Math.random() * 0.3,                    speed: 0.3 + Math.random() * 0.7,                twinkle: {                layer: layerIndex,                alpha: layer.alpha,                speed: layer.speed,                size: layer.size.min + Math.random() * (layer.size.max - layer.size.min),                y: Math.random() * (canvas ? canvas.height : 600),                x: Math.random() * (canvas ? canvas.width : 800),            parallaxStars.push({            // Create star with layer properties        for (let i = 0; i < layer.count; i++) {    layers.forEach((layer, layerIndex) => {    // Generate stars for each layer        ];        { count: 200, speed: 0.05, size: {min: 0.5, max: 1}, alpha: 0.6 }   // Back layer        { count: 100, speed: 0.1, size: {min: 1, max: 2}, alpha: 0.8 },     // Middle layer        { count: 50, speed: 0.2, size: {min: 1.5, max: 3}, alpha: 1.0 },    // Front layer    const layers = [    // Create 3 layers of stars with different speeds and densities        parallaxStars = [];    // Clear any existing starsfunction initializeParallaxStars() {// Initialize stars with parallax effect (multiple layers for depth)}    nebulaBackground = nebulaCanvas;    // Store the rendered nebula        }        nCtx.fill();        nCtx.arc(x, y, size, 0, Math.PI * 2);        nCtx.beginPath();                const size = 0.5 + Math.random();        const y = Math.random() * nebulaCanvas.height;        const x = Math.random() * nebulaCanvas.width;    for (let i = 0; i < starCount; i++) {        nCtx.fillStyle = "rgba(255, 255, 255, 0.4)";    const starCount = 200;    // Add subtle distant stars        }        }            nCtx.fill();            nCtx.arc(x, y, radius, 0, Math.PI * 2);            nCtx.beginPath();            nCtx.fillStyle = gradient;                        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);            const gradient = nCtx.createRadialGradient(x, y, 0, x, y, radius);            // Create radial gradient                        const radius = 50 + Math.random() * 150;            const y = Math.random() * nebulaCanvas.height;            const x = Math.random() * nebulaCanvas.width;        for (let i = 0; i < cloudCount / nebulaColors.length; i++) {        // Create several clouds with this color    for (const color of nebulaColors) {    // For each cloud color        ];        {r: 0, g: 30, b: 30, a: 0.12}   // Teal        {r: 40, g: 0, b: 20, a: 0.1},   // Deep red        {r: 0, g: 20, b: 40, a: 0.15},  // Deep blue        {r: 20, g: 0, b: 50, a: 0.2},  // Purple    const nebulaColors = [    // Draw multiple nebula clouds with different colors        const cloudCount = Math.floor((nebulaCanvas.width * nebulaCanvas.height) / 50000);    // Add nebula clouds        nCtx.fillRect(0, 0, nebulaCanvas.width, nebulaCanvas.height);    nCtx.fillStyle = MODERN_COLORS.background;    // Create a dark base        const nCtx = nebulaCanvas.getContext('2d');    nebulaCanvas.height = canvas ? canvas.height : 600;    nebulaCanvas.width = canvas ? canvas.width : 800;    const nebulaCanvas = document.createElement('canvas');    // Create offscreen canvas for the nebulafunction generateNebulaBackground() {// Pre-render a nebula background for better performance*/}    100% { transform: scale(1); }    60% { transform: scale(1.2); }    50% { transform: scale(1.3); }    40% { transform: scale(1.2); }    30% { transform: scale(1.4); }    20% { transform: scale(1.2); }    10% { transform: scale(1.5); }    0% { transform: scale(1); }@keyframes levelPulse {}    text-shadow: 0 0 8px rgba(0, 255, 200, 0.8);    color: #00ffcc;    animation: levelPulse 2s ease-out;.level-highlight {/*// This needs to be added to your CSS file or inline styles// At the end of the file, add CSS styles for the level indicator highlight}    }        }, 2000);            levelElement.classList.remove('level-highlight');        setTimeout(() => {        // Remove highlight class after animation completes                levelElement.classList.add('level-highlight');        // Add visual highlight class                levelIndicatorPulse = 1.0; // Start pulse effect        // Add visual highlight effect to the level indicator                levelElement.textContent = newLevel + 1; // Display level starting from 1 instead of 0    if (levelElement) {function updateLevelIndicator(newLevel) {// Add this function to enhance the top bar level indicator}    }        ));            0.8 + Math.random() * 0.4            x, y, vx, vy, size, color,         particles.push(createParticle(@keyframes levelPulse {
    0% { transform: scale(1); }
    10% { transform: scale(1.5); }
    20% { transform: scale(1.2); }
    30% { transform: scale(1.4); }
    40% { transform: scale(1.2); }
    50% { transform: scale(1.3); }
    60% { transform: scale(1.2); }
    100% { transform: scale(1); }
}
*/