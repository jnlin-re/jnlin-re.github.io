(() => {
  "use strict";

  const storageKey = "junnuo-site-language";
  const root = document.documentElement;
  const nav = document.querySelector(".top-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const languageButtons = [...document.querySelectorAll("[data-lang-switch]")];
  const sectionLinks = new Map(
    [...document.querySelectorAll("[data-section-link]")].map((link) => [link.dataset.sectionLink, link])
  );
  const titleByLanguage = {
    zh: "林君诺 | 学术主页",
    en: "Junnuo Lin | Academic Homepage"
  };
  const descriptionByLanguage = {
    zh: "林君诺的个人学术主页，研究方向集中在具身智能领域，主要关注 VLA 与 world action models（WAM）。",
    en: "Junnuo Lin's academic homepage: embodied intelligence, VLA, and world action models (WAM)."
  };

  function readStoredLanguage() {
    try {
      const language = window.localStorage.getItem(storageKey);
      return language === "en" ? "en" : "zh";
    } catch {
      return "zh";
    }
  }

  function saveLanguage(language) {
    try {
      window.localStorage.setItem(storageKey, language);
    } catch {
      // The page remains usable when browser storage is unavailable.
    }
  }

  function setLanguage(language, persist = true) {
    const nextLanguage = language === "en" ? "en" : "zh";
    root.dataset.language = nextLanguage;
    root.lang = nextLanguage === "zh" ? "zh-CN" : "en";
    document.title = titleByLanguage[nextLanguage];

    const description = document.querySelector('meta[name="description"]');
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    description?.setAttribute("content", descriptionByLanguage[nextLanguage]);
    ogTitle?.setAttribute("content", titleByLanguage[nextLanguage]);
    ogDescription?.setAttribute("content", descriptionByLanguage[nextLanguage]);

    document.querySelectorAll("[data-zh-label][data-en-label]").forEach((element) => {
      element.setAttribute("aria-label", element.dataset[`${nextLanguage}Label`]);
    });
    document.querySelectorAll("[data-zh-alt][data-en-alt]").forEach((element) => {
      element.setAttribute("alt", element.dataset[`${nextLanguage}Alt`]);
    });
    languageButtons.forEach((button) => {
      const isActive = button.dataset.langSwitch === nextLanguage;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    if (persist) saveLanguage(nextLanguage);
  }

  function closeMenu() {
    nav?.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langSwitch));
  });

  menuButton?.addEventListener("click", () => {
    const isOpen = nav?.classList.toggle("open") ?? false;
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMenu();
  });

  if ("IntersectionObserver" in window) {
    const sections = [...document.querySelectorAll(".academic-content > section[id]")];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      sectionLinks.forEach((link, id) => link.classList.toggle("active", id === visible.target.id));
    }, { rootMargin: "-18% 0px -68% 0px", threshold: [0.01, 0.25, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  setLanguage(readStoredLanguage(), false);
})();
