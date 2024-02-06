document.addEventListener("DOMContentLoaded", async function () {
  // Constants and variables
  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const searchInput = document.getElementById("searchInput");
  const filterDropdown = document.getElementById("filterColumn");
  const resetButton = document.getElementById("resetButton");
  const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=tsv';

  let baseDate = new Date('2024-01-14');
  let tableData = [];
  let selectedColumnIndex = -1;
  let optionsInitialized = false;

  // Fetch data from external source - google docs
  async function getTableData() {
    try {
      const tableDataResponse = await fetch(dataUrl, { cache: "reload" });
      const csvData = await tableDataResponse.text();
      return csvData.split('\n').map(row => row.split('\t'));
    } catch (error) {
      console.error('Error fetching data:', error);
      return [];
    }
  }

  // Table is initialized on page load
  async function initializeTable() {
    tableData = await getTableData();
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTable();
  }

  // Check if a given date is today
  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  // Create the table header based on the data
  function createTableHeader(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "head-row");

    // Date column
    const dateThElement = document.createElement("th");
    dateThElement.setAttribute("class", "head-cell");
    dateThElement.innerHTML = `<span>${data[0]}</span>`;
    trElement.appendChild(dateThElement);

    // Day column
    const dayThElement = document.createElement("th");
    dayThElement.setAttribute("class", "head-cell");
    dayThElement.innerHTML = `<span>${data[1]}</span>`;
    trElement.appendChild(dayThElement);

    // Check if a column is selected from the filter
    if (selectedColumnIndex !== -1) {
      // Display only the selected column header
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = `<span>${data[selectedColumnIndex]}</span>`;
      trElement.appendChild(thElement);
    } else {
      // Display all column headers except the first two
      data.slice(2).forEach((item, index) => {
        const thElement = document.createElement("th");
        thElement.setAttribute("class", "head-cell");
        thElement.innerHTML = `<span>${item}</span>`;
        trElement.appendChild(thElement);
      });
    }

    return trElement;
  }

  // Create a table row for the body based on the data
  function createTrForTableBody(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "body-row");

    // Check if the date is today
    const date = new Date(data[0]);
    if (isToday(date)) {
      trElement.setAttribute("class", "body-row body-row--today");
    }

    // Create cells for each item in the data
    data.forEach((item, index) => {
      const tdElement = document.createElement("td");
      tdElement.setAttribute("class", "body-cell");
      tdElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(tdElement);
    });

    return trElement;
  }

  // Update the table based on the selected filters
  function updateTable() {
    tbodyElement.innerHTML = '';

    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + 27);

    // Iterate through the table data and update the rows
    for (let i = 1; i < tableData.length; i++) {
      const rowDate = new Date(tableData[i][0]);
      const trElementForBody = document.createElement("tr");
      trElementForBody.setAttribute("class", "body-row");

      // Date cell
      const dateCell = document.createElement("td");
      dateCell.setAttribute("class", "body-cell");
      dateCell.innerHTML = `<span>${tableData[i][0]}</span>`;
      trElementForBody.appendChild(dateCell);

      // Day cell
      const dayCell = document.createElement("td");
      dayCell.setAttribute("class", "body-cell");
      dayCell.innerHTML = `<span>${tableData[i][1]}</span>`;
      trElementForBody.appendChild(dayCell);

      // Check if a column is selected
      if (selectedColumnIndex !== -1) {
        // Only display the selected column
        const tdElement = document.createElement("td");
        tdElement.setAttribute("class", "body-cell");
        tdElement.innerHTML = `<span>${tableData[i][selectedColumnIndex]}</span>`; // Offset by 2 for the skipped first two columns
        trElementForBody.appendChild(tdElement);
      } else {
        // Display all columns except the first two
        tableData[i].forEach((item, index) => {
          if (index > 1) {
            const tdElement = document.createElement("td");
            tdElement.setAttribute("class", "body-cell");
            tdElement.innerHTML = `<span>${item}</span>`;
            trElementForBody.appendChild(tdElement);
          }
        });
      }

      // Add the row to the tbody if it falls within the date range
      if (rowDate >= startDate && rowDate <= endDate) {
        tbodyElement.appendChild(trElementForBody);
      }

      // Add a class if the row corresponds to today's date
      if (isToday(rowDate)) {
        trElementForBody.classList.add('body-row--today');
      }
    }

    // Update header
    theadElement.innerHTML = '';
    theadElement.appendChild(createTableHeader(tableData[0]));

    // Append existing content
    tableElement.innerHTML = '';
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);

    // Highlight cells based on search input
    highlightCells();
  }

  // Highlight cells based on search input
  function highlightCells() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
      return;
    }

    const cells = document.querySelectorAll('.body-cell');
    cells.forEach(cell => {
      const text = cell.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        cell.classList.add('highlight');
      } else {
        cell.classList.remove('highlight');
      }
    });
  }

  // Update the filter dropdown options
  function updateFilterDropdown(data) {
    if (!optionsInitialized) {
      // Display all column headers except the first two
      data.slice(2).forEach((item, index) => {
        const optionElement = document.createElement("option");
        optionElement.value = (index + 2).toString(); // Offset by 2 for the skipped first two columns
        optionElement.textContent = item;
        filterDropdown.appendChild(optionElement);
      });

      optionsInitialized = true;
    }
  }

  // Event listeners for buttons and input fields
  const nextWeeksButton = document.getElementById("nextWeeksButton");
  nextWeeksButton.addEventListener("click", () => {
    baseDate.setDate(baseDate.getDate() + 28);
    updateTable();
  });

  const previousWeeksButton = document.getElementById("previousWeeksButton");
  previousWeeksButton.addEventListener("click", () => {
    baseDate.setDate(baseDate.getDate() - 28);
    updateTable();
  });

  searchInput.addEventListener("input", function () {
    updateTable();
  });

  filterDropdown.addEventListener("change", function () {
    selectedColumnIndex = parseInt(filterDropdown.value);
    updateTable();
  });

  resetButton.addEventListener("click", function () {
    // Reset any filter-related variables
    selectedColumnIndex = -1;

    // Update the table to display the original data
    updateTable();
  });

  // Hover effect for rows and columns
  tableElement.addEventListener("mouseover", handleTableHover);
  tableElement.addEventListener("mouseout", handleTableHoverOut);

  function handleTableHover(event) {
    const target = event.target;
    const cell = target.closest("td");

    if (cell && cell.classList.contains("body-cell")) {
      cell.classList.add("hovered-cell");
      const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
      highlightColumn(columnIndex);
    }
  }

  function handleTableHoverOut(event) {
    const target = event.target;
    const cell = target.closest("td");

    if (cell && cell.classList.contains("body-cell")) {
      cell.classList.remove("hovered-cell");
      unhighlightColumns();
    }
  }

  // Highlight entire column
  function highlightColumn(index) {
    const cells = document.querySelectorAll(`.body-cell:nth-child(${index + 1})`);
    cells.forEach((cell) => {
      cell.classList.add("hovered-column");
    });
  }

  // Remove highlight from entire column
  function unhighlightColumns() {
    const cells = document.querySelectorAll(".hovered-column");
    cells.forEach((cell) => {
      cell.classList.remove("hovered-column");
    });
  }

  // Initialize the table on page load
  await initializeTable();
});
