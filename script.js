// Shared interaction layer for both landing pages.
const ready = () => {
  document.body.classList.add("is-ready");
  setupHeader();
  setupMenu();
  setupReveal();
  setupAccordion();
  setupCounters();
  setupParallax();
  setupInteractiveCards();
  setupHeroMotion();
  setupForm();
  setupStickyCTA();
};

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setupHeader = () => {
  const header = document.querySelector("[data-header]");
  if (!header) return;

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
};

const setupMenu = () => {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
};

const setupReveal = () => {
  const elements = document.querySelectorAll(".reveal");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  });

  elements.forEach((element, index) => {
    element.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 70}ms`);
    observer.observe(element);
  });
};

const setupAccordion = () => {
  const items = document.querySelectorAll("[data-accordion-item]");
  items.forEach((item) => {
    const trigger = item.querySelector("[data-accordion-trigger]");
    const panel = item.querySelector("[data-accordion-panel]");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.remove("is-open");
        const otherTrigger = other.querySelector("[data-accordion-trigger]");
        const otherPanel = other.querySelector("[data-accordion-panel]");
        if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
        if (otherPanel) {
          otherPanel.style.maxHeight = "";
          otherPanel.style.opacity = "";
          otherPanel.style.transform = "";
        }
      });

      if (willOpen) {
        item.classList.add("is-open");
        trigger.setAttribute("aria-expanded", "true");
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => {
          panel.style.opacity = "1";
          panel.style.transform = "translateY(0)";
        });
      } else {
        panel.style.opacity = "";
        panel.style.transform = "";
      }
    });
  });
};

const setupCounters = () => {
  const counters = document.querySelectorAll("[data-counter]");
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const counter = entry.target;
      const target = Number(counter.dataset.counter || 0);
      const duration = 900;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        counter.textContent = `${Math.round(target * progress)}`;
        if (progress < 1) {
          requestAnimationFrame(tick);
        }
      };

      requestAnimationFrame(tick);
      observer.unobserve(counter);
    });
  }, { threshold: 0.45 });

  counters.forEach((counter) => observer.observe(counter));
};

const setupParallax = () => {
  const parallaxItems = document.querySelectorAll("[data-parallax]");
  if (!parallaxItems.length || prefersReducedMotion()) return;

  window.addEventListener("mousemove", (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 10;
    const y = (event.clientY / window.innerHeight - 0.5) * 10;
    parallaxItems.forEach((item, index) => {
      const factor = (index + 1) * 0.35;
      item.style.setProperty("--parallax-x", `${x * factor}px`);
      item.style.setProperty("--parallax-y", `${y * factor}px`);
    });
  });
};

const setupInteractiveCards = () => {
  const cards = document.querySelectorAll(".offer-card, .step-card, .timeline-card, .trust-rail-card, .testimonial-card, .mini-panel, .benefit-tile, .proof-pill, .counter-card");
  if (!cards.length || prefersReducedMotion()) return;

  cards.forEach((card) => {
    card.addEventListener("mousemove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateY = (x - 0.5) * 6;
      const rotateX = (0.5 - y) * 6;
      card.style.setProperty("--card-rotate-x", `${rotateX}deg`);
      card.style.setProperty("--card-rotate-y", `${rotateY}deg`);
    });

    card.addEventListener("mouseleave", () => {
      card.style.setProperty("--card-rotate-x", "0deg");
      card.style.setProperty("--card-rotate-y", "0deg");
    });
  });
};

const setupHeroMotion = () => {
  if (prefersReducedMotion()) return;

  const glowNodes = document.querySelectorAll(".hero-media-glow, .showcase-glow, .hero-orb");
  if (!glowNodes.length) return;

  window.addEventListener("scroll", () => {
    const scrollRatio = Math.min(window.scrollY / 800, 1);
    glowNodes.forEach((node, index) => {
      const offset = ((index % 3) - 1) * 10;
      node.style.setProperty("--glow-shift-y", `${scrollRatio * (12 + offset)}px`);
      node.style.setProperty("--glow-shift-x", `${scrollRatio * offset * 0.35}px`);
    });
  }, { passive: true });
};

// Lead form validation and completion feedback are only activated on page 1.
const setupForm = () => {
  const form = document.querySelector("[data-form]");
  if (!form) return;

  const fields = [...form.querySelectorAll("[data-field]")];
  const completionBar = document.querySelector("[data-completion-bar]");
  const completionCopy = document.querySelector("[data-completion-copy]");
  const successText = document.querySelector("[data-form-success]");

  const validators = {
    gender: (value) => value.trim() !== "",
    "first-name": (value) => value.trim().length >= 2,
    "last-name": (value) => value.trim().length >= 2,
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
  };

  const messages = {
    gender: "Please select a gender option.",
    "first-name": "Enter a valid first name.",
    "last-name": "Enter a valid last name.",
    email: "Enter a valid email address."
  };

  const syncCompletion = () => {
    const completed = fields.filter((field) => validators[field.id]?.(field.value) ?? false).length;
    const percent = (completed / fields.length) * 100;
    if (completionBar) completionBar.style.width = `${percent}%`;
    if (completionCopy) completionCopy.textContent = `${completed} of ${fields.length} fields complete`;
  };

  const setFieldState = (field) => {
    const fieldGroup = field.closest(".field-group");
    const errorNode = document.querySelector(`[data-error-for="${field.id}"]`);
    const isValid = validators[field.id]?.(field.value) ?? true;

    if (!fieldGroup) return isValid;
    fieldGroup.classList.toggle("is-invalid", !isValid && field.value.trim() !== "");
    if (errorNode) errorNode.textContent = !isValid && field.value.trim() !== "" ? messages[field.id] : "";
    return isValid;
  };

  fields.forEach((field) => {
    field.addEventListener("focus", () => field.closest(".field-group")?.classList.add("is-focused"));
    field.addEventListener("blur", () => {
      field.closest(".field-group")?.classList.remove("is-focused");
      const valid = setFieldState(field);
      field.closest(".field-group")?.classList.toggle("is-complete", valid && field.value.trim() !== "");
      syncCompletion();
    });
    field.addEventListener("input", () => {
      const valid = setFieldState(field);
      field.closest(".field-group")?.classList.toggle("is-complete", valid && field.value.trim() !== "");
      syncCompletion();
      if (successText) successText.textContent = "";
    });
    field.addEventListener("change", () => {
      const valid = setFieldState(field);
      field.closest(".field-group")?.classList.toggle("is-complete", valid && field.value.trim() !== "");
      syncCompletion();
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const results = fields.map((field) => setFieldState(field));
    syncCompletion();
    const valid = results.every(Boolean);

    if (!valid) {
      const firstInvalid = fields.find((field) => !(validators[field.id]?.(field.value) ?? true));
      firstInvalid?.focus();
      return;
    }

    if (successText) {
      successText.textContent = "Thanks. Your secure profile looks ready for the next step.";
    }
    form.reset();
    fields.forEach((field) => field.closest(".field-group")?.classList.remove("is-invalid", "is-complete"));
    syncCompletion();
  });

  syncCompletion();
};

const setupStickyCTA = () => {
  const stickyCTA = document.querySelector("[data-mobile-cta]");
  if (!stickyCTA) return;
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const syncSticky = () => {
    const heroBottom = hero.getBoundingClientRect().bottom;
    stickyCTA.classList.toggle("is-visible", heroBottom < 0);
  };

  syncSticky();
  window.addEventListener("scroll", syncSticky, { passive: true });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", ready);
} else {
  ready();
}
