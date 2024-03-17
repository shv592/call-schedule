document.addEventListener("DOMContentLoaded", async function () {
  //Constants
  const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=tsv';
  const moment = window.moment || (await import('https://cdn.jsdelivr.net/momentjs/latest/moment.min.js')).default;

  // Constants related to DOM elements
  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const searchInput = document.getElementById("searchInput");
  const filterDropdown = document.getElementById("filterColumn");
  const resetButton = document.getElementById("resetButton");
  const nextWeeksButton = document.getElementById("nextWeeksButton");
  const previousWeeksButton = document.getElementById("previousWeeksButton");

  //************************ DATE CALCULATIONS ************************************************
  let currentDate = moment().startOf('day');

  // Dynamically updates the schoolYear
  function determineSchoolYearStart() {
    const julyMoment = moment(`${currentDate.year()}-07-01`, 'YYYY-MM-DD');
    return currentDate.isSameOrAfter(julyMoment) ? currentDate.year() : currentDate.year() - 1;
  }
  let specificYear = determineSchoolYearStart();

  //Determines the first sunday in july. 
  function getFirstSundayInJuly(specificYear) {
    const julyMoment = moment(`${specificYear}-07-01`, 'YYYY-MM-DD');
    const dayOfWeek = julyMoment.day(); // Calculate the day of the week for July 1st
    const daysToAdd = dayOfWeek === 0 ? 0 : 7 - dayOfWeek; // Calculate the number of days to add to reach the first Sunday
    const firstSundayMoment = julyMoment.add(daysToAdd, 'days').startOf('day'); // Add the days to get the first Sunday
    return firstSundayMoment;
  }
  let schoolYearStart = getFirstSundayInJuly(specificYear);

  //Variables
  let tableData = [];
  let selectedColumnIndex = -1;
  let currentBlockStartDate;
  let currentBlockEndDate;
  const daysElapsed = Math.ceil(currentDate.diff(schoolYearStart, "days"));
  let blockNumber = Math.ceil(daysElapsed / 28);


  //ASYNC FUNCTIONS ************************************************************************************************************************************************
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
  
// Fetch data and update table every second
setInterval(async () => {
  try {
    const tableData = await getTableData();
    // Update your table with the fetched data
    updateTable(tableData);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}, 1000);
  
  

  // Initializes the original table
  async function initializeTable() {
    tableData = await getTableData();

    // Resets all variables on July 1st
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

  // ************************ FUNCTIONS ************************************************

  // Check if a given date is today
  function isToday(date) {
    return moment(date).isSame(moment(), "day");
  }

  // Update the title based on the current block
  function updateTitle() {
    const titleElement = document.getElementById("table-title");
    const titleText = `Block ${blockNumber}: ${currentBlockStartDate.format('MMM D, YYYY')} - ${currentBlockEndDate.format('MMM D, YYYY')}`;
    titleElement.textContent = titleText;
  }

  // Updates the block start and end dates
  function updateDates() {
    currentBlockStartDate = schoolYearStart.clone().add((blockNumber - 1) * 28, "days");
    currentBlockEndDate = currentBlockStartDate.clone().add(27, "days");
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTitle();
    updateTable();
  }

  // Create the table headers based on the data
  function createTableHeader(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "head-row");
    ['DATE', 'DAY'].forEach((item, index) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", `head-cell${index === 0 || index === 1 ? ' special-column' : ''}`);
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });
    data.slice(2).forEach((item) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(thElement);
    });
    return trElement;
  }


  // Create the rows of the table based on data
  function createTrForTableBody(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "body-row");

    const date = moment(data[0]).toDate();
    if (isToday(date)) {
      trElement.classList.add("body-row--today");
    }
    const dateValue = data[0];  // Create DATE CELL based on google sheet value, and format it. 
    const dateCell = document.createElement("td");
    dateCell.setAttribute("class", `body-cell${' special-column'}`);
    const formattedDate = moment(dateValue).format('MMM D');
    dateCell.innerHTML = `<span>${formattedDate}</span>`;
    trElement.appendChild(dateCell);

    const dayCell = document.createElement("td");      // Create cell for Day using the value from Google sheet
    dayCell.setAttribute("class", "body-cell special-column");
    const dayValue = data[1]; // Assuming the "Day" column is at index 1
    dayCell.innerHTML = `<span>${dayValue}</span>`;
    trElement.appendChild(dayCell);

    if (selectedColumnIndex !== -1) {      // Create cells based on selected column
      const tdElement = document.createElement("td");
      tdElement.setAttribute("class", "body-cell");
      tdElement.innerHTML = `<span>${data[selectedColumnIndex]}</span>`;
      trElement.appendChild(tdElement);
    } else {
      data.slice(2).forEach((item) => {        // Create cells for the rest of the data
        const tdElement = document.createElement("td");
        tdElement.setAttribute("class", "body-cell");
        tdElement.innerHTML = `<span>${item}</span>`;
        trElement.appendChild(tdElement);
      });
    }
    return trElement;
  }

 
// Update the table based on the selected filters
function updateTable() {
  console.log("Selected value:", filterDropdown.value);  // Log the selected value for debugging

  tbodyElement.innerHTML = '';

  if (filterDropdown.value === "default") {
    console.log("Showing original table");  // Add this log for debugging
    selectedColumnIndex = -1;
    searchInput.value = "";
    filterDropdown.value = "default";  // Set the value explicitly to "default"
    theadElement.innerHTML = '';
    theadElement.appendChild(createTableHeader(tableData[0]));
  
    // Clear tbodyElement before appending rows
    tbodyElement.innerHTML = '';
    
    for (let i = 1; i < tableData.length; i++) {
      const trElementForBody = createTrForTableBody(tableData[i]);
      const rowDate = moment(tableData[i][0]).toDate();
  
      if (rowDate >= currentBlockStartDate && rowDate <= currentBlockEndDate) {
        tbodyElement.appendChild(trElementForBody);
      }
  
      if (isToday(rowDate)) {
        trElementForBody.classList.add('body-row--today');
      }
    }
    selectedColumnIndex = -1;
  
  } else {
    // If a team is selected, display the filtered table
    const headerData = ["DATE", "DAY"];
    if (selectedColumnIndex !== -1) {
      headerData.push(tableData[0][selectedColumnIndex]);
    } else {
      headerData.push("DATE", "DAY");
    }

    theadElement.innerHTML = '';
    theadElement.appendChild(createTableHeader(headerData));

    for (let i = 1; i < tableData.length; i++) {
      const trElementForBody = createTrForTableBody(tableData[i]);
      const rowDate = moment(tableData[i][0]).toDate();

      if (rowDate >= currentBlockStartDate && rowDate <= currentBlockEndDate) {
        tbodyElement.appendChild(trElementForBody);
      }

      if (isToday(rowDate)) {
        trElementForBody.classList.add('body-row--today');
      }
    }
  }

  tableElement.innerHTML = '';
  tableElement.appendChild(theadElement);
  tableElement.appendChild(tbodyElement);
  highlightCells();
}


  // Update the filter dropdown options
  function updateFilterDropdown(data) {
    filterDropdown.innerHTML = '';
    const defaultOption = document.createElement("option");     // Create a default "Select a Team" option
    defaultOption.value = "default";
    defaultOption.textContent = "Select a Team";
    filterDropdown.appendChild(defaultOption);
    data.slice(2).forEach((item, index) => {      // Add options for each column
      const optionElement = document.createElement("option");
      optionElement.value = (index + 2).toString();
      optionElement.textContent = item;
      filterDropdown.appendChild(optionElement);
    });
  }

  // Function to move to different blocks
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
  //*****************************************************************************************************************************************************************************************


  // DESGIN FEATURES: HIGHLIGHTING AND HOVER ************************************************************************************************************************************************

  // HIGHLIGHTING WORD BASED ON SEARCH INPUT
  function removeAllHighlights() {
    const cells = document.querySelectorAll('.body-cell');
    cells.forEach(cell => {
      cell.classList.remove('highlight');
    });
  }
  function highlightCells() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) {
      removeAllHighlights();        // If the search term is empty, remove all highlights
      return;
    }
    const cells = document.querySelectorAll('.body-cell');
    cells.forEach(cell => {
      const text = cell.textContent.toLowerCase();
      const words = text.split(' ');
      const startsWithSearchTerm = words.some(word => word.startsWith(searchTerm));        // Check if any word in the cell starts with the search term
      if (startsWithSearchTerm) {
        cell.classList.add('highlight');
      } else {
        cell.classList.remove('highlight');
      }
    });
  }

  // HOVER FEATURE BASED ON HOVERING OVER THE CELL, COLUMN OR ROW
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
  //*******************************************************************************************************************************************************************************


  //EVENT LISTENERS FOR BUTTONS AND INPUT FIELDS //********************************************************************************************************************************
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
    searchInput.value = "";
    filterDropdown.value = "";
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTitle();
    updateTable();
  });
  tableElement.addEventListener("mouseover", handleHover);
  tableElement.addEventListener("mouseout", handleHover);
  //*******************************************************************************************************************************************************************************





  // INITIALIZE TABLE ON PAGE LOAD ************************************************************************************************************************************************
  await initializeTable();
  // INITIALIZE TABLE ON PAGE LOAD ************************************************************************************************************************************************



});
