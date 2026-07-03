// Lightweight, dependency-free share helpers: copy link + share on X.
// No third-party widgets, scripts, or tracking.
(function () {
  function canonicalUrl() {
    var link = document.querySelector('link[rel="canonical"]');
    return (link && link.href) || window.location.href;
  }

  function articleTitle() {
    var og = document.querySelector('meta[property="og:title"]');
    return (og && og.content) || document.title;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var url = canonicalUrl();

    var x = document.querySelector("[data-share-x]");
    if (x) {
      x.href =
        "https://twitter.com/intent/tweet?text=" +
        encodeURIComponent(articleTitle()) +
        "&url=" +
        encodeURIComponent(url);
    }

    var copy = document.querySelector("[data-share-copy]");
    if (copy) {
      copy.addEventListener("click", function () {
        function flash() {
          var prev = copy.getAttribute("data-label") || copy.textContent;
          copy.setAttribute("data-label", prev);
          copy.textContent = "Copied";
          copy.classList.add("is-copied");
          setTimeout(function () {
            copy.textContent = prev;
            copy.classList.remove("is-copied");
          }, 1600);
        }
        function fallback() {
          var ta = document.createElement("textarea");
          ta.value = url;
          ta.setAttribute("readonly", "");
          ta.style.position = "absolute";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.select();
          try {
            document.execCommand("copy");
            flash();
          } catch (e) {}
          document.body.removeChild(ta);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(flash, fallback);
        } else {
          fallback();
        }
      });
    }
  });
})();
