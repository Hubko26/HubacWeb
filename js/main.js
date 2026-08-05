// ===== Rok v pätičke =====
document.getElementById("rok").textContent = new Date().getFullYear();

// ===== Animované počítadlá =====
const counters = document.querySelectorAll("[data-count]");
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    counterObserver.unobserve(el);
    const target = parseInt(el.dataset.count, 10);
    const duration = 1400;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}, { threshold: 0.4 });
counters.forEach((c) => counterObserver.observe(c));

// ===== Bočná navigácia — zvýraznenie aktívnej sekcie =====
const sideLinks = document.querySelectorAll(".side-nav a[data-section]");
if (sideLinks.length) {
  const linkFor = {};
  sideLinks.forEach((a) => { linkFor[a.dataset.section] = a; });
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sideLinks.forEach((a) => a.classList.remove("is-active"));
      linkFor[entry.target.id].classList.add("is-active");
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  Object.keys(linkFor).forEach((id) => {
    const sec = document.getElementById(id);
    if (sec) sectionObserver.observe(sec);
  });
}

// ===== Formuláre (mailto — statický web bez backendu) =====
document.querySelectorAll("form[data-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = new FormData(form);
    const typ = form.dataset.form === "callback" ? "Prosím o spätné zavolanie" : "Nezáväzný dopyt z webu";
    const body = [
      typ,
      "",
      "Meno: " + (d.get("meno") || ""),
      "Telefón: " + (d.get("telefon") || ""),
      d.get("email") ? "E-mail: " + d.get("email") : null,
      d.get("sprava") ? "\nSpráva:\n" + d.get("sprava") : null,
    ].filter(Boolean).join("\n");
    window.location.href =
      "mailto:jhubko66@gmail.com?subject=" + encodeURIComponent(typ + " — " + (d.get("meno") || "")) +
      "&body=" + encodeURIComponent(body);
  });
});

// ===== Galéria / lightbox =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");
document.querySelectorAll(".gallery__grid img").forEach((img) => {
  img.addEventListener("click", () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  });
});
const closeLightbox = () => {
  lightbox.hidden = true;
  document.body.style.overflow = "";
};
lightbox.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !lightbox.hidden) closeLightbox();
});
