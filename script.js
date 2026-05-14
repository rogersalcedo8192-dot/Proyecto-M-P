const rotatingPhrases = [
  "web apps, landing pages y sistemas que convierten",
  "automatizacion para WhatsApp, Instagram, TikTok y Telegram",
  "CRM, flujos con Make, n8n y correos con Resend",
  "videos, imagenes, branding y multimedia para vender mejor"
];

document.addEventListener("DOMContentLoaded", () => {
  const constrainedMode = isConstrainedExperience();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  document.documentElement.classList.toggle("is-constrained", constrainedMode);
  initOptimizedMedia(constrainedMode);

  if (!constrainedMode) {
    initPointerGlow();
    initSpaceField();
    initCursor();
    initHoverSpotlights();
    initParticles();
    initHeroParallax();
    initMagneticButtons();
  }

  initReveal();
  initMatrixText();
  initCinematicWords();
  initRotatingText();
  initCounters();
  initNavigationState();
  initMobileNavigation();
  initSvgDraw();
  initDiagonalCarousels(reducedMotion);
  initOfferDeck();
  initAIWidget();
});

function isConstrainedExperience() {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const saveData = navigator.connection?.saveData === true;
  const smallViewport = window.matchMedia("(max-width: 720px)").matches;

  return prefersReducedMotion || saveData || coarsePointer || smallViewport;
}

function initOptimizedMedia(constrainedMode) {
  const lazyVideos = Array.from(document.querySelectorAll(".js-lazy-video, [data-lazy-video]"));
  if (!lazyVideos.length) return;

  const loadVideo = (video) => {
    if (video.dataset.loaded === "true") return;

    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
    });

    video.dataset.loaded = "true";
    video.load();

    const playPromise = video.play();
    if (playPromise?.catch) playPromise.catch(() => {});
  };

  if (!("IntersectionObserver" in window)) {
    lazyVideos.forEach(loadVideo);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadVideo(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "260px 0px" }
  );

  lazyVideos.forEach((video) => observer.observe(video));
}

function initPointerGlow() {
  const glow = document.getElementById("pointerGlow");
  if (!glow) return;

  const updatePointer = (x, y) => {
    glow.style.setProperty("--pointer-x", `${x}px`);
    glow.style.setProperty("--pointer-y", `${y}px`);
  };

  updatePointer(window.innerWidth / 2, window.innerHeight / 2);

  document.addEventListener("pointermove", (event) => {
    updatePointer(event.clientX, event.clientY);
  }, { passive: true });
}

function initSpaceField() {
  const field = document.getElementById("spaceField");
  if (!field) return;

  const shapeKinds = ["square", "ring", "diamond", "triangle", "hex"];
  const stars = [];
  const shapes = [];
  const pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

  let rafId = 0;

  function createStar() {
    const star = document.createElement("span");
    star.className = "space-star";

    const size = randomBetween(1, 3.4);
    const opacity = randomBetween(0.28, 0.8);

    star.style.setProperty("--star-size", `${size}px`);
    star.style.setProperty("--star-opacity", opacity.toFixed(3));
    star.style.setProperty("--star-duration", `${randomBetween(4.8, 10.4).toFixed(2)}s`);
    star.style.setProperty("--star-delay", `${(-randomBetween(0, 8)).toFixed(2)}s`);

    field.appendChild(star);

    return {
      node: star,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      driftX: randomBetween(-0.18, 0.18),
      driftY: randomBetween(-0.12, 0.12),
      depth: randomBetween(0.15, 0.5),
      range: randomBetween(3, 10),
      angle: randomBetween(0, Math.PI * 2)
    };
  }

  function createShape() {
    const shape = document.createElement("span");
    const kind = shapeKinds[Math.floor(Math.random() * shapeKinds.length)];
    shape.className = `space-shape ${kind}`;

    const size = randomBetween(46, 120);
    shape.style.setProperty("--shape-size", `${size}px`);
    shape.style.setProperty("--shape-opacity", randomBetween(0.12, 0.32).toFixed(3));

    field.appendChild(shape);

    return {
      node: shape,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      depth: randomBetween(0.5, 1.25),
      baseRotation: randomBetween(0, 360),
      rotationSpeed: randomBetween(-0.18, 0.18),
      floatRadius: randomBetween(8, 28),
      angle: randomBetween(0, Math.PI * 2),
      speed: randomBetween(0.002, 0.007)
    };
  }

  function clearField() {
    window.cancelAnimationFrame(rafId);
    field.innerHTML = "";
    stars.length = 0;
    shapes.length = 0;
  }

  function buildField() {
    clearField();

    const starCount = window.innerWidth < 720 ? 70 : 130;
    const shapeCount = window.innerWidth < 720 ? 10 : 18;

    for (let index = 0; index < starCount; index += 1) {
      stars.push(createStar());
    }

    for (let index = 0; index < shapeCount; index += 1) {
      shapes.push(createShape());
    }

    render();
  }

  function render() {
    const pointerXRatio = pointer.x / Math.max(window.innerWidth, 1) - 0.5;
    const pointerYRatio = pointer.y / Math.max(window.innerHeight, 1) - 0.5;

    stars.forEach((star) => {
      star.angle += 0.006;
      star.x += star.driftX;
      star.y += star.driftY;

      if (star.x < -20) star.x = window.innerWidth + 20;
      if (star.x > window.innerWidth + 20) star.x = -20;
      if (star.y < -20) star.y = window.innerHeight + 20;
      if (star.y > window.innerHeight + 20) star.y = -20;

      const swayX = Math.cos(star.angle) * star.range;
      const swayY = Math.sin(star.angle) * star.range * 0.7;
      const repelX = -pointerXRatio * 18 * star.depth;
      const repelY = -pointerYRatio * 18 * star.depth;

      star.node.style.transform = `translate3d(${(star.x + swayX + repelX).toFixed(2)}px, ${(star.y + swayY + repelY).toFixed(2)}px, 0)`;
    });

    shapes.forEach((shape) => {
      shape.angle += shape.speed;

      const floatX = Math.cos(shape.angle) * shape.floatRadius;
      const floatY = Math.sin(shape.angle) * shape.floatRadius * 0.65;
      const shiftX = -pointerXRatio * 42 * shape.depth;
      const shiftY = -pointerYRatio * 42 * shape.depth;
      const rotation = shape.baseRotation + shape.angle * (180 / Math.PI) * shape.rotationSpeed;

      shape.node.style.transform = `translate3d(${(shape.x + floatX + shiftX).toFixed(2)}px, ${(shape.y + floatY + shiftY).toFixed(2)}px, 0) rotate(${rotation.toFixed(2)}deg)`;
    });

    rafId = requestAnimationFrame(render);
  }

  document.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  window.addEventListener("resize", buildField);
  buildField();
}

function initHoverSpotlights() {
  const selector = [
    ".glass-panel",
    ".primary-button",
    ".solution-link",
    ".solution-tile-frame",
    ".nav-links a",
    ".brand",
    ".ticker-tool"
  ].join(", ");

  document.querySelectorAll(selector).forEach((element) => {
    element.classList.add("hover-spotlight");
    element.style.setProperty("--spotlight-x", "50%");
    element.style.setProperty("--spotlight-y", "50%");

    element.addEventListener("mouseenter", () => {
      element.classList.add("is-lit");
    });

    element.addEventListener("mouseleave", () => {
      element.classList.remove("is-lit");
      element.style.setProperty("--spotlight-x", "50%");
      element.style.setProperty("--spotlight-y", "50%");
    });

    element.addEventListener("mousemove", (event) => {
      const rect = element.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      element.style.setProperty("--spotlight-x", `${x}%`);
      element.style.setProperty("--spotlight-y", `${y}%`);
    });
  });
}

function initMatrixText() {
  const target = document.querySelector("[data-matrix-text]");
  if (!target) return;

  const finalText = target.textContent.replace(/\s+/g, " ").trim();
  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-<>?/|";
  const overlay = document.createElement("span");
  const revealStep = 1 / Math.max(finalText.length, 1);
  let progress = 0;

  overlay.className = "matrix-text-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.textContent = finalText;
  target.dataset.finalText = finalText;
  target.appendChild(overlay);
  target.classList.add("is-matrix-running");

  const intervalId = window.setInterval(() => {
    progress += revealStep * 1.15;

    const revealedChars = Math.floor(progress * finalText.length);
    overlay.textContent = finalText
      .split("")
      .map((char, index) => {
        if (char === " ") return " ";
        if (index < revealedChars) return finalText[index];
        return glyphs[Math.floor(Math.random() * glyphs.length)];
      })
      .join("");

    if (revealedChars >= finalText.length) {
      overlay.remove();
      target.classList.remove("is-matrix-running");
      window.clearInterval(intervalId);
    }
  }, 34);
}

function initCinematicWords() {
  const grids = Array.from(document.querySelectorAll("[data-word-grid]"));
  if (!grids.length) return;

  grids.forEach((grid) => {
    const words = Array.from(grid.querySelectorAll(".cinematic-word"));
    if (!words.length) return;

    const fallbackOrder = words.map((_, index) => index);
    const parsedOrder = (grid.dataset.wordOrder || "")
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isInteger(value) && value >= 0 && value < words.length);
    const order = parsedOrder.length ? parsedOrder : fallbackOrder;
    let activeIndex = 0;

    const activateWord = (index) => {
      words.forEach((word, currentIndex) => {
        word.classList.toggle("is-active", currentIndex === order[index]);
      });
    };

    activateWord(activeIndex);

    window.setInterval(() => {
      activeIndex = (activeIndex + 1) % order.length;
      activateWord(activeIndex);
    }, 1400);
  });
}

function initCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  const cursor = document.createElement("div");
  cursor.id = "mp-cursor";
  cursor.innerHTML = '<div class="cursor-dot"></div><div class="cursor-ring"></div>';
  document.body.appendChild(cursor);

  const style = document.createElement("style");
  style.textContent = `
    #mp-cursor {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 9999;
      pointer-events: none;
      mix-blend-mode: difference;
    }
    #mp-cursor .cursor-dot,
    #mp-cursor .cursor-ring {
      position: absolute;
      transform: translate(-50%, -50%);
      border-radius: 999px;
    }
    #mp-cursor .cursor-dot {
      width: 6px;
      height: 6px;
      background: #fff;
      transition: transform 120ms ease;
    }
    #mp-cursor .cursor-ring {
      width: 34px;
      height: 34px;
      border: 1.5px solid rgba(255, 255, 255, 0.55);
      transition: width 180ms ease, height 180ms ease, border-color 180ms ease;
    }
    body.cursor-hover #mp-cursor .cursor-ring {
      width: 52px;
      height: 52px;
      border-color: rgba(57, 160, 255, 0.9);
    }
    body.cursor-hover #mp-cursor .cursor-dot {
      transform: translate(-50%, -50%) scale(1.45);
    }
    body.cursor-click #mp-cursor .cursor-ring {
      width: 28px;
      height: 28px;
    }
  `;
  document.head.appendChild(style);

  const dot = cursor.querySelector(".cursor-dot");
  const ring = cursor.querySelector(".cursor-ring");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  const hoverTargets = "a, button, [data-carousel-slide], .solution-tile-frame";
  document.querySelectorAll(hoverTargets).forEach((element) => {
    element.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
    element.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
  });

  document.addEventListener("mousedown", () => document.body.classList.add("cursor-click"));
  document.addEventListener("mouseup", () => document.body.classList.remove("cursor-click"));

  function animateCursor() {
    ringX += (mouseX - ringX) * 0.14;
    ringY += (mouseY - ringY) * 0.14;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateCursor);
  }

  requestAnimationFrame(animateCursor);
}

function initReveal() {
  const revealItems = document.querySelectorAll(".reveal");
  if (!revealItems.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initRotatingText() {
  const textNode = document.getElementById("rotatingText");
  if (!textNode) return;

  let index = 0;

  window.setInterval(() => {
    textNode.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-12px)" },
        { opacity: 0, transform: "translateY(12px)" },
        { opacity: 1, transform: "translateY(0)" }
      ],
      {
        duration: 700,
        easing: "ease"
      }
    );

    window.setTimeout(() => {
      index = (index + 1) % rotatingPhrases.length;
      textNode.textContent = rotatingPhrases[index];
    }, 280);
  }, 3200);
}

function initParticles() {
  const canvas = document.getElementById("particleLayer");
  if (!canvas) return;

  const context = canvas.getContext("2d");
  let particles = [];
  let width = 0;
  let height = 0;
  const mouse = { x: -9999, y: -9999 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = createParticles(width, height);
  }

  function drawLinks() {
    for (let index = 0; index < particles.length; index += 1) {
      const current = particles[index];
      for (let next = index + 1; next < particles.length; next += 1) {
        const target = particles[next];
        const dx = current.x - target.x;
        const dy = current.y - target.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 90) continue;

        context.beginPath();
        context.moveTo(current.x, current.y);
        context.lineTo(target.x, target.y);
        context.strokeStyle = `rgba(120, 160, 255, ${(1 - distance / 90) * 0.08})`;
        context.lineWidth = 0.6;
        context.stroke();
      }
    }
  }

  function frame() {
    context.clearRect(0, 0, width, height);
    drawLinks();

    particles.forEach((particle) => {
      const mouseDx = particle.x - mouse.x;
      const mouseDy = particle.y - mouse.y;
      const mouseDistance = Math.hypot(mouseDx, mouseDy);

      if (mouseDistance < 120) {
        const force = (120 - mouseDistance) / 120;
        particle.vx += (mouseDx / Math.max(mouseDistance, 1)) * force * 0.4;
        particle.vy += (mouseDy / Math.max(mouseDistance, 1)) * force * 0.4;
      }

      particle.vx *= 0.985;
      particle.vy *= 0.985;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life += 1;

      if (particle.life > particle.maxLife || particle.y < -20) {
        resetParticle(particle, width, height, false);
      }

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y > height + 20) particle.y = -20;

      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fillStyle = particle.color(particle);
      context.shadowBlur = 18;
      context.shadowColor = particle.shadow;
      context.fill();
    });

    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("pointermove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
  }, { passive: true });
  resize();
  frame();
}

function createParticles(width, height) {
  const amount = width < 720 ? 42 : 88;
  return Array.from({ length: amount }, () => {
    const particle = {};
    resetParticle(particle, width, height, true);
    return particle;
  });
}

function resetParticle(particle, width, height, initial) {
  const isBlue = Math.random() > 0.5;
  particle.x = Math.random() * width;
  particle.y = initial ? Math.random() * height : height + 20;
  particle.vx = (Math.random() - 0.5) * 0.22;
  particle.vy = -(Math.random() * 0.35 + 0.08);
  particle.radius = Math.random() * 1.8 + 0.4;
  particle.life = 0;
  particle.maxLife = Math.random() * 260 + 180;
  particle.shadow = isBlue ? "rgba(57, 160, 255, 0.85)" : "rgba(255, 63, 180, 0.78)";
  particle.color = (item) => {
    const alpha = Math.sin((item.life / item.maxLife) * Math.PI) * 0.7;
    return isBlue
      ? `rgba(57, 160, 255, ${alpha})`
      : `rgba(255, 63, 180, ${alpha})`;
  };
}

function initHeroParallax() {
  const heroContent = document.querySelector(".hero-content");
  const orbs = document.querySelectorAll(".hero-orb");
  if (!heroContent && !orbs.length) return;

  document.addEventListener("mousemove", (event) => {
    const xRatio = event.clientX / window.innerWidth - 0.5;
    const yRatio = event.clientY / window.innerHeight - 0.5;

    orbs.forEach((orb, index) => {
      const depth = index === 0 ? 28 : 18;
      orb.style.transform = `translate3d(${xRatio * depth}px, ${yRatio * depth}px, 0)`;
    });
  });

  window.addEventListener(
    "scroll",
    () => {
      const offset = window.scrollY;
      if (heroContent) {
        heroContent.style.transform = `translate3d(0, ${offset * 0.08}px, 0)`;
      }
    },
    { passive: true }
  );
}

function initMagneticButtons() {
  document.querySelectorAll(".primary-button, .solution-link").forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${x * 0.16}px, ${y * 0.22}px) scale(1.03)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "";
    });
  });
}

function initCounters() {
  const metrics = document.querySelectorAll(".metric strong");
  if (!metrics.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const element = entry.target;
        const raw = element.textContent.trim();
        const number = Number.parseInt(raw.replace(/\D/g, ""), 10);
        const prefix = raw.match(/^[^\d]*/)?.[0] ?? "";
        const suffix = raw.match(/[^\d]*$/)?.[0] ?? "";

        if (!number) return;

        let start = 0;
        const duration = 1400;

        const update = (timestamp) => {
          if (!start) start = timestamp;
          const progress = Math.min((timestamp - start) / duration, 1);
          const eased = 1 - (1 - progress) ** 3;
          element.textContent = `${prefix}${Math.floor(number * eased)}${suffix}`;
          if (progress < 1) requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
        observer.unobserve(element);
      });
    },
    { threshold: 0.5 }
  );

  metrics.forEach((metric) => observer.observe(metric));
}

function initNavigationState() {
  const navLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = Array.from(document.querySelectorAll("section[id]"));
  if (!navLinks.length || !sections.length) return;

  const style = document.createElement("style");
  style.textContent = `
    .nav-links a.active {
      color: #fff;
      opacity: 1;
      position: relative;
    }
    .nav-links a.active::after {
      content: "";
      position: absolute;
      left: 0;
      bottom: -4px;
      width: 100%;
      height: 1.5px;
      border-radius: 999px;
      background: linear-gradient(90deg, #3b82f6, #ff3fb4);
    }
  `;
  document.head.appendChild(style);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-40% 0px -55% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

function initMobileNavigation() {
  const toggle = document.querySelector("[data-mobile-nav-toggle]");
  const panel = document.querySelector("[data-mobile-nav-panel]");
  if (!toggle || !panel) return;

  const panelLinks = Array.from(panel.querySelectorAll('a[href^="#"]'));

  const positionPanel = () => {
    const rect = toggle.getBoundingClientRect();
    const panelWidth = panel.offsetWidth || (window.innerWidth <= 720 ? 160 : 172);
    const panelHeight = panel.offsetHeight || (window.innerWidth <= 720 ? 148 : 160);
    const left = Math.max(12, rect.left - panelWidth + rect.width);
    const top = Math.max(12, rect.top + rect.height + 4);

    panel.style.setProperty("--mobile-nav-left", `${left}px`);
    panel.style.setProperty("--mobile-nav-top", `${top}px`);
  };

  const closePanel = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir navegación");
    panel.classList.remove("is-open");
    panel.hidden = true;
    document.body.classList.remove("mobile-nav-open");
  };

  const openPanel = () => {
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Cerrar navegación");
    positionPanel();
    panel.hidden = false;
    document.body.classList.add("mobile-nav-open");
    requestAnimationFrame(() => {
      panel.classList.add("is-open");
    });
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      closePanel();
      return;
    }
    openPanel();
  });

  panelLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closePanel();
    });
  });

  document.addEventListener("click", (event) => {
    if (panel.hidden) return;
    if (panel.contains(event.target) || toggle.contains(event.target)) return;
    closePanel();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePanel();
  });

  window.addEventListener("resize", () => {
    positionPanel();
    if (window.innerWidth > 960) closePanel();
  });

  window.addEventListener("scroll", () => {
    if (!panel.hidden) positionPanel();
  }, { passive: true });

  positionPanel();
}

function initSvgDraw() {
  const style = document.createElement("style");
  style.textContent = `
    .solution-tile svg path,
    .solution-tile svg rect,
    .solution-tile svg circle {
      stroke-dasharray: 600;
      stroke-dashoffset: 600;
      transition: stroke-dashoffset 1.15s cubic-bezier(.16, 1, .3, 1);
    }
    .solution-tile.is-active svg path,
    .solution-tile.is-active svg rect,
    .solution-tile.is-active svg circle {
      stroke-dashoffset: 0;
    }
  `;
  document.head.appendChild(style);
}

function initDiagonalCarousels(staticMode = false) {
  const carousels = document.querySelectorAll("[data-diagonal-carousel]");
  carousels.forEach((carouselNode) => {
    const carousel = new DiagonalCarousel(carouselNode, staticMode);
    carousel.init();
  });
}

function initOfferDeck() {
  const grid = document.querySelector(".offers-grid");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".offer-card"));
  if (!cards.length) return;

  const mobileQuery = window.matchMedia("(max-width: 720px)");
  let current = 0;
  let isDragging = false;
  let startX = 0;
  let dragX = 0;

  const normalize = (index) => (index + cards.length) % cards.length;

  const resetDesktop = () => {
    grid.classList.remove("is-offer-deck");
    cards.forEach((card) => {
      card.classList.remove("is-active", "is-before", "is-after");
      card.style.transform = "";
      card.style.opacity = "";
      card.style.zIndex = "";
      card.style.pointerEvents = "";
    });
  };

  const render = () => {
    if (!mobileQuery.matches) {
      resetDesktop();
      return;
    }

    grid.classList.add("is-offer-deck");

    cards.forEach((card, index) => {
      let diff = index - current;
      if (diff < 0) diff += cards.length;

      const isActive = diff === 0;
      const stackIndex = Math.min(diff, 3);
      const x = isActive ? dragX : stackIndex * 13;
      const y = isActive ? 0 : stackIndex * 13;
      const rotate = isActive ? clamp(dragX / 18, -12, 12) : stackIndex * -2.6;
      const scale = isActive ? 1 : 1 - stackIndex * 0.055;
      const opacity = diff > 3 ? 0 : 1 - stackIndex * 0.12;

      card.classList.toggle("is-active", isActive);
      card.classList.toggle("is-before", diff > cards.length - 2);
      card.classList.toggle("is-after", diff > 0 && diff <= 3);
      card.style.transform = `translate3d(calc(-50% + ${x}px), ${y}px, 0) rotate(${rotate}deg) scale(${scale})`;
      card.style.opacity = opacity.toFixed(2);
      card.style.zIndex = String(100 - stackIndex);
      card.style.pointerEvents = isActive ? "auto" : "none";
    });
  };

  const move = (direction) => {
    current = normalize(current + direction);
    dragX = 0;
    render();
  };

  grid.addEventListener("pointerdown", (event) => {
    if (!mobileQuery.matches) return;
    isDragging = true;
    startX = event.clientX;
    dragX = 0;
    grid.setPointerCapture?.(event.pointerId);
    grid.classList.add("is-dragging");
  });

  grid.addEventListener("pointermove", (event) => {
    if (!isDragging || !mobileQuery.matches) return;
    dragX = event.clientX - startX;
    render();
  });

  const finishDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    grid.classList.remove("is-dragging");

    if (Math.abs(dragX) > 68) {
      move(dragX < 0 ? 1 : -1);
      return;
    }

    dragX = 0;
    render();
  };

  grid.addEventListener("pointerup", finishDrag);
  grid.addEventListener("pointercancel", finishDrag);
  window.addEventListener("resize", render);
  render();
}

function initAIWidget() {
  const widget = document.querySelector("[data-ai-widget]");
  if (!widget) return;

  const toggle = widget.querySelector("[data-ai-widget-toggle]");
  const closeButton = widget.querySelector("[data-ai-widget-close]");
  const panel = widget.querySelector(".ai-widget-panel");
  const form = widget.querySelector("[data-ai-form]");
  const input = widget.querySelector(".ai-widget-input");
  const thread = widget.querySelector("[data-ai-thread]");
  const toggleCopy = widget.querySelector("[data-ai-toggle-copy]");
  const quickActions = Array.from(widget.querySelectorAll("[data-ai-prompt]"));
  const whatsapp = widget.dataset.whatsapp || "";
  const email = widget.dataset.email || "";

  if (!toggle || !panel || !form || !input || !thread) return;

  const togglePhrases = [
    'Quiero una <span class="ai-key ai-key-blue">demo</span>',
    'Te puedo ayudar a <span class="ai-key ai-key-pink">escalar</span> tu negocio',
    'Preguntame por <span class="ai-key ai-key-blue">web apps</span> y <span class="ai-key ai-key-pink">landing pages</span>',
    'Tambien automatizo <span class="ai-key ai-key-pink">WhatsApp</span>, <span class="ai-key ai-key-blue">Instagram</span> y <span class="ai-key ai-key-pink">Telegram</span>',
    'Implemento <span class="ai-key ai-key-blue">CRM</span>, <span class="ai-key ai-key-pink">Make</span>, <span class="ai-key ai-key-blue">n8n</span> y <span class="ai-key ai-key-pink">Resend</span>',
    'Creo <span class="ai-key ai-key-blue">videos</span>, <span class="ai-key ai-key-pink">logos</span> y <span class="ai-key ai-key-blue">multimedia</span> para tu marca'
  ];
  let togglePhraseIndex = 0;
  let togglePhraseInterval = 0;

  const startToggleCopyRotation = () => {
    if (!toggleCopy || togglePhraseInterval) return;

    toggleCopy.innerHTML = togglePhrases[togglePhraseIndex];
    togglePhraseInterval = window.setInterval(() => {
      togglePhraseIndex = (togglePhraseIndex + 1) % togglePhrases.length;
      toggleCopy.innerHTML = togglePhrases[togglePhraseIndex];
    }, 2200);
  };

  const stopToggleCopyRotation = () => {
    if (!togglePhraseInterval) return;
    window.clearInterval(togglePhraseInterval);
    togglePhraseInterval = 0;
  };

  const openWidget = () => {
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    widget.classList.add("is-open");
    document.body.classList.add("ai-widget-open");
    startToggleCopyRotation();
    if (!window.matchMedia("(max-width: 720px)").matches) {
      window.setTimeout(() => input.focus(), 60);
    }
  };

  const closeWidget = () => {
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    widget.classList.remove("is-open");
    document.body.classList.remove("ai-widget-open");
    stopToggleCopyRotation();
  };

  const scrollThread = () => {
    thread.scrollTop = thread.scrollHeight;
  };

  const appendMessage = (text, role) => {
    const message = document.createElement("article");
    const body = document.createElement("p");
    message.className = `ai-message ai-message-${role}`;
    body.textContent = text;
    message.appendChild(body);
    thread.appendChild(message);
    scrollThread();
  };

  const appendLeadActions = () => {
    if (thread.querySelector("[data-ai-lead-actions]")) return;

    const actionRow = document.createElement("div");
    actionRow.className = "ai-widget-footer";
    actionRow.dataset.aiLeadActions = "true";

    const whatsappLink = document.createElement("a");
    whatsappLink.className = "ai-widget-link";
    whatsappLink.href = `https://wa.me/${whatsapp}?text=Hola%20quiero%20automatizar%20mi%20negocio`;
    whatsappLink.target = "_blank";
    whatsappLink.rel = "noopener";
    whatsappLink.textContent = "Continuar por WhatsApp";

    const emailLink = document.createElement("a");
    emailLink.className = "ai-widget-link";
    emailLink.href = `mailto:${email}?subject=Quiero%20automatizar%20mi%20negocio`;
    emailLink.textContent = "Enviar por correo";

    actionRow.append(whatsappLink, emailLink);
    thread.appendChild(actionRow);
    scrollThread();
  };

  const getBotReply = (message) => {
    const normalized = message.toLowerCase();

    if (normalized.includes("lead") || normalized.includes("capt") || normalized.includes("trafico")) {
      return "Podemos montar un sistema de captacion con landing, formularios y CRM para que cada lead entre clasificado y con seguimiento automatico.";
    }

    if (normalized.includes("venta") || normalized.includes("whatsapp") || normalized.includes("crm")) {
      return "La mejor ruta es automatizar respuesta, seguimiento y cierre con CRM y secuencias comerciales conectadas a WhatsApp.";
    }

    if (normalized.includes("landing") || normalized.includes("web") || normalized.includes("pagina")) {
      return "Podemos construir una landing enfocada en conversion, con propuesta clara, CTA fuerte y medicion lista para optimizar campañas.";
    }

    if (normalized.includes("app") || normalized.includes("producto") || normalized.includes("saas")) {
      return "Tambien podemos ayudarte a diseñar y desarrollar un producto digital con experiencia premium y operacion automatizada.";
    }

    if (normalized.includes("precio") || normalized.includes("cuanto") || normalized.includes("cotiza")) {
      return "Para cotizar bien necesito entender objetivo, volumen de leads y si ya tienes CRM, campañas o equipo comercial.";
    }

    return "Entiendo. Para orientarte mejor, cuentame si tu prioridad hoy es conseguir mas leads, automatizar ventas o mejorar conversion.";
  };

  let interactionCount = 0;

  const handleUserMessage = (rawMessage) => {
    const message = rawMessage.trim();
    if (!message) return;

    appendMessage(message, "user");
    input.value = "";
    interactionCount += 1;

    window.setTimeout(() => {
      appendMessage(getBotReply(message), "bot");

      if (interactionCount >= 2) {
        window.setTimeout(() => {
          appendMessage("Si quieres, seguimos por WhatsApp o correo y te ayudo a convertir esto en un sistema real para tu negocio.", "bot");
          appendLeadActions();
        }, 320);
      }
    }, 260);
  };

  toggle.addEventListener("click", () => {
    if (panel.hidden) {
      openWidget();
    } else {
      closeWidget();
    }
  });

  closeButton?.addEventListener("click", closeWidget);

  quickActions.forEach((button) => {
    button.addEventListener("click", () => {
      handleUserMessage(button.dataset.aiPrompt || button.textContent);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    handleUserMessage(input.value);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) closeWidget();
  });
}

class DiagonalCarousel {
  constructor(root, staticMode = false) {
    this.root = root;
    this.track = root.querySelector("[data-carousel-track]");
    this.slides = Array.from(root.querySelectorAll("[data-carousel-slide]"));
    this.prevButton = root.querySelector("[data-carousel-prev]");
    this.nextButton = root.querySelector("[data-carousel-next]");
    this.dotsHost = root.querySelector("[data-carousel-dots]");

    this.current = 0;
    this.target = 0;
    this.autoDrift = 0.22;
    this.autoDriftMobile = 0.34;
    this.lastTime = 0;
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragDelta = 0;
    this.autoEnabled = true;
    this.dots = [];
    this.rafId = 0;
    this.resumeTimer = 0;
    this.staticMode = staticMode;
    this.canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    this.metrics = {
      spacing: 310,
      lift: 98,
      minScale: 0.58,
      scaleFactor: 0.18,
      blur: 8,
      activeThreshold: 0.28,
      fadeThreshold: 2.35
    };
  }

  init() {
    if (!this.track || !this.slides.length) return;

    this.buildDots();
    this.bindEvents();
    this.handleResize();
    this.render();
    if (!this.staticMode) {
      this.rafId = requestAnimationFrame((time) => this.animate(time));
    }
  }

  buildDots() {
    if (!this.dotsHost) return;

    this.dotsHost.innerHTML = "";
    this.dots = this.slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "solution-dot";
      dot.setAttribute("aria-label", `Ir al servicio ${index + 1}`);
      dot.addEventListener("click", () => {
        this.goTo(index);
        this.pauseAuto();
      });
      this.dotsHost.appendChild(dot);
      return dot;
    });
  }

  bindEvents() {
    this.prevButton?.addEventListener("click", () => {
      this.step(-1);
      this.pauseAuto();
    });

    this.nextButton?.addEventListener("click", () => {
      this.step(1);
      this.pauseAuto();
    });

    this.root.addEventListener("pointerenter", () => {
      if (!this.canHover) return;
      this.autoEnabled = false;
    });

    this.root.addEventListener("pointerleave", () => {
      if (!this.canHover) return;
      this.autoEnabled = true;
      this.resumeAutoFromCurrent();
    });

    this.track.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    window.addEventListener("pointermove", (event) => this.onPointerMove(event));
    window.addEventListener("pointerup", () => this.onPointerUp());
    window.addEventListener("resize", () => this.handleResize());

    this.slides.forEach((slide) => {
      const frame = slide.querySelector(".solution-tile-frame");
      frame?.addEventListener("pointermove", (event) => this.updateGlow(frame, event));
      frame?.addEventListener("pointerleave", () => {
        frame.style.setProperty("--glow-x", "50%");
        frame.style.setProperty("--glow-y", "50%");
      });
    });
  }

  onPointerDown(event) {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragDelta = 0;
    this.autoEnabled = false;
    this.track.style.cursor = "grabbing";
  }

  onPointerMove(event) {
    if (!this.isDragging) return;

    this.dragDelta = event.clientX - this.dragStartX;
    this.target -= this.dragDelta / this.metrics.spacing;
    this.dragStartX = event.clientX;
    this.renderStatic(true);
  }

  onPointerUp() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.track.style.cursor = "";
    this.target = this.wrapIndex(Math.round(this.target));
    this.autoEnabled = true;
    this.renderStatic();
  }

  handleResize() {
    const compact = window.innerWidth < 720;
    this.canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    this.metrics = compact
      ? {
          spacing: 226,
          lift: 42,
          minScale: 0.82,
          scaleFactor: 0.09,
          blur: 3,
          activeThreshold: 0.24,
          fadeThreshold: 1.9
        }
      : {
          spacing: 310,
          lift: 98,
          minScale: 0.58,
          scaleFactor: 0.18,
          blur: 8,
          activeThreshold: 0.28,
          fadeThreshold: 2.35
        };
  }

  animate(time) {
    const deltaSeconds = this.lastTime ? (time - this.lastTime) / 1000 : 0.016;
    this.lastTime = time;

    if (this.autoEnabled && !this.isDragging) {
      const speed = window.innerWidth < 720 ? this.autoDriftMobile : this.autoDrift;
      this.target = this.wrapFloat(this.target + speed * deltaSeconds);
    }

    const diffToTarget = shortestCircularDelta(this.current, this.target, this.slides.length);
    this.current = this.wrapFloat(this.current + diffToTarget * 0.11);

    this.render();
    this.rafId = requestAnimationFrame((nextTime) => this.animate(nextTime));
  }

  render() {
    const activeIndex = this.wrapIndex(Math.round(this.current));

    this.slides.forEach((slide, index) => {
      const rawDiff = shortestCircularDelta(index, this.current, this.slides.length);
      const absDiff = Math.abs(rawDiff);
      const limitedDiff = Math.min(absDiff, this.metrics.fadeThreshold);
      const progress = Math.min(limitedDiff / this.metrics.fadeThreshold, 1);
      const signedDirection = rawDiff === 0 ? 0 : rawDiff > 0 ? -1 : 1;

      const x = rawDiff * this.metrics.spacing;
      const y = signedDirection * limitedDiff * this.metrics.lift;
      const scale = clamp(1 - limitedDiff * this.metrics.scaleFactor, this.metrics.minScale, 1);
      const blur = Math.max(0, (progress - 0.18) * this.metrics.blur);
      const opacity = clamp(1 - progress * 0.82, 0.18, 1);
      const glow = clamp(1 - limitedDiff * 0.42, 0, 1);
      const zIndex = String(1000 - Math.round(limitedDiff * 100));

      slide.dataset.diffToTarget = rawDiff.toFixed(3);
      slide.style.transform = `translate3d(calc(-50% + ${x}px), calc(-50% + ${y}px), 0) scale(${scale})`;
      slide.style.filter = `blur(${blur.toFixed(2)}px)`;
      slide.style.opacity = opacity.toFixed(3);
      slide.style.zIndex = zIndex;

      slide.classList.toggle("is-active", absDiff < this.metrics.activeThreshold);

      const frame = slide.querySelector(".solution-tile-frame");
      if (frame) {
        frame.style.setProperty("--glow-intensity", glow.toFixed(3));
        frame.style.boxShadow =
          absDiff < this.metrics.activeThreshold
            ? "inset 0 0 60px rgba(255, 63, 180, 0.14), 0 30px 80px rgba(0, 0, 0, 0.46), 0 0 52px rgba(57, 160, 255, 0.12)"
            : "0 24px 60px rgba(0, 0, 0, 0.34)";
      }
    });

    this.dots.forEach((dot, index) => {
      const isActive = index === activeIndex;
      dot.classList.toggle("is-active", isActive);
      dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
  }

  updateGlow(frame, event) {
    const rect = frame.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    frame.style.setProperty("--glow-x", `${x}%`);
    frame.style.setProperty("--glow-y", `${y}%`);
  }

  step(direction) {
    this.target = this.wrapFloat(Math.round(this.target) + direction);
    this.renderStatic();
  }

  goTo(index) {
    const total = this.slides.length;
    const normalized = this.wrapIndex(index);
    const currentAnchor = this.wrapIndex(Math.round(this.target));

    let delta = normalized - currentAnchor;
    if (delta > total / 2) delta -= total;
    if (delta < -total / 2) delta += total;

    this.target = this.wrapFloat(this.target + delta);
    this.renderStatic();
  }

  renderStatic(force = false) {
    if (!this.staticMode) return;
    this.current = force ? this.wrapFloat(this.target) : this.wrapFloat(Math.round(this.target));
    this.render();
  }

  pauseAuto() {
    this.autoEnabled = false;
    window.clearTimeout(this.resumeTimer);
    this.resumeTimer = window.setTimeout(() => {
      this.autoEnabled = true;
      this.resumeAutoFromCurrent();
    }, 1800);
  }

  resumeAutoFromCurrent() {
    this.target = this.wrapFloat(this.current);
  }

  wrapIndex(index) {
    return ((index % this.slides.length) + this.slides.length) % this.slides.length;
  }

  wrapFloat(value) {
    const total = this.slides.length;
    return ((value % total) + total) % total;
  }
}

function shortestCircularDelta(from, to, total) {
  let delta = (to - from) % total;
  if (delta > total / 2) delta -= total;
  if (delta < -total / 2) delta += total;
  return delta;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}
