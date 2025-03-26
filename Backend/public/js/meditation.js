document.addEventListener('DOMContentLoaded', () => {
    const handleImageError = (element) => {
        element.style.setProperty('--bg-image', 'url("/images/meditation/default.jpg")');
    };

    document.querySelectorAll('.meditation-card').forEach(card => {
        const bgUrl = getComputedStyle(card).getPropertyValue('--bg-image');
        const img = new Image();
        img.onerror = () => handleImageError(card);
        img.src = bgUrl.replace(/url\(['"](.+)['"]\)/, '$1');
    });

    const player = new AudioPlayer();
    player.init();
});

class AudioPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.isPlaying = false;
        this.tracks = {
            "Rain Sounds": "/audio/meditation/Zack.mp3",
            "Ocean Waves": "/audio/meditation/lofi.mp3",
            "Forest Ambience": "/audio/meditation/Ligaya.mp3",
            "Crystal Bowls": "/audio/meditation/dandelions.mp3"
        };
    }

    init() {
        this.progressBar = document.querySelector('.progress-bar');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.nowPlayingTitle = document.getElementById('now-playing-title');
        this.playPauseBtn = document.getElementById('play-pause');
        this.bindEvents();
    }

    bindEvents() {
        // Sound tile click handlers
        document.querySelectorAll('.sound-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const soundTitle = tile.dataset.sound;
                this.loadAndPlay(soundTitle);
                this.updateTileIcons(tile);
            });
        });

        // Play/Pause button
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());

        // Audio events
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('loadedmetadata', () => {
            this.durationEl.textContent = this.formatTime(this.audio.duration);
        });
        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.updatePlayButton();
        });
    }

    loadAndPlay(soundTitle) {
        if (this.currentTrack === soundTitle) {
            this.togglePlay();
            return;
        }

        this.currentTrack = soundTitle;
        this.audio.src = this.tracks[soundTitle];
        this.nowPlayingTitle.textContent = soundTitle;
        this.play();
    }

    play() {
        this.audio.play();
        this.isPlaying = true;
        this.updatePlayButton();
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.updatePlayButton();
    }

    togglePlay() {
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    updatePlayButton() {
        const icon = this.playPauseBtn.querySelector('i');
        icon.className = this.isPlaying ? 'fas fa-pause' : 'fas fa-play';
    }

    updateTileIcons(activeTile) {
        // Reset all tile icons to play
        document.querySelectorAll('.sound-tile button i').forEach(icon => {
            icon.className = 'fas fa-play';
        });
        // Update active tile icon
        if (this.isPlaying) {
            activeTile.querySelector('button i').className = 'fas fa-pause';
        }
    }

    updateProgress() {
        const progress = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.style.width = `${progress}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
    }

    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}