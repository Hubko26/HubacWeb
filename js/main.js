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

// ===== Bočná navigácia — farba textu podľa podkladu =====
const DARK_AREAS = ".hero, .marquee, .stats, .section--dark, .photo-cta, .footer";
const updateNavColors = () => {
  sideLinks.forEach((a) => {
    const r = a.getBoundingClientRect();
    if (!r.height) return;
    const behind = document
      .elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      .find((el) => !el.closest(".side-nav"));
    a.classList.toggle("on-dark", !!(behind && behind.closest(DARK_AREAS)));
  });
};
if (sideLinks.length) {
  let navTick = false;
  const requestNavUpdate = () => {
    if (navTick) return;
    navTick = true;
    requestAnimationFrame(() => { updateNavColors(); navTick = false; });
  };
  window.addEventListener("scroll", requestNavUpdate, { passive: true });
  window.addEventListener("resize", requestNavUpdate, { passive: true });
  updateNavColors();
}

// ===== Mobilné menu =====
const topbar = document.querySelector(".topbar");
const navToggle = document.querySelector(".nav-toggle");
navToggle.addEventListener("click", () => {
  const open = topbar.classList.toggle("menu-open");
  navToggle.setAttribute("aria-expanded", open);
  navToggle.setAttribute("aria-label", open ? "Zavrieť menu" : "Otvoriť menu");
});
document.querySelectorAll(".topbar__nav a").forEach((a) =>
  a.addEventListener("click", () => {
    topbar.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

// ===== Formuláre (FormSubmit AJAX — statický web bez backendu) =====
document.querySelectorAll("form[data-form]").forEach((form) => {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = form.querySelector(".form__status");
    const button = form.querySelector("button[type=submit]");
    const d = new FormData(form);
    if (d.get("_honey")) return; // spam bot
    const typ = form.dataset.form === "callback" ? "Prosím o spätné zavolanie" : "Nezáväzný dopyt z webu";
    button.disabled = true;
    button.dataset.label = button.textContent;
    button.textContent = "Odosielam…";
    try {
      const res = await fetch("https://formsubmit.co/ajax/jhubko66@gmail.com", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: typ + " — " + (d.get("meno") || ""),
          _template: "table",
          Typ: typ,
          Meno: d.get("meno") || "",
          Telefon: d.get("telefon") || "",
          Email: d.get("email") || "",
          Sprava: d.get("sprava") || "",
        }),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      status.textContent = "Ďakujeme! Dopyt je odoslaný — ozveme sa do 24 hodín.";
      status.className = "form__status form__status--ok";
      form.reset();
    } catch (err) {
      status.textContent = "Odoslanie zlyhalo. Zavolajte nám prosím na +421 905 637 049 alebo napíšte na jhubko66@gmail.com.";
      status.className = "form__status form__status--err";
    }
    status.hidden = false;
    button.disabled = false;
    button.textContent = button.dataset.label;
  });
});

// ===== Galéria / lightbox s listovaním =====
const lightbox = document.getElementById("lightbox");
const lightboxImg = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector(".lightbox__caption");
const lightboxCounter = lightbox.querySelector(".lightbox__counter");
const galleryImgs = [...document.querySelectorAll(".gallery__grid img")];
let lightboxIndex = 0;

const showLightbox = (i) => {
  lightboxIndex = (i + galleryImgs.length) % galleryImgs.length;
  const img = galleryImgs[lightboxIndex];
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = img.alt;
  lightboxCounter.textContent = (lightboxIndex + 1) + " / " + galleryImgs.length;
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
};
const closeLightbox = () => {
  lightbox.hidden = true;
  document.body.style.overflow = "";
};

galleryImgs.forEach((img, i) => img.addEventListener("click", () => showLightbox(i)));
lightbox.querySelector(".lightbox__nav--prev").addEventListener("click", (e) => { e.stopPropagation(); showLightbox(lightboxIndex - 1); });
lightbox.querySelector(".lightbox__nav--next").addEventListener("click", (e) => { e.stopPropagation(); showLightbox(lightboxIndex + 1); });
lightbox.querySelector(".lightbox__close").addEventListener("click", (e) => { e.stopPropagation(); closeLightbox(); });
lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") showLightbox(lightboxIndex - 1);
  if (e.key === "ArrowRight") showLightbox(lightboxIndex + 1);
});
