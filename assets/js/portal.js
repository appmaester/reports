// CHANGE: Reports portal rendering, category filtering, and search.
(() => {
  const reportGrid = document.querySelector("#report-grid");
  const reportCount = document.querySelector("#report-count");
  const emptyState = document.querySelector("#empty-state");
  const categoryFilters = document.querySelector("#category-filters");
  const searchInput = document.querySelector("#report-search");

  if (!reportGrid || !reportCount || !emptyState || !categoryFilters || !searchInput) return;

  let reports = [];
  let activeCategory = "All";
  let activeSearch = "";

  function normalise(value) {
    return String(value || "").trim().toLowerCase();
  }

  function createReportCard(report) {
    const card = document.createElement("article");
    card.className = report.featured ? "report-card is-featured" : "report-card";

    const tags = Array.isArray(report.tags) ? report.tags : [];

    card.innerHTML = `
      <div class="report-meta">
        <span class="badge">${report.category || "Uncategorised"}</span>
        <span class="badge year">${report.year || "Undated"}</span>
      </div>

     <a href="${report.url}"> <h3>${report.title || "Untitled Report"}</h3></a>

      <p>${report.description || ""}</p>

      <div class="tags" aria-label="Report tags">
        ${tags.map((tag) => `<span class="tag">#${tag}</span>`).join("")}
      </div>

      <div class="card-actions">
        <a class="button primary" href="${report.url}">Open Report</a>
        ${
          report.pdfUrl
            ? `<a class="button secondary" href="${report.pdfUrl}" download> Full Report (Academic Version)</a>`
            : ""
        }
      </div>
    `;

    return card;
  }

  function getCategories() {
    const categories = reports
      .map((report) => report.category)
      .filter(Boolean);

    return ["All", ...new Set(categories)];
  }

  function renderFilters() {
    const categories = getCategories();

    categoryFilters.innerHTML = categories
      .map((category) => {
        const isActive = category === activeCategory ? " is-active" : "";

        return `
          <button class="filter-button${isActive}" type="button" data-category="${category}">
            ${category}
          </button>
        `;
      })
      .join("");
  }

  function reportMatchesSearch(report) {
    if (!activeSearch) return true;

    const searchableText = [
      report.title,
      report.category,
      report.year,
      report.publisher,
      report.description,
      ...(Array.isArray(report.tags) ? report.tags : []),
    ]
      .map(normalise)
      .join(" ");

    return searchableText.includes(activeSearch);
  }

  function reportMatchesCategory(report) {
    if (activeCategory === "All") return true;

    return report.category === activeCategory;
  }

  function getFilteredReports() {
    return reports.filter((report) => {
      return reportMatchesCategory(report) && reportMatchesSearch(report);
    });
  }

  function renderReports() {
    const filteredReports = getFilteredReports();

    reportGrid.innerHTML = "";

    filteredReports.forEach((report) => {
      reportGrid.appendChild(createReportCard(report));
    });

    const reportLabel = filteredReports.length === 1 ? "report" : "reports";

    reportCount.textContent = `${filteredReports.length} ${reportLabel} shown`;

    emptyState.hidden = filteredReports.length > 0;
  }

  function render() {
    renderFilters();
    renderReports();
  }

  categoryFilters.addEventListener("click", (event) => {
    const button = event.target instanceof Element
      ? event.target.closest("[data-category]")
      : null;

    if (!button) return;

    activeCategory = button.getAttribute("data-category") || "All";

    render();
  });

  searchInput.addEventListener("input", (event) => {
    activeSearch = normalise(event.target.value);

    renderReports();
  });

  fetch("./reports.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Could not load reports.json");
      }

      return response.json();
    })
    .then((data) => {
      reports = Array.isArray(data) ? data : [];

      render();
    })
    .catch((error) => {
      console.error(error);

      reportCount.textContent = "Could not load reports";
      emptyState.hidden = false;
      emptyState.querySelector("h3").textContent = "Reports could not be loaded";
      emptyState.querySelector("p").textContent = "Check that reports.json exists in the reports root folder.";
    });
})();