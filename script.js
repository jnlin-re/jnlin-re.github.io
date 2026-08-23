(() => {
  "use strict";

  const body = document.body;
  const titleByLanguage = {
    zh: "林君诺 | 学术主页",
    en: "Junnuo Lin | Academic Homepage"
  };
  const descriptionByLanguage = {
    zh: "林君诺的个人学术主页，研究方向包括自动驾驶 VLA、具身智能、机器人视觉与世界模型。",
    en: "Junnuo Lin's academic homepage: autonomous-driving VLA, embodied intelligence, robot vision, and world models."
  };
  const storageKey = "junnuo-site-language";
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const translatedText = [...document.querySelectorAll("[data-zh][data-en]")];
  const translatedLabels = [...document.querySelectorAll("[data-zh-label][data-en-label]")];
  const translatedAlts = [...document.querySelectorAll("[data-zh-alt][data-en-alt]")];
  const menuButton = document.querySelector(".menu-button");
  const siteNav = document.querySelector(".site-nav");
  const backToTop = document.querySelector(".back-to-top");
  const descriptionMeta = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');

  function readStoredLanguage() {
    try {
      const stored = window.localStorage.getItem(storageKey);
      return stored === "en" ? "en" : "zh";
    } catch {
      return "zh";
    }
  }

  function storeLanguage(language) {
    try {
      window.localStorage.setItem(storageKey, language);
    } catch {
      // The language still changes when storage is unavailable.
    }
  }

  function setLanguage(language, persist = true) {
    const nextLanguage = language === "en" ? "en" : "zh";
    const key = nextLanguage === "zh" ? "zh" : "en";

    body.dataset.currentLanguage = nextLanguage;
    document.documentElement.lang = nextLanguage === "zh" ? "zh-CN" : "en";
    document.title = titleByLanguage[nextLanguage];
    descriptionMeta?.setAttribute("content", descriptionByLanguage[nextLanguage]);
    ogTitle?.setAttribute("content", titleByLanguage[nextLanguage]);
    ogDescription?.setAttribute("content", descriptionByLanguage[nextLanguage]);

    translatedText.forEach((element) => {
      element.textContent = element.dataset[key];
    });
    translatedLabels.forEach((element) => {
      element.setAttribute("aria-label", element.dataset[`${key}Label`]);
    });
    translatedAlts.forEach((element) => {
      element.setAttribute("alt", element.dataset[`${key}Alt`]);
    });
    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === nextLanguage));
    });

    if (persist) {
      storeLanguage(nextLanguage);
    }
  }

  function closeMenu() {
    body.classList.remove("menu-open");
    menuButton?.setAttribute("aria-expanded", "false");
  }

  function toggleMenu() {
    const isOpen = body.classList.toggle("menu-open");
    menuButton?.setAttribute("aria-expanded", String(isOpen));
  }

  function initializeIcons() {
    if (window.lucide?.createIcons) {
      window.lucide.createIcons();
      document.documentElement.classList.add("icons-ready");
    }
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  menuButton?.addEventListener("click", toggleMenu);
  siteNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  backToTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scroll", () => {
    backToTop?.classList.toggle("visible", window.scrollY > 520);
  }, { passive: true });

  const sectionLinks = new Map(
    [...document.querySelectorAll("[data-section-link]")].map((link) => [link.dataset.sectionLink, link])
  );
  const sections = [...document.querySelectorAll("main section[id]")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      sectionLinks.forEach((link, id) => link.classList.toggle("active", id === visible.target.id));
    }, { rootMargin: "-18% 0px -62% 0px", threshold: [0.01, 0.2] });
    sections.forEach((section) => observer.observe(section));
  }

  setLanguage(readStoredLanguage(), false);
  initializeIcons();
  window.addEventListener("load", initializeIcons, { once: true });
})();
