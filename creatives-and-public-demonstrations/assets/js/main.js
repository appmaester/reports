// CHANGE: Welcome reveal, sidebar collapse, mobile navigation, and active section detection.
// Default sidebar state is expanded because no body.sidebar-collapsed class is added on load.
(() => {
  const MOBILE_QUERY = "(max-width: 980px)";

  const welcome = document.querySelector(".welcome-screen");
  const sidebar = document.querySelector(".site-sidebar");
  const sidebarCollapse = document.querySelector(".sidebar-collapse");
  const sidebarCollapseText = document.querySelector(".sidebar-collapse-text");
  const sidebarCollapseIcon = document.querySelector(".sidebar-collapse-icon");

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  if (!nav) return;

  // CHANGE: Only internal section links are used for active-section highlighting.
  // External links like "Main Site" are ignored.
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));

  const sectionLinks = navLinks
    .map((link) => {
      const href = link.getAttribute("href");
      const id = href ? href.replace("#", "") : "";
      const section = id ? document.getElementById(id) : null;

      return {
        id,
        link,
        section,
      };
    })
    .filter((item) => item.id && item.section);

  let activeId = null;
  let ticking = false;

  function isMobileViewport() {
    return window.matchMedia(MOBILE_QUERY).matches;
  }

  function setSidebarCollapsed(isCollapsed) {
    document.body.classList.toggle("sidebar-collapsed", isCollapsed);

    if (!sidebarCollapse) return;

    sidebarCollapse.setAttribute("aria-expanded", String(!isCollapsed));
    sidebarCollapse.setAttribute(
      "aria-label",
      isCollapsed ? "Expand sidebar" : "Collapse sidebar"
    );

    if (sidebarCollapseText) {
      sidebarCollapseText.textContent = isCollapsed ? "Expand" : "Collapse";
    }

    if (sidebarCollapseIcon) {
      sidebarCollapseIcon.textContent = isCollapsed ? "›" : "‹";
    }
  }

  function updateSidebarVisibility() {
    if (!welcome) {
      document.body.classList.add("sidebar-visible");
      return;
    }

    const welcomeBottom = welcome.offsetTop + welcome.offsetHeight;
    const revealPoint = welcomeBottom - 24;
    const shouldShowSidebar = window.scrollY >= revealPoint;

    document.body.classList.toggle("sidebar-visible", shouldShowSidebar);
  }

  function setActiveLink(nextActiveId) {
    if (!nextActiveId || activeId === nextActiveId) return;

    activeId = nextActiveId;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");

      link.classList.toggle("is-active", href === `#${nextActiveId}`);
    });
  }

  function getActiveOffset() {
    // CHANGE: On mobile, account for the sticky top sidebar/menu height.
    if (isMobileViewport() && sidebar) {
      return Math.ceil(sidebar.getBoundingClientRect().height) + 24;
    }

    // CHANGE: Desktop has no top header, but this gives sections a natural activation point.
    return 96;
  }

  function getDocumentHeight() {
    return Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
  }

  function updateActiveLink() {
    if (sectionLinks.length === 0) return;

    const offset = getActiveOffset();
    const scrollPosition = window.scrollY + offset;
    const pageBottom =
      window.innerHeight + window.scrollY >= getDocumentHeight() - 12;

    // CHANGE: Force the final section active when the user reaches the bottom.
    if (pageBottom) {
      setActiveLink(sectionLinks[sectionLinks.length - 1].id);
      return;
    }

    let currentSection = sectionLinks[0];

    sectionLinks.forEach((item) => {
      if (item.section.offsetTop <= scrollPosition) {
        currentSection = item;
      }
    });

    setActiveLink(currentSection.id);
  }

  function updatePageState() {
    updateSidebarVisibility();
    updateActiveLink();
  }

  function requestPageStateUpdate() {
    if (ticking) return;

    ticking = true;

    window.requestAnimationFrame(() => {
      updatePageState();
      ticking = false;
    });
  }

  // CHANGE: Desktop sidebar collapse/expand.
  if (sidebarCollapse) {
    sidebarCollapse.addEventListener("click", () => {
      const isCurrentlyCollapsed =
        document.body.classList.contains("sidebar-collapsed");

      setSidebarCollapsed(!isCurrentlyCollapsed);

      // CHANGE: Recalculate after layout width changes.
      requestPageStateUpdate();
    });
  }

  // CHANGE: Mobile menu toggle.
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");

      toggle.setAttribute("aria-expanded", String(isOpen));

      // CHANGE: Mobile menu height changes active offset.
      requestPageStateUpdate();
    });
  }

  // CHANGE: Handle nav clicks.
  nav.addEventListener("click", (event) => {
    const clickedLink =
      event.target instanceof Element ? event.target.closest("a") : null;

    if (!clickedLink) return;

    const href = clickedLink.getAttribute("href");

    // CHANGE: Immediately mark clicked internal links as active.
    if (href && href.startsWith("#")) {
      const clickedId = href.replace("#", "");

      setActiveLink(clickedId);
    }

    // CHANGE: Close mobile menu after clicking any nav link.
    if (isMobileViewport() && toggle) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  // CHANGE: Page-state updates while scrolling/resizing.
  window.addEventListener("scroll", requestPageStateUpdate, { passive: true });
  window.addEventListener("resize", requestPageStateUpdate);

  // CHANGE: Initial state.
  updatePageState();

  // CHANGE: Recalculate after assets/images/charts load and affect layout height.
  window.addEventListener("load", updatePageState);
})();
