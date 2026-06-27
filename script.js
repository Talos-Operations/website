/* Talos Operations — shared interactions */
(function () {
  "use strict";

  /* Sticky header background on scroll */
  var header = document.querySelector(".header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav toggle */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.classList.remove("open");
      });
    });
  }

  /* FAQ accordions */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var open = item.classList.toggle("open");
      q.setAttribute("aria-expanded", open ? "true" : "false");
      a.style.maxHeight = open ? a.scrollHeight + "px" : null;
    });
  });

  /* Scroll reveal */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach(function (el) {
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("in");
    });
  }

  /* Real form submit -> Netlify Forms. AJAX for standard forms (inline
     success, no page jump); file-upload forms submit natively. */
  document.querySelectorAll("form[data-netlify]").forEach(function (form) {
    if (form.enctype === "multipart/form-data") return; // files -> native submit
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var hp = form.querySelector('[name="_gotcha"]');
      if (hp && hp.value) return; // bot caught by honeypot
      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;
      var body = new URLSearchParams(new FormData(form)).toString();
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body
      })
        .then(function (res) {
          if (!res.ok) throw new Error("submit failed");
          var ok = form.querySelector(".form-success");
          if (ok) ok.classList.add("show");
          form.querySelectorAll("input, textarea").forEach(function (f) {
            if (f.type !== "submit" && f.type !== "hidden") f.value = "";
          });
          if (btn) btn.disabled = false;
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          form.submit(); // fallback: native submit so the lead still lands
        });
    });
  });

  /* Citations add-on slider (services page) */
  var citeRange = document.getElementById("citeRange");
  if (citeRange) {
    var citeCount = document.getElementById("citeCount");
    var citeTotal = document.getElementById("citeTotal");
    var updateCite = function () {
      var n = parseInt(citeRange.value, 10);
      citeCount.textContent = n;
      citeTotal.textContent = (n * 2).toLocaleString();
    };
    citeRange.addEventListener("input", updateCite);
    updateCite();
  }

  /* Get Started — preselect plan from ?plan= */
  var planParam = new URLSearchParams(location.search).get("plan");
  if (planParam) {
    var planMap = { basic: "Basic", growth: "Get Found", complete: "Complete" };
    var want = planMap[planParam.toLowerCase()];
    if (want) {
      document.querySelectorAll('input[name="plan"]').forEach(function (r) {
        if (r.value.indexOf(want) === 0) r.checked = true;
      });
    }
  }
})();
