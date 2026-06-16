// Minimal custom audio player for articles.
// Hides itself gracefully if the audio file is missing (e.g. not yet generated).
(function () {
  var SKIP = 15; // seconds to jump on back/forward
  var RATES = [1, 1.25, 1.5, 2, 0.75]; // cycled by the speed button

  function format(seconds) {
    if (!isFinite(seconds)) return "--:--";
    var m = Math.floor(seconds / 60);
    var s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function formatRate(rate) {
    return String(rate) + "\u00D7";
  }

  // These MP3s are headerless VBR, so the browser can only seek into the part
  // it has already downloaded. Returns true if `t` is inside a buffered range;
  // if not, callers should do nothing (rather than letting the seek snap to 0).
  function canSeek(audio, t) {
    var b = audio.buffered;
    for (var i = 0; i < b.length; i++) {
      if (t >= b.start(i) - 0.25 && t <= b.end(i) + 0.25) return true;
    }
    return false;
  }

  function setup(player) {
    var audio = player.querySelector("audio");
    var toggle = player.querySelector(".audio-toggle");
    var back = player.querySelector(".audio-back");
    var fwd = player.querySelector(".audio-fwd");
    var speedBtn = player.querySelector(".audio-speed");
    var progress = player.querySelector(".audio-progress");
    var bar = player.querySelector(".audio-bar");
    var time = player.querySelector(".audio-time");
    if (!audio || !toggle) return;

    // If the audio file can't be loaded, remove the player entirely.
    audio.addEventListener("error", function () {
      player.remove();
    });

    toggle.addEventListener("click", function () {
      if (audio.paused) {
        audio.play();
      } else {
        audio.pause();
      }
    });

    if (back) {
      back.addEventListener("click", function () {
        audio.currentTime = Math.max(0, audio.currentTime - SKIP);
      });
    }

    if (fwd) {
      fwd.addEventListener("click", function () {
        var end = isFinite(audio.duration) ? audio.duration : audio.currentTime + SKIP;
        audio.currentTime = Math.min(end, audio.currentTime + SKIP);
      });
    }

    if (speedBtn) {
      var ri = 0;
      speedBtn.textContent = formatRate(RATES[ri]);
      speedBtn.addEventListener("click", function () {
        ri = (ri + 1) % RATES.length;
        audio.playbackRate = RATES[ri];
        speedBtn.textContent = formatRate(RATES[ri]);
      });
    }

    audio.addEventListener("play", function () {
      player.classList.add("playing");
      toggle.setAttribute("aria-label", "Pause audio");
    });

    audio.addEventListener("pause", function () {
      player.classList.remove("playing");
      toggle.setAttribute("aria-label", "Play audio");
    });

    audio.addEventListener("loadedmetadata", function () {
      if (time) time.textContent = format(audio.duration);
    });

    audio.addEventListener("timeupdate", function () {
      if (audio.duration) {
        var pct = (audio.currentTime / audio.duration) * 100;
        if (bar) bar.style.width = pct + "%";
        if (time) time.textContent = format(audio.duration - audio.currentTime);
      }
    });

    audio.addEventListener("ended", function () {
      if (bar) bar.style.width = "0%";
      if (time) time.textContent = format(audio.duration);
    });

    if (progress) {
      progress.addEventListener("click", function (e) {
        if (!audio.duration) return;
        var rect = progress.getBoundingClientRect();
        var ratio = (e.clientX - rect.left) / rect.width;
        var target = Math.max(0, Math.min(1, ratio)) * audio.duration;
        if (!audio.paused && canSeek(audio, target)) audio.currentTime = target;
      });
    }

    // Pause when the reader clicks away from the article (the text + player).
    var container = player.closest("article") || player;
    document.addEventListener("click", function (e) {
      if (audio.paused) return;
      if (container.contains(e.target)) return;
      audio.pause();
    });

    setupHighlight(player, audio);
  }

  // Word-level highlighting, driven by a per-post timing file (data-timing on
  // the <article>). Optional: pages without timing data are unaffected.
  function setupHighlight(player, audio) {
    var article = player.closest("article");
    var url = article && article.getAttribute("data-timing");
    if (!article || !url) return;

    var timings = [];
    var words = [];
    var lastIdx = -1;

    fetch(url)
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        timings = data;
        words = Array.prototype.slice.call(article.querySelectorAll(".w"));
        words.forEach(function (el, i) {
          el.addEventListener("click", function () {
            if (!audio.paused && timings[i] && canSeek(audio, timings[i][0])) {
              audio.currentTime = timings[i][0];
            }
          });
        });
      })
      .catch(function () {});

    // Greatest index whose start time is <= t (stays lit through pauses).
    function findIndex(t) {
      var lo = 0;
      var hi = timings.length - 1;
      var res = -1;
      while (lo <= hi) {
        var mid = (lo + hi) >> 1;
        if (timings[mid][0] <= t) {
          res = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      return res;
    }

    function update() {
      if (!timings.length || !words.length) return;
      var idx = findIndex(audio.currentTime);
      if (idx === lastIdx) return;
      if (lastIdx >= 0 && words[lastIdx]) words[lastIdx].classList.remove("is-active");
      if (idx >= 0 && words[idx]) words[idx].classList.add("is-active");
      lastIdx = idx;
    }

    audio.addEventListener("timeupdate", update);
    audio.addEventListener("seeked", update);
    audio.addEventListener("ended", function () {
      if (lastIdx >= 0 && words[lastIdx]) words[lastIdx].classList.remove("is-active");
      lastIdx = -1;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".audio-player").forEach(setup);
  });
})();
