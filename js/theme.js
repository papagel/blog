// Toggle between light and dark, persisting the choice.
// Dark is the default; the initial theme is set by an inline script in <head> to avoid a flash.
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

})();
