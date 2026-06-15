// Toggle between light and dark, persisting the choice.
// The initial theme is set by an inline script in <head> to avoid a flash.
(function () {
  var root = document.documentElement;

  function current() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  function apply(theme) {
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      apply(current() === "dark" ? "light" : "dark");
    });
  });

  // Follow system changes only if the user hasn't made an explicit choice.
  if (window.matchMedia) {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", function (e) {
        var stored;
        try {
          stored = localStorage.getItem("theme");
        } catch (err) {}
        if (!stored) root.setAttribute("data-theme", e.matches ? "dark" : "light");
      });
  }
})();
