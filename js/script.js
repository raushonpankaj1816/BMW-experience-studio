/* ──────────────────────────────────────────────────────────────
   BMW Experience Studio — Controller
   One script drives every page. Each module is guarded, so a
   missing element simply disables that module on that page.
   Modules: header · finder · catalogue · spec dialog · heritage
            · gallery/lightbox · compare · booking · configurator
   Data source: window.BMW_CATALOG (js/catalog.js)
   ────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  const catalog = window.BMW_CATALOG;

  /* Guard: no data → show a warning, don't throw. */
  if (!catalog || !Array.isArray(catalog.models)) {
    console.warn("BMW_CATALOG missing or malformed — dynamic sections disabled.");
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = { filter: "all", query: "", galleryIndex: 0, lastInvoker: null, visibleCount: 6 };

  const escapeHtml = (value) =>
    String(value).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Set text only when the target exists (keeps pages optional). */
  const setText = (sel, value, root) => {
    const el = $(sel, root || document);
    if (el) el.textContent = value;
  };

  /* ── 1. Header / navigation ───────────────────────────── */
  const header = $("[data-header]");
  const menuButton = $("[data-menu-button]");
  const nav = $(".main-nav");

  if (header && menuButton && nav) {
    const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 24);

    const setMenu = (open) => {
      nav.classList.toggle("open", open);
      header.classList.toggle("menu-active", open);
      document.body.classList.toggle("menu-open", open);
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    window.addEventListener("scroll", updateHeader, { passive: true });
    updateHeader();

    menuButton.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    nav.addEventListener("click", (e) => { if (e.target.matches("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("open")) setMenu(false);
    });
  }

  /* ── 2. Finder: home → models.html?q= · models → filter ── */
  const grid = $("[data-model-grid]");
  const emptyState = $("[data-empty-state]");
  const resultCount = $("[data-result-count]");
  const loadMoreButton = $("[data-load-more]");
  const searchInput = $("#model-search");
  const filterButtons = $$("[data-filter]");
  const finder = $("[data-finder]");

  const getLaunchYear = (model) => {
    if (model.launchYear) return model.launchYear;
    const match = String(model.years || "").match(/\b(?:19|20)\d{2}\b/);
    return match ? Number(match[0]) : Number(model.year) || 0;
  };

  const runFilter = (resetVisibleCount = true) => {
    if (!grid) return;
    if (resetVisibleCount) state.visibleCount = 6;
    const visible = catalog.models
      .filter(matchesFilters)
      .slice()
      .sort((a, b) => getLaunchYear(b) - getLaunchYear(a) || a.name.localeCompare(b.name));
    const shown = visible.slice(0, state.visibleCount);

    grid.innerHTML = shown.map(modelCardHtml).join("");
    if (emptyState) emptyState.hidden = visible.length > 0;
    if (loadMoreButton) loadMoreButton.hidden = shown.length >= visible.length;
    if (resultCount) {
      resultCount.textContent =
        `Showing ${shown.length} of ${visible.length} matching models` +
        (state.query ? ` for “${state.query}”` : "");
    }
  };

  const modelCardHtml = (m) => {
    const isM = m.tags.includes("m");
    return `
      <article class="model-card" data-name="${escapeHtml(m.name)}" data-tags="${escapeHtml(m.tags.join(" "))}">
        <img src="${m.image}" alt="BMW ${escapeHtml(m.name)}" loading="lazy" decoding="async">
        ${m.imageCredit ? `<span class="sr-only"><a href="${escapeHtml(m.imageCreditUrl)}" target="_blank" rel="noopener">${escapeHtml(m.imageCredit)}</a></span>` : ""}
        <div class="model-card-body">
          <span class="series${isM ? " m" : ""}">${escapeHtml(m.series)}</span>
          <h3>${escapeHtml(m.name)}</h3>
          <p>${escapeHtml(m.description)}</p>
          <div class="card-meta">
            <span>Launched ${getLaunchYear(m)}</span>
            <span>${escapeHtml(m.power)}</span>
            <span>${escapeHtml(m.drive)}</span>
          </div>
          <button type="button" data-model="${m.id}" aria-label="View specifications for BMW ${escapeHtml(m.name)}">View Specs</button>
        </div>
      </article>`;
  };

  function matchesFilters(model) {
    const byFilter = state.filter === "all" || model.tags.includes(state.filter);
    if (!byFilter) return false;
    if (!state.query) return true;

    const haystack = (model.name + " " + model.series + " " + model.category + " " +
      model.tags.join(" ")).toLowerCase();
    return state.query.split(/\s+/).every((word) => haystack.includes(word));
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((b) => {
        const active = b === button;
        b.classList.toggle("active", active);
        b.setAttribute("aria-selected", String(active));
      });
      state.filter = button.dataset.filter;
      runFilter();
    });
  });

  if (loadMoreButton) {
    loadMoreButton.addEventListener("click", () => {
      state.visibleCount += 3;
      runFilter(false);
    });
  }

  if (finder && searchInput) {
    const redirect = finder.dataset.redirect === "models";

    finder.addEventListener("submit", (e) => {
      e.preventDefault();
      const value = searchInput.value.trim();

      if (redirect) {
        window.location.href = "models.html" + (value ? "?q=" + encodeURIComponent(value) : "");
        return;
      }

      state.query = value.toLowerCase();
      runFilter();
      const target = $("#models");
      if (target) target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  }

  /* Deep link: models.html?q=… pre-fills the search box. */
  if (grid && searchInput) {
    const initial = new URLSearchParams(window.location.search).get("q");
    if (initial) {
      searchInput.value = initial;
      state.query = initial.toLowerCase();
    }
    runFilter();
  }

  /* ── 3. Spec dialog ───────────────────────────────────── */
  const specDialog = $("[data-spec-dialog]");
  const brand = catalog.brand || {};

  function openSpecs(modelId, invoker) {
    const model = catalog.models.find((m) => m.id === modelId);
    if (!model || !specDialog || typeof specDialog.showModal !== "function") return;

    state.lastInvoker = invoker || null;

    setText("[data-spec-category]", model.category, specDialog);
    setText("[data-spec-title]", model.name, specDialog);
    setText("[data-spec-description]", model.description, specDialog);
    setText("[data-spec-power]", model.power, specDialog);
    setText("[data-spec-speed]", model.acceleration, specDialog);
    setText("[data-spec-speed-label]", model.accelLabel || "0-100 km/h", specDialog);
    setText("[data-spec-drive]", model.drive, specDialog);
    setText("[data-spec-series]", model.series, specDialog);

    /* Extended detail block */
    setText("[data-spec-engine]", model.engine || "—", specDialog);
    setText("[data-spec-topspeed]", model.topSpeed || "—", specDialog);
    setText("[data-spec-years]", model.years || "—", specDialog);
    setText("[data-spec-origin]", model.origin || "—", specDialog);
    setText("[data-spec-price]", model.price || "—", specDialog);

    /* Highlights list */
    const highlightsList = $("[data-spec-highlights]", specDialog);
    if (highlightsList && model.highlights) {
      highlightsList.innerHTML = model.highlights
        .map(h => `<li>${escapeHtml(h)}</li>`)
        .join("");
    }

    /* Fun fact */
    setText("[data-spec-fun-fact]", model.funFact || "BMW continues to push engineering boundaries.", specDialog);

    /* Origin & ownership block */
    setText("[data-brand-parent]", brand.parent || "BMW AG", specDialog);
    setText("[data-brand-owner]", brand.owner || "BMW Group", specDialog);
    setText("[data-brand-founded]", brand.founded || "1916", specDialog);
    setText("[data-brand-hq]", brand.hq || "Munich, Germany", specDialog);
    setText("[data-brand-listing]", brand.listing || "XETRA: BMW", specDialog);
    setText("[data-brand-ceo]", brand.ceo || "BMW AG Board of Management", specDialog);

    const bookLink = $("[data-spec-book]", specDialog);
    if (bookLink) bookLink.href = "index.html?model=" + encodeURIComponent(model.id) + "#drive";

    const img = $("[data-spec-image]", specDialog);
    if (img) {
      img.src = model.image;
      img.alt = "BMW " + model.name;
    }

    specDialog.showModal();
    const copy = $(".dialog-copy", specDialog);
    if (copy) copy.scrollTop = 0;
  }

  if (grid && specDialog) {
    grid.addEventListener("click", (e) => {
      const button = e.target.closest("[data-model]");
      if (button) openSpecs(button.dataset.model, button);
    });

    $$("[data-dialog-close]").forEach((btn) => {
      btn.addEventListener("click", () => specDialog.close());
    });

    specDialog.addEventListener("click", (e) => {
      if (e.target === specDialog) specDialog.close();
    });
    specDialog.addEventListener("close", () => {
      if (state.lastInvoker) state.lastInvoker.focus();
    });
  }

  /* ── 4. Heritage timeline ─────────────────────────────── */
  const heritageList = $("[data-heritage-list]");

  if (heritageList && Array.isArray(catalog.heritage)) {
    const eraOf = (year) =>
      year < 1945 ? "origins" : year < 1980 ? "rebirth" : year < 2000 ? "motorsport" :
      year < 2015 ? "modern" : "electric";

    const heritageHtml = (entry) => {
      const facts = (entry.facts || [])
        .map(([label, value]) =>
          `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
        .join("");

      const media = `<img src="${entry.image}" alt="${escapeHtml(entry.alt || entry.title)}" loading="lazy" decoding="async">`;
      const credit = entry.imageCredit
        ? `<span class="sr-only"><a href="${escapeHtml(entry.imageCreditUrl)}" target="_blank" rel="noopener">${escapeHtml(entry.imageCredit)}</a></span>`
        : "";

      return `
        <article class="timeline-item" data-reveal data-era="${eraOf(entry.year)}">
          <div class="timeline-year"><span>${entry.year}</span></div>
          <figure class="timeline-card">
            ${media}
            ${credit}
            <figcaption>
              <h3>${escapeHtml(entry.title)}</h3>
              <p>${escapeHtml(entry.blurb)}</p>
              <ul class="timeline-facts">${facts}</ul>
            </figcaption>
          </figure>
        </article>`;
    };

    const renderHeritage = (era) => {
      const sorted = catalog.heritage
        .slice()
        .sort((a, b) => a.year - b.year)
        .filter((entry) => era === "all" || eraOf(entry.year) === era);

      heritageList.innerHTML = sorted.map(heritageHtml).join("");
      reveal(heritageList);
    };

    renderHeritage("all");

    $$("[data-era-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        $$("[data-era-filter]").forEach((b) => {
          const active = b === button;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", String(active));
        });
        renderHeritage(button.dataset.eraFilter);
      });
    });
  }

  /* Scroll reveal (skipped for reduced motion / unsupported browsers) */
  function reveal(root) {
    const targets = $$("[data-reveal]", root || document);
    if (reducedMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    targets.forEach((el) => observer.observe(el));
  }
  reveal(document);

  /* ── 5. Gallery grid + lightbox ───────────────────────── */
  const galleryGrid = $("[data-gallery-grid]");
  const lightbox = $("[data-lightbox]");
  const items = catalog.gallery;

  if (galleryGrid) {
    const lightboxImage = $("[data-lightbox-image]");
    const lightboxCaption = $("[data-lightbox-caption]");
    const lightboxCounter = $("[data-lightbox-counter]");
    let visible = items.map((_, i) => i);

    const renderGallery = (filter) => {
      visible = items
        .map((item, i) => i)
        .filter((i) => filter === "all" || (items[i].tags || []).includes(filter));

      galleryGrid.innerHTML = visible.map((n, position) => {
        const item = items[n];
        return `
        <button class="gallery-thumb" type="button" data-gallery-index="${position}"
                data-tags="${escapeHtml((item.tags || []).join(" "))}"
                aria-label="Open image ${position + 1} of ${visible.length}: ${escapeHtml(item.alt)}">
          <img src="${item.src}" alt="${escapeHtml(item.alt)}" loading="lazy" decoding="async">
        </button>`;
      }).join("");

      const count = $("[data-gallery-count]");
      if (count) count.textContent = `${visible.length} photographs`;
    };

    const showGalleryItem = (position) => {
      if (!lightbox || !lightboxImage) return;
      state.galleryIndex = (position + visible.length) % visible.length;
      const item = items[visible[state.galleryIndex]];

      lightboxImage.src = item.src;
      lightboxImage.alt = item.alt;
      if (lightboxCaption) lightboxCaption.textContent = item.caption;
      if (lightboxCounter) lightboxCounter.textContent = `${state.galleryIndex + 1} / ${visible.length}`;

      [state.galleryIndex + 1, state.galleryIndex - 1].forEach((n) => {
        const next = items[visible[(n + visible.length) % visible.length]];
        const preload = new Image();
        preload.src = next.src;
      });
    };

    const openLightbox = (position) => {
      if (!lightbox || typeof lightbox.showModal !== "function") return;
      showGalleryItem(position);
      lightbox.showModal();
      document.body.classList.add("lightbox-open");
      const close = $("[data-lightbox-close]");
      if (close) close.focus();
    };

    renderGallery("all");

    galleryGrid.addEventListener("click", (e) => {
      const thumb = e.target.closest("[data-gallery-index]");
      if (thumb) openLightbox(Number(thumb.dataset.galleryIndex));
    });

    $$("[data-gallery-filter]").forEach((button) => {
      button.addEventListener("click", () => {
        $$("[data-gallery-filter]").forEach((b) => {
          const active = b === button;
          b.classList.toggle("active", active);
          b.setAttribute("aria-selected", String(active));
        });
        renderGallery(button.dataset.galleryFilter);
      });
    });

    if (lightbox) {
      const prev = $("[data-lightbox-prev]");
      const next = $("[data-lightbox-next]");
      const close = $("[data-lightbox-close]");

      if (prev) prev.addEventListener("click", () => showGalleryItem(state.galleryIndex - 1));
      if (next) next.addEventListener("click", () => showGalleryItem(state.galleryIndex + 1));
      if (close) close.addEventListener("click", () => { if (lightbox.open) lightbox.close(); });

      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox && lightbox.open) lightbox.close();
      });
      lightbox.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") showGalleryItem(state.galleryIndex - 1);
        if (e.key === "ArrowRight") showGalleryItem(state.galleryIndex + 1);
      });
      lightbox.addEventListener("close", () => {
        document.body.classList.remove("lightbox-open");
        const thumb = galleryGrid.querySelector(`[data-gallery-index="${state.galleryIndex}"]`);
        if (thumb) thumb.focus();
      });
    }
  }

  /* ── 6. User-selected model comparison ────────────────── */
  const compareGrid = $("[data-compare-grid]");
  const compareCount = $("[data-compare-count]");
  const compareOptions = $("#compare-model-options");

  if (compareGrid && compareOptions) {
    const compareSlots = [];
    const specs = [
      ["Series", (m) => m.series],
      ["Category", (m) => m.category],
      ["Launch year", getLaunchYear],
      ["Power", (m) => m.power],
      ["Acceleration", (m) => `${m.acceleration} (${m.accelLabel || "0-100 km/h"})`],
      ["Drive", (m) => m.drive],
      ["Top speed", (m) => m.topSpeed || "—"],
      ["Engine", (m) => m.engine || "—"],
      ["Production", (m) => m.years || "—"],
      ["Price", (m) => m.price || "—"]
    ];

    compareOptions.innerHTML = catalog.models
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((m) => `<option value="${escapeHtml(m.name)}"></option>`)
      .join("");

    const renderCompare = () => {
      const selectedCount = compareSlots.filter(Boolean).length;
      const hasPendingSlot = compareSlots.some((modelId) => !modelId);
      const cards = compareSlots.map((modelId, slotIndex) => {
        const model = catalog.models.find((m) => m.id === modelId);
        if (!model) {
          return `
            <div class="compare-column compare-pending">
              <label class="compare-search-label">
                <span class="sr-only">Search a car to compare</span>
                <input type="search" list="compare-model-options" data-compare-slot="${slotIndex}"
                  placeholder="Search BMW models..." autocomplete="off">
              </label>
            </div>`;
        }

        const title = `BMW ${model.name}`;
        const credit = model.imageCredit
          ? `<span class="sr-only"><a href="${escapeHtml(model.imageCreditUrl)}" target="_blank" rel="noopener">${escapeHtml(model.imageCredit)}</a></span>`
          : "";

        return `
          <article class="compare-column">
            <div class="compare-car-head">
              <label class="compare-search-label">
                <span class="sr-only">Search a car to compare</span>
                <input type="search" list="compare-model-options" data-compare-slot="${slotIndex}"
                  value="${escapeHtml(model.name)}" placeholder="Search BMW models..." autocomplete="off">
              </label>
              <button class="compare-remove" type="button" data-remove-compare="${slotIndex}"
                aria-label="Remove ${escapeHtml(title)} from comparison">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>
              </button>
            </div>
            <h3 class="compare-model-title">${escapeHtml(title)}</h3>
            <div class="compare-car-image"><img src="${escapeHtml(model.image)}" alt="${escapeHtml(title)}" loading="lazy" decoding="async"></div>
            ${credit}
            <dl class="compare-specs">${specs.map(([label, value]) => `
              <div class="compare-spec"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value(model))}</dd></div>`).join("")}
            </dl>
          </article>`;
      });

      cards.push(`
        <div class="compare-add-column">
          <button class="button primary" type="button" data-add-compare ${hasPendingSlot ? "disabled" : ""}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
            ${selectedCount ? "Add another car" : "Add a car"}
          </button>
        </div>`);
      compareGrid.innerHTML = cards.join("");

      if (compareCount) {
        compareCount.textContent = selectedCount < 2
          ? selectedCount === 0
            ? "Add cars to start comparing"
            : "Choose one more car to compare"
          : `Comparing ${selectedCount} cars`;
      }
    };

    compareGrid.addEventListener("change", (event) => {
      const input = event.target.closest("[data-compare-slot]");
      if (!input) return;

      const slotIndex = Number(input.dataset.compareSlot);
      const model = catalog.models.find((m) => m.name.toLowerCase() === input.value.trim().toLowerCase());
      const alreadySelected = model && compareSlots.some((id, index) => index !== slotIndex && id === model.id);

      compareSlots[slotIndex] = model && !alreadySelected ? model.id : "";
      renderCompare();
    });

    compareGrid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-remove-compare]");
      if (button) {
        compareSlots.splice(Number(button.dataset.removeCompare), 1);
        renderCompare();
        return;
      }

      if (!event.target.closest("[data-add-compare]") || compareSlots.some((modelId) => !modelId)) return;
      compareSlots.push("");
      renderCompare();
      const newInput = compareGrid.querySelector(`[data-compare-slot="${compareSlots.length - 1}"]`);
      if (newInput) newInput.focus();
    });

    renderCompare();
  }

  /* ── 7. Booking form ──────────────────────────────────── */
  const form = $("[data-drive-form]");

  if (form) {
    const formStatus = $("[data-form-status]");
    const modelSelect = form.querySelector('select[name="model"]');

    catalog.models
      .filter((m) => m.bookable)
      .forEach((m) => {
        const option = document.createElement("option");
        option.value = m.id;
        option.textContent = "BMW " + m.name;
        modelSelect.appendChild(option);
      });

    /* Deep link: index.html?model=i7#drive pre-selects a car. */
    const preselect = new URLSearchParams(window.location.search).get("model");
    if (preselect && modelSelect.querySelector(`option[value="${CSS.escape(preselect)}"]`)) {
      modelSelect.value = preselect;
    }

    const dateInput = form.querySelector('input[name="date"]');
    if (dateInput) {
      const today = new Date();
      dateInput.min = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
      ].join("-");
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        if (formStatus) {
          formStatus.textContent = "Please complete every required field before requesting a drive.";
          formStatus.classList.add("error");
        }
        form.reportValidity();
        return;
      }

      const data = new FormData(form);
      const firstName = String(data.get("firstName") || "").trim();
      const middleName = String(data.get("middleName") || "").trim();
      const lastName = String(data.get("lastName") || "").trim();
      const name = [firstName, middleName, lastName].filter(Boolean).join(" ");
      if (name.length > 80) {
        const lastNameInput = form.querySelector('input[name="lastName"]');
        lastNameInput.setCustomValidity("Please keep your full name to 80 characters or fewer.");
        if (formStatus) {
          formStatus.textContent = "Please keep your full name to 80 characters or fewer.";
          formStatus.classList.add("error");
        }
        form.reportValidity();
        form.querySelectorAll('input[name="firstName"], input[name="middleName"], input[name="lastName"]')
          .forEach((input) => {
            input.addEventListener("input", () => lastNameInput.setCustomValidity(""), { once: true });
          });
        return;
      }
      const modelOption = modelSelect.options[modelSelect.selectedIndex];
      const phoneCountryCode = String(data.get("phoneCountryCode") || "");
      const phoneNumber = String(data.get("phone") || "").trim();

      const booking = {
        id: "tdr_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
        name: name,
        firstName: firstName,
        middleName: middleName,
        lastName: lastName,
        email: String(data.get("email") || "").trim(),
        phoneCountryCode: phoneCountryCode,
        phone: phoneCountryCode + " " + phoneNumber,
        gender: String(data.get("gender") || "").trim(),
        preferredContact: String(data.get("preferredContact") || "").trim(),
        modelId: String(data.get("model")),
        modelName: modelOption.textContent,
        date: String(data.get("date")),
        time: String(data.get("time") || "").trim(),
        city: String(data.get("city") || "").trim(),
        vehicle: String(data.get("vehicle") || "").trim(),
        message: String(data.get("message") || "").trim(),
        createdAt: new Date().toISOString(),
        status: "pending"
      };

      /* Best-effort persistence — private mode may throw (TRD §9). */
      try {
        const bookings = JSON.parse(localStorage.getItem("bmw.bookings") || "[]");
        bookings.push(booking);
        localStorage.setItem("bmw.bookings", JSON.stringify(bookings));
      } catch (err) {
        console.info("localStorage unavailable — booking confirmed without persistence.");
      }

      if (formStatus) {
        formStatus.classList.remove("error");
        formStatus.textContent =
          `Thanks ${name}. Your ${booking.modelName} test drive on ${booking.date}` +
          (booking.time ? ` at ${booking.time}` : "") +
          (booking.city ? ` in ${booking.city}` : "") +
          " is ready for confirmation.";
      }
      form.reset();
      if (preselect && modelSelect.querySelector(`option[value="${CSS.escape(preselect)}"]`)) {
        modelSelect.value = preselect;
      }
    });
  }

  /* ── 8. Configurator ──────────────────────────────────── */
  const paintOverlay = $("[data-paint-overlay]");

  if (paintOverlay) {
    const paintColors = {
      alpine: { color: "#f7f7f2", opacity: 0.1 },
      black: { color: "#05070a", opacity: 0.28 },
      blue: { color: "#1267d8", opacity: 0.22 },
      red: { color: "#9d1826", opacity: 0.2 }
    };

    $$("[data-paint]").forEach((button) => {
      button.addEventListener("click", () => {
        $$("[data-paint]").forEach((b) => {
          const active = b === button;
          b.classList.toggle("active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        const paint = paintColors[button.dataset.paint];
        paintOverlay.style.background = paint.color;
        paintOverlay.style.opacity = paint.opacity;
      });
    });

    const configName = $("[data-config-name]");
    const driveMode = $("[data-drive-mode]");
    if (driveMode && configName) {
      driveMode.addEventListener("click", (e) => {
        const button = e.target.closest("[data-mode]");
        if (!button) return;
        $$("[data-mode]", driveMode).forEach((b) => {
          const active = b === button;
          b.classList.toggle("active", active);
          b.setAttribute("aria-pressed", String(active));
        });
        configName.textContent = "BMW X6 M60i - " + button.dataset.mode;
      });
    }

    const range = $("[data-range]");
    const rangeValue = $("[data-range-value]");
    if (range && rangeValue) {
      range.addEventListener("input", () => { rangeValue.textContent = range.value + "%"; });
    }
  }

  /* ── 9. Stats strip + about facts ─────────────────────── */
  setText("[data-stat-models]", String(catalog.models.length));
  setText("[data-stat-images]", String(catalog.gallery.length));
  setText("[data-stat-heritage]", String((catalog.heritage || []).length));

  const aboutList = $("[data-about-facts]");
  if (aboutList && catalog.about) {
    aboutList.innerHTML = catalog.about.facts
      .map(([label, value]) =>
        `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`)
      .join("");
  }

  const brandList = $("[data-brand-list]");
  if (brandList && catalog.about && catalog.about.brands) {
    brandList.innerHTML = catalog.about.brands
      .map((b) => `<li><strong>${escapeHtml(b.name)}</strong><span>${escapeHtml(b.note)}</span></li>`)
      .join("");
  }

  const aboutStats = $("[data-about-stats]");
  if (aboutStats && catalog.about && catalog.about.stats) {
    aboutStats.innerHTML = catalog.about.stats
      .map(([label, value]) =>
        `<div class="group-stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
      .join("");
  }
})();
