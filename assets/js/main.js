/* ==========================================================================
   main.js — nav, reveals, tilt, UI Lab, code tabs, project modal
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = window.matchMedia("(hover: hover)").matches;

  /* ------------------------------------------------------------------ */
  /* 1. nav state, scroll progress, active link                          */
  /* ------------------------------------------------------------------ */
  const nav = $("#nav");
  const progress = $("#progressBar");
  const navLinks = $$(".nav__link");
  const sections = navLinks
    .map((link) => $(link.getAttribute("href")))
    .filter(Boolean);

  let ticking = false;
  function onScroll() {
    const y = window.scrollY;
    if (nav) nav.classList.toggle("is-stuck", y > 18);

    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    // active section
    const probe = y + window.innerHeight * 0.32;
    let current = sections[0];
    sections.forEach((section) => {
      if (section.offsetTop <= probe) current = section;
    });
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", current && link.getAttribute("href") === "#" + current.id);
    });

    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true }
  );
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------------ */
  /* 2. mobile drawer                                                    */
  /* ------------------------------------------------------------------ */
  const burger = $("#navBurger");
  const drawer = $("#navDrawer");

  function setDrawer(open) {
    if (!burger || !drawer) return;
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (open) {
      drawer.hidden = false;
      requestAnimationFrame(() => drawer.classList.add("is-open"));
    } else {
      drawer.classList.remove("is-open");
      drawer.hidden = true;
    }
  }

  burger?.addEventListener("click", () => {
    setDrawer(burger.getAttribute("aria-expanded") !== "true");
  });
  $$("#navDrawer a").forEach((a) => a.addEventListener("click", () => setDrawer(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setDrawer(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 960) setDrawer(false);
  });

  /* ------------------------------------------------------------------ */
  /* 3. reveal on scroll                                                 */
  /* ------------------------------------------------------------------ */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ------------------------------------------------------------------ */
  /* 4. count-up stats                                                   */
  /* ------------------------------------------------------------------ */
  const counters = $$(".count");
  function countUp(el) {
    const target = parseInt(el.dataset.count || "0", 10);
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    const start = performance.now();
    const dur = 1500;
    function tick(now) {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    counters.forEach((c) => (c.textContent = "0"));
    const co = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            countUp(entry.target);
            co.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => co.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count || "0"));
  }

  /* ------------------------------------------------------------------ */
  /* 5. cursor spotlight                                                 */
  /* ------------------------------------------------------------------ */
  const spotlight = $("#spotlight");
  if (spotlight && canHover && !reduceMotion) {
    let sx = -1000;
    let sy = -1000;
    let cx = sx;
    let cy = sy;
    let active = false;

    window.addEventListener(
      "pointermove",
      (e) => {
        sx = e.clientX;
        sy = e.clientY;
        if (!active) {
          active = true;
          spotlight.classList.add("is-on");
          cx = sx;
          cy = sy;
        }
      },
      { passive: true }
    );

    (function loop() {
      cx += (sx - cx) * 0.12;
      cy += (sy - cy) * 0.12;
      spotlight.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------ */
  /* 6. magnetic buttons                                                 */
  /* ------------------------------------------------------------------ */
  if (canHover && !reduceMotion) {
    $$(".btn").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
        const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
        btn.style.setProperty("--mx", (dx * 5).toFixed(2) + "px");
        btn.style.setProperty("--my", (dy * 4).toFixed(2) + "px");
      });
      btn.addEventListener("pointerleave", () => {
        btn.style.setProperty("--mx", "0px");
        btn.style.setProperty("--my", "0px");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* 7. studio window tilt                                               */
  /* ------------------------------------------------------------------ */
  const studio = $("#studio");
  const visual = $(".hero__visual");
  if (studio && visual && canHover && !reduceMotion) {
    visual.addEventListener("pointermove", (e) => {
      const r = visual.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      studio.style.setProperty("--ry", (px * 7).toFixed(2) + "deg");
      studio.style.setProperty("--rx", (-py * 6).toFixed(2) + "deg");
    });
    visual.addEventListener("pointerleave", () => {
      studio.style.setProperty("--ry", "0deg");
      studio.style.setProperty("--rx", "0deg");
    });
  }

  /* ------------------------------------------------------------------ */
  /* 8. UI Lab tabs                                                      */
  /* ------------------------------------------------------------------ */
  const labTabs = $$(".lab__tab");
  const labPanels = $$(".lab__panel");
  const labName = $("#labName");
  const labTag = $("#labTag");
  const labDesc = $("#labDesc");
  const labTags = $("#labTags");
  const labSpec = $("#labSpec");
  const labPrev = $("#labPrev");
  const labNext = $("#labNext");

  const labMeta = {
    hud: {
      name: "Combat HUD",
      tag: "In-game overlay",
      desc: "Health and shield arcs, a cooldown-aware ability bar, combo counter and a boss bar — laid out on a scale grid so nothing clips on phones.",
      tags: ["UIStroke", "UICorner", "TweenService"],
      spec: [["Screen", "Overlay · always on"], ["Sizing", "Scale + UIAspectRatio"], ["Motion", "0.22s · Quad out"]]
    },
    shop: {
      name: "Aether Shop",
      tag: "Modal · commerce",
      desc: "Rarity-tinted item cards, a live wallet readout and a two-step purchase flow. Every price is server-verified before currency moves.",
      tags: ["UIGridLayout", "RemoteFunction", "TweenService"],
      spec: [["Screen", "Modal · 6 items"], ["Sizing", "Grid + padding 8"], ["States", "Hover, buy, sold"]]
    },
    inv: {
      name: "Inventory",
      tag: "Modal · systems",
      desc: "A 4-column grid with rarity glow and an item inspector. Slots reconcile from one state table so the client can never desync.",
      tags: ["UIGridLayout", "State binding", "Gamepad"],
      spec: [["Screen", "Modal · 48 slots"], ["Sizing", "Grid · 6 columns"], ["States", "Hover, selected"]]
    },
    quest: {
      name: "Quest Log",
      tag: "Journal · progression",
      desc: "Expandable quest cards with objective tracking, progress bars and reward previews. Steps tick off the moment the server confirms them.",
      tags: ["UIListLayout", "DataStore", "Progression"],
      spec: [["Screen", "Journal panel"], ["Sizing", "List + auto canvas"], ["States", "Open, done, locked"]]
    },
    settings: {
      name: "Settings",
      tag: "Modal · preferences",
      desc: "Sliders, toggles and segmented controls bound to a settings table. Choices persist per player and apply without a rejoin.",
      tags: ["Sliders", "Toggles", "Persistence"]
    }
  };

  function activateLab(id, focus) {
    const tab = labTabs.find((t) => t.dataset.tab === id);
    if (!tab) return;

    labTabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
    });

    labPanels.forEach((panel) => {
      const on = panel.id === "panel-" + id;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
      if (on) {
        // restart the entry animation
        panel.style.animation = "none";
        void panel.offsetWidth;
        panel.style.animation = "";
      }
    });

    const meta = labMeta[id];
    if (meta) {
      if (labName) labName.textContent = meta.name;
      if (labTag) labTag.textContent = meta.tag;
      if (labDesc) labDesc.textContent = meta.desc;
      if (labTags) labTags.innerHTML = meta.tags.map((t) => `<span>${t}</span>`).join("");
      if (labSpec && meta.spec) {
        labSpec.innerHTML = meta.spec
          .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
          .join("");
      }
    }
    if (focus) tab.focus();
  }

  labTabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activateLab(tab.dataset.tab));
    tab.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const next = (i + (e.key === "ArrowRight" ? 1 : -1) + labTabs.length) % labTabs.length;
      activateLab(labTabs[next].dataset.tab, true);
    });
  });

  function stepLab(dir) {
    const current = labTabs.findIndex((t) => t.classList.contains("is-active"));
    const next = (current + dir + labTabs.length) % labTabs.length;
    activateLab(labTabs[next].dataset.tab);
  }
  labPrev?.addEventListener("click", () => stepLab(-1));
  labNext?.addEventListener("click", () => stepLab(1));

  /* --- small in-preview interactions (demo only) --- */
  $$(".shopui__filters button").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".shopui__filters button").forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });
  $$(".item__buy").forEach((btn) => {
    btn.addEventListener("click", () => {
      toast("Demo shop — in the real game this purchase is server-verified.");
    });
  });
  $$(".invui__grid .cell").forEach((cell) => {
    cell.addEventListener("click", () => {
      $$(".invui__grid .cell").forEach((c) => c.classList.toggle("is-selected", c === cell));
    });
  });
  $$(".toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => toggle.classList.toggle("is-on"));
  });
  $$(".segmented button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.parentElement;
      $$("button", group).forEach((b) => b.classList.toggle("is-active", b === btn));
    });
  });
  $$(".quest").forEach((quest) => {
    const head = $(".quest__head", quest);
    if (!head || !$(".quest__steps", quest)) return;
    head.style.cursor = "pointer";
    head.addEventListener("click", () => {
      const steps = $(".quest__steps", quest);
      const rewards = $(".quest__rewards", quest);
      const open = quest.classList.toggle("is-open");
      steps.hidden = !open;
      if (rewards) rewards.hidden = !open;
    });
  });

  /* ------------------------------------------------------------------ */
  /* 9. code tabs + copy                                                 */
  /* ------------------------------------------------------------------ */
  const codeTabs = $$(".code-tab");
  const codePanels = $$(".code-panel");
  const copyBtn = $("#copyBtn");

  codeTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      codeTabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
      });
      codePanels.forEach((p) => {
        const on = p.id === "cp-" + tab.dataset.code;
        p.hidden = !on;
        p.classList.toggle("is-active", on);
      });
    });
  });

  function activeCodeText() {
    const panel = codePanels.find((p) => !p.hidden);
    if (!panel) return "";
    const clone = panel.cloneNode(true);
    $$(".ln", clone).forEach((n) => n.remove());
    return clone.textContent.replace(/\u200b/g, "").trim();
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch (err) {
      return false;
    }
  }

  copyBtn?.addEventListener("click", async () => {
    const ok = await copyText(activeCodeText());
    if (!ok) {
      toast("Couldn't copy — select the code manually.");
      return;
    }
    copyBtn.classList.add("is-copied");
    const label = $("span", copyBtn);
    const old = label ? label.textContent : "";
    if (label) label.textContent = "Copied";
    toast("Snippet copied to clipboard");
    window.setTimeout(() => {
      copyBtn.classList.remove("is-copied");
      if (label) label.textContent = old || "Copy";
    }, 2000);
  });

  /* ------------------------------------------------------------------ */
  /* 10. toast                                                           */
  /* ------------------------------------------------------------------ */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove("is-on"), 2800);
  }

  /* ------------------------------------------------------------------ */
  /* 11. discord handle copy                                             */
  /* ------------------------------------------------------------------ */
  const discordBtn = $("#copyDiscord");
  discordBtn?.addEventListener("click", async () => {
    const handle = discordBtn.dataset.handle || "";
    const ok = await copyText(handle);
    const label = $(".copy-label", discordBtn);
    if (ok) {
      const old = label ? label.textContent : "";
      if (label) label.textContent = "Copied: " + handle;
      toast("Discord handle copied — " + handle);
      window.setTimeout(() => {
        if (label) label.textContent = old;
      }, 2400);
    } else {
      toast("Discord handle: " + handle);
    }
  });

  /* ------------------------------------------------------------------ */
  /* 12. project modal                                                   */
  /* ------------------------------------------------------------------ */
  const projects = {
    combat: {
      chip: "Gameplay · UI",
      title: "Vanguard Combat",
      accent: "#8b7bff",
      lede: "An ability-based melee combat system built around one rule: the server decides, the client only predicts. Eight abilities, combo chains, i-frames and a HUD that tells the player everything they need without covering the fight.",
      list: [
        "Server-side hit validation with reach and rate-of-fire checks",
        "Combo chains with input buffering and cancel windows",
        "Client prediction for instant swing feedback, then reconcile",
        "Cooldown-aware ability bar that reads from one state table",
        "Hit feedback: hitstop, camera shake, particles, damage numbers"
      ],
      tags: ["Luau", "RemoteEvents", "Combat", "HUD", "TweenService"],
      stats: [
        ["Abilities", "8"],
        ["Server authority", "100%"],
        ["Exploitable hits", "0"],
        ["Avg. input latency", "~48 ms"]
      ]
    },
    shop: {
      chip: "UI · Commerce",
      title: "Aether Shop",
      accent: "#38e2c8",
      lede: "A storefront that stays snappy with 26 items on screen. Rarity tiers drive the colour system, tooltips are pre-built and reused, and the purchase flow confirms on the server before anything is taken away.",
      list: [
        "Rarity colour tokens shared by shop, inventory and loot",
        "Reusable item card component with hover and focus states",
        "Server-verified purchase with rollback on failure",
        "Buy feedback layered with sound and a currency flight tween",
        "Filters and sorting that never rebuild the whole layout"
      ],
      tags: ["UIGridLayout", "RemoteFunction", "Economy", "TweenService"],
      stats: [
        ["Items supported", "26"],
        ["Frame cost on open", "1 frame"],
        ["Purchase round trip", "<120 ms"],
        ["Layout breakpoints", "4"]
      ]
    },
    inventory: {
      chip: "UI · Systems",
      title: "Grid Inventory",
      accent: "#ffb457",
      lede: "A 48-slot grid with drag-and-drop, stacking and equipment slots. One data table is the source of truth; the interface renders from it, so there is no state to desync when the server sends an update mid-drag.",
      list: [
        "Drag-and-drop with drop previews and invalid-slot handling",
        "Stack merging with partial-stack maths",
        "Equipment slots that feed straight into combat stats",
        "Rarity glow, tooltips and keyboard + gamepad navigation",
        "Rebuilt against a 4 / 6 / 8 column responsive rule"
      ],
      tags: ["UIGridLayout", "State binding", "Gamepad", "Drag & Drop"],
      stats: [
        ["Slots", "48"],
        ["Input methods", "3"],
        ["Re-render cost", "O(changed)"],
        ["Duplicate-item bugs", "0"]
      ]
    },
    save: {
      chip: "Backend",
      title: "SaveCore",
      accent: "#5ec8ff",
      lede: "The unglamorous module that keeps a game alive. Retries with exponential backoff, autosave, session locking to stop duplicate-session overwrites, and schema migrations so old saves keep working after an update.",
      list: [
        "Exponential-backoff retries around every DataStore call",
        "Session locking with a heartbeat and a safe takedown path",
        "Autosave on a staggered timer to avoid request spikes",
        "Versioned schema with forward migrations",
        "Analytics hooks for failed saves, so nothing fails silently"
      ],
      tags: ["DataStore", "Modules", "Backend", "Reliability"],
      stats: [
        ["Rollbacks", "0"],
        ["Sessions handled", "2M+"],
        ["Save retry depth", "3"],
        ["Schema versions", "4"]
      ]
    },
    boss: {
      chip: "Gameplay",
      title: "Boss Rush",
      accent: "#ff6b9d",
      lede: "Five bosses, three phases each, with attacks telegraphed on the ground before they land. The fight reads like a conversation: the boss shows you what's coming, you answer with a dodge or a block, and the loot rolls at the end.",
      list: [
        "Phase state machine with interrupt and enrage handling",
        "Ground telegraphs driven by the same data as the hitbox",
        "Boss bar that scales with damage and shows phase breaks",
        "Weighted loot rolls with pity counters",
        "Wave pacing tuned so a solo player can finish in ~9 minutes"
      ],
      tags: ["AI", "Combat", "Loot", "State machines"],
      stats: [
        ["Bosses", "5"],
        ["Phases each", "3"],
        ["Attack telegraphs", "17"],
        ["Clear time", "~9 min"]
      ]
    },
    toolkit: {
      chip: "Tooling",
      title: "Studio Toolkit",
      accent: "#a6e85f",
      lede: "The panel my testers keep open. Live server stats, a player inspector, a command console and one-click test tools, all gated by role so a regular player never sees it.",
      list: [
        "Command console with history and autocomplete",
        "Live server stats: FPS, memory, player count, ping",
        "Player inspector for stats, inventory and position",
        "Role-gated access checked on the server, not just hidden",
        "One-click reset, respawn and test-data tools"
      ],
      tags: ["Admin", "Debug", "UI", "Permissions"],
      stats: [
        ["Commands", "20+"],
        ["Access checks", "Server-side"],
        ["Overhead", "<0.5 ms/frame"],
        ["Testers using it", "12"]
      ]
    }
  };

  const modal = $("#projectModal");
  const modalHero = $("#modalHero");
  const modalChip = $("#modalChip");
  const modalTitle = $("#modalTitle");
  const modalLede = $("#modalLede");
  const modalList = $("#modalList");
  const modalTags = $("#modalTags");
  const modalStats = $("#modalStats");
  let lastFocus = null;

  function openModal(key, card) {
    const data = projects[key];
    if (!data || !modal) return;
    lastFocus = document.activeElement;

    modalHero.style.background = `
      radial-gradient(560px 220px at 24% 0%, ${data.accent}55, transparent 70%),
      radial-gradient(420px 200px at 88% 30%, ${data.accent}22, transparent 75%),
      linear-gradient(160deg, #141926, #0a0c13)`;

    // reuse the card's preview art as the modal banner
    modalHero.innerHTML = "";
    const art = card && $(".proj__preview", card);
    if (art) {
      const clone = art.cloneNode(true);
      clone.classList.add("modal__preview");
      clone.removeAttribute("aria-hidden");
      modalHero.appendChild(clone);
    }
    modalChip.textContent = data.chip;
    modalTitle.textContent = data.title;
    modalLede.textContent = data.lede;
    modalList.innerHTML = data.list.map((item) => `<li>${item}</li>`).join("");
    modalTags.innerHTML = data.tags.map((t) => `<span>${t}</span>`).join("");
    modalStats.innerHTML = data.stats
      .map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`)
      .join("");

    modal.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      modal.classList.add("is-open");
      $(".modal__close", modal)?.focus();
    });
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    modal.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(() => {
      modal.hidden = true;
    }, 300);
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus({ preventScroll: true });
    }
  }

  $$("[data-project]").forEach((card) => {
    const key = card.dataset.project;
    card.addEventListener("click", () => openModal(key, card));
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openModal(key, card);
      }
    });
  });

  $$("[data-close]", modal || document).forEach((el) => {
    el.addEventListener("click", (e) => {
      closeModal();
      if (el.tagName !== "A") e.preventDefault(); // anchors still navigate
    });
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // simple focus trap
  window.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !modal || modal.hidden) return;
    const focusables = $$(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      modal
    ).filter((el) => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ------------------------------------------------------------------ */
  /* 13. year                                                            */
  /* ------------------------------------------------------------------ */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------ */
  /* 14. smooth anchor offset for browsers without scroll-padding        */
  /* ------------------------------------------------------------------ */
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 90;
      if (reduceMotion) return;
      e.preventDefault();
      window.scrollTo({ top, behavior: "smooth" });
      history.replaceState(null, "", id);
    });
  });
})();
