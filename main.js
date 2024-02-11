document.addEventListener("DOMContentLoaded", async function () {

  // Constants and variables
  const specificYear = 2023; // Change this to the desired year
  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const searchInput = document.getElementById("searchInput");
  const filterDropdown = document.getElementById("filterColumn");
  const resetButton = document.getElementById("resetButton");
  const nextWeeksButton = document.getElementById("nextWeeksButton");
  const previousWeeksButton = document.getElementById("previousWeeksButton");
  const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=tsv';
  const moment = window.moment || (await import('https://cdn.jsdelivr.net/momentjs/latest/moment.min.js')).default;

  let tableData = [];
  let selectedColumnIndex = -1;
  let currentDate = moment().startOf('day');
  let currentBlockStartDate;
  let currentBlockEndDate;
  let schoolYearStart = getFirstSundayInJuly(specificYear);
  const daysElapsed = Math.ceil(currentDate.diff(schoolYearStart, "days"));
  let blockNumber = Math.ceil(daysElapsed / 28);


  // ************************ Fetch data from external source - google docs ************************************************
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

  // ************************ Determines the first Sunday of July ************************************************
  function getFirstSundayInJuly(specificYear) {
    const julyMoment = moment(`${specificYear}-07-01`, 'YYYY-MM-DD');
    const dayOfWeek = julyMoment.day(); // Calculate the day of the week for July 1st
    const daysToAdd = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // Calculate the number of days to add to reach the first Sunday
    const firstSundayMoment = julyMoment.add(daysToAdd, 'days').startOf('day'); // Add the days to get the first Sunday
    return firstSundayMoment;
  }


  // ************************ Initializes the original table ************************************************
  async function initializeTable() {
    tableData = await getTableData();
    // Log the schoolYearStart and currentDate for debugging
    console.log('schoolYearStart:', schoolYearStart.format('YYYY-MM-DD'));
    console.log('currentDate:', currentDate.format('YYYY-MM-DD'));
    console.log('Days Elapsed:', daysElapsed);
    // Resets all variables if its July 1st
    if (currentDate.isSame(schoolYearStart.clone().startOf('year').add(6, 'months'), 'day')) {
      schoolYearStart = getFirstSundayInJuly(currentDate.year());
      currentDate = moment().startOf('day');
      daysElapsed = Math.ceil(currentDate.diff(schoolYearStart, "days"));
      blockNumber = 1;
    } else {
      blockNumber = Math.ceil(daysElapsed / 28); // Calculates the block number 
    }
    // Current block's start and end dates based on the current block number
    currentBlockStartDate = schoolYearStart.clone().add((blockNumber - 1) * 28, "days");
    currentBlockEndDate = currentBlockStartDate.clone().add(27, "days");
    // Check if today's date is within the current block, otherwise it moves to the next block
    if (!(currentDate.isSameOrAfter(currentBlockStartDate) && currentDate.isSameOrBefore(currentBlockEndDate))) {
      moveToNextBlock();
    }
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTitle();
    updateTable();
  }

  // Check if a given date is today
  function isToday(date) {
    return moment(date).isSame(moment(), "day");
  }

  // ************************ Updates the block start and end dates ************************************************
  function updateDates() {
    currentBlockStartDate = schoolYearStart.clone().add((blockNumber - 1) * 28, "days");
    currentBlockEndDate = currentBlockStartDate.clone().add(27, "days");
    //Consoles for debugging
    console.log('schoolYearStart:', schoolYearStart.format('YYYY-MM-DD'));
    console.log('currentDate:', currentDate.format('YYYY-MM-DD'));
    console.log('blockNumber:', blockNumber);
    console.log('currentBlockStartDate:', currentBlockStartDate);
    console.log('currentBlockEndDate:', currentBlockEndDate);

    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTitle();
    updateTable();
  }

  // ************************ Create the table header based on the data ************************************************
  function createTableHeader(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "head-row");
    // Always display Date and Day columns
    ['DATE', 'DAY'].forEach((item, index) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", `head-cell${index === 0 || index === 1 ? ' special-column' : ''}`);
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });
    // Rest of the columns
    data.slice(2).forEach((item) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });
    return trElement;
  }

  // ************************ Update the title based on the current block ************************************************
  function updateTitle() {
    const titleElement = document.getElementById("table-title");
    const titleText = `Block ${blockNumber}: ${currentBlockStartDate.format('MMM D, YYYY')} - ${currentBlockEndDate.format('MMM D, YYYY')}`;
    titleElement.textContent = titleText;
  }

  // ************************ Rows of the table ************************************************
  function createTrForTableBody(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "body-row");
    // Check if the date is today
    const date = moment(data[0]).toDate();
    if (isToday(date)) {
      trElement.classList.add("body-row--today");
    }
    //DATE CELL 
    const dateValue = data[0];
    const dateCell = document.createElement("td");
    dateCell.setAttribute("class", `body-cell${' special-column'}`);
    // Format the date using moment.js
    const formattedDate = moment(dateValue).format('MMM D');
    dateCell.innerHTML = `<span>${formattedDate}</span>`;
    trElement.appendChild(dateCell);
    // Create cell for Day using the value from Google Sheets
    const dayCell = document.createElement("td");
    dayCell.setAttribute("class", "body-cell special-column");
    const dayValue = data[1]; // Assuming the "Day" column is at index 1
    dayCell.innerHTML = `<span>${dayValue}</span>`;
    trElement.appendChild(dayCell);
    // Create cells based on selected column
    if (selectedColumnIndex !== -1) {
      const tdElement = document.createElement("td");
      tdElement.setAttribute("class", "body-cell");
      tdElement.innerHTML = `<span>${data[selectedColumnIndex]}</span>`;
      trElement.appendChild(tdElement);
    } else {
      // Create cells for the rest of the data
      data.slice(2).forEach((item) => {
        const tdElement = document.createElement("td");
        tdElement.setAttribute("class", "body-cell");
        tdElement.innerHTML = `<span>${item}</span>`;
        trElement.appendChild(tdElement);
      });
    }
    return trElement;
  }

  // ************************ Update the table based on the selected filters ************************************************
  function updateTable() {
    tbodyElement.innerHTML = '';
    if (filterDropdown.value === "") {
      // Display the original table header
      theadElement.innerHTML = '';
      theadElement.appendChild(createTableHeader(tableData[0]));
      // Iterate through the table data and update the rows
      for (let i = 1; i < tableData.length; i++) {
        const trElementForBody = createTrForTableBody(tableData[i]);
        // Add the row to the tbody if it falls within the date range
        const rowDate = moment(tableData[i][0]).toDate();
        if (rowDate >= currentBlockStartDate && rowDate <= currentBlockEndDate) {
          tbodyElement.appendChild(trElementForBody);
        }
        // Add the "body-row--today" class if it's today's date
        if (isToday(rowDate)) {
          trElementForBody.classList.add('body-row--today');
        }
      }
    } else {
      // Create header data including "Date" and "Day"
      const headerData = ["DATE", "DAY"];
      // Check if a column is selected // Only display the selected column in the header
      if (selectedColumnIndex !== -1) {
        headerData.push(tableData[0][selectedColumnIndex]);
      } else {
        headerData.push("DATE", "DAY"); // Display only DATE and DAY columns in the header
      }
      // Update header
      theadElement.innerHTML = '';
      theadElement.appendChild(createTableHeader(headerData));
      // Iterate through the table data and update the rows
      for (let i = 1; i < tableData.length; i++) {
        const trElementForBody = createTrForTableBody(tableData[i]);
        // Add the row to the tbody if it falls within the date range
        const rowDate = moment(tableData[i][0]).toDate();
        if (rowDate >= currentBlockStartDate && rowDate <= currentBlockEndDate) {
          tbodyElement.appendChild(trElementForBody);
        }
        // Add the "body-row--today" class if it's today's date
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
    // Clear existing options
    filterDropdown.innerHTML = '';
    // Create a default "Select a Team" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a Team";
    filterDropdown.appendChild(defaultOption);
    // Add options for each column
    data.slice(2).forEach((item, index) => {
      const optionElement = document.createElement("option");
      optionElement.value = (index + 2).toString();
      optionElement.textContent = item;
      filterDropdown.appendChild(optionElement);
    });
  }

  // Function to move blocks
  function moveToNextBlock() {
    blockNumber++;
    updateDates();
  }
  function moveToPreviousBlock() {
    if (blockNumber > 1) {
      blockNumber--;
      updateDates();
    }
  }

  // Event listeners for buttons and input fields
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
  searchInput.addEventListener("input", function () {
    updateTable();
  });
  filterDropdown.addEventListener("change", function () {
    selectedColumnIndex = parseInt(filterDropdown.value);
    updateTable();
  });
  resetButton.addEventListener("click", function () {
    selectedColumnIndex = -1;
    initializeTable(); // Reinitialize the table
    searchInput.value = "";
    filterDropdown.value = "";
  });

  // Hover effect for rows and columns
  tableElement.addEventListener("mouseover", handleHover);
  tableElement.addEventListener("mouseout", handleHover);
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

  //HIGHLIGHT FUNCTIONS
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

  // Initialize the table on page load
  await initializeTable();
});
