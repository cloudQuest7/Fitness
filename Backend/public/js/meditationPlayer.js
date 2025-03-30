class MeditationPlayer {
    constructor() {
        this.audio = new Audio();
        this.currentTrack = null;
        this.isPlaying = false;
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.playerImage = document.getElementById('current-meditation-image');
        this.playerTitle = document.getElementById('current-meditation-title');
        this.playPauseBtn = document.getElementById('play-pause');
        this.progressBar = document.querySelector('.progress-fill');
        this.currentTimeEl = document.getElementById('current-time');
        this.durationEl = document.getElementById('duration');
        this.volumeSlider = document.querySelector('.volume-slider');
    }

    bindEvents() {
        // Play buttons in recently played section
        document.querySelectorAll('.play-meditation').forEach(button => {
            button.addEventListener('click', (e) => {
                const trackData = JSON.parse(e.currentTarget.closest('[data-track]').dataset.track);
                this.loadTrack(trackData);
            });
        });

        // Main player controls
        this.playPauseBtn.addEventListener('click', () => this.togglePlay());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.onTrackEnd());
        this.volumeSlider.addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
        });
    }

    loadTrack(trackData) {
        this.currentTrack = trackData;
        this.audio.src = trackData.audio;
        this.playerImage.src = trackData.image;
        this.playerTitle.textContent = trackData.title;
        this.play();
    }

    togglePlay() {
        if (!this.currentTrack) return;
        if (this.isPlaying) {
            this.pause();
        } else {
            this.play();
        }
    }

    play() {
        this.isPlaying = true;
        this.audio.play();
        this.playPauseBtn.querySelector('i').classList.replace('fa-play', 'fa-pause');
        // Update all play buttons in recently played section
        this.updatePlayButtons();
    }

    pause() {
        this.isPlaying = false;
        this.audio.pause();
        this.playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        this.updatePlayButtons();
    }

    updateProgress() {
        const percent = (this.audio.currentTime / this.audio.duration) * 100;
        this.progressBar.style.width = `${percent}%`;
        this.currentTimeEl.textContent = this.formatTime(this.audio.currentTime);
        this.durationEl.textContent = this.formatTime(this.audio.duration);
    }

    updatePlayButtons() {
        document.querySelectorAll('.play-meditation i').forEach(icon => {
            icon.classList.replace('fa-pause', 'fa-play');
        });
        if (this.isPlaying && this.currentTrack) {
            const activeButton = document.querySelector(`[data-track] img[src="${this.currentTrack.image}"]`)
                ?.closest('[data-track]')
                ?.querySelector('.play-meditation i');
            if (activeButton) {
                activeButton.classList.replace('fa-play', 'fa-pause');
            }
        }
    }

    formatTime(seconds) {
        if (!seconds) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    onTrackEnd() {
        this.isPlaying = false;
        this.playPauseBtn.querySelector('i').classList.replace('fa-pause', 'fa-play');
        this.updatePlayButtons();
    }
}

// Initialize player when document loads
document.addEventListener('DOMContentLoaded', () => {
    window.meditationPlayer = new MeditationPlayer();
});