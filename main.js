
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

    // Always display Date and Day columns
    ['Date', 'Day'].forEach((item) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });

    // Rest of the columns
    data.slice(2).forEach((item, index) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });

    return trElement;
  }

  // Create a table row for the body based on the data
  function createTrForTableBody(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "body-row");

    // Check if the date is today
    const date = new Date(data[0]);
    if (isToday(date)) {
      trElement.classList.add("body-row--today");
    }

    // Format date to display only month and day
    const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Create cell for formatted date
    const dateCell = document.createElement("td");
    dateCell.setAttribute("class", "body-cell");
    dateCell.innerHTML = `<span>${formattedDate}</span>`;
    trElement.appendChild(dateCell);

    // Create cell for Day
    const dayCell = document.createElement("td");
    dayCell.setAttribute("class", "body-cell");
    dayCell.innerHTML = `<span>${data[1]}</span>`;
    trElement.appendChild(dayCell);

    // Create cells for the rest of the data
    data.slice(2).forEach((item, index) => {
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

    // Add a class to trigger the transition
    tableElement.classList.add("updating-table");

    // Remove the class after a short delay
    setTimeout(() => {
      tableElement.classList.remove("updating-table");
    }, 100);

    
    // Check if "Select a Team" is chosen from the dropdown
    if (filterDropdown.value === "") {
      // Display the original table
      theadElement.innerHTML = '';
      theadElement.appendChild(createTableHeader(tableData[0]));

      // Iterate through the table data and update the rows
      for (let i = 1; i < tableData.length; i++) {
        const rowDate = new Date(tableData[i][0]);
        const trElementForBody = createTrForTableBody(tableData[i]);

        // Add the row to the tbody if it falls within the date range
        if (rowDate >= startDate && rowDate <= endDate) {
          tbodyElement.appendChild(trElementForBody);
        }

        // Add a class if the row corresponds to today's date
        if (isToday(rowDate)) {
          trElementForBody.classList.add('body-row--today');
        }
      }
    } else {
      // Create header data including "Date" and "Day"
      const headerData = ["Date", "Day"];

      // Check if a column is selected
      if (selectedColumnIndex !== -1) {
        // Only display the selected column in the header
        headerData.push(tableData[0][selectedColumnIndex]); // +2 to account for date and column 0
      } else {
        // Display all columns except the first two in the header
        headerData.push(...tableData[0].slice(2)); // Concatenate date and column 0 with the rest of the columns
      }

      // Update header
      theadElement.innerHTML = '';
      theadElement.appendChild(createTableHeader(headerData));

      // Iterate through the table data and update the rows
      for (let i = 1; i < tableData.length; i++) {
        const rowDate = new Date(tableData[i][0]);
        const trElementForBody = document.createElement("tr");
        trElementForBody.setAttribute("class", "body-row");

        // Date cell
        const dateCell = document.createElement("td");
        dateCell.setAttribute("class", "body-cell");
        const formattedDate = rowDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        dateCell.innerHTML = `<span>${formattedDate}</span>`;
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
          tdElement.innerHTML = `<span>${tableData[i][selectedColumnIndex]}</span>`; // +2 to account for date and column 0
          trElementForBody.appendChild(tdElement);
        } else {
          // Display all columns except the first two
          tableData[i].slice(2).forEach((item, index) => {
            const tdElement = document.createElement("td");
            tdElement.setAttribute("class", "body-cell");
            tdElement.innerHTML = `<span>${item}</span>`;
            trElementForBody.appendChild(tdElement);
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
    }

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

    // Reset the search input
    searchInput.value = "";

    // Reset the filter dropdown to the default option
    filterDropdown.value = "";

    // Reset the baseDate to the original date
    baseDate = new Date('2024-01-14');

    // Update the table to display the original data
    updateTable();
  });

  // Hover effect for rows and columns
  // Consolidate event listeners for "mouseover" and "mouseout"
  tableElement.addEventListener("mouseover", handleHover);
  tableElement.addEventListener("mouseout", handleHover);

  function handleHover(event) {
    const target = event.target;
    const cell = target.closest("td");

    if (cell && cell.classList.contains("body-cell")) {
      if (event.type === "mouseover") {
        cell.classList.add("hovered-cell");
        const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);
        highlightColumn(columnIndex);
      } else if (event.type === "mouseout") {
        cell.classList.remove("hovered-cell");
        unhighlightColumns();
      }
    }
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

  // Additional CSS for smoother transitions
  const bodyElement = document.body;

  // Initialize the table on page load
  await initializeTable();
});
