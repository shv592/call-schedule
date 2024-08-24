// popup.js

// Function to open the popup with data from the first three columns for today's date
function openPopup() {
    const dataUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRhBfkLZwlSmj2Rh0w8AFLlirlzCm_26qZnf4tIcE5e8qgqQz7NtFBZyhBRX61TB0-jCignTKJNdOty/pub?gid=0&single=true&output=tsv';
    
    async function fetchData() {
      try {
        const response = await fetch(dataUrl);
        const csvData = await response.text();
        return csvData.split('\n').map(row => row.split('\t'));
      } catch (error) {
        console.error('Error fetching data:', error);
        return [];
      }
    }
    
    async function showPopup() {
      const tableData = await fetchData();
      const todayDate = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
      
      const filteredData = tableData.filter(row => row[0] === todayDate).map(row => row.slice(0, 3));
      
      const popupWindow = window.open("", "Popup", "width=600,height=400");
      popupWindow.document.write("<html><head><title>Today's JR</title></head><body>");
      popupWindow.document.write("<table border='1'>");
      
      // Create table header
      popupWindow.document.write("<tr><th>Date</th><th>Event 1</th><th>Event 2</th></tr>");
      
      // Create table rows
      filteredData.forEach(row => {
        popupWindow.document.write(`<tr><td>${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td></tr>`);
      });
      
      popupWindow.document.write("</table>");
      popupWindow.document.write("</body></html>");
      popupWindow.document.close();
    }
    
    showPopup();
  }
  
  // Add event listener for the button
  document.addEventListener('DOMContentLoaded', function() {
    const showThreeColumnsButton = document.getElementById('showThreeColumnsButton');
    if (showThreeColumnsButton) {
      showThreeColumnsButton.addEventListener('click', openPopup);
    }
  });
  