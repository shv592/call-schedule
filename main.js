// SAMPLE_DATA defined in sampleData.js
(function () {
  const ownTeamName = 'Team 4';
  let ownTeamIndex = 0;
  const tableElement = document.getElementById("schedule");
  const theadElement = document.createElement("thead");
  const tbodyElement = document.createElement("tbody");

  // thead
  const createTableHeader = (data) => {
    const trElement = document.createElement("tr");
    trElement.setAttribute("class", "head-row");
    data.forEach((item, index) => {
      const thElement = document.createElement("th");
      thElement.setAttribute("class", "head-cell");
      thElement.innerHTML = item.value;
      if (item.value === ownTeamName) {
        thElement.setAttribute("class", "head-cell head-cell--own-team");
        ownTeamIndex = index;
      }
      trElement.appendChild(thElement);
    });
    return trElement;
  };
  const trElementForHead = createTableHeader(SAMPLE_DATA[0]);
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
      tdElement.innerHTML = item.value;
      trElement.appendChild(tdElement);
    });
    return trElement;
  };

  for (let i = 1; i < SAMPLE_DATA.length; i++) {
    const trElementForBody = createTrForTableBody(SAMPLE_DATA[i]);
    tbodyElement.appendChild(trElementForBody);
  }

  tableElement.appendChild(theadElement);
  tableElement.appendChild(tbodyElement);

})();
