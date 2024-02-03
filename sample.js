document.addEventListener("DOMContentLoaded", function () {
    const ownTeamName = 'Ward Night';
    let ownTeamIndex = 0;
    const tableElement = document.getElementById("schedule");
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
      renderTable();
    }
  
    function isToday(date) {
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    }
  
    function renderTable() {
      let html = '';
  
      const startDate = new Date(baseDate);
      const endDate = new Date(baseDate);
      endDate.setDate(endDate.getDate() + 27);
  
      for (let i = 0; i < tableData.length; i++) {
        const rowDate = new Date(tableData[i][0]);
        const isTodayRow = isToday(rowDate);
  
        html += '<tr class="body-row">';
        for (let j = 0; j < tableData[i].length; j++) {
          const cellValue = tableData[i][j];
          const isOwnTeam = j === ownTeamIndex;
          const highlight = searchTerm && cellValue.toLowerCase().includes(searchTerm);
          const biggerText = highlight && !isTodayRow;
  
          const cellClass = 'body-cell' +
            (isOwnTeam ? ' body-cell--own-team' : '') +
            (highlight ? ' highlight' : '') +
            (biggerText ? ' bigger-text' : '');
  
          html += `<td class="${cellClass}"><span>${cellValue}</span></td>`;
        }
        html += '</tr>';
      }
  
      tableElement.innerHTML = html;
    }
  
    const nextWeeksButton = document.getElementById("nextWeeksButton");
    nextWeeksButton.addEventListener("click", () => {
      baseDate.setDate(baseDate.getDate() + 28);
      renderTable();
    });
  
    const previousWeeksButton = document.getElementById("previousWeeksButton");
    previousWeeksButton.addEventListener("click", () => {
      baseDate.setDate(baseDate.getDate() - 28);
      renderTable();
    });
  
    const searchInput = document.getElementById("searchInput");
    searchInput.addEventListener("input", function () {
      searchTerm = this.value.trim().toLowerCase();
      renderTable();
    });
  
    initializeTable();
  });
  