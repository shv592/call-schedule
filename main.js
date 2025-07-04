import { print_button } from "./print_button.js";

document.addEventListener("DOMContentLoaded", async function () {
  // ─────────────────────────────────────────────────────────────────────────────
  // CONSTANTS & ELEMENT REFERENCES
  // ─────────────────────────────────────────────────────────────────────────────
  const dataUrl =
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=tsv";
  const moment =
    window.moment ||
    (await import("https://cdn.jsdelivr.net/momentjs/latest/moment.min.js")).default;

  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const filterDropdown = document.getElementById("filterColumn");
  const nextWeeksButton = document.getElementById("nextWeeksButton");
  const previousWeeksButton = document.getElementById("previousWeeksButton");
  const searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  const resetButton = document.getElementById("resetButton");
  const mobileAccordionContainer = document.getElementById("mobile-accordion");

  // ─────────────────────────────────────────────────────────────────────────────
  // DATE CALCULATIONS
  // ─────────────────────────────────────────────────────────────────────────────
  let currentDate = moment().startOf("day");

  function determineSchoolYearStart() {
    const julyFirstThisYear = moment(
      `${currentDate.year()}-07-01`,
      "YYYY-MM-DD"
    );
    const year = currentDate.isSameOrAfter(julyFirstThisYear)
      ? currentDate.year()
      : currentDate.year() - 1;
    return moment(`${year}-07-01`, "YYYY-MM-DD");
  }

  let schoolYearStart = determineSchoolYearStart();
  let specificYear = schoolYearStart.year();

  // ─────────────────────────────────────────────────────────────────────────────
  // STATE VARIABLES
  // ─────────────────────────────────────────────────────────────────────────────
  let tableData = [];
  let selectedColumnIndex = -1;
  let currentBlockStartDate;
  let currentBlockEndDate;
  let daysElapsed = Math.ceil(currentDate.diff(schoolYearStart, "days"));
  let blockNumber = Math.ceil(daysElapsed / 28);

  // ─────────────────────────────────────────────────────────────────────────────
  // FETCH & INITIALIZE
  // ─────────────────────────────────────────────────────────────────────────────
  async function getTableData() {
    try {
      const response = await fetch(dataUrl, { cache: "reload" });
      const csvData = await response.text();
      return csvData.split("\n").map((row) => row.split("\t"));
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
  }

  async function initializeTable() {
    tableData = await getTableData();

    // If today is July 1, reset to Block 1 of new school year
    if (
      currentDate.isSame(
        moment(`${specificYear}-07-01`, "YYYY-MM-DD"),
        "day"
      )
    ) {
      schoolYearStart = moment(`${currentDate.year()}-07-01`, "YYYY-MM-DD");
      specificYear = schoolYearStart.year();
      currentDate = moment().startOf("day");
      daysElapsed = Math.ceil(currentDate.diff(schoolYearStart, "days"));
      blockNumber = 1;
    } else {
      blockNumber = Math.ceil(daysElapsed / 28);
      if (blockNumber < 1) blockNumber = 1;
      if (blockNumber > 13) blockNumber = 13;
    }

    currentBlockStartDate = schoolYearStart
      .clone()
      .add((blockNumber - 1) * 28, "days");
    if (blockNumber === 13) {
      currentBlockEndDate = moment(
        `${specificYear + 1}-06-30`,
        "YYYY-MM-DD"
      );
    } else {
      currentBlockEndDate = currentBlockStartDate.clone().add(27, "days");
    }

    // If today isn’t in this calculated block, move to next block
    if (
      !(
        currentDate.isSameOrAfter(currentBlockStartDate) &&
        currentDate.isSameOrBefore(currentBlockEndDate)
      )
    ) {
      moveToNextBlock();
    }

    // Build thead / tbody, set dropdown, title, table
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTitle();
    updateTable();

    // Build mobile accordion on first load
    buildMobileAccordion();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // UTILITY FUNCTIONS
  // ─────────────────────────────────────────────────────────────────────────────
  function isToday(date) {
    return moment(date).isSame(moment(), "day");
  }

  function updateTitle() {
    const titleElement = document.getElementById("table-title");
    const titleText = `Block ${blockNumber}: ${currentBlockStartDate.format(
      "MMM D, YYYY"
    )} - ${currentBlockEndDate.format("MMM D, YYYY")}`;
    titleElement.textContent = titleText;
  }

  function createTableHeader(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "head-row");

    // First two columns: DATE and DAY
    ["DATE", "DAY"].forEach((item, index) => {
      const thElement = document.createElement("th");
      thElement.setAttribute(
        "class",
        `head-cell${index === 0 || index === 1 ? " special-column" : ""}`
      );
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });

    // Remaining columns: everyone else
    data.slice(2).forEach((item) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });

    return trElement;
  }

  function createTrForTableBody(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "body-row");

    const date = moment(data[0]).toDate();
    if (isToday(date)) {
      trElement.classList.add("body-row--today");
    }

    // DATE cell
    const dateValue = data[0];
    const dateCell = document.createElement("td");
    const formattedDate = moment(dateValue).format("MMM D");
    dateCell.setAttribute("class", "body-cell special-column");
    dateCell.innerHTML = `<span>${formattedDate}</span>`;
    trElement.appendChild(dateCell);

    // DAY cell
    const dayValue = data[1];
    const dayCell = document.createElement("td");
    dayCell.setAttribute("class", "body-cell special-column");
    dayCell.innerHTML = `<span>${dayValue}</span>`;
    trElement.appendChild(dayCell);

    // Assignment columns
    if (selectedColumnIndex !== -1) {
      const tdElement = document.createElement("td");
      tdElement.setAttribute("class", "body-cell");
      tdElement.innerHTML = `<span>${data[selectedColumnIndex]}</span>`;
      trElement.appendChild(tdElement);
    } else {
      data.slice(2).forEach((item) => {
        const tdElement = document.createElement("td");
        tdElement.setAttribute("class", "body-cell");
        tdElement.innerHTML = `<span>${item}</span>`;
        trElement.appendChild(tdElement);
      });
    }

    return trElement;
  }

  function updateTable() {
    tbodyElement.innerHTML = "";

    if (filterDropdown.value === "default") {
      selectedColumnIndex = -1;
      filterDropdown.value = "default";
      theadElement.innerHTML = "";
      theadElement.appendChild(createTableHeader(tableData[0]));

      for (let i = 1; i < tableData.length; i++) {
        const trElementForBody = createTrForTableBody(tableData[i]);
        const rowDate = moment(tableData[i][0]).toDate();
        if (
          rowDate >= currentBlockStartDate &&
          rowDate <= currentBlockEndDate
        ) {
          tbodyElement.appendChild(trElementForBody);
        }
        if (isToday(rowDate)) {
          trElementForBody.classList.add("body-row--today");
        }
      }
    } else {
      const headerData = ["DATE", "DAY"];
      if (selectedColumnIndex !== -1) {
        headerData.push(tableData[0][selectedColumnIndex]);
      } else {
        headerData.push("DATE", "DAY");
      }
      theadElement.innerHTML = "";
      theadElement.appendChild(createTableHeader(headerData));

      for (let i = 1; i < tableData.length; i++) {
        const trElementForBody = createTrForTableBody(tableData[i]);
        const rowDate = moment(tableData[i][0]).toDate();
        if (
          rowDate >= currentBlockStartDate &&
          rowDate <= currentBlockEndDate
        ) {
          tbodyElement.appendChild(trElementForBody);
        }
        if (isToday(rowDate)) {
          trElementForBody.classList.add("body-row--today");
        }
      }
    }

    tableElement.innerHTML = "";
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);

    // Rebuild the mobile accordion whenever the table changes
    buildMobileAccordion();
  }

  function updateFilterDropdown(data) {
    filterDropdown.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "default";
    defaultOption.textContent = "All";
    filterDropdown.appendChild(defaultOption);

    data.slice(2).forEach((item, index) => {
      const optionElement = document.createElement("option");
      optionElement.value = (index + 2).toString();
      optionElement.textContent = item;
      filterDropdown.appendChild(optionElement);
    });

    adjustFilterColumnWidth();
  }

  function scrollToTodayRow() {
    const todayRow = document.querySelector(".body-row--today");
    if (todayRow) {
      todayRow.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function adjustFilterColumnWidth() {
    const selectedOption =
      filterDropdown.options[filterDropdown.selectedIndex];
    const selectedOptionText = selectedOption.textContent;
    const paddingAndMargin = 35;
    const selectedOptionWidth =
      getTextWidth(selectedOptionText) + paddingAndMargin;
    filterDropdown.style.width = `${selectedOptionWidth}px`;
    filterDropdown.style.minWidth = `${selectedOptionWidth}px`;
  }

  function getTextWidth(text) {
    const span = document.createElement("span");
    span.style.visibility = "hidden";
    span.style.whiteSpace = "nowrap";
    span.innerText = text;
    document.body.appendChild(span);
    const width = span.offsetWidth;
    document.body.removeChild(span);
    return width;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NAVIGATION: Next/Previous Block
  // ─────────────────────────────────────────────────────────────────────────────
  function moveToNextBlock() {
    if (blockNumber < 13) {
      blockNumber++;
    } else {
      specificYear += 1;
      schoolYearStart = moment(`${specificYear}-07-01`, "YYYY-MM-DD");
      blockNumber = 1;
    }
    updateDates();
  }

  function moveToPreviousBlock() {
    if (blockNumber > 1) {
      blockNumber--;
    } else {
      specificYear -= 1;
      schoolYearStart = moment(`${specificYear}-07-01`, "YYYY-MM-DD");
      blockNumber = 13;
    }
    updateDates();
  }

  function updateDates() {
    currentBlockStartDate = schoolYearStart
      .clone()
      .add((blockNumber - 1) * 28, "days");
    if (blockNumber === 13) {
      currentBlockEndDate = moment(
        `${specificYear + 1}-06-30`,
        "YYYY-MM-DD"
      );
    } else {
      currentBlockEndDate = currentBlockStartDate.clone().add(27, "days");
    }
    theadElement.innerHTML = "";
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTitle();
    updateTable();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HIGHLIGHT + HOVER EFFECTS
  // ─────────────────────────────────────────────────────────────────────────────
  function highlightCells() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const cells = document.querySelectorAll(".body-cell");
    cells.forEach((cell) => {
      const text = cell.textContent.toLowerCase();
      const row = cell.parentElement;
      if (searchTerm && text.includes(searchTerm)) {
        cell.classList.add("highlight");
        if (row.classList.contains("body-row--today")) {
          cell.style.color = "black";
        } else {
          cell.style.color = "";
        }
      } else {
        cell.classList.remove("highlight");
        cell.style.color = "";
      }
    });
  }

  function highlightColumn(index) {
    const cells = document.querySelectorAll(`.body-cell:nth-child(${index + 1})`);
    cells.forEach((cell) => {
      cell.classList.add("hovered-column");
    });
  }

  function unhighlightColumns() {
    const cells = document.querySelectorAll(".hovered-column");
    cells.forEach((cell) => {
      cell.classList.remove("hovered-column");
    });
  }

  function handleHover(event) {
    const target = event.target;
    const cell = target.closest("th, td");
    if (cell && cell.classList.contains("body-cell")) {
      const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
      if (columnIndex >= 2) {
        if (event.type === "mouseover") {
          cell.classList.add("hovered-cell");
          highlightColumn(columnIndex);
        } else if (event.type === "mouseout") {
          cell.classList.remove("hovered-cell");
          unhighlightColumns();
        }
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MOBILE ACCORDION (DATE‐CENTERED)
  // ─────────────────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────
// MOBILE ACCORDION (Date‐Centered, Auto‐Open Today)
// ─────────────────────────────────────────────────────────────────────────────
function buildMobileAccordion() {
  if (window.innerWidth > 768) {
    mobileAccordionContainer.innerHTML = "";
    return;
  }

  const thead = tableElement.querySelector("thead");
  const tbody = tableElement.querySelector("tbody");
  if (!thead || !tbody) {
    mobileAccordionContainer.innerHTML = "";
    return;
  }

  const allTh = Array.from(thead.querySelectorAll("th"));
  const columnHeaders = allTh.slice(2).map(th => th.innerText.trim());
  const bodyRows = Array.from(tbody.querySelectorAll("tr.body-row"));

  mobileAccordionContainer.innerHTML = "";
  let todayHeaderButton = null;

  bodyRows.forEach((row, rowIndex) => {
    const tdCells = Array.from(row.querySelectorAll("td"));
    const dateText = tdCells[0]?.innerText.trim() || "";
    const dayText  = tdCells[1]?.innerText.trim() || "";
    if (!dateText) return;

    const headerLabel = `${dateText} (${dayText})`;
    const panelId = `mobile-panel-${rowIndex}`;

    // Create header button
    const headerButton = document.createElement("button");
    headerButton.classList.add("accordion-header");
    headerButton.setAttribute("aria-expanded", "false");
    headerButton.setAttribute("aria-controls", panelId);
    headerButton.innerText = headerLabel;

    // Create panel div
    const panelDiv = document.createElement("div");
    panelDiv.classList.add("accordion-panel");
    panelDiv.id = panelId;
    // No inline display toggle—CSS handles it via .expanded

    // Populate panel contents
    columnHeaders.forEach((colName, colIdx) => {
      const assignCell = tdCells[colIdx + 2];
      const assignText = assignCell ? assignCell.innerText.trim() : "";
      if (assignText) {
        const item = document.createElement("div");
        item.classList.add("accordion-item");
        item.innerText = `${colName}: ${assignText}`;
        panelDiv.appendChild(item);
      }
    });

    // Remember today’s button to auto‐open later
    if (row.classList.contains("body-row--today")) {
      todayHeaderButton = headerButton;
    }

    // NEW: smoother toggle using “expanded” class, not display
    headerButton.addEventListener("click", () => {
      const isOpen = headerButton.getAttribute("aria-expanded") === "true";
      headerButton.setAttribute("aria-expanded", String(!isOpen));
      if (isOpen) {
        panelDiv.classList.remove("expanded");
      } else {
        panelDiv.classList.add("expanded");
      }
    });

    mobileAccordionContainer.appendChild(headerButton);
    mobileAccordionContainer.appendChild(panelDiv);
  });

  // Auto‐open today’s panel as before
  if (todayHeaderButton) {
    todayHeaderButton.setAttribute("aria-expanded", "true");
    const todayPanelDiv = document.getElementById(todayHeaderButton.getAttribute("aria-controls"));
    if (todayPanelDiv) {
      todayPanelDiv.classList.add("expanded");
    }
    setTimeout(() => {
      todayHeaderButton.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}


  // ─────────────────────────────────────────────────────────────────────────────
  // EVENT LISTENERS
  // ─────────────────────────────────────────────────────────────────────────────
  searchInput.addEventListener("input", highlightCells);
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      searchInput.blur();
      highlightCells();
    }
  });
  searchButton.addEventListener("click", highlightCells);

  resetButton.addEventListener("click", () => {
    searchInput.value = "";
    highlightCells();
    filterDropdown.value = "default";
    updateTable();
  });

  nextWeeksButton.addEventListener("click", () => {
    moveToNextBlock();
    updateTable();
    updateTitle();
  });

  previousWeeksButton.addEventListener("click", () => {
    moveToPreviousBlock();
    updateTable();
    updateTitle();
  });

  filterDropdown.addEventListener("change", () => {
    selectedColumnIndex = parseInt(filterDropdown.value);
    adjustFilterColumnWidth();
    updateTable();
  });

  tableElement.addEventListener("mouseover", handleHover);
  tableElement.addEventListener("mouseout", handleHover);

  window.addEventListener("resize", () => {
    buildMobileAccordion();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // INITIALIZE EVERYTHING
  // ─────────────────────────────────────────────────────────────────────────────
  await initializeTable();
  print_button.init(tbodyElement, theadElement);
  scrollToTodayRow();
});
