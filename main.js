// SAMPLE_DATA defined in sampleData.js
(async function () {
  const ownTeamName = 'Ward Night';
  let ownTeamIndex = 0;
  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");
  const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=csv';
  
  let tableData = SAMPLE_DATA;
  
  async function getTableData() {
    const tableDataResponse = await fetch(dataUrl, {cache: "no-store"});
    const csvData = await tableDataResponse.text();
    const rawRows = csvData.split('\n');
    const rows = rawRows.map(row => row.split(','));

    return rows;
  }

  tableData = await getTableData();

  // thead
  const createTableHeader = (data) => {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "head-row");
    data.forEach((item, index) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = '<span>' + item + '</span>';
      if (item === ownTeamName) {
        thElement.setAttribute("class", "head-cell head-cell--own-team");
        ownTeamIndex = index;
      }
      trElement.appendChild(thElement);
    });
    return trElement;
  };
  const trElementForHead = createTableHeader(tableData[0]);
  theadElement.appendChild(trElementForHead);

  // tbody
  const createTrForTableBody = (data) => {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "body-row");
    data.forEach((item, index) => {
      const tdElement = document.createElement("td");
      tdElement.setAttribute("class", "body-cell");
      if (index === ownTeamIndex) {
        tdElement.setAttribute("class", "body-cell body-cell--own-team");
      }
      tdElement.innerHTML = '<span>' + item + '</span>';
      trElement.appendChild(tdElement);
    });
    return trElement;
  };

  for (let i = 1; i < tableData.length; i++) {
    const trElementForBody = createTrForTableBody(tableData[i]);
    tbodyElement.appendChild(trElementForBody);
  }

  tableElement.appendChild(theadElement);
  tableElement.appendChild(tbodyElement);

})();
