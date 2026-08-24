(() => {
  "use strict";

  const storageKey = "junnuo-site-language";
  const root = document.documentElement;
  const nav = document.querySelector(".top-nav");
  const menuButton = document.querySelector(".menu-toggle");
  const emailLinks = [...document.querySelectorAll("[data-email-link]")];
  const emailCopyNotice = document.querySelector(".email-copy-notice");
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
  let emailNoticeTimeout;
  let emailNoticeHideTimeout;

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

  function isWeChatBrowser() {
    return /MicroMessenger/i.test(navigator.userAgent);
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall back for embedded browsers that deny the modern clipboard API.
      }
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;";
    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      textarea.remove();
    }
  }

  function showEmailCopyNotice(copied, email) {
    if (!emailCopyNotice) return;

    const isEnglish = root.dataset.language === "en";
    emailCopyNotice.textContent = copied
      ? (isEnglish ? "Email copied. Paste it in your mail app." : "邮箱已复制，可在邮件客户端中粘贴。")
      : (isEnglish ? `Press and hold to copy: ${email}` : `请长按复制邮箱：${email}`);

    window.clearTimeout(emailNoticeTimeout);
    window.clearTimeout(emailNoticeHideTimeout);
    emailCopyNotice.hidden = false;
    window.requestAnimationFrame(() => emailCopyNotice.classList.add("is-visible"));

    emailNoticeTimeout = window.setTimeout(() => {
      emailCopyNotice.classList.remove("is-visible");
      emailNoticeHideTimeout = window.setTimeout(() => {
        emailCopyNotice.hidden = true;
      }, 180);
    }, 2800);
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langSwitch));
  });

  emailLinks.forEach((link) => {
    link.addEventListener("click", async (event) => {
      if (!isWeChatBrowser()) return;

      event.preventDefault();
      const email = link.dataset.email || link.textContent.trim();
      showEmailCopyNotice(await copyText(email), email);
    });
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
