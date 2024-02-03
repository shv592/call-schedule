document.addEventListener("DOMContentLoaded", function () {
  const ownTeamName = 'Ward Night';
  let ownTeamIndex = 0;
  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const searchInput = document.getElementById("searchInput");
  const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=tsv';

  let baseDate = new Date('2024-01-14');
  let tableData = [];
  let searchTerm = '';

  async function getTableData() {
    const tableDataResponse = await fetch(dataUrl, { cache: "reload" });
    const csvData = await tableDataResponse.text();
    return csvData.split('\n').map(row => row.split('\t'));
  }

  async function initializeTable() {
    tableData = await getTableData();
    theadElement.appendChild(createTableHeader(tableData[0]));
    tableElement.appendChild(theadElement);
    updateTable();
  }

  function isToday(date) {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  function createTableHeader(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "head-row");
    data.forEach((item, index) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = `<span>${item}</span>`;
      if (item === ownTeamName) {
        thElement.setAttribute("class", "head-cell head-cell--own-team");
        ownTeamIndex = index;
      }
      trElement.appendChild(thElement);
    });

    // Add an empty column for the search input
    const thSearchElement = document.createElement("th");
    thSearchElement.setAttribute("class", "head-cell");
    trElement.appendChild(thSearchElement);

    return trElement;
  }

  function createTrForTableBody(data) {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "body-row");

    const date = new Date(data[0]);
    if (isToday(date)) {
      trElement.setAttribute("class", "body-row body-row--today");
    }

    data.forEach((item, index) => {
      const tdElement = document.createElement("td");
      tdElement.setAttribute("class", "body-cell");
      if (index === ownTeamIndex) {
        tdElement.setAttribute("class", "body-cell body-cell--own-team");
      }
      tdElement.innerHTML = `<span>${item}</span>`;
      trElement.appendChild(tdElement);
    });

    // Add an empty column for the search input
    const tdSearchElement = document.createElement("td");
    tdSearchElement.setAttribute("class", "body-cell");
    trElement.appendChild(tdSearchElement);

    return trElement;
  }

  function updateTable() {
    tbodyElement.innerHTML = '';

    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + 27);

    for (let i = 1; i < tableData.length; i++) {
      const rowDate = new Date(tableData[i][0]);
      if (rowDate >= startDate && rowDate <= endDate) {
        const trElementForBody = createTrForTableBody(tableData[i]);
        tbodyElement.appendChild(trElementForBody);
      }
    }

    // Filter rows based on the search term
    const filteredRows = tableData.slice(1).filter(row => {
      return row.some(cell => cell.toLowerCase().includes(searchTerm));
    });

    for (let i = 0; i < filteredRows.length; i++) {
      const trElementForBody = createTrForTableBody(filteredRows[i]);
      tbodyElement.appendChild(trElementForBody);
    }

    // Clear existing content and append new content
    tableElement.innerHTML = '';
    tableElement.appendChild(theadElement);
    tableElement.appendChild(tbodyElement);

    // Add search input to the last column
    const trSearchElement = document.createElement("tr");
    const tdSearchElement = document.createElement("td");
    tdSearchElement.colSpan = tableData[0].length + 1;
    tdSearchElement.appendChild(searchInput);
    trSearchElement.appendChild(tdSearchElement);
    tbodyElement.appendChild(trSearchElement);
  }

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
    searchTerm = this.value.trim().toLowerCase();
    updateTable();
  });

  initializeTable();
});
