function createAudioWithFallback(name) {
    const audio = document.createElement("audio");
    const sourceMP3 = document.createElement("source");
    const sourceOGG = document.createElement("source");

    sourceMP3.src = `${name}.mp3`;
    sourceMP3.type = "audio/mpeg";

    sourceOGG.src = `${name}.ogg`;
    sourceOGG.type = "audio/ogg";

    audio.appendChild(sourceMP3);
    audio.appendChild(sourceOGG);

    document.body.appendChild(audio); // Needed for sources to load

    audio.loop = false;
    audio.volume = 0.6;

    return audio;
  }

  const menuMusic = createAudioWithFallback("menu");

  const gameTracks = [
    createAudioWithFallback("game1"),
    createAudioWithFallback("game2"),
    createAudioWithFallback("game3"),
    createAudioWithFallback("game4")
  ];

  let musicQueue = [...gameTracks];
  let currentGameTrack = null;
  let isMuted = false;

  // Fade in helper
  function fadeIn(audio, duration = 1000) {
    audio.volume = 0;
    audio.play();
    let step = 0.06;
    let interval = setInterval(() => {
      if (audio.volume < 0.6) {
        audio.volume = Math.min(audio.volume + step, 0.6);
      } else {
        clearInterval(interval);
      }
    }, duration / (0.6 / step));
  }

  // Fade out helper
  function fadeOut(audio, duration = 500, callback) {
    let step = 0.06;
    let interval = setInterval(() => {
      if (audio.volume > 0) {
        audio.volume = Math.max(audio.volume - step, 0);
      } else {
        clearInterval(interval);
        audio.pause();
        audio.currentTime = 0;
        if (callback) callback();
      }
    }, duration / (0.6 / step));
  }

  function playNextGameTrack() {
    if (musicQueue.length === 0) {
      musicQueue = [...gameTracks];
    }

    let nextTrack;
    do {
      const index = Math.floor(Math.random() * musicQueue.length);
      nextTrack = musicQueue.splice(index, 1)[0];
    } while (nextTrack === currentGameTrack && musicQueue.length > 0);

    currentGameTrack = nextTrack;
    fadeIn(currentGameTrack);
  }

  gameTracks.forEach(track => {
    track.addEventListener("ended", playNextGameTrack);
  });

  function playMusic(target) {
    [menuMusic, ...gameTracks].forEach(audio => {
      if (audio !== target) fadeOut(audio);
    });

    if (target && !isMuted) {
      fadeIn(target);
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    const icon = document.getElementById("muteIcon");
    icon.src = isMuted ? "mute.png" : "unmute.png";
    [menuMusic, ...gameTracks].forEach(a => a.muted = isMuted);
  }

  function setMuteIconVisible(visible) {
    document.getElementById("muteIcon").style.display = visible ? "block" : "none";
  }

  window.addEventListener("click", () => {
    if (!isMuted) playMusic(menuMusic);
  }, { once: true });

  document.getElementById("newgame").addEventListener("click", () => {
    fadeOut(menuMusic, 500, () => {
      playNextGameTrack();
    });

    document.getElementById("title").style.display = "none";
    document.getElementById("hud").style.display = "block";
    document.getElementById("pause").style.display = "none";
    setMuteIconVisible(false);
  });

  document.getElementById("resumegame").addEventListener("click", () => {
    playMusic(currentGameTrack);
    document.getElementById("pause").style.display = "none";
    document.getElementById("hud").style.display = "block";
    setMuteIconVisible(false);
  });

  document.getElementById("savegame").addEventListener("click", () => {
    playMusic(menuMusic);
    document.getElementById("pause").style.display = "none";
    document.getElementById("title").style.display = "block";
    setMuteIconVisible(true);
  });

  function pauseGame() {
    playMusic(menuMusic);
    document.getElementById("pause").style.display = "block";
    document.getElementById("hud").style.display = "none";
    setMuteIconVisible(true);
  }

  window.pauseGame = pauseGame;

  // Mute icon button
  const muteBtn = document.createElement("img");
  muteBtn.id = "muteIcon";
  muteBtn.src = "unmute.png";
  muteBtn.style.cssText = `
    position: fixed;
    bottom: 12px;
    right: 12px;
    width: 36px;
    height: 36px;
    cursor: pointer;
    display: none;
    z-index: 9999;
  `;
  muteBtn.addEventListener("click", toggleMute);
  document.body.appendChild(muteBtn);
