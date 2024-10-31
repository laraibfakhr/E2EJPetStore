/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [1.0, 2000, 8000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 8000, "Open URL_3"], "isController": true}, {"data": [1.0, 2000, 8000, "Open URL_2"], "isController": true}, {"data": [1.0, 2000, 8000, "EnterURL_1"], "isController": true}, {"data": [1.0, 2000, 8000, "Search-01"], "isController": false}, {"data": [1.0, 2000, 8000, "Select item-07"], "isController": false}, {"data": [1.0, 2000, 8000, "Open URL-1"], "isController": false}, {"data": [1.0, 2000, 8000, "Open URL-2"], "isController": false}, {"data": [1.0, 2000, 8000, "Select Product-06"], "isController": false}, {"data": [1.0, 2000, 8000, "Open URL-03"], "isController": false}, {"data": [1.0, 2000, 8000, "Open URL-02"], "isController": false}, {"data": [1.0, 2000, 8000, "Select Category-04"], "isController": false}, {"data": [1.0, 2000, 8000, "Select Item_2"], "isController": true}, {"data": [1.0, 2000, 8000, "Select Category_2"], "isController": true}, {"data": [1.0, 2000, 8000, "Select Product_2"], "isController": true}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 75, 0, 0.0, 323.1066666666665, 122, 993, 148.0, 586.8000000000001, 800.2000000000007, 993.0, 7.559721802237678, 35.629027914272754, 4.786051998286464], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Open URL_3", 5, 0, 0.0, 786.8, 630, 1118, 717.0, 1118.0, 1118.0, 1118.0, 0.580046403712297, 6.02534530887471, 0.7290231656032483], "isController": true}, {"data": ["Open URL_2", 10, 0, 0.0, 721.6999999999999, 641, 1123, 684.0, 1083.5, 1123.0, 1123.0, 1.0312467773538208, 10.712277315149016, 1.247768317520883], "isController": true}, {"data": ["EnterURL_1", 15, 0, 0.0, 595.0, 507, 993, 558.0, 848.4000000000001, 993.0, 993.0, 2.886836027713626, 15.967811778290994, 1.671771254330254], "isController": true}, {"data": ["Search-01", 15, 0, 0.0, 595.0, 507, 993, 558.0, 848.4000000000001, 993.0, 993.0, 2.937720329024677, 16.249265569917743, 1.7012384327262045], "isController": false}, {"data": ["Select item-07", 10, 0, 0.0, 138.4, 125, 149, 140.0, 148.9, 149.0, 149.0, 1.1749500646222537, 4.370837188638233, 0.805024380213841], "isController": false}, {"data": ["Open URL-1", 5, 0, 0.0, 643.2, 503, 993, 568.0, 993.0, 993.0, 993.0, 0.5949547834364588, 3.290843645882913, 0.35848349744169444], "isController": false}, {"data": ["Open URL-2", 5, 0, 0.0, 143.6, 125, 171, 146.0, 171.0, 171.0, 171.0, 0.6634819532908705, 3.222163821987792, 0.43411416865711255], "isController": false}, {"data": ["Select Product-06", 10, 0, 0.0, 141.10000000000002, 127, 155, 144.0, 154.3, 155.0, 155.0, 1.1757789535567313, 4.5936902924750145, 0.817648625808348], "isController": false}, {"data": ["Open URL-03", 10, 0, 0.0, 138.4, 125, 148, 141.0, 147.9, 148.0, 148.0, 1.177440244907571, 5.718174158130225, 0.742799217002237], "isController": false}, {"data": ["Open URL-02", 10, 0, 0.0, 583.3000000000001, 501, 993, 547.5, 951.8000000000002, 993.0, 993.0, 1.0698619878035733, 5.917674120038515, 0.6195587487964053], "isController": false}, {"data": ["Select Category-04", 10, 0, 0.0, 136.2, 122, 157, 135.5, 156.0, 157.0, 157.0, 1.1761938367442955, 4.519157257115972, 0.777046025935074], "isController": false}, {"data": ["Select Item_2", 10, 0, 0.0, 138.4, 125, 149, 140.0, 148.9, 149.0, 149.0, 1.1748120300751879, 4.370323697427161, 0.8049298049812029], "isController": true}, {"data": ["Select Category_2", 10, 0, 0.0, 136.2, 122, 157, 135.5, 156.0, 157.0, 157.0, 1.1761938367442955, 4.519157257115972, 0.777046025935074], "isController": true}, {"data": ["Select Product_2", 10, 0, 0.0, 141.10000000000002, 127, 155, 144.0, 154.3, 155.0, 155.0, 1.1759172154280337, 4.594230472424742, 0.817744774517874], "isController": true}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 75, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
