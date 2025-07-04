// PRINT BUTTON **************************************************************************************************************************

export const print_button = {

    today: [],
    table: document.createElement("table"),
    rota_table: document.createElement("table"),
    counts: {
        "BLUE JR": { "docs": [] },
        "RED JR": { "docs": [] },
        "CTU ED JR": { "docs": [] },
    },
    rotas_to_count: ["BLUE JR", "RED JR", "CTU ED JR"],

    descriptions: {

        "DATE": "Date",
        "DAY": "Day",
        "BLUE JR": "CTU Blue Jr (Weekend)",
        "RED JR": "CTU Red Jr (Weekend)",
        "CTU ED JR": "CTU ED Jr (Weekend)",
        "WARD NIGHT": "Ward Night Jr (Mon-Thurs)",
        "ED NIGHT": "ED Night Jr (Mon-Thurs)",
        "LATE STAY": "Late Stay Jr (Mon-Thurs)",
        "BLUE SR": "CTU Blue Sr (8am-5pm)",
        "RED SR": "CTU Red Sr (8am-5pm)",
        "CTU ED SR": "CTU ED Sr (8am-5pm)",
        "DAY FLOAT": "CTU Day Float (9am-9pm) (New Consults)",
        "NIGHT FLOAT": "CTU Night Float (9pm-9am) (New Consults)",
        "W/E 24H SS": "RUH Subspecialty",
        "W/D PM SS": "RUH Weekday PM Subspecialty",
        "GIM SPH DAY": "SPH GIM (8am-4pm)",
        "GIM SPH PM": "SPH GIM (4pm-12am)",
        "NEPHRO": "SPH Nephro",
        "CCU JR": "CCU Jr",
        "CCU SR": "CCU Sr",
        "MED STUDENT": "Med Student",
        "CCU JR ATTENDING": "CCU Jr Attending",
        "FELLOW GIM (RUH)": "GIM Fellow (RUH)",
        "FELLOW GIM (SPH)": "GIM Fellow (SPH)",
        "CTU JR ATTENDING": "CTU Jr Attenting",

    },

    html: `
<div id="print_header">
<img id="logo" src="https://i.imgur.com/m0VW7QB.png" alt="Logo">

<p>Saskatoon Internal Medicine Call Schedule</p>
</div>
`,

    css: `
<style>

p{
font-family: "Calibri", sans-serif;
}

#print_header {
text-align:center;
font-size:18px;
}

#logo {
width: 200px;
margin-bottom: -10px;
}

.print_table {
font-family: "Calibri", sans-serif;
text-align:left;
font-size: 12px;
width: 65%;
margin: auto;
margin-bottom: 30px;


}

.rota_table {
font-family: "Calibri", sans-serif;
margin: auto;
width: 65%;
text-align:left;
padding-left: 10px;
table-layout: fixed; 
font-size: 12px;


}

table {
border-collapse: collapse;
margin-bottom: 30px;
}

table th {
border: 1px solid black;
background-color: #eee;
text-align:left;
padding-left: 10px;
width: 65%;
color: black;


}

table td {
border: 1px solid black;
padding-left: 10px;

}

</style>
`,

    init: function (tbodyElement, theadElement) {

        // GATHER DATA
        for (var y = 0; y < tbodyElement.rows.length; y++) {
            if (tbodyElement.rows[y].classList.contains("body-row--today")) {
                for (var x = 0; x < tbodyElement.rows[0].cells.length; x++) {
                    let item = {}
                    item.header = theadElement.rows[0].cells[x].textContent.replace(/\s+/g, ' ').trim();;
                    item.description = this.descriptions[item.header];
                    item.doc = tbodyElement.rows[y].cells[x].textContent.replace(/\s+/g, ' ').trim();;
                    this.today.push(item);
                }
            }
        }

        // COUNT DOCS
        for (var x = 0; x < tbodyElement.rows[0].cells.length; x++) {
            var rota = theadElement.rows[0].cells[x].textContent.replace(/\s+/g, ' ').trim();
            if (this.rotas_to_count.indexOf(rota) >= 0) {
                for (var y = 0; y < tbodyElement.rows.length; y++) {
                    var doc = tbodyElement.rows[y].cells[x].textContent.replace(/\s+/g, ' ').trim();
                    this.count_jr(rota, doc);
                }
            }
        }

        //  MAKE HIDDEN DIV
        // var hidden_div = document.createElement("DIV");
        // hidden_div.id = "hidden_div";
        // hidden_div.classList.add("hidden_div");
        // hidden_div.classList.add("hidden");

        //  MAKE HEADER
        // var div = document.createElement("DIV");
        // div.id = "page_header";
        // var img = new Image();
        // img.src = "https://drive.google.com/uc?id=1hHp0Oyt3iPyH3pOwoexMbogKWn16uGI4";
        // div.appendChild(img);
        // var p = document.createElement("P");
        // p.textContent = "Saskatoon Internal Medicine Schedule";
        // div.appendChild(p)
        // hidden_div.appendChild(div)

        //  MAKE SCHEDULE TABLE
        this.table.classList.add("print_table");
        // MAKE HEADER
        var row = document.createElement("TR");
        var header = document.createElement("TD");
        header.colSpan = "2";
        header.textContent = this.today[1].doc + ", " + this.today[0].doc;
        header.classList.add("header");
        row.appendChild(header);
        this.table.appendChild(row);
        // MAKE BODY
        for (var i = 2; i < this.today.length; i++) {
            var row = document.createElement("TR");
            var th = document.createElement("TH");
            th.textContent = this.today[i].description;
            row.appendChild(th);
            var td = document.createElement("TD");
            td.textContent = this.today[i].doc;
            row.appendChild(td);
            this.table.appendChild(row);
        }
        // hidden_div.appendChild(this.table);

        // MAKE ROTA TABLE
        this.rota_table.classList.add("rota_table");
        // MAKE HEADER
        var row = document.createElement("TR");
        var header = document.createElement("TD");
        header.colSpan = "3";
        header.textContent = "CTU Juniors for " + document.getElementById("table-title").textContent;
        header.classList.add("header");
        row.appendChild(header);
        this.rota_table.appendChild(row);
        // MAKE ROTAS
        var row = document.createElement("TR");
        var th = document.createElement("TH");
        th.textContent = "Blue Juniors";
        row.appendChild(th);
        var th = document.createElement("TH");
        th.textContent = "Red Juniors";
        row.appendChild(th);
        var th = document.createElement("TH");
        th.textContent = "ED Juniors";
        row.appendChild(th);
        this.rota_table.appendChild(row);
        // ADD DOCS
        let biggest_team = 0;
        for (var rota of this.rotas_to_count) {
            if (this.counts[rota]["docs"].length > biggest_team) {
                biggest_team = this.counts[rota]["docs"].length;
            }
        }
        for (var i = 0; i < biggest_team; i++) {
            var row = document.createElement("TR");
            for (var rota of this.rotas_to_count) {
                var td = document.createElement("TD");
                td.classList.add("rota_doc_td");
                td.textContent = this.counts[rota]["docs"][i] || "";
                row.appendChild(td);
            }
            this.rota_table.appendChild(row);
        }
        // hidden_div.appendChild(this.rota_table);
        // document.body.appendChild(hidden_div);
        this.render();
    },

    render: function () {
        let button = document.createElement("button");
        button.innerHTML = "Print 24hr Call";
        button.classList.add("print_button");
        button.addEventListener("click", () => {
            let print_div = window.open("");
            print_div.document.write(this.html + this.table.outerHTML + this.rota_table.outerHTML + this.css);
            print_div.print();
            print_div.onafterprint = () => print_div.close();
            // document.getElementById("hidden_div").classList.remove("hidden");
            // window.print();
            // document.getElementById("hidden_div").classList.add("hidden");
        });
        navButtons.appendChild(button);
    },

    count_jr: function (rota, doc) {
        if (doc === "") return
        if (doc.charAt(doc.length - 1) === "*") return
        if (doc in this.counts[rota]) {
            this.counts[rota][doc]++
        }
        else {
            this.counts[rota][doc] = 1
            this.counts[rota]["docs"].push(doc);
        }
    }
}