document.addEventListener("DOMContentLoaded", async function () {
  // Constants and variables
  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const searchInput = document.getElementById("searchInput");
  const filterDropdown = document.getElementById("filterColumn");
  const resetButton = document.getElementById("resetButton");
  const specificYear = 2023; // Change this to the desired year
  // Add this at the top of your script
  const moment = window.moment;

  const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=tsv';

  let tableData = [];
  let selectedColumnIndex = -1;
  let currentDate;
  let blockNumber;
  let schoolYearStart = getFirstSundayInJuly(specificYear);
  let currentBlockStartDate;
  let currentBlockEndDate;

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


  // Function to update current block start and end dates based on current date
// Import moment.js (if not already imported)
// const moment = window.moment;

function updateDates() {
  // Calculate the start date of the current block
  const currentBlockStartDateMoment = moment(schoolYearStart).add((blockNumber - 1) * 28, 'days');
  currentBlockStartDate = currentBlockStartDateMoment.toDate();

  // Calculate the end date of the current block
  const currentBlockEndDateMoment = currentBlockStartDateMoment.add(28, 'days');
  currentBlockEndDate = currentBlockEndDateMoment.toDate();

  // Update the table and title
  updateTable();
  updateTitle();
}


  // Event listeners for buttons and input fields
  const nextWeeksButton = document.getElementById("nextWeeksButton");
  nextWeeksButton.addEventListener("click", () => {
    moveToNextBlock();
    updateTable();
    updateTitle();
  });

  const previousWeeksButton = document.getElementById("previousWeeksButton");
  previousWeeksButton.addEventListener("click", () => {
    moveToPreviousBlock();
    updateTable();
    updateTitle();
  });


// Import moment.js (if not already imported)
// const moment = window.moment;

function getFirstSundayInJuly(year) {
  const julyMoment = moment(`${year}-07-01`, 'YYYY-MM-DD');
  const firstSundayMoment = julyMoment.day('Sunday').startOf('day');
  return firstSundayMoment.toDate();
}


  // Check if a given date is today
// Check if a given date is today
function isToday(date) {
  return moment(date).isSame(moment(), 'day');
}

  

  // Calculate the current block's start and end dates based on the current date
  async function initializeTable() {
    tableData = await getTableData();
    schoolYearStart = getFirstSundayInJuly(specificYear);
    currentDate = moment(); // Use moment for the current date
    
    const daysElapsed = Math.floor(currentDate.diff(schoolYearStart, 'days'));
    blockNumber = Math.floor(daysElapsed / 28) + 1;
    
    currentBlockStartDate = moment(schoolYearStart).add((blockNumber - 1) * 28, 'days');
    currentBlockEndDate = moment(currentBlockStartDate).add(28, 'days');
    
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);
    updateFilterDropdown(tableData[0]);
    updateTitle();
    updateTable();
    
  }

  // Create the table header based on the data
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

  // Update the title based on the current block
  function updateTitle() {
    const titleElement = document.getElementById("table-title");
    const titleText = `Block ${blockNumber}: ${currentBlockStartDate.toDateString()} - ${currentBlockEndDate.toDateString()}`;
    titleElement.textContent = titleText;
  }

///********************************************* */
function createTrForTableBody(data) {
  const trElement = document.createElement("tr");
  trElement.setAttribute("class", "body-row");


// Check if the date is today
const date = moment(data[0]).toDate();
if (isToday(date)) {
  trElement.classList.add("body-row--today");
}

// Modified code for DATE column
const dateParts = data[0].split('-');
const rowDate = moment.utc(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`, 'YYYY-MM-DD').toDate();

//DATE CELL 
const dateCell = document.createElement("td");
dateCell.setAttribute("class", `body-cell${' special-column'}`);
const formattedDate = moment(rowDate).format('MMM D'); // Format the date using moment.js
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



  // Update the table based on the selected filters
  function updateTable() {
    tbodyElement.innerHTML = '';
  
    // Check if "Select a Team" is chosen from the dropdown
    if (filterDropdown.value === "") {
      // Display the original table
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
  
        // Add a class if the row corresponds to today's date
        if (isToday(rowDate)) {
          trElementForBody.classList.add('body-row--today');
        }
      }
    } else {
      // Create header data including "Date" and "Day"
      const headerData = ["DATE", "DAY"];
  
      // Check if a column is selected
     // Check if a column is selected
if (selectedColumnIndex !== -1) {
  // Only display the selected column in the header
  headerData.push(tableData[0][selectedColumnIndex]);
} else {
  // Display only DATE and DAY columns in the header
  headerData.push("DATE", "DAY");
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

  // Function to move to the next block
  function moveToNextBlock() {
    blockNumber++;
    updateDates();
  }

  // Function to move to the previous block
  function moveToPreviousBlock() {
    if (blockNumber > 1) {
      blockNumber--;
      updateDates();
    }
  }



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
    currentDate = new Date();
    updateTable();
    updateTitle();
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
