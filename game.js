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
let score = 0;
let level = 0;
let lives = GAME_LIVES;
let gameOver = false;
let gameStarted = false;
let isModernStyle = false;

// DOM elements
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const finalScoreElement = document.getElementById("finalScore");
const gameOverModal = document.getElementById("gameOverModal");
const restartButton = document.getElementById("restartButton");
const startScreen = document.getElementById("startScreen");
const startButton = document.getElementById("startButton");
const styleToggle = document.getElementById("styleToggle");
const startStyleToggle = document.getElementById("startStyleToggle");

// Audio controls
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

// Mobile controls
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
        "#ffff00", // inner
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

        // Load high scores initially
        loadHighScores();
    } catch (error) {
        console.error("Error initializing Firebase:", error);
        alert("Failed to connect to Firebase. High scores will not be saved.");
    }
}

// Load high scores from Firebase
function loadHighScores() {
    if (!db) return;
    
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
        
        mediumExplosion: { type: "white", duration: 0.5, 
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
                const gain = audioContext.createGain();
                gain.gain.value = 0;
                
                // Volume based on octave
                const maxVolume = [0.05, 0.03, 0.01][octave];
                
                // Create long envelope
                const fadeInTime = 1; // 1 second fade in
                const fadeOutTime = 1; // 1 second fade out
                
                gain.gain.setValueAtTime(0, noteStart);
                gain.gain.linearRampToValueAtTime(maxVolume, noteStart + fadeInTime);
                gain.gain.setValueAtTime(maxVolume, noteStart + noteDuration - fadeOutTime);
                gain.gain.linearRampToValueAtTime(0, noteStart + noteDuration);
                
                // Add a little chorus/detune effect
                osc.detune.value = (Math.random() * 10) - 5;
                
                // Connect nodes
                osc.connect(gain);
                gain.connect(audioContext.destination);
                
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
    
    // Clear existing buffers
    asteroidBuffers = {};
    
    // Create a buffer for each asteroid size
    sizes.forEach(size => {
        const key = size.toString();
        
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
            vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
            offs: []
        };
        
        // Generate random vertices
        for (let i = 0; i < sampleAsteroid.vert; i++) {
            sampleAsteroid.offs.push(Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG);
        }
        
        // Set modern asteroid colors based on size
        let asteroidColor, asteroidOutlineColor;
        if (size === ASTEROID_SIZE) {
            asteroidColor = MODERN_COLORS.asteroid.large.fill;
            asteroidOutlineColor = MODERN_COLORS.asteroid.large.outline;
        } else if (size === ASTEROID_SIZE / 2) {
            asteroidColor = MODERN_COLORS.asteroid.medium.fill;
            asteroidOutlineColor = MODERN_COLORS.asteroid.medium.outline;
        } else {
            asteroidColor = MODERN_COLORS.asteroid.small.fill;
            asteroidOutlineColor = MODERN_COLORS.asteroid.small.outline;
        }
        
        // Draw modern asteroid on buffer
        bCtx.fillStyle = asteroidColor;
        bCtx.strokeStyle = asteroidOutlineColor;
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
        
        // Add a subtle highlight
        bCtx.fillStyle = "rgba(255, 255, 255, 0.1)";
        bCtx.beginPath();
        bCtx.arc(
            sampleAsteroid.x - sampleAsteroid.radius * 0.3, 
            sampleAsteroid.y - sampleAsteroid.radius * 0.3, 
            sampleAsteroid.radius * 0.4, 
            0, 
            Math.PI * 2
        );
        bCtx.fill();
        
        // Add some crater details
        const craterCount = Math.floor(sampleAsteroid.radius / 10);
        bCtx.fillStyle = "rgba(0, 0, 0, 0.2)";
        
        for (let i = 0; i < craterCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * sampleAsteroid.radius * 0.7;
            const craterX = sampleAsteroid.x + Math.cos(angle) * distance;
            const craterY = sampleAsteroid.y + Math.sin(angle) * distance;
            const craterSize = Math.random() * sampleAsteroid.radius * 0.3 + sampleAsteroid.radius * 0.05;
            
            bCtx.beginPath();
            bCtx.arc(craterX, craterY, craterSize, 0, Math.PI * 2);
            bCtx.fill();
        }
        
        // Store the buffer
        asteroidBuffers[key] = {
            canvas: buffer,
            asteroid: sampleAsteroid
        };
    });
}

// Draw the optimized asteroids
function drawAsteroid(asteroid) {
    const size = asteroid.radius * 2;
    
    if (isModernStyle && asteroidBuffers[size]) {
        // Use pre-rendered asteroid
        const buffer = asteroidBuffers[size];
        
        // Draw the pre-rendered asteroid with rotation
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.angle);
        ctx.drawImage(
            buffer.canvas, 
            -buffer.canvas.width/2, 
            -buffer.canvas.height/2
        );
        ctx.restore();
        
        // Add subtle glow effect
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.shadowBlur = 8;
        ctx.shadowColor = size === ASTEROID_SIZE ? 
            MODERN_COLORS.asteroid.large.outline : 
            (size === ASTEROID_SIZE/2 ? 
             MODERN_COLORS.asteroid.medium.outline : 
             MODERN_COLORS.asteroid.small.outline);
             
        ctx.beginPath();
        ctx.arc(asteroid.x, asteroid.y, asteroid.radius * 0.9, 0, Math.PI * 2);
        ctx.closePath();
        ctx.restore();
    } else {
        // Fall back to drawing directly if buffer not available
        // (Original drawing code...)
        let asteroidColor, asteroidOutlineColor;
        
        if (isModernStyle) {
            // Set modern asteroid colors based on size
            if (size === ASTEROID_SIZE) {
                asteroidColor = MODERN_COLORS.asteroid.large.fill;
                asteroidOutlineColor = MODERN_COLORS.asteroid.large.outline;
            } else if (size === ASTEROID_SIZE / 2) {
                asteroidColor = MODERN_COLORS.asteroid.medium.fill;
                asteroidOutlineColor = MODERN_COLORS.asteroid.medium.outline;
            } else {
                asteroidColor = MODERN_COLORS.asteroid.small.fill;
                asteroidOutlineColor = MODERN_COLORS.asteroid.small.outline;
            }
            
            ctx.fillStyle = asteroidColor;
            ctx.strokeStyle = asteroidOutlineColor;
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
        } else {
            // Original retro style
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
                // Modern laser with glow
                ctx.shadowBlur = 15;
                ctx.shadowColor = MODERN_COLORS.laser.glow;
                
                // Draw outer glow
                ctx.fillStyle = MODERN_COLORS.laser.glow;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 8, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw inner core
                ctx.fillStyle = MODERN_COLORS.laser.core;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2);
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
                // Modern explosion
                const explosionProgress = lasers[i].explodeTime / LASER_EXPLODE_DUR;
                const radius = ship.radius * 0.75 * (0.75 + 0.5 * explosionProgress);
                
                // Create a radial gradient for the explosion
                const gradient = ctx.createRadialGradient(
                    lasers[i].x, lasers[i].y, 0,
                    lasers[i].x, lasers[i].y, radius
                );
                gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
                gradient.addColorStop(0.3, "rgba(255, 255, 0, 0.8)");
                gradient.addColorStop(0.7, "rgba(255, 100, 0, 0.5)");
                gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(lasers[i].x, lasers[i].y, radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Add some explosion particles
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
}

// Update game objects
function update() {
    let exploding = ship.exploding;
    let wasThrusting = ship.thrusting;
    
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
        
        if (ship.explodeTime > SHIP_EXPLOSION_DUR) {
            lives--;
            livesElement.textContent = lives;
            
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
    
    // Update the score display
    scoreElement.textContent = score;
    
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
}

// Draw the game
function draw() {
    // Background
    ctx.fillStyle = isModernStyle ? MODERN_COLORS.background : "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw starfield in modern mode
    if (isModernStyle) {
        drawStarfield();
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
        // Draw explosion
        if (isModernStyle) {
            // Modern explosion
            const explosionProgress = ship.explodeTime / SHIP_EXPLOSION_DUR;
            
            // Create a radial gradient for the explosion
            const gradient = ctx.createRadialGradient(
                ship.x, ship.y, 0,
                ship.x, ship.y, ship.radius * (1.7 + explosionProgress)
            );
            gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
            gradient.addColorStop(0.2, "rgba(255, 255, 0, 0.8)");
            gradient.addColorStop(0.4, "rgba(255, 100, 0, 0.6)");
            gradient.addColorStop(0.7, "rgba(255, 0, 0, 0.4)");
            gradient.addColorStop(1, "rgba(100, 0, 0, 0)");
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(ship.x, ship.y, ship.radius * (1.7 + explosionProgress), 0, Math.PI * 2);
            ctx.fill();
            
            // Create explosion particles if not already created
            if (explosionProgress < 0.2 && PARTICLES.enabled) {
                // Only create particles once at the beginning of the explosion
                createExplosion(
                    ship.x, ship.y,
                    ship.radius * 2,
                    PARTICLES.count.shipExplosion,
                    MODERN_COLORS.explosion,
                    PARTICLES.duration.shipExplosion,
                    1.5
                );
            }
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
        
        // Set alpha based on remaining life
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
                PARTICLES.duration.shield * (0.3 + Math.random() * 0.3),
                0.3 + Math.random() * 0.3
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

// Stars for the background
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
            brightness: 0.3 + Math.random() * 0.7,
            twinkleSpeed: 0.3 + Math.random() * 0.7,
            twinklePhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.9 ? 
                  (Math.random() > 0.5 ? "#aaccff" : "#ffaaaa") : 
                  "#ffffff"
        });
    }
}

// Draw the starfield
function drawStarfield() {
    if (!isModernStyle) return;
    
    // Draw each star with twinkling effect
    for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Calculate twinkling effect
        star.twinklePhase += star.twinkleSpeed / FPS;
        if (star.twinklePhase > Math.PI * 2) {
            star.twinklePhase -= Math.PI * 2;
        }
        
        const twinkleFactor = 0.7 + 0.3 * Math.sin(star.twinklePhase);
        const brightness = star.brightness * twinkleFactor;
        
        // Draw the star
        if (star.color === "#ffffff") {
            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        } else {
            ctx.fillStyle = star.color;
        }
        
        ctx.globalAlpha = brightness;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size * twinkleFactor, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset opacity
    ctx.globalAlpha = 1.0;
}

// Game loop
function gameLoop() {
    update();
    draw();
    
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Initialize the game
function init() {
    setupCanvas();
    setupFirebase();
    setupAudio();
    setupEventListeners();
    
    // Initialize stars for the background
    initializeStars();
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
        modernStyle = e.target.checked;
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

// Modify createAsteroid to accept speed and jaggedness multipliers
function createAsteroid(x, y, size, speedMultiplier = 1, jaggednessMultiplier = 1) {
    let asteroid = {
        x: x || Math.random() * canvas.width,
        y: y || Math.random() * canvas.height,
        xv: (Math.random() * ASTEROID_SPEED * speedMultiplier / FPS) * (Math.random() < 0.5 ? 1 : -1),
        yv: (Math.random() * ASTEROID_SPEED * speedMultiplier / FPS) * (Math.random() < 0.5 ? 1 : -1),
        radius: size / 2,
        angle: Math.random() * Math.PI * 2, // in radians
        vert: Math.floor(Math.random() * (ASTEROID_VERT + 1) + ASTEROID_VERT / 2),
        offs: []
    };
    
    // Create the vertex offsets array with increased jaggedness
    for (let i = 0; i < asteroid.vert; i++) {
        asteroid.offs.push((Math.random() * ASTEROID_JAG * 2 + 1 - ASTEROID_JAG) * jaggednessMultiplier);
    }
    
    return asteroid;
}

// Enhance level progression by increasing asteroid speed and jaggedness
function createAsteroids() {
    asteroids = [];
    let x, y;
    
    // Calculate number of asteroids based on level
    const numAsteroids = ASTEROID_NUM + level;
    
    for (let i = 0; i < numAsteroids; i++) {
        do {
            x = Math.random() * canvas.width;
            y = Math.random() * canvas.height;
        } while (
            // Ensure asteroids don't spawn too close to the ship
            distBetweenPoints(ship.x, ship.y, x, y) < ASTEROID_SIZE * 2
        );
        
        // Increase asteroid speed and jaggedness with level
        const speedMultiplier = 1 + level * 0.1;
        const jaggednessMultiplier = 1 + level * 0.05;
        
        asteroids.push(createAsteroid(x, y, ASTEROID_SIZE, speedMultiplier, jaggednessMultiplier));
    }
    
    // Play level up sound if not the first level
    if (level > 0 && soundEnabled && sounds.levelUp) {
        sounds.levelUp();
    }
}

// Calculate distance between two points
function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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
        
        ctx.beginPath();
        // Nose of the ship
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
        // Add a laser
        lasers.push({
            x: ship.x + 4/3 * ship.radius * Math.cos(ship.angle),
            y: ship.y - 4/3 * ship.radius * Math.sin(ship.angle),
            xv: LASER_SPEED * Math.cos(ship.angle) / FPS,
            yv: -LASER_SPEED * Math.sin(ship.angle) / FPS,
            dist: 0,
            explodeTime: 0
        });
        
        // Play laser sound
        if (soundEnabled && sounds.laser) {
            sounds.laser();
        }
    }
}

// Start a new game
function startGame() {
    // Set up initial game state
    score = 0;
    level = 0;
    lives = GAME_LIVES;
    gameOver = false;
    
    // Update displays
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    // Create ship and asteroids
    ship = createShip();
    asteroids = [];
    lasers = [];
    createAsteroids();
    
    // Hide start screen
    startScreen.classList.remove("active");
    
    // Set modern style based on checkbox
    isModernStyle = startStyleToggle.checked;
    styleToggle.checked = isModernStyle;
    
    if (isModernStyle) {
        preRenderAsteroids();
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