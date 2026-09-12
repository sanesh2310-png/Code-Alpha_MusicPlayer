(function(){

  // ---- Playlist data -------------------------------------------------
  // Point "src" at your own audio files inside the songs/ folder.
  // File names below are just suggestions — rename to match your files,
  // or add/remove tracks freely.
  const playlist = [
    { title: "Piano",     artist: "Nova Ridge",    src: "songs/song1.mp3" },
    { title: "Phonk ", artist: "Coral Static",  src: "songs/song2.mp3" },
    { title: "Phonk Music",      artist: "Halide",        src: "songs/song3.mp3" },
    { title: "Coffee Music",     artist: "Unknown",    src: "songs/song4.mp3" },
    { title: "Jazz Song",  artist: "Suner",   src: "songs/song5.mp3"}
  ];

  // ---- Elements --------------------------------------------------------
  const audio = new Audio();
  let currentIndex = 0;
  let isPlaying = false;
  let autoplay = true;
  let isMuted = false;
  let lastVolume = 0.7;

  const playBtn = document.getElementById('playBtn');
  const playIcon = document.getElementById('playIcon');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const seek = document.getElementById('seek');
  const currentTimeEl = document.getElementById('currentTime');
  const durationEl = document.getElementById('duration');
  const trackTitle = document.getElementById('trackTitle');
  const trackArtist = document.getElementById('trackArtist');
  const labelInitials = document.getElementById('labelInitials');
  const record = document.querySelector('.record');
  const tonearm = document.getElementById('tonearm');
  const volumeSlider = document.getElementById('volumeSlider');
  const muteBtn = document.getElementById('muteBtn');
  const volIcon = document.getElementById('volIcon');
  const autoplayBtn = document.getElementById('autoplayBtn');
  const playlistEl = document.getElementById('playlist');
  const playlistCount = document.getElementById('playlistCount');
  const audioHint = document.getElementById('audioHint');

  const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
  const ICON_PAUSE = '<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>';
  const ICON_VOL_ON = '<path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/>';
  const ICON_VOL_MUTE = '<path d="M16.5 12A4.5 4.5 0 0 0 14 8v1.5l2.4 2.4c.06-.29.1-.59.1-.9zM3 10v4h4l5 5v-6.2l-4.6-4.6L7 10H3zm14.3-6.7L2.1 18.5 3.2 19.6 5.6 17.2 12 22V13.4l1.9 1.9-1.9-1.9v.1L18.6 4.6z"/>';

  function initials(title){
    return title.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  }

  function formatTime(sec){
    if (!isFinite(sec) || isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function loadTrack(index, autoPlayAfterLoad){
    currentIndex = (index + playlist.length) % playlist.length;
    const track = playlist[currentIndex];

    audio.src = track.src;
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    labelInitials.textContent = initials(track.title);
    seek.value = 0;
    updateSeekFill(0);
    currentTimeEl.textContent = '0:00';
    durationEl.textContent = '0:00';

    renderPlaylist();

    if (autoPlayAfterLoad){
      play();
    }
  }

  function play(){
    audio.play().then(() => {
      isPlaying = true;
      playIcon.innerHTML = ICON_PAUSE;
      record.classList.add('spinning');
      tonearm.classList.add('playing');
      audioHint.textContent = '';
    }).catch(() => {
      isPlaying = false;
      audioHint.textContent = `Couldn't load "${playlist[currentIndex].src}" — add your own audio file at that path inside the songs/ folder.`;
    });
  }

  function pause(){
    audio.pause();
    isPlaying = false;
    playIcon.innerHTML = ICON_PLAY;
    record.classList.remove('spinning');
    tonearm.classList.remove('playing');
  }

  function togglePlay(){
    if (isPlaying) pause();
    else play();
  }

  function nextTrack(){
    loadTrack(currentIndex + 1, isPlaying);
  }

  function prevTrack(){
    // If more than 3s into the track, restart it instead of going back
    if (audio.currentTime > 3){
      audio.currentTime = 0;
      return;
    }
    loadTrack(currentIndex - 1, isPlaying);
  }

  function updateSeekFill(pct){
    seek.style.background = `linear-gradient(to right, var(--copper) 0%, var(--copper) ${pct}%, var(--panel-line) ${pct}%, var(--panel-line) 100%)`;
  }

  function updateVolumeFill(pct){
    volumeSlider.style.background = `linear-gradient(to right, var(--text-dim) 0%, var(--text-dim) ${pct}%, var(--panel-line) ${pct}%, var(--panel-line) 100%)`;
  }

  function renderPlaylist(){
    playlistEl.innerHTML = '';
    playlist.forEach((track, i) => {
      const li = document.createElement('li');
      li.className = 'playlist-item' + (i === currentIndex ? ' playing' : '');
      li.innerHTML = `
        <span class="playlist-index">${i === currentIndex && isPlaying ? '♪' : i + 1}</span>
        <div class="playlist-info">
          <div class="playlist-title">${track.title}</div>
          <div class="playlist-artist">${track.artist}</div>
        </div>
        <span class="playlist-duration" data-dur-index="${i}">--:--</span>
      `;
      li.addEventListener('click', () => loadTrack(i, true));
      playlistEl.appendChild(li);
    });
    playlistCount.textContent = `${playlist.length} track${playlist.length === 1 ? '' : 's'}`;
  }

  // ---- Event wiring ------------------------------------------------

  playBtn.addEventListener('click', togglePlay);
  nextBtn.addEventListener('click', () => loadTrack(currentIndex + 1, true));
  prevBtn.addEventListener('click', prevTrack);

  audio.addEventListener('timeupdate', () => {
    if (audio.duration){
      const pct = (audio.currentTime / audio.duration) * 100;
      seek.value = pct;
      updateSeekFill(pct);
      currentTimeEl.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audio.duration);
    const durEl = document.querySelector(`[data-dur-index="${currentIndex}"]`);
    if (durEl) durEl.textContent = formatTime(audio.duration);
  });

  audio.addEventListener('ended', () => {
    if (autoplay){
      nextTrack();
    } else {
      pause();
    }
  });

  seek.addEventListener('input', () => {
    if (audio.duration){
      audio.currentTime = (seek.value / 100) * audio.duration;
      updateSeekFill(seek.value);
    }
  });

  volumeSlider.addEventListener('input', () => {
    const val = volumeSlider.value / 100;
    audio.volume = val;
    lastVolume = val;
    isMuted = val === 0;
    volIcon.innerHTML = isMuted ? ICON_VOL_MUTE : ICON_VOL_ON;
    updateVolumeFill(volumeSlider.value);
  });

  muteBtn.addEventListener('click', () => {
    if (isMuted){
      audio.volume = lastVolume || 0.7;
      volumeSlider.value = (lastVolume || 0.7) * 100;
      isMuted = false;
      volIcon.innerHTML = ICON_VOL_ON;
    } else {
      lastVolume = audio.volume;
      audio.volume = 0;
      volumeSlider.value = 0;
      isMuted = true;
      volIcon.innerHTML = ICON_VOL_MUTE;
    }
    updateVolumeFill(volumeSlider.value);
  });

  autoplayBtn.addEventListener('click', () => {
    autoplay = !autoplay;
    autoplayBtn.classList.toggle('active', autoplay);
    autoplayBtn.setAttribute('aria-pressed', String(autoplay));
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space'){
      e.preventDefault();
      togglePlay();
    } else if (e.key === 'ArrowRight'){
      loadTrack(currentIndex + 1, true);
    } else if (e.key === 'ArrowLeft'){
      prevTrack();
    }
  });

  // ---- Init ------------------------------------------------------

  audio.volume = lastVolume;
  volumeSlider.value = lastVolume * 100;
  updateVolumeFill(lastVolume * 100);
  loadTrack(0, false);
  audioHint.textContent = 'Add your own .mp3 files to the songs/ folder (matching the names in script.js) to hear playback.';

})();
