document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const audioPlayer = document.getElementById('audioPlayer');
    const playBtn = document.getElementById('playBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const progressBar = document.getElementById('progressBar');
    const currentTimeDisplay = document.getElementById('currentTime');
    const durationDisplay = document.getElementById('duration');
    const volumeSlider = document.getElementById('volumeSlider');
    const playlist = document.getElementById('playlist');
    const addBtn = document.getElementById('addBtn');
    const fileInput = document.getElementById('fileInput');
    const songTitle = document.getElementById('songTitle');
    const artistName = document.getElementById('artistName');
    const albumName = document.getElementById('albumName');
    const albumArt = document.getElementById('albumArt');

    // Player state
    let currentSongIndex = 0;
    let songs = [
        {
            title: "Sample Song 1",
            artist: "Sample Artist",
            album: "Sample Album",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
            duration: "2:45",
            art: "https://via.placeholder.com/300"
        },
        {
            title: "Sample Song 2",
            artist: "Sample Artist",
            album: "Sample Album",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
            duration: "3:30",
            art: "https://via.placeholder.com/300"
        },
        {
            title: "Sample Song 3",
            artist: "Sample Artist",
            album: "Sample Album",
            src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
            duration: "4:15",
            art: "https://via.placeholder.com/300"
        }
    ];

    // Initialize the player
    function init() {
        renderPlaylist();
        setupEventListeners();
        loadSong(currentSongIndex);
    }

    // Render playlist
    function renderPlaylist() {
        playlist.innerHTML = '';
        songs.forEach((song, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <div class="song-title">${song.title}</div>
                    <div class="song-artist">${song.artist}</div>
                </div>
                <span class="song-duration">${song.duration}</span>
            `;
            li.addEventListener('click', () => playSong(index));
            playlist.appendChild(li);
        });
    }

    // Set up event listeners
    function setupEventListeners() {
        // Play/Pause button
        playBtn.addEventListener('click', togglePlay);
        
        // Previous button
        prevBtn.addEventListener('click', prevSong);
        
        // Next button
        nextBtn.addEventListener('click', nextSong);
        
        // Progress bar
        progressBar.addEventListener('click', seek);
        
        // Time update
        audioPlayer.addEventListener('timeupdate', updateProgress);
        
        // Song ended
        audioPlayer.addEventListener('ended', nextSong);
        
        // Volume control
        volumeSlider.addEventListener('input', setVolume);
        
        // Add songs button
        addBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileUpload);
    }

    // Load a song
    function loadSong(index) {
        if (index < 0 || index >= songs.length) return;
        
        currentSongIndex = index;
        const song = songs[index];
        
        audioPlayer.src = song.src;
        songTitle.textContent = song.title;
        artistName.textContent = song.artist;
        albumName.textContent = song.album;
        albumArt.src = song.art;
        
        // Update playing state in playlist
        const playlistItems = playlist.querySelectorAll('li');
        playlistItems.forEach((item, i) => {
            if (i === index) {
                item.classList.add('playing');
            } else {
                item.classList.remove('playing');
            }
        });
        
        // Play the song if it was playing before
        if (!audioPlayer.paused) {
            audioPlayer.play()
                .then(() => updatePlayButton())
                .catch(error => console.error('Playback failed:', error));
        }
    }

    // Toggle play/pause
    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play()
                .then(() => updatePlayButton())
                .catch(error => console.error('Playback failed:', error));
        } else {
            audioPlayer.pause();
            updatePlayButton();
        }
    }

    // Update play button icon
    function updatePlayButton() {
        playBtn.innerHTML = audioPlayer.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
    }

    // Play previous song
    function prevSong() {
        currentSongIndex--;
        if (currentSongIndex < 0) {
            currentSongIndex = songs.length - 1;
        }
        loadSong(currentSongIndex);
        audioPlayer.play()
            .then(() => updatePlayButton())
            .catch(error => console.error('Playback failed:', error));
    }

    // Play next song
    function nextSong() {
        currentSongIndex++;
        if (currentSongIndex >= songs.length) {
            currentSongIndex = 0;
        }
        loadSong(currentSongIndex);
        audioPlayer.play()
            .then(() => updatePlayButton())
            .catch(error => console.error('Playback failed:', error));
    }

    // Play specific song
    function playSong(index) {
        loadSong(index);
        audioPlayer.play()
            .then(() => updatePlayButton())
            .catch(error => console.error('Playback failed:', error));
    }

    // Update progress bar
    function updateProgress() {
        const { currentTime, duration } = audioPlayer;
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.setProperty('--progress', `${progressPercent}%`);
        
        // Update time displays
        currentTimeDisplay.textContent = formatTime(currentTime);
        
        if (!isNaN(duration)) {
            durationDisplay.textContent = formatTime(duration);
        }
    }

    // Seek in the song
    function seek(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audioPlayer.duration;
        audioPlayer.currentTime = (clickX / width) * duration;
    }

    // Set volume
    function setVolume() {
        audioPlayer.volume = this.value;
    }

    // Format time (seconds to MM:SS)
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // Handle file upload
    function handleFileUpload(e) {
        const files = e.target.files;
        
        if (files.length === 0) return;
        
        Array.from(files).forEach(file => {
            if (file.type.startsWith('audio/')) {
                const newSong = {
                    title: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
                    artist: "Unknown Artist",
                    album: "Unknown Album",
                    src: URL.createObjectURL(file),
                    duration: "0:00",
                    art: "https://via.placeholder.com/300"
                };
                
                songs.push(newSong);
            }
        });
        
        renderPlaylist();
        fileInput.value = ''; // Reset file input
    }

    // Initialize the player
    init();
});