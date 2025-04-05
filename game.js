// Game constants
const FPS = 60; // frames per second
const FRICTION = 7; // friction coefficient (0 = no friction, 1 = lots of friction)
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
let screenShake = 0; // Screen shake intensity for visual effects

// Visual effects settings for modern rendering
let visualEffects = {
    nebulaBrightness: 0.5, // Default opacity for nebula background
    hudGlowIntensity: 5,   // Default glow intensity for HUD elements
    starTwinkleSpeed: 1.0, // Multiplier for star twinkling speed
    explosionScale: 1.0    // Scale for explosion effects
};

// Enhanced splash screen variables
let splashCanvas, splashCtx;
let splashStars = [];
let titleParticles = [];
let splashAsteroids = [];
let titlePulse = 0;
let logoRotation = 0;
let splashAnimationId;
let buttonHoverEffects = {};

// DOM elements - organized by category
// Game UI elements
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const levelElement = document.getElementById("level");

// Modal and screen elements
const finalScoreElement = document.getElementById("finalScore");
const gameOverModal = document.getElementById("gameOverModal");
const startScreen = document.getElementById("startScreen");

// Button elements
const restartButton = document.getElementById("restartButton");
const startButton = document.getElementById("startButton");

// Control elements
const styleToggle = document.getElementById("styleToggle");
const startStyleToggle = document.getElementById("startStyleToggle");
const soundToggle = document.getElementById("soundToggle");
const musicToggle = document.getElementById("musicToggle");
const startSoundToggle = document.getElementById("startSoundToggle");
const startMusicToggle = document.getElementById("startMusicToggle");

// High Score elements
const highScoreInput = document.getElementById("highScoreInput");
const playerNameInput = document.getElementById("playerName");
const submitScoreButton = document.getElementById("submitScore");
const viewHighScoresButton = document.getElementById("viewHighScores");
const startHighScoresButton = document.getElementById("startHighScores");
const highScoresModal = document.getElementById("highScoresModal");
const highScoresList = document.getElementById("highScoresList");
const closeHighScoresButton = document.getElementById("closeHighScores");

// Mobile control elements
const mobileControls = document.getElementById("mobileControls");
const thrustButton = document.getElementById("thrustButton");
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const fireButton = document.getElementById("fireButton");

// Modern style colors
const MODERN_COLORS = {
    ship: "#00ffff",
    shipOutline: "#0099ff",
    shipEngine: "#33ccff", // Added for engine glow
    thrust: {
        inner: "#ff3300",
        outer: "#ff9900",
        glow: "#ffcc00"
    },
    asteroid: {
        large: {
            fill: "#5555aa",
            outline: "#7777cc"
        },
        medium: {
            fill: "#7777cc", 
            outline: "#9999ee"
        },
        small: {
            fill: "#9999ee",
            outline: "#aaaaff"
        }
    },
    laser: {
        core: "#ff00ff",
        glow: "#ff66ff",
        trail: "rgba(255, 0, 255, 0.3)"
    },
    explosion: [
        "#ffffff", // center
        "#ffff00", // inner,
        "#ff6600", // middle
        "#ff0000", // outer
        "#990000"  // edge
    ],
    background: "#080820",
    stars: {
        small: "#6666aa", 
        medium: "#9999dd", 
        large: "#ffffff",
        twinkle: "#aaccff"
    },
    shield: {
        color: "rgba(0, 200, 255, 0.3)",
        border: "rgba(0, 150, 255, 0.8)"
    },
    ui: {
        highlight: "#00ccff",
        text: "#ffffff",
        background: "rgba(0, 30, 60, 0.7)",
        border: "rgba(0, 150, 255, 0.5)"
    },
    levelUp: {
        text: "#00ffcc",
        glow: "rgba(0, 255, 200, 0.5)"
    }
};

// Particle effects
const PARTICLES = {
    enabled: true, // turn particle effects on/off
    count: {
        shipExplosion: 40,
        asteroidExplosion: {
            large: 25, 
            medium: 15, 
            small: 10 
        },
        thrust: 5,
        laserTrail: 2,
        shield: 3
    },
    duration: {
        shipExplosion: 1.5,
        asteroidExplosion: 1.0,
        thrust: 0.3, 
        laserTrail: 0.4,
        shield: 1.0 
    },
    size: {
        shipExplosion: {min: 1, max: 3},
        asteroidExplosion: {min: 0.5, max: 2.5},
        thrust: {min: 0.5, max: 2},
        laserTrail: {min: 0.5, max: 1.5},
        shield: {min: 1, max: 2}
    }
};

// Performance optimization variables
let lastTime = 0;
let deltaTime = 0;
let fpsInterval = 1000 / FPS;
let frameCount = 0;
let currentFps = 0;
let lastFpsUpdate = 0;
let offscreenCanvas = null;
let offscreenCtx = null;
let asteroidBuffers = {}; // Pre-rendered asteroid graphics

// Enhance Firebase error handling
function setupFirebase() {
    try {
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        // Initialize Firestore
        db = firebase.firestore();
        // Log Firestore settings for debugging
        console.log("Firestore initialized with settings:", firebaseConfig);
        // Load high scores initially
        loadHighScores();
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        alert("Failed to connect to Firebase. High scores will not be saved.");
    }
}

// Enhance error handling and debugging for Firestore requests
function loadHighScores() {
    if (!db) {
        console.error("Firestore database is not initialized.");
        return;
    }
    db.collection("highScores")
        .orderBy("score", "desc")
        .limit(HIGH_SCORES_COUNT)
        .get()
        .then((querySnapshot) => {
            highScores = [];
            querySnapshot.forEach((doc) => {
                highScores.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        })
        .catch((error) => {
            console.error("Error loading high scores:", error);
            alert("Failed to load high scores. Please check your network connection and Firestore configuration.");
        });
}

// Display high scores in the modal
function displayHighScores() {
    // Clear previous content
    highScoresList.innerHTML = '';
    if (highScores.length === 0) {
        highScoresList.innerHTML = '<div class="no-scores">No high scores yet. Be the first!</div>';
        return;
    }
    
    // Create high score entries
    highScores.forEach((score, index) => {
        const scoreEntry = document.createElement('div');
        scoreEntry.className = 'highscore-entry';
        // Highlight the new high score
        if (isNewHighScore && index === newHighScoreRank) {
            scoreEntry.classList.add('new');
        }
        
        scoreEntry.innerHTML = `
            <span class="rank">${index + 1}.</span>
            <span class="name">${score.name}</span>
            <span class="score">${score.score.toLocaleString()}</span>
        `;
        
        highScoresList.appendChild(scoreEntry);
    });
}

// Check if the current score is a high score
function checkHighScore(score) {
    if (highScores.length < HIGH_SCORES_COUNT) {
        // Less than the maximum number of high scores, so this is automatically a high score
        return true;
    }
    
    // Check if the score is higher than the lowest high score
    return score > highScores[highScores.length - 1].score;
}

// Save a new high score to Firebase
function saveHighScore(name, score) {
    if (!db) return;
    db.collection("highScores").add({
        name: name,
        score: score,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        // Reload high scores after adding a new one
        loadHighScores();
        // Hide the input form
        highScoreInput.style.display = "none";
        // Show the high scores
        setTimeout(() => {
            showHighScoresModal();
        }, 500);
    })
    .catch((error) => {
        console.error("Error saving high score:", error);
        alert("There was an error saving your score. Please try again.");
    });
}

// Show the high scores modal
function showHighScoresModal() {
    // Load the latest high scores before showing the modal
    if (db) {
        db.collection("highScores")
            .orderBy("score", "desc")
            .limit(HIGH_SCORES_COUNT)
            .get()
            .then((querySnapshot) => {
                highScores = [];
                querySnapshot.forEach((doc) => {
                    highScores.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                // Display the high scores
                displayHighScores();
                // Show the modal
                highScoresModal.classList.add("active");
            })
            .catch((error) => {
                console.error("Error loading high scores:", error);
            });
    } else {
        // Display whatever we have locally if Firebase is not initialized
        displayHighScores();
        highScoresModal.classList.add("active");
    }
}

// Hide the high scores modal
function hideHighScoresModal() {
    highScoresModal.classList.remove("active");
}

// Initialize audio context and load sounds
function setupAudio() {
    try {
        // Create audio context
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        // Apply initial audio settings from UI
        soundEnabled = startSoundToggle.checked;
        musicEnabled = startMusicToggle.checked;
        
        // Update UI buttons
        updateAudioButtonAppearance();
        
        // Create sounds
        if (soundEnabled) {
            loadSounds();
        }
        
        if (musicEnabled) {
            setupMusicLoop();
        }
    } catch (e) {
        console.error("Web Audio API not supported in this browser", e);
        soundEnabled = false;
        musicEnabled = false;
        updateAudioButtonAppearance();
    }
}

// Update the appearance of audio buttons based on current state
function updateAudioButtonAppearance() {
    // During game
    if (soundEnabled) {
        soundToggle.classList.remove('muted');
        soundToggle.textContent = '🔊';
    } else {
        soundToggle.classList.add('muted');
        soundToggle.textContent = '🔇';
    }
    
    if (musicEnabled) {
        musicToggle.classList.remove('muted');
        musicToggle.textContent = '🎵';
    } else {
        musicToggle.classList.add('muted');
        musicToggle.textContent = '🎵';
    }
    
    // Start screen
    startSoundToggle.checked = soundEnabled;
    startMusicToggle.checked = musicEnabled;
}

// Load all game sounds
function loadSounds() {
    // Define the sound types we need
    const soundTypes = {
        laser: { type: "sine", frequency: 880, duration: 0.1, 
                 attack: 0.01, decay: 0.1, fadeOut: 0.1, volume: 0.3, 
                 pitchRamp: true, rampValue: 1200 },
        thrustLoop: { type: "sawtooth", frequency: 65, duration: 0.1, 
                      modulation: true, modFreq: 10, modDepth: 50, 
                      attack: 0.01, decay: 0, fadeOut: 0.05, volume: 0.15 },
        smallExplosion: { type: "white", duration: 0.3, 
                          attack: 0.01, decay: 0.2, fadeOut: 0.1, 
                          filterFreq: 800, volume: 0.3, pitchRamp: true, rampValue: -400 },
        mediumExplosion: { type: "white", duration: 0.5, volume: 0.3, 
                           attack: 0.01, decay: 0.3, fadeOut: 0.2, 
                           filterFreq: 500, volume: 0.4, pitchRamp: true, rampValue: -200 },
        largeExplosion: { type: "white", duration: 0.7, 
                          attack: 0.01, decay: 0.5, fadeOut: 0.2, 
                          filterFreq: 300, volume: 0.5, pitchRamp: true, rampValue: -100 },
        extraLife: { type: "sine", frequency: 440, duration: 0.6, 
                     attack: 0.01, decay: 0.3, fadeOut: 0.1, volume: 0.5, sequence: [440, 660, 880] },
        
        levelUp: { type: "triangle", frequency: 220, duration: 0.8, 
                   attack: 0.01, decay: 0.5, fadeOut: 0.1, volume: 0.4, sequence: [220, 330, 440, 550, 660] }
    };
    
    // Generate all sounds
    for (const [name, params] of Object.entries(soundTypes)) {
        sounds[name] = (params.sequence) ? 
            createSequenceSound(params) : 
            createSound(params);
    }
}

// Create a sound generator based on parameters
function createSound(params) {
    return function() {
        if (!soundEnabled || !audioContext) return;
        
        const startTime = audioContext.currentTime;
        const endTime = startTime + params.duration;
        
        // Create oscillator or noise source
        let source;
        if (params.type === "white") {
            // Create noise
            const bufferSize = audioContext.sampleRate * params.duration;
            const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
            const data = buffer.getChannelData(0);
            
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
            
            source = audioContext.createBufferSource();
            source.buffer = buffer;
        } else {
            // Create oscillator
            source = audioContext.createOscillator();
            source.type = params.type;
            source.frequency.setValueAtTime(params.frequency, startTime);
            // Apply pitch ramp if needed
            if (params.pitchRamp) {
                source.frequency.linearRampToValueAtTime(
                    params.frequency + params.rampValue, 
                    endTime
                );
            }
        }
        
        // Create gain node for volume control
        const gainNode = audioContext.createGain();
        
        // Set up envelope
        const attackTime = startTime + params.attack;
        const decayTime = attackTime + params.decay;
        const fadeTime = endTime - params.fadeOut;
        
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(params.volume, attackTime);
        gainNode.gain.linearRampToValueAtTime(params.volume * 0.7, decayTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, fadeTime);
        gainNode.gain.linearRampToValueAtTime(0, endTime);
        
        // Apply filter for noise sounds
        if (params.type === "white" && params.filterFreq) {
            const filter = audioContext.createBiquadFilter();
            filter.type = "lowpass";
            filter.frequency.value = params.filterFreq;
            source.connect(filter);
            filter.connect(gainNode);
        } else {
            source.connect(gainNode);
        }
        
        // Apply modulation if needed
        if (params.modulation) {
            const modulator = audioContext.createOscillator();
            modulator.frequency.value = params.modFreq;
            const modulatorGain = audioContext.createGain();
            modulatorGain.gain.value = params.modDepth;
            modulator.connect(modulatorGain);
            modulatorGain.connect(source.frequency);
            modulator.start(startTime);
            modulator.stop(endTime);
        }
        
        gainNode.connect(audioContext.destination);
        
        // Start and stop the sound
        source.start(startTime);
        source.stop(endTime);
        
        // Return the source for potential early stopping
        return source;
    };
}

// Create a sequence of tones
function createSequenceSound(params) {
    return function() {
        if (!soundEnabled || !audioContext) return;
        
        let startTime = audioContext.currentTime;
        const toneDuration = params.duration / params.sequence.length;
        
        params.sequence.forEach((frequency, i) => {
            const oscillator = audioContext.createOscillator();
            oscillator.type = params.type;
            oscillator.frequency.value = frequency;
            
            const gainNode = audioContext.createGain();
            const noteStart = startTime + (i * toneDuration);
            const noteEnd = noteStart + toneDuration;
            const attackTime = noteStart + params.attack;
            const decayTime = attackTime + params.decay;
            const fadeTime = noteEnd - params.fadeOut;
            
            gainNode.gain.setValueAtTime(0, noteStart);
            gainNode.gain.linearRampToValueAtTime(params.volume, attackTime);
            gainNode.gain.linearRampToValueAtTime(params.volume * 0.7, decayTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, fadeTime);
            gainNode.gain.linearRampToValueAtTime(0, noteEnd);
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.start(noteStart);
            oscillator.stop(noteEnd);
        });
    };
}

// Create and start thrust sound (continuous while thrusting)
function startThrustSound() {
    if (!soundEnabled || thrustSound !== null || !audioContext) return;
    
    // Create continuous sound for thruster
    const oscillator = audioContext.createOscillator();
    oscillator.type = "sawtooth";
    oscillator.frequency.value = 65;
    
    // Add modulation for rumble effect
    const modulator = audioContext.createOscillator();
    modulator.frequency.value = 10;
    const modulatorGain = audioContext.createGain();
    modulatorGain.gain.value = 50;
    modulator.connect(modulatorGain);
    modulatorGain.connect(oscillator.frequency);
    
    // Add noise for texture
    const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.1, audioContext.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
        noiseData[i] = Math.random() * 2 - 1;
    }
    const noise = audioContext.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    
    const noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 1000;
    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.05;
    
    // Main gain node
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0.15;
    
    // Connect all nodes
    oscillator.connect(gainNode);
    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Start sounds
    oscillator.start();
    modulator.start();
    noise.start();
    
    // Store references to stop later
    thrustSound = {
        oscillator,
        modulator,
        noise,
        gainNode
    };
}

// Stop the thrust sound
function stopThrustSound() {
    if (!thrustSound) return;
    
    // Apply a short fade out
    const now = audioContext.currentTime;
    thrustSound.gainNode.gain.setValueAtTime(thrustSound.gainNode.gain.value, now);
    thrustSound.gainNode.gain.linearRampToValueAtTime(0, now + 0.1);
    
    // Schedule stop after fade
    setTimeout(() => {
        thrustSound.oscillator.stop();
        thrustSound.modulator.stop();
        thrustSound.noise.stop();
        thrustSound = null;
    }, 100);
}

// Set up background music
function setupMusicLoop() {
    if (!musicEnabled || !audioContext) return;
    
    // Create a simple, ambient background loop
    const createLoop = () => {
        const numNotes = 4;
        const loopDuration = 10; // 10 seconds loop
        const noteDuration = loopDuration / numNotes;
        
        // Base frequencies for ambient notes (A minor scale)
        const baseFreqs = [55, 58.27, 69.30, 82.41]; // A, C, A1, E1
        
        // Create oscillators for each note
        for (let i = 0; i < numNotes; i++) {
            const noteStart = i * noteDuration;
            
            // Create multiple layers for each note for rich texture
            for (let octave = 0; octave < 3; octave++) {
                const osc = audioContext.createOscillator();
                osc.type = ["sine", "triangle", "sine"][octave];
                
                // Calculate frequency (different octaves)
                const freq = baseFreqs[i] * Math.pow(2, octave);
                osc.frequency.value = freq;
                
                // Create gain node with long fade in/out for smooth transitions
                const gainNode = audioContext.createGain();
                gainNode.gain.value = 0;
                
                // Volume based on octave
                const maxVolume = [0.05, 0.03, 0.01][octave];
                
                // Create long envelope
                const fadeInTime = 1; // 1 second fade in
                const fadeOutTime = 1; // 1 second fade out
                
                gainNode.gain.setValueAtTime(0, noteStart);
                gainNode.gain.linearRampToValueAtTime(maxVolume, noteStart + fadeInTime);
                gainNode.gain.setValueAtTime(maxVolume, noteStart + noteDuration - fadeOutTime);
                gainNode.gain.linearRampToValueAtTime(0, noteStart + noteDuration);
                
                // Add a little chorus/detune effect
                osc.detune.value = (Math.random() * 10) - 5;
                
                // Connect nodes
                osc.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                // Schedule playback
                osc.start(audioContext.currentTime + noteStart);
                osc.stop(audioContext.currentTime + noteStart + noteDuration);
            }
        }
        
        // Schedule the next loop
        musicLoop = setTimeout(createLoop, loopDuration * 1000);
    };
    
    // Start the loop
    createLoop();
}

// Stop background music
function stopMusicLoop() {
    if (musicLoop) {
        clearTimeout(musicLoop);
        musicLoop = null;
    }
}

// Toggle sound on/off
function toggleSound() {
    soundEnabled = !soundEnabled;
    
    if (!soundEnabled && thrustSound) {
        stopThrustSound();
    }
    
    updateAudioButtonAppearance();
    return soundEnabled;
}

// Toggle music on/off
function toggleMusic() {
    musicEnabled = !musicEnabled;
    
    if (musicEnabled) {
        if (audioContext && audioContext.state === 'suspended') {
            audioContext.resume();
        }
        setupMusicLoop();
    } else {
        stopMusicLoop();
    }
    
    updateAudioButtonAppearance();
    return musicEnabled;
}

// Play appropriate explosion sound based on size
function playExplosionSound(size) {
    if (!soundEnabled) return;
    
    // Ensure audio context is running
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    if (size === ASTEROID_SIZE) {
        sounds.largeExplosion();
    } else if (size === ASTEROID_SIZE / 2) {
        sounds.mediumExplosion();
    } else {
        sounds.smallExplosion();
    }
}

// Set up the canvas and context
function setupCanvas() {
    canvas = document.getElementById("gameCanvas");
    ctx = canvas.getContext("2d");
    // Set canvas to full window size
    resizeCanvas();
    window.addEventListener("resize", debounce(resizeCanvas, 250));
    // Create offscreen canvas for better performance
    offscreenCanvas = document.createElement('canvas');
    offscreenCtx = offscreenCanvas.getContext('2d');
    // Initialize stars for background
    initializeStars();
}

// Debounce function to limit resize events
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Resize canvas to fit window with performance optimizations
function resizeCanvas() {
    // Get the actual display size
    const containerWidth = canvas.parentElement.clientWidth;
    const containerHeight = canvas.parentElement.clientHeight;
    // Set canvas size
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // Also resize the offscreen canvas
    if (offscreenCanvas) {
        offscreenCanvas.width = containerWidth;
        offscreenCanvas.height = containerHeight;
    }
    
    // Reinitialize stars when canvas size changes
    if (isModernStyle) {
        initializeStars();
        // Re-render asteroids for the new size
        preRenderAsteroids();
    }
}

// Pre-render asteroids for better performance
function preRenderAsteroids() {
    const sizes = [ASTEROID_SIZE, ASTEROID_SIZE/2, ASTEROID_SIZE/4];
    const types = Object.values(ASTEROID_TYPES);
    
    // Clear existing buffers
    asteroidBuffers = {};
    
    // Create a buffer for each asteroid size and type combination
    sizes.forEach(size => {
        types.forEach(type => {
            const key = `${size}-${type}`;
            // Create buffer canvas
            const buffer = document.createElement('canvas');
            const bufferSize = size * 2.5; // Add padding for jaggedness
            buffer.width = bufferSize;
            buffer.height = bufferSize;
            
            const bCtx = buffer.getContext('2d');
            
            // Create a sample asteroid
            const sampleAsteroid = {
                x: bufferSize / 2,
                y: bufferSize / 2,
                radius: size / 2,
                angle: 0,
                type: type,
                vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
                offs: []
            };
            
            // Generate random vertices
            for (let i = 0; i < sampleAsteroid.vert; i++) {
                sampleAsteroid.offs.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
            }
            
            // Get colors based on size and type
            let sizeCategory;
            if (size === ASTEROID_SIZE) sizeCategory = 'large';
            else if (size === ASTEROID_SIZE / 2) sizeCategory = 'medium';
            else sizeCategory = 'small';
            
            const typeColors = ASTEROID_TYPE_COLORS[type][sizeCategory];
            
            // Draw the asteroid body
            bCtx.fillStyle = typeColors.fill;
            bCtx.strokeStyle = typeColors.outline;
            bCtx.lineWidth = SHIP_SIZE / 20;
            
            // Draw the asteroid path
            bCtx.beginPath();
            for (let i = 0; i < sampleAsteroid.vert; i++) {
                let angle = sampleAsteroid.angle + (i * Math.PI * 2 / sampleAsteroid.vert);
                let radius = sampleAsteroid.radius * (1 + sampleAsteroid.offs[i]);
                
                if (i === 0) {
                    bCtx.moveTo(
                        sampleAsteroid.x + radius * Math.cos(angle),
                        sampleAsteroid.y + radius * Math.sin(angle)
                    );
                } else {
                    bCtx.lineTo(
                        sampleAsteroid.x + radius * Math.cos(angle),
                        sampleAsteroid.y + radius * Math.sin(angle)
                    );
                }
            }
            bCtx.closePath();
            bCtx.fill();
            bCtx.stroke();
            
            // Add type-specific details
            if (type === ASTEROID_TYPES.ROCKY || type === ASTEROID_TYPES.METALLIC) {
                // Add craters for rocky and metallic types
                const craterCount = Math.floor(sampleAsteroid.radius / 6);
                bCtx.fillStyle = typeColors.craters;
                for (let i = 0; i < craterCount; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const distance = Math.random() * sampleAsteroid.radius * 0.7;
                    const craterX = sampleAsteroid.x + Math.cos(angle) * distance;
                    const craterY = sampleAsteroid.y + Math.sin(angle) * distance;
                    const craterSize = Math.random() * sampleAsteroid.radius * 0.2 + sampleAsteroid.radius * 0.05;
                    bCtx.beginPath();
                    bCtx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
                    bCtx.fill();
                }
                // Add a subtle highlight (different for each type)
                if (type === ASTEROID_TYPES.ROCKY) {
                    bCtx.fillStyle = "rgba(255, 255, 255, 0.07)";
                } else { // METALLIC
                    bCtx.fillStyle = "rgba(255, 220, 150, 0.15)";
                }
            } else {
                // ICY type - add crystalline patterns
                bCtx.fillStyle = "rgba(255, 255, 255, 0.15)";
                // Add shine lines
                for (let i = 0; i < 4; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const startX = sampleAsteroid.x + Math.cos(angle) * (sampleAsteroid.radius * 0.2);
                    const startY = sampleAsteroid.y + Math.sin(angle) * (sampleAsteroid.radius * 0.2);
                    const endX = sampleAsteroid.x + Math.cos(angle) * sampleAsteroid.radius * 0.8;
                    const endY = sampleAsteroid.y + Math.sin(angle) * sampleAsteroid.radius * 0.8;
                    
                    bCtx.beginPath();
                    bCtx.moveTo(startX, startY);
                    bCtx.lineTo(endX, endY);
                    bCtx.lineWidth = sampleAsteroid.radius * 0.1;
                    bCtx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                    bCtx.stroke();
                }
            }
            
            // Add a highlight to all asteroid types
            bCtx.beginPath();
            bCtx.arc(
                sampleAsteroid.x - sampleAsteroid.radius * 0.3, 
                sampleAsteroid.y - sampleAsteroid.radius * 0.3, 
                sampleAsteroid.radius * 0.4, 
                0, 
                Math.PI * 2
            );
            bCtx.fill();
            
            // Store the buffer
            asteroidBuffers[key] = {
                canvas: buffer,
                asteroid: sampleAsteroid
            };
        });
    });
}

// Draw the optimized asteroids
function drawAsteroid(asteroid) {
    const size = asteroid.radius * 2;
    if (isModernStyle) {
        // Update asteroid angle based on rotation speed
        asteroid.angle += asteroid.rotationSpeed || 0;
        // Use pre-rendered asteroid if available
        const bufferKey = `${size}-${asteroid.type || ASTEROID_TYPES.ROCKY}`;
        
        if (asteroidBuffers[bufferKey]) {
            // Draw the pre-rendered asteroid with rotation and enhanced effects
            ctx.save();
            ctx.translate(asteroid.x, asteroid.y);
            ctx.rotate(asteroid.angle);
            
            // Draw base asteroid image
            ctx.drawImage(
                asteroidBuffers[bufferKey].canvas,
                -asteroidBuffers[bufferKey].canvas.width/2, 
                -asteroidBuffers[bufferKey].canvas.height/2
            );
            
            // Add type-specific enhanced effects
            if (asteroid.type === ASTEROID_TYPES.ICY) {
                // Add crystalline reflection
                ctx.globalCompositeOperation = "lighter";
                ctx.globalAlpha = 0.2 + Math.sin(Date.now() / 1000) * 0.1;
                
                // Create reflection gradient
                const reflectionGradient = ctx.createLinearGradient(
                    -asteroid.radius/2, -asteroid.radius/2,
                    asteroid.radius/2, asteroid.radius/2
                );
                reflectionGradient.addColorStop(0, "rgba(200, 230, 255, 0.6)");
                reflectionGradient.addColorStop(0.5, "rgba(150, 200, 255, 0.2)");
                reflectionGradient.addColorStop(1, "rgba(100, 150, 255, 0)");
                
                ctx.fillStyle = reflectionGradient;
                ctx.fillRect(-asteroid.radius, -asteroid.radius, asteroid.radius*2, asteroid.radius*2);
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = 1;
            } 
            else if (asteroid.type === ASTEROID_TYPES.METALLIC) {
                // Add metallic shine
                ctx.globalAlpha = 0.3;
                
                // Create shine gradient
                const shinePos = Math.sin(Date.now() / 2000) * asteroid.radius * 0.5;
                const shineGradient = ctx.createRadialGradient(
                    shinePos, shinePos, 0,
                    shinePos, shinePos, asteroid.radius
                );
                shineGradient.addColorStop(0, "rgba(255, 240, 200, 0.5)");
                shineGradient.addColorStop(0.3, "rgba(255, 220, 150, 0.2)");
                shineGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
                
                ctx.fillStyle = shineGradient;
                ctx.beginPath();
                ctx.arc(shinePos, shinePos, asteroid.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
            
            ctx.restore();
            
            // Add atmospheric glow around asteroid
            ctx.save();
            ctx.globalAlpha = asteroid.glowIntensity || 0.1;
            ctx.shadowBlur = 15;
            
            if (asteroid.type === ASTEROID_TYPES.ICY) {
                ctx.shadowColor = "rgba(100, 150, 255, 0.8)";
                const glowGradient = ctx.createRadialGradient(
                    asteroid.x, asteroid.y, asteroid.radius * 0.9,
                    asteroid.x, asteroid.y, asteroid.radius * 1.3
                );
                glowGradient.addColorStop(0, "rgba(100, 150, 255, 0.2)");
                glowGradient.addColorStop(1, "rgba(100, 150, 255, 0)");
                
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 1.3, 0, Math.PI * 2);
                ctx.fill();
            } 
            else if (asteroid.type === ASTEROID_TYPES.METALLIC) {
                ctx.shadowColor = "rgba(255, 200, 100, 0.6)";
                const glowGradient = ctx.createRadialGradient(
                    asteroid.x, asteroid.y, asteroid.radius * 0.8,
                    asteroid.x, asteroid.y, asteroid.radius * 1.1
                );
                glowGradient.addColorStop(0, "rgba(255, 200, 100, 0.1)");
                glowGradient.addColorStop(1, "rgba(255, 200, 100, 0)");
                
                ctx.fillStyle = glowGradient;
                ctx.beginPath();
                ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 1.1, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        } else {
            // Fallback to direct drawing if buffer not available
            // Get colors based on type and size
            let sizeCategory;
            if (size === ASTEROID_SIZE) sizeCategory = 'large';
            else if (size === ASTEROID_SIZE / 2) sizeCategory = 'medium';
            else sizeCategory = 'small';
            const type = asteroid.type || ASTEROID_TYPES.ROCKY;
            const colors = ASTEROID_TYPE_COLORS[type][sizeCategory];
            ctx.fillStyle = colors.fill;
            ctx.strokeStyle = colors.outline;
            ctx.lineWidth = SHIP_SIZE / 20;
            
            // Draw the asteroid path
            ctx.beginPath();
            for (let i = 0; i < asteroid.vert; i++) {
                let angle = asteroid.angle + (i * Math.PI * 2 / asteroid.vert);
                let radius = asteroid.radius * (1 + asteroid.offs[i]);
                
                if (i === 0) {
                    ctx.moveTo(
                        asteroid.x + radius * Math.cos(angle),
                        asteroid.y + radius * Math.sin(angle)
                    );
                } else {
                    ctx.lineTo(
                        asteroid.x + radius * Math.cos(angle),
                        asteroid.y + radius * Math.sin(angle)
                    );
                }
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    } else {
        // Original retro style drawing (unchanged)
        ctx.strokeStyle = "slategrey";
        ctx.lineWidth = SHIP_SIZE / 20;
        // Draw the asteroid path
        ctx.beginPath();
        for (let i = 0; i < asteroid.vert; i++) {
            let angle = asteroid.angle + (i * Math.PI * 2 / asteroid.vert);
            let radius = asteroid.radius * (1 + asteroid.offs[i]);
            
            if (i === 0) {
                ctx.moveTo(
                    asteroid.x + radius * Math.cos(angle),
                    asteroid.y + radius * Math.sin(angle)
                );
            } else {
                ctx.lineTo(
                    asteroid.x + radius * Math.cos(angle),
                    asteroid.y + radius * Math.sin(angle)
                );
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // Show collision circle
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
}

// Draw lasers
function drawLasers() {
    for (let i = 0; i < lasers.length; i++) {
        if (lasers[i].explodeTime === 0) {
            if (isModernStyle) {
                // Set up shadow for glow effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = MODERN_COLORS.laser.glow;
                
                // Create a gradient for the laser beam
                const laserGradient = ctx.createRadialGradient(
                    lasers[i].x, lasers[i].y, 0,
                    lasers[i].x, lasers[i].y, SHIP_SIZE / 8
                );
                laserGradient.addColorStop(0, "#ffffff");
                laserGradient.addColorStop(0.3, MODERN_COLORS.laser.core);
                laserGradient.addColorStop(0.7, MODERN_COLORS.laser.glow);
                laserGradient.addColorStop(1, "rgba(255, 100, 255, 0)");
                
                // Draw outer glow
                ctx.fillStyle = laserGradient;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw motion blur trail
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = MODERN_COLORS.laser.trail;
                ctx.beginPath();
                
                // Calculate trail points based on velocity
                const trailLength = Math.sqrt(Math.pow(lasers[i].xv, 2) + Math.pow(lasers[i].yv, 2)) * 0.8;
                const angle = Math.atan2(-lasers[i].yv, -lasers[i].xv);
                
                ctx.moveTo(lasers[i].x, lasers[i].y);
                ctx.lineTo(
                    lasers[i].x + Math.cos(angle + 0.3) * trailLength,
                    lasers[i].y + Math.sin(angle + 0.3) * trailLength
                );
                ctx.lineTo(
                    lasers[i].x + Math.cos(angle - 0.3) * trailLength,
                    lasers[i].y + Math.sin(angle - 0.3) * trailLength
                );
                ctx.closePath();
                ctx.fill();
                
                // Reset opacity
                ctx.globalAlpha = 1.0;
                
                // Draw inner core (brighter center)
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 20, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                // Retro laser
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2);
                ctx.fill();
            }
        } else {
            // Draw the explosion
            if (isModernStyle) {
                // Calculate explosion parameters
                const explosionProgress = lasers[i].explodeTime / LASER_EXPLODE_DUR;
                const radius = ship.radius * 0.75 * (0.75 + 0.5 * explosionProgress);
                
                // Create detailed explosion with multi-layered gradients
                // Outer explosion gradient
                const outerGradient = ctx.createRadialGradient(
                    lasers[i].x, lasers[i].y, radius * 0.5,
                    lasers[i].x, lasers[i].y, radius
                );
                outerGradient.addColorStop(0, "rgba(255, 200, 100, 0.7)");
                outerGradient.addColorStop(0.5, "rgba(255, 100, 0, 0.5)");
                outerGradient.addColorStop(1, "rgba(100, 0, 0, 0)");
                
                // Inner explosion gradient
                const innerGradient = ctx.createRadialGradient(
                    lasers[i].x, lasers[i].y, 0,
                    lasers[i].x, lasers[i].y, radius * 0.5
                );
                innerGradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
                innerGradient.addColorStop(0.3, "rgba(255, 255, 150, 0.9)");
                innerGradient.addColorStop(1, "rgba(255, 200, 0, 0.5)");
                
                // Draw shockwave
                ctx.globalAlpha = (1 - explosionProgress) * 0.7;
                ctx.strokeStyle = "rgba(255, 200, 100, 0.8)";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, radius * (0.8 + explosionProgress * 0.5), 0, Math.PI * 2);
                ctx.stroke();
                
                // Reset alpha
                ctx.globalAlpha = 1.0;
                
                // Draw outer explosion
                ctx.fillStyle = outerGradient;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw inner explosion
                ctx.fillStyle = innerGradient;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
                
                // Add highlights
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.arc(
                    lasers[i].x + radius * 0.2, 
                    lasers[i].y - radius * 0.2, 
                    radius * 0.1, 
                    0, Math.PI * 2
                );
                ctx.fill();
                
                // Reset alpha
                ctx.globalAlpha = 1.0;
                
                // Add particles
                if (explosionProgress < 0.3 && PARTICLES.enabled) {
                    const particleCount = 3;
                    for (let j = 0; j < particleCount; j++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 0.5 + Math.random() * 1.5;
                        const size = 1 + Math.random();
                        particles.push(createParticle(
                            lasers[i].x, 
                            lasers[i].y, 
                            Math.cos(angle) * speed, 
                            Math.sin(angle) * speed, 
                            size,
                            explosionProgress < 0.15 ? "#ffffff" : "#ffcc00",
                            0.3
                        ));
                    }
                }
            } else {
                // Retro explosion
                ctx.fillStyle = "orangered";
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.75, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "salmon";
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = "pink";
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, ship.radius * 0.25, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
}

// Detect collision between objects
function detectCollision(obj1, obj2) {
    return distBetweenPoints(obj1.x, obj1.y, obj2.x, obj2.y) < obj1.radius + obj2.radius;
}

// Handle game over
function handleGameOver() {
    gameOver = true;
    finalScoreElement.textContent = score;
    
    // Check if this is a high score
    isNewHighScore = checkHighScore(score);
    if (isNewHighScore) {
        // Find the rank of the new high score
        newHighScoreRank = highScores.findIndex(entry => score > entry.score);
        if (newHighScoreRank === -1) {
            newHighScoreRank = highScores.length;
        }
        // Show high score input
        highScoreInput.style.display = "block";
        // Focus the input field
        setTimeout(() => {
            playerNameInput.focus();
        }, 500);
    } else {
        // Hide high score input
        highScoreInput.style.display = "none";
    }
    
    // Show the game over modal
    gameOverModal.classList.add("active");
    
    // Play a dramatic explosion sound
    if (soundEnabled && sounds.largeExplosion) {
        sounds.largeExplosion();
    }
    
    // Add intense screen shake for game over
    if (isModernStyle) {
        addScreenShake(8);
    }
}

// Update game objects
function update() {
    let exploding = ship.exploding;
    let wasThrusting = ship.thrusting;
    
    // Update level announcement timing
    if (levelAnnouncementActive) {
        levelAnnouncementTime += 1 / FPS;
        if (levelAnnouncementTime > LEVEL_ANNOUNCEMENT_DURATION) {
            levelAnnouncementActive = false;
        }
    }
    
    // Update level indicator pulse effect
    if (levelIndicatorPulse > 0) {
        levelIndicatorPulse -= 0.01;
        if (levelIndicatorPulse <= 0) {
            levelIndicatorPulse = 0;
        }
    }
    
    // Apply control inputs to ship
    if (!exploding) {
        // Set ship rotation based on left/right keys
        if (keys.left) {
            ship.rotation = TURN_SPEED / 180 * Math.PI / FPS * -1;
        } else if (keys.right) {
            ship.rotation = TURN_SPEED / 180 * Math.PI / FPS;
        } else {
            ship.rotation = 0;
        }
        
        // Set ship thrusting based on up key
        ship.thrusting = keys.up;
        
        // Fire lasers with space key
        if (keys.space) {
            shootLaser();
            // Reset space key to prevent continuous firing
            keys.space = false;
        }
    }
    
    // Update ship position
    if (!exploding) {
        // Rotate the ship
        ship.angle += ship.rotation;
        
        // Move the ship
        if (ship.thrusting) {
            ship.thrust.x += SHIP_THRUST * Math.cos(ship.angle) / FPS;
            ship.thrust.y -= SHIP_THRUST * Math.sin(ship.angle) / FPS;
            
            // Ensure thrust sound is playing
            if (soundEnabled && !thrustSound) {
                startThrustSound();
            }
        } else {
            // Apply friction to slow the ship
            ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
            ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
            
            // Stop thrust sound if no longer thrusting
            if (wasThrusting && soundEnabled && thrustSound) {
                stopThrustSound();
            }
        }
        
        // Update ship position
        ship.x += ship.thrust.x;
        ship.y += ship.thrust.y;
        
        // Handle ship going off screen
        if (ship.x < 0 - ship.radius) {
            ship.x = canvas.width + ship.radius;
        } else if (ship.x > canvas.width + ship.radius) {
            ship.x = 0 - ship.radius;
        }
        if (ship.y < 0 - ship.radius) {
            ship.y = canvas.height + ship.radius;
        } else if (ship.y > canvas.height + ship.radius) {
            ship.y = 0 - ship.radius;
        }
    }
    
    // Update ship explosion
    if (exploding) {
        // Stop thrust sound if exploding
        if (thrustSound) {
            stopThrustSound();
        }
        
        ship.explodeTime += 1 / FPS;
        
        // Reset ship after explosion
        if (ship.explodeTime > SHIP_EXPLOSION_DUR) {
            lives--;
            
            // Only update DOM element when not in modern style
            if (!isModernStyle) {
                livesElement.textContent = lives;
            }
            
            if (lives === 0) {
                handleGameOver();
            } else {
                ship = createShip();
                // Play extra life sound when respawning (but not at game over)
                if (soundEnabled && sounds.extraLife) {
                    sounds.extraLife();
                }
            }
        }
    }
    
    // Update ship blinking (invulnerability after respawn)
    if (ship.blinkNum > 0) {
        ship.blinkTime--;
        if (ship.blinkTime === 0) {
            ship.blinkTime = Math.ceil(SHIP_INVULNERABILITY_DUR / SHIP_BLINK_DUR);
            ship.blinkNum--;
        }
    }
    
    // Update asteroids
    for (let i = 0; i < asteroids.length; i++) {
        // Move the asteroid
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;
        
        // Handle asteroid going off screen
        if (asteroids[i].x < 0 - asteroids[i].radius) {
            asteroids[i].x = canvas.width + asteroids[i].radius;
        } else if (asteroids[i].x > canvas.width + asteroids[i].radius) {
            asteroids[i].x = 0 - asteroids[i].radius;
        }
        if (asteroids[i].y < 0 - asteroids[i].radius) {
            asteroids[i].y = canvas.height + asteroids[i].radius;
        } else if (asteroids[i].y > canvas.height + asteroids[i].radius) {
            asteroids[i].y = 0 - asteroids[i].radius;
        }
        
        // Check for collision with ship
        if (!exploding && ship.blinkNum === 0 && detectCollision(ship, asteroids[i])) {
            ship.exploding = true;
            ship.explodeTime = 0;
            
            // Play ship explosion sound
            if (soundEnabled && sounds.largeExplosion) {
                sounds.largeExplosion();
            }
        }
    }
    
    // Update lasers
    for (let i = lasers.length - 1; i >= 0; i--) {
        // Check for laser explosion
        if (lasers[i].explodeTime > 0) {
            lasers[i].explodeTime += 1 / FPS;
            
            // Remove the laser after the explosion duration
            if (lasers[i].explodeTime > LASER_EXPLODE_DUR) {
                lasers.splice(i, 1);
                continue;
            }
        } else {
            // Move the laser
            lasers[i].x += lasers[i].xv;
            lasers[i].y += lasers[i].yv;
            
            // Calculate the distance traveled
            lasers[i].dist += Math.sqrt(Math.pow(lasers[i].xv, 2) + Math.pow(lasers[i].yv, 2));
            
            // Remove the laser if it goes too far
            if (lasers[i].dist > LASER_DIST * canvas.width) {
                lasers.splice(i, 1);
                continue;
            }
            
            // Handle laser going off screen
            if (lasers[i].x < 0) {
                lasers[i].x = canvas.width;
            } else if (lasers[i].x > canvas.width) {
                lasers[i].x = 0;
            }
            if (lasers[i].y < 0) {
                lasers[i].y = canvas.height;
            } else if (lasers[i].y > canvas.height) {
                lasers[i].y = 0;
            }
            
            // Check for collision with asteroids
            for (let j = asteroids.length - 1; j >= 0; j--) {
                if (detectCollision({x: lasers[i].x, y: lasers[i].y, radius: SHIP_SIZE / 15}, asteroids[j])) {
                    // Mark the laser as exploding
                    lasers[i].explodeTime = 1;
                    
                    // Play explosion sound based on asteroid size
                    if (soundEnabled) {
                        playExplosionSound(asteroids[j].radius * 2);
                    }
                    
                    // Break the asteroid
                    destroyAsteroid(j);
                    break;
                }
            }
        }
    }
    
    // Check if all asteroids are destroyed
    if (asteroids.length === 0) {
        level++;
        createAsteroids();
    }
    
    // Update particles
    if (isModernStyle && PARTICLES.enabled) {
        updateParticles();
    }
    
    // Update powerups
    updatePowerups();
    
    // Update visual effects for modern mode
    if (isModernStyle) {
        updateParallaxStars();
    }
}

// Destroy an asteroid and create smaller ones
function destroyAsteroid(index) {
    let asteroid = asteroids[index];
    let newSize = asteroid.radius * 2;
    
    // Add explosion particles
    if (isModernStyle && PARTICLES.enabled) {
        let particleCount;
        if (newSize === ASTEROID_SIZE) {
            particleCount = PARTICLES.count.asteroidExplosion.large;
        } else if (newSize === ASTEROID_SIZE / 2) {
            particleCount = PARTICLES.count.asteroidExplosion.medium;
        } else {
            particleCount = PARTICLES.count.asteroidExplosion.small;
        }
        
        // Get the appropriate color
        let particleColors;
        if (newSize === ASTEROID_SIZE) {
            particleColors = [MODERN_COLORS.asteroid.large.fill, MODERN_COLORS.asteroid.large.outline, "#ffffff"];
        } else if (newSize === ASTEROID_SIZE / 2) {
            particleColors = [MODERN_COLORS.asteroid.medium.fill, MODERN_COLORS.asteroid.medium.outline, "#ffffff"];
        } else {
            particleColors = [MODERN_COLORS.asteroid.small.fill, MODERN_COLORS.asteroid.small.outline, "#ffffff"];
        }
        
        createExplosion(
            asteroid.x,
            asteroid.y,
            asteroid.radius,
            particleCount,
            particleColors,
            PARTICLES.duration.asteroidExplosion,
            1.2
        );
    }
    
    // Calculate score based on asteroid size
    if (newSize === ASTEROID_SIZE) {
        score += ASTEROID_POINTS_LRG;
    } else if (newSize === ASTEROID_SIZE / 2) {
        score += ASTEROID_POINTS_MED;
    } else {
        score += ASTEROID_POINTS_SML;
    }
    
    // Update the score display - only update DOM element in retro mode
    if (!isModernStyle) {
        scoreElement.textContent = score;
    }
    
    // Split the asteroid if it's large enough
    if (asteroid.radius > ASTEROID_SIZE / 8) {
        // Create two new asteroids
        for (let i = 0; i < 2; i++) {
            asteroids.push(createAsteroid(
                asteroid.x,
                asteroid.y,
                newSize / 2
            ));
        }
    }
    
    // Remove the original asteroid
    asteroids.splice(index, 1);
    
    // Randomly drop a powerup
    if (Math.random() < POWERUP_PROBABILITY) {
        powerups.push(createPowerup(asteroid.x, asteroid.y));
    }
    
    // Add screen shake based on asteroid size
    if (newSize === ASTEROID_SIZE) {
        addScreenShake(3);
    } else if (newSize === ASTEROID_SIZE / 2) {
        addScreenShake(1.5);
    } else {
        addScreenShake(0.5);
    }
}

// Draw the game
function draw() {
    // Apply screen shake if active
    if (screenShake > 0) {
        ctx.save();
        applyScreenShake();
    }

    // Draw enhanced background instead of simple starfield
    if (isModernStyle) {
        drawEnhancedBackground();
    } else {
        // Original background
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw particles (behind ship and asteroids)
    if (isModernStyle && PARTICLES.enabled) {
        drawParticles();
    }
    
    // Draw the ship if not blinking
    if (!ship.exploding) {
        if (ship.blinkNum === 0 || ship.blinkNum % 2 === 0) {
            drawShip(ship.x, ship.y, ship.angle);
        }
    } else {
        // Draw explosion - use enhanced version for modern style
        if (isModernStyle) {
            drawShipExplosion();
        } else {
            // Retro explosion
            ctx.fillStyle = "darkred";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 1.7, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "red";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 1.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "orange";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "yellow";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 0.8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw collision circle for ship
    if (SHOW_BOUNDING) {
        ctx.strokeStyle = "lime";
        ctx.beginPath();
        ctx.arc(ship.x, ship.y, ship.radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // Draw the asteroids
    for (let i = 0; i < asteroids.length; i++) {
        drawAsteroid(asteroids[i]);
    }
    
    // Draw the lasers
    drawLasers();
    
    // Draw the powerups
    drawPowerups();
    
    // Draw level announcement if active
    if (levelAnnouncementActive) {
        drawLevelAnnouncement();
    }
    
    // Draw enhanced HUD if in modern mode
    if (isModernStyle) {
        drawEnhancedHUD();
    }
    
    // Restore context if screen shake was applied
    if (screenShake > 0) {
        ctx.restore();
    }
}

// Particle system
let particles = [];
let stars = [];

// Initialize stars for background
function initializeStars() {
    // Clear existing stars
    stars = [];
    
    // Create new stars based on canvas size
    const starCount = Math.floor((canvas.width * canvas.height) / 2500); // Adjusted for better density
    
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            type: Math.random() > 0.9 ? "large" : (Math.random() > 0.6 ? "medium" : "small"),
            twinkleSpeed: Math.random() * 0.05 + 0.01,
            twinkleAmount: Math.random() * 0.7 + 0.3,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
}

// Create a single particle
function createParticle(x, y, xv, yv, size, color, duration = 1.0) {
    return {
        x: x,
        y: y,
        xv: xv,
        yv: yv,
        size: size,
        color: color,
        life: 1.0,
        decay: 1.0 / (FPS * duration)
    };
}

// Create an explosion of particles
function createExplosion(x, y, radius, count, colors, duration = 1.0, speedMultiplier = 1.0) {
    for (let i = 0; i < count; i++) {
        // Random angle and distance from center
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * radius / 15 + radius / 30) * speedMultiplier;
        
        // Calculate velocity components
        const xv = Math.cos(angle) * speed;
        const yv = Math.sin(angle) * speed;
        
        // Randomize size
        const size = Math.random() * (PARTICLES.size.asteroidExplosion.max - PARTICLES.size.asteroidExplosion.min) + PARTICLES.size.asteroidExplosion.min;
        
        // Pick a random color from the array
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create the particle
        particles.push(createParticle(x, y, xv, yv, size, color, duration));
    }
}

// Update all particles
function updateParticles() {
    // Process particles in reverse order for efficient removal
    for (let i = particles.length - 1; i >= 0; i--) {
        // Move the particle
        particles[i].x += particles[i].xv;
        particles[i].y += particles[i].yv;
        
        // Apply drag to slow down particles
        particles[i].xv *= 0.98;
        particles[i].yv *= 0.98;
        
        // Reduce life
        particles[i].life -= particles[i].decay;
        
        // Remove dead particles
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
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
        
        // Set opacity based on remaining life
        ctx.globalAlpha = p.life * 0.8 + 0.2;
        
        // Draw the particle
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset global alpha
    ctx.globalAlpha = 1.0;
}

// Draw stars for background
function drawStars() {
    // Update and draw each star
    const now = Date.now() / 1000;
    
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Calculate twinkle effect
        const twinkle = star.twinkleAmount * Math.sin(now * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase) + 1 - star.twinkleAmount;
        
        // Set color and size based on star type
        if (star.type === "large") {
            // Large stars twinkle more and can change color slightly
            ctx.fillStyle = MODERN_COLORS.stars.large;
            ctx.shadowBlur = 5 * twinkle;
            ctx.shadowColor = MODERN_COLORS.stars.twinkle;
        } else if (star.type === "medium") {
            ctx.fillStyle = MODERN_COLORS.stars.medium;
            ctx.shadowBlur = 2 * twinkle;
            ctx.shadowColor = MODERN_COLORS.stars.medium;
        } else {
            ctx.fillStyle = MODERN_COLORS.stars.small;
            ctx.shadowBlur = 0;
        }
        
        // Draw the star with size variation based on twinkle
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset shadow effects
    ctx.shadowBlur = 0;
}

// Generate shield particles around ship
function createShieldParticles() {
    if (!PARTICLES.enabled || !isModernStyle || ship.blinkNum === 0) return;
    
    if (ship.blinkNum % 2 === 0) {
        // Only create particles if shield is visible
        const count = 2; // Number of particles to add per frame
        
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = ship.radius * 1.2;
            const px = ship.x + Math.cos(angle) * distance;
            const py = ship.y + Math.sin(angle) * distance;
            
            // Minimal velocity, mainly for slight movement
            const speed = 0.5 + Math.random() * 0.5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            // Randomize size
            const size = PARTICLES.size.shield.min + 
                     Math.random() * (PARTICLES.size.shield.max - PARTICLES.size.shield.min);
            
            // Add some variety to the shield color
            const blueShift = Math.floor(Math.random() * 55);
            const color = `rgba(0, ${150 + blueShift}, 255, ${0.3 + Math.random() * 0.3})`;
            
            // Create the particle with shorter life
            particles.push(createParticle(
                px, py, vx, vy, size, color, 
                PARTICLES.duration.shield * (0.3 + Math.random() * 0.3)
            ));
        }
    }
}

// Create thruster particles
function createThrustParticles() {
    if (!PARTICLES.enabled || !isModernStyle || ship.exploding || !ship.thrusting) return;
    
    // Calculate position behind the ship
    const angle = ship.angle + Math.PI; // Reverse of ship's angle
    const distance = ship.radius * 0.6;
    const spread = 0.5; // How wide the thrust fan is
    
    // Create multiple particles for the thrust
    for (let i = 0; i < PARTICLES.count.thrust; i++) {
        // Vary the angle slightly to create a fan effect
        const particleAngle = angle + (Math.random() * spread * 2 - spread);
        
        // Position at the back of the ship
        const px = ship.x + Math.cos(particleAngle) * distance;
        const py = ship.y + Math.sin(particleAngle) * distance;
        
        // Velocity in the opposite direction of ship movement
        const speed = 1 + Math.random() * 2;
        const vx = Math.cos(particleAngle) * speed;
        const vy = Math.sin(particleAngle) * speed;
        
        // Size of the particle
        const size = PARTICLES.size.thrust.min + 
                 Math.random() * (PARTICLES.size.thrust.max - PARTICLES.size.thrust.min);
        
        // Color based on position in the thrust (hotter in the middle)
        let color;
        if (Math.random() < 0.3) {
            color = MODERN_COLORS.thrust.inner; // Center/inner color
        } else if (Math.random() < 0.6) {
            color = MODERN_COLORS.thrust.outer; // Outer color
        } else {
            color = MODERN_COLORS.thrust.glow; // Edges
        }
        
        // Create the particle with randomized life duration
        particles.push(createParticle(
            px, py, vx, vy, size, color, 
            PARTICLES.duration.thrust * (0.5 + Math.random() * 0.5)
        ));
    }
}

// Create laser trail particles
function createLaserTrailParticles(laser) {
    if (!PARTICLES.enabled || !isModernStyle || laser.explodeTime > 0) return;
    
    // Calculate position slightly behind the laser
    const trailLength = 5;
    const angle = Math.atan2(-laser.yv, laser.xv);
    
    for (let i = 0; i < PARTICLES.count.laserTrail; i++) {
        // Position behind the laser with some randomness
        const distance = Math.random() * trailLength;
        const spread = 0.8;
        const perpAngle = angle + (Math.random() * spread - spread/2);
        
        const px = laser.x - Math.cos(angle) * distance + Math.cos(perpAngle) * Math.random();
        const py = laser.y - Math.sin(angle) * distance + Math.sin(perpAngle) * Math.random();
        
        // Small velocity, mostly following the laser but with some randomness
        const vx = -laser.xv * 0.1 + (Math.random() - 0.5) * 0.5;
        const vy = -laser.yv * 0.1 + (Math.random() - 0.5) * 0.5;
        
        // Size based on position in the trail (smaller further back)
        const size = PARTICLES.size.laserTrail.min + 
                 Math.random() * (PARTICLES.size.laserTrail.max - PARTICLES.size.laserTrail.min);
        
        // Create the particle with very short life duration
        particles.push(createParticle(
            px, py, vx, vy, size, MODERN_COLORS.laser.trail, 
            PARTICLES.duration.laserTrail * (0.3 + Math.random() * 0.7),
            0.3 + Math.random() * 0.4
        ));
    }
}

// Update all particles
function updateParticles() {
    if (!PARTICLES.enabled || !isModernStyle) return;
    
    // Update existing particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Update position
        p.x += p.vx;
        p.y += p.vy;
        
        // Update life
        p.life -= 1 / FPS;
        
        // Remove dead particles
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        // Fade out based on remaining life
        if (p.fadeOut) {
            p.alpha = p.life / p.fullLife * p.alpha;
        }
        
        // Wrap particles around the screen edges
        if (p.x < 0) {
            p.x = canvas.width;
        } else if (p.x > canvas.width) {
            p.x = 0;
        }
        
        if (p.y < 0) {
            p.y = canvas.height;
        } else if (p.y > canvas.height) {
            p.y = 0;
        }
    }
    
    // Generate new particles as needed
    if (ship && !ship.exploding) {
        if (ship.thrusting) {
            createThrustParticles();
        }
        if (ship.blinkNum > 0) {
            createShieldParticles();
        }
    }
    
    // Create laser trail particles
    lasers.forEach(laser => {
        createLaserTrailParticles(laser);
    });
}

// Draw all particles
function drawParticles() {
    if (!PARTICLES.enabled || !isModernStyle) return;
    
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        
        // Set opacity based on remaining life
        ctx.globalAlpha = p.alpha;
        
        // Draw the particle
        if (p.color.startsWith("rgba")) {
            ctx.fillStyle = p.color;
        } else {
            ctx.fillStyle = p.color;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset opacity
    ctx.globalAlpha = 1;
}

// Draw starfield
function drawStarfield() {
    if (!isModernStyle) return;
    
    // Draw each star with twinkling effect
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Calculate twinkle effect
        const twinkleFactor = 0.7 + 0.3 * Math.sin(star.twinklePhase);
        
        // Set color and size based on star type
        if (star.type === "large") {
            ctx.fillStyle = star.color;
            ctx.shadowBlur = star.size * 2;
            ctx.shadowColor = star.color;
        } else {
            ctx.fillStyle = star.color;
            ctx.shadowBlur = 0;
        }
        
        // Draw the star with size variation based on twinkle
        ctx.globalAlpha = star.alpha * twinkleFactor;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkleFactor, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset opacity
    ctx.globalAlpha = 1.0;
}

// Initialize starfield
function initializeStars() {
    stars = [];
    const density = 0.0001; // Stars per pixel
    const starCount = Math.floor(canvas.width * canvas.height * density);
    
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            color: Math.random() > 0.9 ? (Math.random() > 0.5 ? "#8af" : "#faa") : "#fff",
            alpha: 0.5 + Math.random() * 0.5,
            twinkleSpeed: 0.5 + Math.random() * 0.5,
            twinkleAmount: 0.3 + Math.random() * 0.7,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
}

// Update starfield
function updateStarfield() {
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.twinklePhase += star.twinkleSpeed / FPS;
        if (star.twinklePhase > Math.PI * 2) {
            star.twinklePhase -= Math.PI * 2;
        }
    }
}

// Draw enhanced background
function drawEnhancedBackground() {
    if (!isModernStyle) return;
    
    // Fill with base color
    ctx.fillStyle = MODERN_COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw pre-rendered nebula with animated brightness
    if (nebulaBackground) {
        ctx.globalAlpha = visualEffects.nebulaBrightness;
        ctx.drawImage(nebulaBackground, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }
    
    // Draw parallax stars
    if (parallaxStars.length) {
        for (let i = 0; i < parallaxStars.length; i++) {
            const star = parallaxStars[i];
            ctx.globalAlpha = star.alpha * star.twinkleFactor;
            ctx.fillStyle = star.color;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.size * star.twinkleFactor, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1.0;
    }
}

// Generate nebula background
function generateNebulaBackground() {
    const nebulaCanvas = document.createElement('canvas');
    nebulaCanvas.width = canvas.width;
    nebulaCanvas.height = canvas.height;
    const nCtx = nebulaCanvas.getContext('2d');
    
    // Fill with base color
    nCtx.fillStyle = MODERN_COLORS.background;
    nCtx.fillRect(0, 0, nebulaCanvas.width, nebulaCanvas.height);
    
    // Draw nebula clouds
    const cloudCount = Math.floor((nebulaCanvas.width * nebulaCanvas.height) / 50000);
    const nebulaColors = [
        {r: 20, g: 0, b: 50, a: 0.2},  // Purple
        {r: 0, g: 20, b: 40, a: 0.15},  // Deep blue
        {r: 40, g: 0, b: 20, a: 0.1},   // Deep red
        {r: 0, g: 30, b: 30, a: 0.12}   // Teal
    ];
    
    for (const color of nebulaColors) {
        for (let i = 0; i < cloudCount / nebulaColors.length; i++) {
            const x = Math.random() * nebulaCanvas.width;
            const y = Math.random() * nebulaCanvas.height;
            const radius = 50 + Math.random() * 150;
            
            // Create radial gradient
            const gradient = nCtx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            nCtx.fillStyle = gradient;
            nCtx.beginPath();
            nCtx.arc(x, y, radius, 0, Math.PI * 2);
            nCtx.fill();
        }
    }
    
    // Add distant stars
    const starCount = 200;
    nCtx.fillStyle = "rgba(255, 255, 255, 0.4)";
    for (let i = 0; i < starCount; i++) {
        const x = Math.random() * nebulaCanvas.width;
        const y = Math.random() * nebulaCanvas.height;
        const size = 0.5 + Math.random();
        nCtx.beginPath();
        nCtx.arc(x, y, size, 0, Math.PI * 2);
        nCtx.fill();
    }
    
    nebulaBackground = nebulaCanvas;
}

// Initialize parallax stars
function initializeParallaxStars() {
    parallaxStars = [];
    const layers = [
        { count: 50, speed: 0.2, size: {min: 1.5, max: 3}, alpha: 1.0 },    // Front layer
        { count: 100, speed: 0.1, size: {min: 1, max: 2}, alpha: 0.8 },     // Middle layer
        { count: 200, speed: 0.05, size: {min: 0.5, max: 1}, alpha: 0.6 }   // Back layer
    ];
    
    // Generate stars for each layer
    layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
            parallaxStars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: layer.size.min + Math.random() * (layer.size.max - layer.size.min),
                speed: layer.speed,
                alpha: layer.alpha,
                layer: layerIndex,
                twinkle: {
                    speed: 0.3 + Math.random() * 0.7,
                    amount: 0.2 + Math.random() * 0.3,
                    phase: Math.random() * Math.PI * 2
                },
                color: Math.random() > 0.9 ? (Math.random() > 0.5 ? "#8af" : "#faa") : "#fff"
            });
        }
    });
}

// Update parallax stars
function updateParallaxStars() {
    if (!isModernStyle || !parallaxStars.length) return;
    
    // Move stars based on ship movement (creates parallax effect)
    const parallaxX = ship ? -ship.thrust.x * 0.5 : 0;
    const parallaxY = ship ? -ship.thrust.y * 0.5 : 0;
    
    // Update each star
    for (let i = 0; i < parallaxStars.length; i++) {
        const star = parallaxStars[i];
        
        // Move star based on speed (layer factor) and ship movement
        star.x += parallaxX * star.speed;
        star.y += parallaxY * star.speed;
        
        // Update twinkle effect
        star.twinkle.phase += star.twinkle.speed / FPS;
        if (star.twinkle.phase > Math.PI * 2) {
            star.twinkle.phase -= Math.PI * 2;
        }
        
        // Wrap stars around the screen edges
        if (star.x < 0) {
            star.x = canvas.width;
        } else if (star.x > canvas.width) {
            star.x = 0;
        }
        if (star.y < 0) {
            star.y = canvas.height;
        } else if (star.y > canvas.height) {
            star.y = 0;
        }
    }
}

// Draw enhanced HUD with glowing effects
function drawEnhancedHUD() {
    if (!isModernStyle) return;
    
    // Pulse the HUD glow effect
    visualEffects.hudGlowIntensity = 5 + 2 * Math.sin(Date.now() / 1000);
    
    // Apply HUD style
    ctx.save();
    ctx.fillStyle = 'rgba(0, 20, 40, 0.7)';
    ctx.strokeStyle = MODERN_COLORS.ui.border;
    ctx.lineWidth = 2;
    ctx.shadowColor = MODERN_COLORS.ui.highlight;
    ctx.shadowBlur = visualEffects.hudGlowIntensity;
    
    // Draw HUD background - adjust positions to prevent overlap
    const hudHeight = 40;
    const cornerRadius = 10;
    const padding = 20; // Space between HUD elements
    
    // Calculate widths based on content
    const scoreWidth = 150;
    const levelWidth = 100;
    const livesWidth = 150;
    
    // Top-left rounded rectangle for score
    roundedRect(ctx, 10, 10, scoreWidth, hudHeight, cornerRadius);
    ctx.fill();
    ctx.stroke();
    
    // Top-center rounded rectangle for level - ensure it's centered
    const levelX = (canvas.width/2) - (levelWidth/2);
    roundedRect(ctx, levelX, 10, levelWidth, hudHeight, cornerRadius);
    ctx.fill();
    ctx.stroke();
    
    // Top-right rounded rectangle for lives - ensure it doesn't overlap
    const livesX = canvas.width - livesWidth - 10;
    roundedRect(ctx, livesX, 10, livesWidth, hudHeight, cornerRadius);
    ctx.fill();
    ctx.stroke();
    
    // Draw labels and values with modern font
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Russo One", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    
    ctx.fillText('SCORE', 25, 30);
    ctx.textAlign = 'right';
    ctx.fillText(score.toLocaleString(), 145, 30);
    
    ctx.textAlign = 'center';
    ctx.fillText('LEVEL', canvas.width/2, 25);
    if (levelIndicatorPulse > 0) {
        // Draw level with pulsing effect if recently changed
        const pulseScale = 1 + levelIndicatorPulse * 0.5;
        ctx.font = `bold ${Math.floor(22 * pulseScale)}px "Russo One", sans-serif`;
        ctx.shadowColor = MODERN_COLORS.levelUp.text;
        ctx.shadowBlur = 10 * levelIndicatorPulse;
        ctx.fillStyle = MODERN_COLORS.levelUp.text;
        ctx.fillText((level + 1).toString(), canvas.width/2, 38);
    } else {
        ctx.font = 'bold 22px "Russo One", sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText((level + 1).toString(), canvas.width/2, 38);
    }
    
    // Reset for lives
    ctx.shadowBlur = 3;
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px "Russo One", sans-serif';
    ctx.textAlign = 'left';
    
    // Position "LIVES" text appropriately in the lives container
    ctx.fillText('LIVES', livesX + 15, 30);
    
    // Draw ship icons for lives with proper spacing
    const shipIconsStartX = livesX + 70; // Adjust this value to position ship icons
    const shipIconSpacing = 25;
    for (let i = 0; i < lives; i++) {
        drawMiniShip(shipIconsStartX + i * shipIconSpacing, 30);
    }
    
    ctx.restore();
}

// Helper function to draw mini ships for lives
function drawMiniShip(x, y) {
    ctx.save();
    ctx.strokeStyle = MODERN_COLORS.shipOutline;
    ctx.fillStyle = MODERN_COLORS.ship;
    ctx.lineWidth = 1;
    
    // Draw a mini version of the ship
    const miniShipSize = 8;
    ctx.beginPath();
    ctx.moveTo(x + miniShipSize, y);
    ctx.lineTo(x - miniShipSize/2, y - miniShipSize/2);
    ctx.lineTo(x - miniShipSize/2, y + miniShipSize/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Add glow effect
    ctx.shadowBlur = 5;
    ctx.shadowColor = MODERN_COLORS.ship;
    ctx.stroke();
    ctx.restore();
}

// Helper function to draw rounded rectangles
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// Apply screen shake effect in draw function
function applyScreenShake() {
    if (screenShake > 0) {
        // Apply shake transformation
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;
        ctx.translate(shakeX, shakeY);
        
        // Reduce shake over time
        screenShake *= 0.9;
        if (screenShake < 0.1) screenShake = 0;
    }
}

// Add screen shake when asteroids are destroyed or ship is hit
function addScreenShake(intensity) {
    screenShake = Math.min(screenShake + intensity, 10); // Cap at reasonable value
}

// Add this function to display level announcements
function showLevelAnnouncement() {
    levelAnnouncementActive = true;
    levelAnnouncementTime = 0;
    
    // Play level up sound
    if (level > 0 && soundEnabled && sounds.levelUp) {
        sounds.levelUp();
    }
}

// Add this function to draw the level announcement
function drawLevelAnnouncement() {
    const progress = levelAnnouncementTime / LEVEL_ANNOUNCEMENT_DURATION;
    ctx.textAlign = "center";
    // Calculate opacity - fade in and out
    let opacity = 1.0;
    if (progress < 0.2) {
        // Fade in
        opacity = progress / 0.2;
    } else if (progress > 0.8) {
        // Fade out
        opacity = (1.0 - progress) / 0.2;
    }
    
    // Calculate scale - zoom in and then stabilize
    let scale = 1.0;
    if (progress < 0.3) {
        scale = 0.5 + 0.5 * (progress / 0.3);
    }
    
    if (isModernStyle) {
        // Modern style level announcement
        // Background glow
        ctx.save();
        ctx.globalAlpha = opacity * 0.3;
        ctx.fillStyle = MODERN_COLORS.levelUp.glow;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 150 * scale, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Text shadow and glow
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = MODERN_COLORS.levelUp.text;
        ctx.font = `bold ${Math.floor(60 * scale)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        
        // Add shadow effect
        ctx.shadowColor = MODERN_COLORS.levelUp.glow;
        ctx.shadowBlur = 15;
        
        // Draw level text with a pulsing effect
        const pulse = 1 + 0.05 * Math.sin(levelAnnouncementTime * 5);
        ctx.font = `bold ${Math.floor(60 * scale * pulse)}px Arial, sans-serif`;
        ctx.fillText(`LEVEL ${level + 1}`, canvas.width / 2, canvas.height / 2 - 15);
        
        // Draw smaller subtitle
        ctx.shadowBlur = 5;
        ctx.font = `${Math.floor(20 * scale)}px Arial, sans-serif`;
        ctx.fillText("GET READY", canvas.width / 2, canvas.height / 2 + 30);
        
        ctx.restore();
        
        // Add particle effects around the text for modern mode
        if (PARTICLES.enabled && levelAnnouncementTime < 0.5) {
            createLevelAnnouncementParticles();
        }
    } else {
        // Retro style level announcement
        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.fillStyle = "white";
        ctx.font = `bold ${Math.floor(50 * scale)}px Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`LEVEL ${level + 1}`, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
}

// Add particles for level announcement
function createLevelAnnouncementParticles() {
    if (!isModernStyle || !PARTICLES.enabled) return;
    
    // Create burst particles around the level text
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 100;
    const particleCount = 3; // Number of particles to generate per frame
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        
        const x = centerX + Math.cos(angle) * distance;
        const y = centerY + Math.sin(angle) * distance;
        
        // Velocity moving away from center
        const speed = 0.5 + Math.random() * 1;
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;
        
        // Size and color
        const size = 1 + Math.random() * 2;
        const colors = [
            MODERN_COLORS.levelUp.text,
            "rgba(0, 255, 200, 0.8)",
            "rgba(100, 255, 230, 0.7)",
            "white"
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        // Create particle with longer duration
        particles.push(createParticle(
            x, y, vx, vy, size, color, 
            0.8 + Math.random() * 0.4
        ));
    }
}

// Add this function to enhance the top bar level indicator
function updateLevelIndicator(newLevel) {
    if (levelElement) {
        levelElement.textContent = newLevel + 1; // Display level starting from 1 instead of 0
        
        // Add visual highlight effect to the level indicator
        levelIndicatorPulse = 1.0; // Start pulse effect
        levelElement.classList.add('level-highlight');
        
        // Remove highlight class after animation completes
        setTimeout(() => {
            levelElement.classList.remove('level-highlight');
        }, 2000);
    }
}

// Start a new game
function startGame() {
    // Clean up splash screen explicitly
    cleanupSplashScreen();
    
    // Set up initial game state
    score = 0;
    level = 0;
    lives = GAME_LIVES;
    gameOver = false;
    
    // Update displays - Add null checks
    if (scoreElement) scoreElement.textContent = score;
    if (livesElement) livesElement.textContent = lives;
    if (levelElement) levelElement.textContent = level + 1;
    
    // Create ship and asteroids
    ship = createShip();
    asteroids = [];
    lasers = [];
    createAsteroids();
    
    // Hide start screen
    startScreen.classList.remove("active");
    
    // Set modern style based on checkbox
    isModernStyle = startStyleToggle && startStyleToggle.checked;
    if (styleToggle) styleToggle.checked = isModernStyle;
    
    // Update HUD visibility based on selected style
    updateHUDVisibility();
    
    if (isModernStyle) {
        preRenderAsteroids();
        initializeParallaxStars(); // Initialize parallax stars if needed
        if (!nebulaBackground) {
            generateNebulaBackground();
        }
    }
    
    // Start audio
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
    
    // Reset particles
    particles = [];
    
    // Start game loop
    gameStarted = true;
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
function showHighScores() {
    showHighScoresModal();
}

// Submit a high score
function submitHighScore() {
    // Get the player name (with validation)
    const name = playerNameInput.value.trim();
    if (name === "") {
        alert("Please enter your name!");
        return;
    }
    
    // Save the score
    saveHighScore(name, score);
    
    // Hide high scores modal
    highScoresModal.classList.remove("active");
}

// Close high scores modal
function closeHighScores() {
    highScoresModal.classList.remove("active");
}

// Update the sound button appearance
function updateSoundButton() {
    if (soundEnabled) {
        soundToggle.textContent = "🔊";
        soundToggle.classList.remove("muted");
    } else {
        soundToggle.textContent = "🔇";
        soundToggle.classList.add("muted");
    }
}

// Update the music button appearance
function updateMusicButton() {
    if (musicEnabled) {
        musicToggle.textContent = "🎵";
        musicToggle.classList.remove("muted");
    } else {
        musicToggle.textContent = "🎵";
        musicToggle.classList.add("muted");
    }
}

// Start background music
function playBackgroundMusic() {
    if (musicEnabled && audioContext) {
        setupMusicLoop();
    }
}

// Stop background music
function stopBackgroundMusic() {
    stopMusicLoop();
}

// Create a new powerup
function createPowerup(x, y) {
    // Randomly select powerup type
    const types = Object.values(POWERUP_TYPES);
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
        x: x,
        y: y,
        xv: (Math.random() * POWERUP_SPEED / FPS) * (Math.random() < 0.5 ? 1 : -1),
        yv: (Math.random() * POWERUP_SPEED / FPS) * (Math.random() < 0.5 ? 1 : -1),
        radius: POWERUP_SIZE / 2,
        type: type,
        duration: POWERUP_DURATION * FPS,
        angle: 0,
        rotation: Math.random() * 0.06 - 0.03
    };
}

// Draw powerups with enhanced effects
function drawPowerups() {
    ctx.lineWidth = SHIP_SIZE / 20;
    
    for (let i = 0; i < powerups.length; i++) {
        const powerup = powerups[i];
        
        // Set color based on powerup type
        let color, glowColor;
        
        if (powerup.type === POWERUP_TYPES.SHIELD) {
            color = "rgba(0, 200, 255, 0.8)";
            glowColor = "rgba(0, 150, 255, 0.5)";
        } else if (powerup.type === POWERUP_TYPES.TRIPLE_SHOT) {
            color = "rgba(255, 100, 255, 0.8)";
            glowColor = "rgba(200, 0, 255, 0.5)";
        } else if (powerup.type === POWERUP_TYPES.RAPID_FIRE) {
            color = "rgba(255, 200, 0, 0.8)";
            glowColor = "rgba(255, 150, 0, 0.5)";
        } else {
            color = "rgba(0, 255, 0, 0.8)";
            glowColor = "rgba(0, 200, 0, 0.5)";
        }

        if (isModernStyle) {
            // Save context for transformations
            ctx.save();
            ctx.translate(powerup.x, powerup.y);
            ctx.rotate(powerup.angle);
            
            // Pulse effect
            const pulse = 1 + Math.sin(Date.now() / 200) * 0.1;
            
            // Create gradient for powerup body
            const powerupGradient = ctx.createRadialGradient(
                0, 0, 0,
                0, 0, powerup.radius * pulse
            );
            
            // Customize gradient based on powerup type
            if (powerup.type === POWERUP_TYPES.SHIELD) {
                powerupGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
                powerupGradient.addColorStop(0.4, "rgba(100, 200, 255, 0.7)");
                powerupGradient.addColorStop(1, "rgba(0, 100, 255, 0.5)");
            } else if (powerup.type === POWERUP_TYPES.TRIPLE_SHOT) {
                powerupGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
                powerupGradient.addColorStop(0.4, "rgba(255, 150, 255, 0.7)");
                powerupGradient.addColorStop(1, "rgba(200, 0, 200, 0.5)");
            } else if (powerup.type === POWERUP_TYPES.RAPID_FIRE) {
                powerupGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
                powerupGradient.addColorStop(0.4, "rgba(255, 255, 0, 0.7)");
                powerupGradient.addColorStop(1, "rgba(255, 150, 0, 0.5)");
            } else {
                powerupGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
                powerupGradient.addColorStop(0.4, "rgba(150, 255, 150, 0.7)");
                powerupGradient.addColorStop(1, "rgba(0, 200, 0, 0.5)");
            }
            
            // Draw glow effect
            ctx.shadowBlur = 15 * pulse;
            ctx.shadowColor = glowColor;
            ctx.fillStyle = powerupGradient;
            ctx.beginPath();
            ctx.arc(0, 0, powerup.radius * pulse, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw outer ring with pulsing effect
            ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, powerup.radius * pulse, 0, Math.PI * 2);
            ctx.stroke();
            
            // Draw icon based on powerup type with enhanced effects
            if (powerup.type === POWERUP_TYPES.SHIELD) {
                // Shield icon
                ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
    activePowerups[type] = POWERUP_DURATION * FPS;
    
    // Apply immediate effects
    if (type === POWERUP_TYPES.SHIELD) {
        // Activate shield (give invulnerability)
        ship.blinkNum = Math.ceil(POWERUP_DURATION / SHIP_BLINK_DUR); // This will keep shield visual active
        ship.blinkTime = Math.ceil(POWERUP_DURATION / SHIP_BLINK_DUR);
    } else if (type === POWERUP_TYPES.EXTRA_LIFE) {
        // Add extra life
        lives++;
        
        // Only update DOM element when not in modern style
        if (!isModernStyle) {
            livesElement.textContent = lives;
        }
        
        // No need to keep timer for this one-time effect
        activePowerups[type] = 0;
    }
}

// Deactivate a powerup
function deactivatePowerup(type) {
    // Reset powerup effects when they expire
    if (type === POWERUP_TYPES.SHIELD) {
        // Only reset shield if it was from a powerup, not from respawn
        if (ship.blinkNum > 0) {
            ship.blinkNum = 0;
        }
    }
    
    // Remove from active powerups
    activePowerups[type] = 0;
}

// Initialize the game
function init() {
    setupCanvas();
    setupFirebase();
    setupAudio();
    setupEventListeners();
    
    // Initialize stars for background
    initializeStars();
    
    // Generate nebula background for modern mode
    generateNebulaBackground();
    
    // Initialize parallax stars for modern mode
    initializeParallaxStars();
    
    // Initialize splash screen
    initSplashScreen();
    
    // Setup HUD visibility based on initial style
    updateHUDVisibility();
}

// Add function to update HUD visibility based on style
function updateHUDVisibility() {
    const domHUD = document.getElementById("hud");
    if (domHUD) {
        // Hide DOM HUD in modern style (using canvas HUD)
        // Show DOM HUD in retro style
        domHUD.style.display = isModernStyle ? "none" : "flex";
    }
}

// Initialize splash screen with animated elements
function initSplashScreen() {
    // Set up splash screen canvas
    splashCanvas = document.createElement('canvas');
    splashCanvas.width = window.innerWidth;
    splashCanvas.height = window.innerHeight;
    splashCtx = splashCanvas.getContext('2d');
    
    // Add canvas to splash screen
    startScreen.appendChild(splashCanvas);
    
    // Create stars for splash background
    createSplashStars();
    
    // Create asteroids for splash screen
    createSplashAsteroids();
    
    // Add hover effects to buttons
    initButtonHoverEffects();
    
    // Start splash screen animation
    animateSplashScreen();
}

// Create animated stars for splash screen background
function createSplashStars() {
    const starCount = Math.floor((splashCanvas.width * splashCanvas.height) / 1000); // More dense than game stars
    
    for (let i = 0; i < starCount; i++) {
        splashStars.push({
            x: Math.random() * splashCanvas.width,
            y: Math.random() * splashCanvas.height,
            size: Math.random() * 3 + 0.5,
            speed: Math.random() * 0.3 + 0.1,
            brightness: Math.random() * 0.5 + 0.5,
            color: Math.random() > 0.8 ? 
                (Math.random() > 0.5 ? "#8af" : "#faa") : "#fff",
            twinkleSpeed: Math.random() * 0.05 + 0.01,
            twinkleAmount: Math.random() * 0.7 + 0.3,
            twinklePhase: Math.random() * Math.PI * 2
        });
    }
}

// Create floating asteroids for splash screen
function createSplashAsteroids() {
    // Create 5-8 asteroids of different sizes
    const asteroidCount = 5 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < asteroidCount; i++) {
        // Create asteroid with random properties
        const size = Math.random() * 80 + 40;
        splashAsteroids.push({
            x: Math.random() * splashCanvas.width,
            y: Math.random() * splashCanvas.height,
            radius: size / 2,
            xv: (Math.random() - 0.5) * 0.5, // Slow movement
            yv: (Math.random() - 0.5) * 0.5,
            angle: Math.random() * Math.PI * 2,
            rotation: (Math.random() - 0.5) * 0.02,
            vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
            offs: [],
            type: Object.values(ASTEROID_TYPES)[Math.floor(Math.random() * 3)]
        });
        
        // Generate random vertices
        for (let j = 0; j < splashAsteroids[i].vert; j++) {
            splashAsteroids[i].offs.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
        }
    }
}

// Create title particles for splash screen
function createTitleParticles() {
    const titleX = splashCanvas.width / 2;
    const titleY = splashCanvas.height * 0.3;
    
    // Clear existing particles
    if (titleParticles.length > 100) {
        titleParticles = titleParticles.slice(-50);
    }
    
    // Create new particles
    for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        
        titleParticles.push({
            x: titleX + Math.cos(angle) * distance * 0.2,
            y: titleY + Math.sin(angle) * distance * 0.1,
            targetX: titleX + Math.cos(angle) * distance,
            targetY: titleY + Math.sin(angle) * distance,
            size: Math.random() * 3 + 1,
            color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
            alpha: Math.random() * 0.7 + 0.3,
            speed: Math.random() * 0.02 + 0.01
        });
    }
}

// Initialize button hover effects for splash screen
function initButtonHoverEffects() {
    // Get all buttons on splash screen
    const buttons = startScreen.querySelectorAll('button, .button');
    
    buttons.forEach(button => {
        // Skip buttons without an ID
        if (!button.id) return;
        
        // Create hover effect data for this button
        buttonHoverEffects[button.id] = {
            particles: [],
            hovered: false,
            color: button.id === 'startButton' ? '#00ffff' : '#ffffff'
        };
        
        // Add mouse event listeners with safety checks
        button.addEventListener('mouseenter', () => {
            if (buttonHoverEffects[button.id]) {
                buttonHoverEffects[button.id].hovered = true;
            }
        });
        
        button.addEventListener('mouseleave', () => {
            if (buttonHoverEffects[button.id]) {
                buttonHoverEffects[button.id].hovered = false;
            }
        });
    });
}

// Update button hover effects
function updateButtonHoverEffects() {
    Object.keys(buttonHoverEffects).forEach(buttonId => {
        const effect = buttonHoverEffects[buttonId];
        const button = document.getElementById(buttonId);
        
        if (!button || !effect) return;
        
        // If button is hovered, create particles
        if (effect.hovered) {
            const buttonRect = button.getBoundingClientRect();
            
            // Create particles around the button
            if (Math.random() < 0.3) {
                const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
                let x, y;
                
                switch(side) {
                    case 0: // top
                        x = buttonRect.left + Math.random() * buttonRect.width;
                        y = buttonRect.top;
                        break;
                    case 1: // right
                        x = buttonRect.right;
                        y = buttonRect.top + Math.random() * buttonRect.height;
                        break;
                    case 2: // bottom
                        x = buttonRect.left + Math.random() * buttonRect.width;
                        y = buttonRect.bottom;
                        break;
                    case 3: // left
                        x = buttonRect.left;
                        y = buttonRect.top + Math.random() * buttonRect.height;
                        break;
                }
                
                effect.particles.push({
                    x: x,
                    y: y,
                    size: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 2,
                    speedY: (Math.random() - 0.5) * 2,
                    life: 1.0,
                    color: effect.color
                });
            }
        }
        
        // Update existing particles
        for (let i = effect.particles.length - 1; i >= 0; i--) {
            const particle = effect.particles[i];
            
            // Move particle
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Reduce life
            particle.life -= 0.02;
            
            // Remove dead particles
            if (particle.life <= 0) {
                effect.particles.splice(i, 1);
            }
        }
    });
}

// Draw splash screen
function drawSplashScreen() {
    // Clear canvas
    splashCtx.fillStyle = MODERN_COLORS.background;
    splashCtx.fillRect(0, 0, splashCanvas.width, splashCanvas.height);
    
    // Draw stars
    drawSplashStars();
    
    // Draw asteroids
    drawSplashAsteroids();
    
    // Draw title
    drawSplashTitle();
    
    // Draw particles
    drawTitleParticles();
    
    // Draw button effects
    drawButtonEffects();
}

// Draw stars for splash screen
function drawSplashStars() {
    const now = Date.now() / 1000;
    
    splashCtx.shadowBlur = 3;
    
    for (let i = 0; i < splashStars.length; i++) {
        const star = splashStars[i];
        
        // Move stars slowly downward for parallax effect
        star.y += star.speed;
        if (star.y > splashCanvas.height) {
            star.y = 0;
            star.x = Math.random() * splashCanvas.width;
        }
        
        // Calculate twinkle effect - Ensure it's never negative
        const twinkle = Math.max(0.1, star.twinkleAmount * Math.sin(now * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase) + 1 - star.twinkleAmount);
        
        // Draw the star
        splashCtx.fillStyle = star.color;
        splashCtx.shadowColor = star.color;
        splashCtx.globalAlpha = star.brightness * twinkle;
        
        splashCtx.beginPath();
        splashCtx.arc(star.x, star.y, star.size * twinkle, 0, Math.PI * 2);
        splashCtx.fill();
    }
    
    splashCtx.globalAlpha = 1.0;
    splashCtx.shadowBlur = 0;
}

// Draw asteroids on splash screen
function drawSplashAsteroids() {
    for (let i = 0; i < splashAsteroids.length; i++) {
        const asteroid = splashAsteroids[i];
        
        // Move the asteroid
        asteroid.x += asteroid.xv;
        asteroid.y += asteroid.yv;
        
        // Rotate the asteroid
        asteroid.angle += asteroid.rotation;
        
        // Wrap around screen edges
        if (asteroid.x < -asteroid.radius * 2) {
            asteroid.x = splashCanvas.width + asteroid.radius;
        } else if (asteroid.x > splashCanvas.width + asteroid.radius * 2) {
            asteroid.x = -asteroid.radius;
        }
        
        if (asteroid.y < -asteroid.radius * 2) {
            asteroid.y = splashCanvas.height + asteroid.radius;
        } else if (asteroid.y > splashCanvas.height + asteroid.radius * 2) {
            asteroid.y = -asteroid.radius;
        }
        
        // Draw the asteroid
        let sizeCategory;
        if (asteroid.radius * 2 >= ASTEROID_SIZE) sizeCategory = 'large';
        else if (asteroid.radius * 2 >= ASTEROID_SIZE/2) sizeCategory = 'medium';
        else sizeCategory = 'small';
        
        const colors = ASTEROID_TYPE_COLORS[asteroid.type][sizeCategory];
        
        splashCtx.fillStyle = colors.fill;
        splashCtx.strokeStyle = colors.outline;
        splashCtx.lineWidth = SHIP_SIZE / 20;
        
        // Draw asteroid path
        splashCtx.beginPath();
        for (let j = 0; j < asteroid.vert; j++) {
            const angle = asteroid.angle + (j * Math.PI * 2 / asteroid.vert);
            const radius = asteroid.radius * (1 + asteroid.offs[j]);
            
            if (j === 0) {
                splashCtx.moveTo(
                    asteroid.x + radius * Math.cos(angle),
                    asteroid.y + radius * Math.sin(angle)
                );
            } else {
                splashCtx.lineTo(
                    asteroid.x + radius * Math.cos(angle),
                    asteroid.y + radius * Math.sin(angle)
                );
            }
        }
        
        splashCtx.closePath();
        splashCtx.fill();
        splashCtx.stroke();
        
        // Add glow effect for icy asteroids
        if (asteroid.type === ASTEROID_TYPES.ICY) {
            splashCtx.shadowBlur = 15;
            splashCtx.shadowColor = "rgba(100, 150, 255, 0.5)";
            splashCtx.stroke();
            splashCtx.shadowBlur = 0;
        }
    }
}

// Draw the game title
function drawSplashTitle() {
    const centerX = splashCanvas.width / 2;
    const centerY = splashCanvas.height * 0.3;
    
    // Update title pulse effect
    titlePulse += 0.03;
    if (titlePulse > Math.PI * 2) {
        titlePulse -= Math.PI * 2;
    }
    
    // Calculate pulse effect 
    const pulseFactor = 1 + 0.05 * Math.sin(titlePulse);
    
    // Update logo rotation
    logoRotation += 0.001;
    
    // Draw title with glow effect
    splashCtx.save();
    splashCtx.translate(centerX, centerY);
    splashCtx.rotate(Math.sin(logoRotation) * 0.05);
    splashCtx.scale(pulseFactor, pulseFactor);
    
    // Text shadow for glow effect
    splashCtx.shadowColor = "rgba(0, 255, 255, 0.8)";
    splashCtx.shadowBlur = 15;
    
    // Draw main title
    splashCtx.font = "bold 72px 'Russo One', Arial, sans-serif";
    splashCtx.textAlign = "center";
    splashCtx.textBaseline = "middle";
    
    const gradient = splashCtx.createLinearGradient(0, -40, 0, 40);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(0.5, "#00ffff");
    gradient.addColorStop(1, "#0088ff");
    
    splashCtx.fillStyle = gradient;
    
    // Draw text with multiple layers for enhanced glow
    splashCtx.globalAlpha = 0.3;
    splashCtx.fillText("ASTEROIDS", 3, 3);
    splashCtx.fillText("ASTEROIDS", -3, -3);
    splashCtx.fillText("ASTEROIDS", 3, -3);
    splashCtx.fillText("ASTEROIDS", -3, 3);
    
    // Main text
    splashCtx.globalAlpha = 1.0;
    splashCtx.fillText("ASTEROIDS", 0, 0);
    
    // Add a smaller subtitle
    splashCtx.font = "24px 'Arial', sans-serif";
    splashCtx.fillStyle = "#66ccff";
    splashCtx.shadowBlur = 10;
    splashCtx.fillText("ENHANCED EDITION", 0, 50);
    
    splashCtx.restore();
    
    // Generate particles at random intervals
    if (Math.random() < 0.1) {
        createTitleParticles();
    }
}

// Draw title particles
function drawTitleParticles() {
    splashCtx.save();
    splashCtx.shadowBlur = 10;
    
    for (let i = titleParticles.length - 1; i >= 0; i--) {
        const particle = titleParticles[i];
        
        // Move particle toward target
        particle.x += (particle.targetX - particle.x) * particle.speed;
        particle.y += (particle.targetY - particle.y) * particle.speed;
        
        // Draw the particle
        splashCtx.globalAlpha = particle.alpha;
        splashCtx.fillStyle = particle.color;
        splashCtx.shadowColor = particle.color;
        
        splashCtx.beginPath();
        splashCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        splashCtx.fill();
        
        // Remove particles that reached their target
        if (Math.abs(particle.x - particle.targetX) < 0.5 && 
            Math.abs(particle.y - particle.targetY) < 0.5) {
            titleParticles.splice(i, 1);
        }
    }
    
    splashCtx.restore();
}

// Draw button hover effects
function drawButtonEffects() {
    splashCtx.save();
    splashCtx.shadowBlur = 8;
    
    Object.keys(buttonHoverEffects).forEach(buttonId => {
        const effect = buttonHoverEffects[buttonId];
        const button = document.getElementById(buttonId);
        
        if (!button) return;
        
        // Draw button glow if hovered
        if (effect.hovered) {
            const rect = button.getBoundingClientRect();
            
            // Draw glow outline around button
            splashCtx.strokeStyle = effect.color;
            splashCtx.shadowColor = effect.color;
            splashCtx.lineWidth = 2;
            splashCtx.strokeRect(rect.left, rect.top, rect.width, rect.height);
        }
        
        // Draw particles
        effect.particles.forEach(particle => {
            splashCtx.globalAlpha = particle.life;
            splashCtx.fillStyle = particle.color;
            splashCtx.shadowColor = particle.color;
            
            splashCtx.beginPath();
            splashCtx.arc(
                particle.x,
                particle.y,
                particle.size * particle.life,
                0,
                Math.PI * 2
            );
            splashCtx.fill();
        });
    });
    
    splashCtx.restore();
}

// Animate the splash screen
function animateSplashScreen() {
    if (!gameStarted) {
        splashAnimationId = requestAnimationFrame(animateSplashScreen);
        
        // Update button effects
        updateButtonHoverEffects();
        
        // Draw the splash screen
        drawSplashScreen();
    } else {
        // Game has started, clean up splash screen
        cleanupSplashScreen();
    }
}

// Clean up splash screen resources
function cleanupSplashScreen() {
    if (splashAnimationId) {
        cancelAnimationFrame(splashAnimationId);
        splashAnimationId = null;
    }
    
    // Remove canvas from the DOM
    if (splashCanvas && splashCanvas.parentNode) {
        splashCanvas.parentNode.removeChild(splashCanvas);
    }
    
    // Clear arrays
    splashStars = [];
    titleParticles = [];
    splashAsteroids = [];
    buttonHoverEffects = {};
}

// Object to track pressed keys
const keys = {
    up: false,
    left: false,
    right: false,
    space: false
};

// Handle keydown events for game controls
function handleKeyDown(e) {
    // Prevent default behavior for arrow keys to avoid page scrolling
    if ([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
    
    // Update keys based on keyCode
    switch(e.keyCode) {
        case 32: // Spacebar
            keys.space = true;
            break;
        case 37: // Left arrow
        case 65: // A key
            keys.left = true;
            break;
        case 38: // Up arrow
        case 87: // W key
            keys.up = true;
            break;
        case 39: // Right arrow
        case 68: // D key
            keys.right = true;
            break;
    }
}

// Handle keyup events for game controls
function handleKeyUp(e) {
    switch(e.keyCode) {
        case 32: // Spacebar
            keys.space = false;
            break;
        case 37: // Left arrow
        case 65: // A key
            keys.left = false;
            break;
        case 38: // Up arrow
        case 87: // W key
            keys.up = false;
            break;
        case 39: // Right arrow
        case 68: // D key
            keys.right = false;
            break;
    }
}

// Setup all event listeners for game controls and UI interactions
function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Mobile controls
    document.getElementById('thrustButton').addEventListener('touchstart', () => {
        keys.up = true;
    });
    document.getElementById('thrustButton').addEventListener('touchend', () => {
        keys.up = false;
    });
    document.getElementById('leftButton').addEventListener('touchstart', () => {
        keys.left = true;
    });
    document.getElementById('leftButton').addEventListener('touchend', () => {
        keys.left = false;
    });
    document.getElementById('rightButton').addEventListener('touchstart', () => {
        keys.right = true;
    });
    document.getElementById('rightButton').addEventListener('touchend', () => {
        keys.right = false;
    });
    document.getElementById('fireButton').addEventListener('touchstart', () => {
        keys.space = true;
    });
    document.getElementById('fireButton').addEventListener('touchend', () => {
        keys.space = false;
    });
    
    // Style toggle
    document.getElementById('styleToggle').addEventListener('change', (e) => {
        isModernStyle = e.target.checked;
        updateHUDVisibility();
    });
    
    document.getElementById('startStyleToggle').addEventListener('change', (e) => {
        isModernStyle = e.target.checked;
        document.getElementById('styleToggle').checked = isModernStyle;
        // No need to update HUD visibility here as game hasn't started yet
    });
    
    // Sound controls
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    document.getElementById('musicToggle').addEventListener('click', toggleMusic);
    
    // Game over modal
    document.getElementById('restartButton').addEventListener('click', restartGame);
    document.getElementById('viewHighScores').addEventListener('click', showHighScores);
    document.getElementById('submitScore').addEventListener('click', submitHighScore);
    
    // Start screen
    document.getElementById('startButton').addEventListener('click', startGame);
    document.getElementById('startHighScores').addEventListener('click', showHighScores);
    document.getElementById('startStyleToggle').addEventListener('change', (e) => {
        modernStyle = e.target.checked;
        document.getElementById('styleToggle').checked = modernStyle;
    });
    document.getElementById('startSoundToggle').addEventListener('change', (e) => {
        soundEnabled = e.target.checked;
        updateSoundButton();
    });
    document.getElementById('startMusicToggle').addEventListener('change', (e) => {
        musicEnabled = e.target.checked;
        updateMusicButton();
        if (musicEnabled) {
            playBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }
    });
    
    // High scores modal
    document.getElementById('closeHighScores').addEventListener('click', closeHighScores);
}

// Start the game when the page loads
window.onload = init;

// Create a new ship
function createShip() {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: SHIP_SIZE / 2,
        angle: 90 / 180 * Math.PI, // convert to radians
        rotation: 0,
        thrusting: false,
        thrust: {
            x: 0,
            y: 0
        },
        exploding: false,
        explodeTime: 0,
        blinkNum: Math.ceil(SHIP_INVULNERABILITY_DUR / SHIP_BLINK_DUR),
        blinkTime: Math.ceil(SHIP_INVULNERABILITY_DUR / SHIP_BLINK_DUR)
    };
}

// Asteroid types for modern visualization
const ASTEROID_TYPES = {
    ROCKY: "rocky",
    ICY: "icy",
    METALLIC: "metallic"
};

// Modern style asteroid type colors
const ASTEROID_TYPE_COLORS = {
    rocky: {
        large: {
            fill: "#5a4f70",
            outline: "#7777cc",
            craters: "rgba(30, 30, 50, 0.4)"
        },
        medium: {
            fill: "#6a5f80", 
            outline: "#9999ee",
            craters: "rgba(40, 40, 60, 0.4)"
        },
        small: {
            fill: "#8a7f90",
            outline: "#aaaaff",
            craters: "rgba(50, 50, 70, 0.4)"
        }
    },
    icy: {
        large: {
            fill: "#4f6e8c",
            outline: "#77aadd",
            craters: "rgba(200, 230, 255, 0.3)"
        },
        medium: {
            fill: "#5f7e9c", 
            outline: "#99ccff",
            craters: "rgba(210, 240, 255, 0.3)"
        },
        small: {
            fill: "#6f8eac",
            outline: "#bbddff",
            craters: "rgba(220, 250, 255, 0.3)"
        }
    },
    metallic: {
        large: {
            fill: "#6b5836",
            outline: "#aa8844",
            craters: "rgba(60, 40, 20, 0.5)"
        },
        medium: {
            fill: "#7b6846", 
            outline: "#cc9955",
            craters: "rgba(70, 50, 30, 0.5)"
        },
        small: {
            fill: "#8b7856",
            outline: "#ddaa66",
            craters: "rgba(80, 60, 40, 0.5)"
        }
    }
};

// Modify createAsteroid to accept speed and jaggedness multipliers
function createAsteroid(x, y, size, speedMultiplier = 1, jaggednessMultiplier = 1) {
    // Pre-calculate radius for efficiency
    const radius = size / 2;
    const vertCount = Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2);
    
    // Create the vertex offsets array more efficiently
    const offsets = new Array(vertCount);
    const jagFactor = ASTEROID_JAG * 2 * jaggednessMultiplier;
    const jagOffset = ASTEROID_JAG * jaggednessMultiplier;
    
    for (let i = 0; i < vertCount; i++) {
        offsets[i] = Math.random() * jagFactor + 1 - jagOffset;
    }
    
    // Determine asteroid type - weighted distribution
    let asteroidType;
    const typeRoll = Math.random();
    if (typeRoll < 0.6) {
        asteroidType = ASTEROID_TYPES.ROCKY; // 60% rocky
    } else if (typeRoll < 0.85) {
        asteroidType = ASTEROID_TYPES.METALLIC; // 25% metallic
    } else {
        asteroidType = ASTEROID_TYPES.ICY; // 15% icy
    }
    
    // Add visual variation parameters for modern style
    const rotationSpeed = (Math.random() * 0.02 - 0.01) * (1 + level * 0.05); // Rotation speed affected by level
    const textureVariation = Math.random(); // 0-1 value for texture variation
    const craterCount = Math.floor(Math.random() * (radius / 10) + radius / 20);
    const surfaceSmoothness = Math.random() * 0.5 + 0.3; // How smooth the asteroid surface is (0-1)
    
    // Create and return the asteroid object
    return {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        xv: (Math.random() * ASTEROID_SPEED * speedMultiplier / FPS) * (Math.random() < 0.5 ? 1 : -1),
        yv: (Math.random() * ASTEROID_SPEED * speedMultiplier / FPS) * (Math.random() < 0.5 ? 1 : -1),
        radius: radius,
        angle: Math.random() * Math.PI * 2, // in radians
        vert: vertCount,
        offs: offsets,
        // Visual properties for modern style
        rotationSpeed: rotationSpeed,
        type: asteroidType,
        textureVariation: textureVariation,
        craterCount: craterCount,
        surfaceSmoothness: surfaceSmoothness,
        glowIntensity: asteroidType === ASTEROID_TYPES.ICY ? 0.4 + Math.random() * 0.3 : 0.1 + Math.random() * 0.1,
        surfaceDetail: []
    };
}

// Enhance level progression by increasing asteroid size, speed and jaggedness
function createAsteroids() {
    asteroids = [];
    powerups = []; // Clear any existing powerups when creating new level
    
    // Cache canvas dimensions for better performance
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate number of asteroids based on level with a maximum limit
    const MAX_ASTEROIDS = 15; // Prevent too many asteroids causing performance issues
    const numAsteroids = Math.min(ASTEROID_NUM + level, MAX_ASTEROIDS);
    
    // Calculate asteroid size based on level with a minimum and maximum size
    const currentAsteroidSize = Math.min(
        INITIAL_ASTEROID_SIZE + (level * ASTEROID_SIZE_INCREMENT),
        MAX_ASTEROID_SIZE
    );
    
    // Update the level display with highlight effect
    updateLevelIndicator(level);
    
    // Show level announcement when starting a new level
    showLevelAnnouncement();
    
    // Increase asteroid speed and jaggedness with level
    const speedMultiplier = 1 + level * 0.1;
    const jaggednessMultiplier = 1 + level * 0.05;
    
    // Calculate safe spawn distance from ship (increases slightly with level)
    const safeDistance = currentAsteroidSize * 2 + (level * 5);
    const shipX = ship.x;
    const shipY = ship.y;
    
    // Create asteroids more efficiently
    for (let i = 0; i < numAsteroids; i++) {
        let x, y;
        let attempts = 0;
        const MAX_ATTEMPTS = 10; // Prevent infinite loops
        
        do {
            // Generate random position
            x = Math.random() * canvasWidth;
            y = Math.random() * canvasHeight;
            attempts++;
            
            // Break after maximum attempts to avoid infinite loops
            if (attempts >= MAX_ATTEMPTS) {
                // Place at a corner if we can't find a good spot
                x = (Math.random() < 0.5) ? currentAsteroidSize : canvasWidth - currentAsteroidSize;
                y = (Math.random() < 0.5) ? currentAsteroidSize : canvasHeight - currentAsteroidSize;
                break;
            }
        } while (
            // Ensure asteroids don't spawn too close to the ship
            distBetweenPoints(shipX, shipY, x, y) < safeDistance
        );
        
        asteroids.push(createAsteroid(x, y, currentAsteroidSize, speedMultiplier, jaggednessMultiplier));
    }
    
    // Play level up sound if not the first level
    if (level > 0 && soundEnabled && sounds.levelUp) {
        sounds.levelUp();
    }
}

// Calculate distance between two points
function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y1 - y2, 2));
}

// Draw the ship
function drawShip(x, y, angle) {
    if (isModernStyle) {
        // Modern ship
        ctx.strokeStyle = MODERN_COLORS.shipOutline;
        ctx.lineWidth = SHIP_SIZE / 15;
        ctx.fillStyle = MODERN_COLORS.ship;
        
        // Draw the ship body
        ctx.beginPath();
        ctx.moveTo(
            x + 4/3 * ship.radius * Math.cos(angle), 
            y - 4/3 * ship.radius * Math.sin(angle)
        );
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) + Math.sin(angle)),
            y + ship.radius * (2/3 * Math.sin(angle) - Math.cos(angle))
        );
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) - Math.sin(angle)),
            y + ship.radius * (2/3 * Math.sin(angle) + Math.cos(angle))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw engine glow
        if (ship.thrusting) {
            ctx.fillStyle = MODERN_COLORS.thrust.inner;
            
            // Draw the flame
            ctx.beginPath();
            ctx.moveTo(
                x - ship.radius * (2/3 * Math.cos(angle)),
                y + ship.radius * (2/3 * Math.sin(angle))
            );
            ctx.lineTo(
                x - ship.radius * (4/3 * Math.cos(angle) + 0.5 * Math.sin(angle)),
                y + ship.radius * (4/3 * Math.sin(angle) - 0.5 * Math.cos(angle))
            );
            ctx.lineTo(
                x - ship.radius * (5/3 * Math.cos(angle)),
                y + ship.radius * (5/3 * Math.sin(angle))
            );
            ctx.lineTo(
                x - ship.radius * (4/3 * Math.cos(angle) - 0.5 * Math.sin(angle)),
                y + ship.radius * (4/3 * Math.sin(angle) + 0.5 * Math.cos(angle))
            );
            ctx.closePath();
            ctx.fill();
            
            // Engine glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = MODERN_COLORS.thrust.glow;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(
                x - ship.radius * Math.cos(angle),
                y + ship.radius * Math.sin(angle),
                ship.radius * 0.6,
                0,
                Math.PI * 2
            );
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }
        
        // Draw shield while invulnerable
        if (ship.blinkNum > 0) {
            ctx.strokeStyle = MODERN_COLORS.shield.border;
            ctx.lineWidth = SHIP_SIZE / 15;
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            ctx.arc(x, y, ship.radius * 1.2, 0, Math.PI * 2);
            ctx.stroke();
            // Shield bubble
            ctx.fillStyle = MODERN_COLORS.shield.color;
            ctx.globalAlpha = 0.2;
            ctx.beginPath();
            ctx.arc(x, y, ship.radius * 1.1, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    } else {
        // Classic ship
        ctx.strokeStyle = "white";
        ctx.lineWidth = SHIP_SIZE / 20;
        
        // Nose of the ship
        ctx.beginPath();
        ctx.moveTo(
            x + 4/3 * ship.radius * Math.cos(angle), 
            y - 4/3 * ship.radius * Math.sin(angle)
        );
        // Rear left
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) + Math.sin(angle)),
            y + ship.radius * (2/3 * Math.sin(angle) - Math.cos(angle))
        );
        // Rear right
        ctx.lineTo(
            x - ship.radius * (2/3 * Math.cos(angle) - Math.sin(angle)),
            y + ship.radius * (2/3 * Math.sin(angle) + Math.cos(angle))
        );
        ctx.closePath();
        ctx.stroke();
        
        // Draw the thruster
        if (ship.thrusting) {
            ctx.strokeStyle = "yellow";
            ctx.beginPath();
            // Rear center
            ctx.moveTo(
                x - ship.radius * (2/3 * Math.cos(angle)),
                y + ship.radius * (2/3 * Math.sin(angle))
            );
            // Thruster left
            ctx.lineTo(
                x - ship.radius * (4/3 * Math.cos(angle) + 0.5 * Math.sin(angle)),
                y + ship.radius * (4/3 * Math.sin(angle) - 0.5 * Math.cos(angle))
            );
            // Thruster right
            ctx.lineTo(
                x - ship.radius * (4/3 * Math.cos(angle) - 0.5 * Math.sin(angle)),
                y + ship.radius * (4/3 * Math.sin(angle) + 0.5 * Math.cos(angle))
            );
            ctx.closePath();
            ctx.stroke();
        }
    }
}

// Shoot a laser from the ship
function shootLaser() {
    // Check if we can shoot more lasers
    if (lasers.length < LASER_MAX) {
        // Regular shot
        const laserSpeed = LASER_SPEED * (activePowerups[POWERUP_TYPES.RAPID_FIRE] > 0 ? 1.5 : 1);
        
        if (activePowerups[POWERUP_TYPES.TRIPLE_SHOT] > 0) {
            // Triple shot - shoot three lasers at different angles
            const spreadAngle = Math.PI / 16; // 11.25 degrees spread
            
            // Center laser
            lasers.push({
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
                xv: laserSpeed * Math.cos(ship.angle) / FPS,
                yv: -laserSpeed * Math.sin(ship.angle) / FPS,
                dist: 0,
                explodeTime: 0
            });
            
            // Left laser
            lasers.push({
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle + spreadAngle),
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle + spreadAngle),
                xv: laserSpeed * Math.cos(ship.angle + spreadAngle) / FPS,
                yv: -laserSpeed * Math.sin(ship.angle + spreadAngle) / FPS,
                dist: 0,
                explodeTime: 0
            });
            
            // Right laser
            lasers.push({
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle - spreadAngle),
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle - spreadAngle),
                xv: laserSpeed * Math.cos(ship.angle - spreadAngle) / FPS,
                yv: -laserSpeed * Math.sin(ship.angle - spreadAngle) / FPS,
                dist: 0,
                explodeTime: 0
            });
        } else {
            // Regular single shot
            lasers.push({
                x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
                y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
                xv: laserSpeed * Math.cos(ship.angle) / FPS,
                yv: -laserSpeed * Math.sin(ship.angle) / FPS,
                dist: 0,
                explodeTime: 0
            });
        }
        
        // Play laser sound
        if (soundEnabled && sounds.laser) {
            sounds.laser();
        }
        
        // Allow rapid fire by not resetting the space key if that powerup is active
        if (activePowerups[POWERUP_TYPES.RAPID_FIRE] > 0) {
            // Set a shorter timeout before allowing next shot
            setTimeout(() => {
                keys.space = false;
            }, 100); // 100ms delay for rapid fire
        } else {
            // Normal firing rate
            keys.space = false;
        }
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game when the page loads
window.onload = init;