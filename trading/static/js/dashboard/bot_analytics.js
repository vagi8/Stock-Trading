var users = [];
var count = [];
var dates = [];
var noofusersdates = [];
var noofusers = [];
var targets = [];
var targetcount = [];
var pieusers = [];
var msteams = [];
var emulator = [];
var facebook = [];
var emulatoractivities=[];
var list = [];
var listofdates = [];
var msteamsactivities = [];
var telegramactivities = [];
var facebookactivities = [];
var directlineactivities = [];
var otheractivities = [];

function getData() {
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/hits',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var average =[];
            var dialog = [];
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                if(data.tables[0].rows[i][0].toString().length<18){
                    dialog.push(data.tables[0].rows[i][0].toString().replace("Dialog View", "").replace(':', '').replace(" ",""));
                    average.push({ "value": data.tables[0].rows[i][1], "name": data.tables[0].rows[i][0].toString().replace("Dialog View", "").replace(":", "").replace(" ","") });
                }
            }
            var basicpieChart = echarts.init(document.getElementById('hits'));
            var option = {
                // Add title
                title: {
                    x: 'center'
                },
                // Add tooltip
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} hits ({d}%)"//{a} <br/>
                },
                // Add legend
                legend: {
                    orient: 'horizontal',
                    x: 'left',
                    data: dialog
                },
                // Add custom colors
                color: ['#17b3a3', '#faa700', '#009933', '#ff4c52', '#3e8ef7','#6633FF'],
                // Display toolbox
                toolbox: {
                    show: true,
                    orient: 'vertical',
                    feature: {
                        mark: {
                            show: true,
                            title: {
                                mark: 'Markline switch',
                                markUndo: 'Undo markline',
                                markClear: 'Clear markline'
                            }
                        },
                        magicType: {
                            show: true,
                            title: {
                                pie: 'Switch to pies',
                                funnel: 'Switch to funnel',
                            },
                            type: ['pie', 'funnel'],
                            option: {
                                funnel: {
                                    x: '25%',
                                    y: '20%',
                                    width: '50%',
                                    height: '70%',
                                    funnelAlign: 'left',
                                    max: 1548
                                }
                            }
                        },
                    }
                },
                calculable: true,
                series: [{
                    name: 'Count',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '57.5%'],
                    data: average
                }]
            };
            basicpieChart.setOption(option);               
        }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/baralc',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var pie = [];
            var name = [];
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                name.push(data.tables[0].rows[i][0]);
                pie.push(Math.round(data.tables[0].rows[i][1],2));
            }
            $("#highestduration").html(name[pie.indexOf(Math.max.apply(null, pie))] + " Dialog - " + pie[pie.indexOf(Math.max.apply(null, pie))] +" Second(s)");
            $("#baralc").sparkline(pie, {
                type: 'bar',
                height: '90',
                barWidth: 8,
                barSpacing: 4,
                barColor: '#ba69aa',
                tooltipFormat: '{{offset:offset}} : {{value}} Seconds',
                tooltipValueLookups: {
                    'offset': name
                },
            });
           
        }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/call3',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                item = {}
                item["value"] = data.tables[0].rows[i][1];
                item["color"] = "#F7464A";
                item["highlight"] = "#FF5A5E";
                item["label"] = data.tables[0].rows[i][0];
                msteams.push(item);
            }
            var start = false;
            var count1;
            for (j = 0; j < list.length; j++) {
                for (k = 0; k < listofdates.length; k++) {
                    if (list[j] == listofdates[k]) {
                        start = true;
                    }
                }
                count1++;
                if (count1 == 1 && start == false) {
                    listofdates.push(list[j]);
                }
                start = false;
                count1 = 0;
            }
        }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/call4',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var requestchannel="";
            var countrequest = 0;
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                if (data.tables[0].rows[i][0] == "") { data.tables[0].rows[i][0] = "NA" }
                if (i == 0) {
                    requestchannel = "<li class=\"flexbox mb - 5\"><div><span class=\"badge badge - dot badge - lg mr - 1\" style=\"background - color: #ff4c52\"></span><span>" + data.tables[0].rows[i][0].toUpperCase() + "</span></div><div>" + data.tables[0].rows[i][1] + "</div></li>";
                }
                else {
                    requestchannel += "<li class=\"flexbox mb - 5\"><div><span class=\"badge badge - dot badge - lg mr - 1\" style=\"background - color: #ff4c52\"></span><span>" + data.tables[0].rows[i][0].toUpperCase() + "</span></div><div>" + data.tables[0].rows[i][1] + "</div></li>";
                }
                countrequest += "'" + parseInt(data.tables[0].rows[i][1]) + "'" + ",";
            }
            if (requestchannel == "") { requestchannel="No Data found" }

            $("#requestchannel").html(requestchannel);
            $("#countrequest").html(countrequest);
        }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/call5',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                targets.push(data.tables[0].rows[i][0]);
                targetcount.push(data.tables[0].rows[i][1]);
            }
            var myChart = echarts.init(document.getElementById('dependencies'));

            // specify chart configuration item and data
            var option = {
                // Setup grid
                grid: {
                    left: '1%',
                    right: '2%',
                    bottom: '3%',
                    containLabel: true
                },
                // Add Tooltip
                tooltip: {
                    trigger: 'axis'
                },
                toolbox: {
                    show: true,
                    feature: {

                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                color: ["#F39C12", "#3e8ef7"],
                calculable: true,
                xAxis: [
                    {
                        type: 'category',
                        data: targets
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        type: 'bar',
                        data: targetcount,
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                    }
                ]
            };
            // use configuration item and data specified to show chart
            myChart.setOption(option);
        }
    });
    var dat3;
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/call6',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            dat3 = data;
            for (var i = 0; i < dat3.tables[0].rows.length; i++) {

                noofusersdates.push(new Date(dat3.tables[0].rows[i][0]).toLocaleDateString());
                noofusers.push(dat3.tables[0].rows[i][1]);
            }
            var res = 0;
            for (var i = 0; i < noofusers.length; i++) {
                res += noofusers[i];
            }
            $("#noofuserscount").html(res);
        }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/call7',
        type: 'GET',
        dataType: 'json',
        success: function (data1) {
            var dat1;
            dat1 = data1;
            var res;
            for (var i = 0; i < dat1.tables[0].rows.length; i++) {
                if (i < 4) {
                    res += "<tr><td>" + (i + 1) + "</td><td>" + dat1.tables[0].rows[i][0] + "</td><td>" + dat1.tables[0].rows[i][1] + "</td></tr>"
                }
            }
            $("#person").html(res);
        }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/botanalytics/call8',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dat;
            dat = data;
              for (var i = 0; i < dat.tables[0].rows.length; i++) {
               
                if (!dates.includes(new Date(dat.tables[0].rows[i][1]).toLocaleDateString())) {
                    dates.push(new Date(dat.tables[0].rows[i][1]).toLocaleDateString());
                }
            }
            for (var i = 0; i < dates.length; i++)
            {
                for (var j = 0; j < dat.tables[0].rows.length; j++)
                {
                    if (dates[i] == new Date(dat.tables[0].rows[j][1]).toLocaleDateString()) {
                        if (dat.tables[0].rows[j][0] == "msteams") { msteamsactivities.push(dat.tables[0].rows[j][2]) }
                        if (dat.tables[0].rows[j][0] == "telegram") { telegramactivities.push(dat.tables[0].rows[j][2]) }
                        if (dat.tables[0].rows[j][0] == "emulator") { emulatoractivities.push(dat.tables[0].rows[j][2]) }
                        if (dat.tables[0].rows[j][0] == "facebook") { facebookactivities.push(dat.tables[0].rows[j][2]) }
                        if (dat.tables[0].rows[j][0] == "directline") {
                            directlineactivities.push(dat.tables[0].rows[j][2])
                        }
                    }
                }
                try { if (msteamsactivities[i].toString() == ""); } catch{ msteamsactivities.push(0); }
                try { if (telegramactivities[i].toString() == ""); } catch{ telegramactivities.push(0); }
                try { if (emulatoractivities[i].toString() == ""); } catch{ emulatoractivities.push(0); }
                try { if (facebookactivities[i].toString() == ""); } catch{ facebookactivities.push(0); }
                try { if (directlineactivities[i].toString() == ""); } catch{ directlineactivities.push(0); }
                    
            }
            var myChart = echarts.init(document.getElementById('basic-bar'));

            // specify chart configuration item and data
            var option = {
                // Setup grid
                grid: {
                    left: '1%',
                    right: '2%',
                    bottom: '3%',
                    containLabel: true
                },

 

                // Add Tooltip
                tooltip: {
                    trigger: 'axis'
                },

 

                legend: {
                    data: ['msteams', 'Facebook', 'Telegram', 'WhatsApp','Emulator']
                },
                toolbox: {
                    show: true,
                    feature: {

 

                        magicType: { show: true, type: ['line', 'bar'] },
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                color: ["#6666CC", "#2E4053", "#3498DB", "#28B463","#F39C12"],
                calculable: true,
                xAxis: [
                    {
                        type: 'category',
                        data: dates// ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: 'msteams',
                        type: 'bar',
                        data: msteamsactivities,//[7.2, 5.3, 6.1, 32.1, 23.1, 89.2, 158.4, 178.1, 36.4, 22.7, 7.1, 9.4],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                    },
                    {
                        name: 'Facebook',
                        type: 'bar',
                        data: facebookactivities,//[19.4, 7.9, 8.9, 27.9, 24.8, 88.1, 167.8, 197.5, 47.1, 16.7, 7.1, 1.5],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: 'Average' }
                            ]
                        }
                    },
                    {
                        name: 'Telegram',
                        type: 'bar',
                        data: telegramactivities,//[19.4, 7.9, 8.9, 27.9, 24.8, 88.1, 167.8, 197.5, 47.1, 16.7, 7.1, 1.5],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: 'Average' }
                            ]
                        }
                    },
                    {
                        name: 'WhatsApp',
                        type: 'bar',
                        data: directlineactivities,//[19.4, 7.9, 8.9, 27.9, 24.8, 88.1, 167.8, 197.5, 47.1, 16.7, 7.1, 1.5],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                        markLine: {
                            data: [
                                { type: 'average', name: 'Average' }
                            ]
                        }
                    },
                    {
                        name: 'Emulator',
                        type: 'bar',
                        data: emulatoractivities,//[19.4, 7.9, 8.9, 27.9, 24.8, 88.1, 167.8, 197.5, 47.1, 16.7, 7.1, 1.5],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                       
                    }
                ]
            };
            // use configuration item and data specified to show chart
            myChart.setOption(option);
        }
    });
};
var Widgetschart = function() {
    // Simple bar charts
    var _barChartWidget = function(element, barQty, height, animate, easing, duration, delay, color, tooltip) {
        if (typeof d3 == 'undefined') {
            console.warn('Warning - d3.min.js is not loaded.');
            return;
        }
        // Initialize chart only if element exsists in the DOM
        if(element) {
            var bardata = noofusers;
            // Main variables
            var d3Container = d3.select(element),
                width = d3Container.node().getBoundingClientRect().width;
            // Horizontal
            var x = d3.scale.ordinal()
                .rangeBands([0, width], 0.3);

            // Vertical
            var y = d3.scale.linear()
                .range([0, height]);
            // Horizontal
            x.domain(d3.range(0, bardata.length));

            // Vertical
            y.domain([0, d3.max(bardata)]);
            // ------------------------------

            // Add svg element
            var container = d3Container.append('svg');

            // Add SVG group
            var svg = container
                .attr('width', width)
                .attr('height', height)
                .append('g');
            //
            // Append chart elements
            //

            // Bars
            var bars = svg.selectAll('rect')
                .data(bardata)
                .enter()
                .append('rect')
                    .attr('class', 'd3-random-bars')
                    .attr('width', x.rangeBand())
                    .attr('x', function(d,i) {
                        return x(i);
                    })
                    .style('fill', color);
            // Tooltip
            // ------------------------------

            // Initiate
            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0]);

            // Show and hide
            if(tooltip == "hours" || tooltip == "goal" || tooltip == "members") {
                bars.call(tip)
                    .on('mouseover', tip.show)
                    .on('mouseout', tip.hide);
            }
            // Statements tooltip content
            if(tooltip == "goal") {
                tip.html(function (d, i) {
                    return "<div class='text-center'>" +
                            "<h6 class='mb-0'>" + d + "</h6>" +
                            "<span class='font-size-16'>statements</span>" +
                            "<div class='font-size-16'>" + i + ":00" + "</div>" +
                        "</div>";
                });
            }

            // Online members tooltip content
            if(tooltip == "members") {
                tip.html(function (d, i) {
                    return "<div class='text-center bg-dark p-5'>" +
                        "<h6 class='mb-0'>" + d +" User(s)"+ "</h6>" +
                        "<div class='font-size-14'>" + noofusersdates[i] + "</div>" +
                        "</div>";
                });
            }
            // Choose between animated or static
            if(animate) {
                withAnimation();
            } else {
                withoutAnimation();
            }
            // Animate on load
            function withAnimation() {
                bars
                    .attr('height', 0)
                    .attr('y', height)
                    .transition()
                        .attr('height', function(d) {
                            return y(d);
                        })
                        .attr('y', function(d) {
                            return height - y(d);
                        })
                        .delay(function(d, i) {
                            return i * delay;
                        })
                        .duration(duration)
                        .ease(easing);
            }
            // Load without animateion
            function withoutAnimation() {
                bars
                    .attr('height', function(d) {
                        return y(d);
                    })
                    .attr('y', function(d) {
                        return height - y(d);
                    });
            }
            // Call function on window resize
            $(window).on('resize', barsResize);

            // Call function on sidebar width change
            $(document).on('click', '.sidebar-control', barsResize);

            // Resize function
            // 
            // Since D3 doesn't support SVG resize by default,
            // we need to manually specify parts of the graph that need to 
            // be updated on window resize
            function barsResize() {

                // Layout variables
                width = d3Container.node().getBoundingClientRect().width;


                // Layout
                // -------------------------

                // Main svg width
                container.attr("width", width);

                // Width of appended group
                svg.attr("width", width);

                // Horizontal range
                x.rangeBands([0, width], 0.3);


                // Chart elements
                // -------------------------

                // Bars
                svg.selectAll('.d3-random-bars')
                    .attr('width', x.rangeBand())
                    .attr('x', function(d,i) {
                        return x(i);
                    });
            }
        }
    };


    // Simple sparklines
    var _sparklinesWidget = function(element, chartType, qty, chartHeight, interpolation, duration, interval, color) {
        if (typeof d3 == 'undefined') {
            console.warn('Warning - d3.min.js is not loaded.');
            return;
        }

        // Initialize chart only if element exsists in the DOM
        if(element) {


            // Basic setup
            // ------------------------------

            // Define main variables
            var d3Container = d3.select(element),
                margin = {top: 0, right: 0, bottom: 0, left: 0},
                width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right,
                height = chartHeight - margin.top - margin.bottom;


            // Generate random data (for demo only)
            var data = [];
            for (var i=0; i < qty; i++) {
                data.push(Math.floor(Math.random() * qty) + 5);
            }


            // Construct scales
            // ------------------------------

            // Horizontal
            var x = d3.scale.linear().range([0, width]);

            // Vertical
            var y = d3.scale.linear().range([height - 5, 5]);


            // Set input domains
            // ------------------------------

            // Horizontal
            x.domain([1, qty - 3]);

            // Vertical
            y.domain([0, qty]);
                

            // Construct chart layout
            // ------------------------------

            // Line
            var line = d3.svg.line()
                .interpolate(interpolation)
                .x(function(d, i) { return x(i); })
                .y(function(d, i) { return y(d); });

            // Area
            var area = d3.svg.area()
                .interpolate(interpolation)
                .x(function(d,i) { 
                    return x(i); 
                })
                .y0(height)
                .y1(function(d) { 
                    return y(d); 
                });


            // Create SVG
            // ------------------------------

            // Container
            var container = d3Container.append('svg');

            // SVG element
            var svg = container
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            // Add mask for animation
            // ------------------------------

            // Add clip path
            var clip = svg.append("defs")
                .append("clipPath")
                .attr('id', function(d, i) { return "load-clip-" + element.substring(1); });

            // Add clip shape
            var clips = clip.append("rect")
                .attr('class', 'load-clip')
                .attr("width", 0)
                .attr("height", height);

            // Animate mask
            clips
                .transition()
                    .duration(1000)
                    .ease('linear')
                    .attr("width", width);


            //
            // Append chart elements
            //

            // Main path
            var path = svg.append("g")
                .attr("clip-path", function(d, i) { return "url(#load-clip-" + element.substring(1) + ")"; })
                .append("path")
                    .datum(data)
                    .attr("transform", "translate(" + x(0) + ",0)");

            // Add path based on chart type
            if(chartType == "area") {
                path.attr("d", area).attr('class', 'd3-area').style("fill", color); // area
            }
            else {
                path.attr("d", line).attr("class", "d3-line d3-line-medium").style('stroke', color); // line
            }

            // Animate path
            path
                .style('opacity', 0)
                .transition()
                    .duration(500)
                    .style('opacity', 1);



            // Set update interval. For demo only
            // ------------------------------

            setInterval(function() {

                // push a new data point onto the back
                data.push(Math.floor(Math.random() * qty) + 5);

                // pop the old data point off the front
                data.shift();

                update();

            }, interval);



            // Update random data. For demo only
            // ------------------------------

            function update() {

                // Redraw the path and slide it to the left
                path
                    .attr("transform", null)
                    .transition()
                        .duration(duration)
                        .ease("linear")
                        .attr("transform", "translate(" + x(0) + ",0)");

                // Update path type
                if(chartType == "area") {
                    path.attr("d", area).attr('class', 'd3-area').style("fill", color);
                }
                else {
                    path.attr("d", line).attr("class", "d3-line d3-line-medium").style('stroke', color);
                }
            }



            // Resize chart
            // ------------------------------

            // Call function on window resize
            $(window).on('resize', resizeSparklines);

            // Call function on sidebar width change
            $(document).on('click', '.sidebar-control', resizeSparklines);

            // Resize function
            // 
            // Since D3 doesn't support SVG resize by default,
            // we need to manually specify parts of the graph that need to 
            // be updated on window resize
            function resizeSparklines() {

                // Layout variables
                width = d3Container.node().getBoundingClientRect().width - margin.left - margin.right;


                // Layout
                // -------------------------

                // Main svg width
                container.attr("width", width + margin.left + margin.right);

                // Width of appended group
                svg.attr("width", width + margin.left + margin.right);

                // Horizontal range
                x.range([0, width]);


                // Chart elements
                // -------------------------

                // Clip mask
                clips.attr("width", width);

                // Line
                svg.select(".d3-line").attr("d", line);

                // Area
                svg.select(".d3-area").attr("d", area);
            }
        }
    };

    

    //
    // Return objects assigned to module
    //

    return {
        init: function() {

            _barChartWidget("#chart_bar_basic", 10, 50, true, "elastic", 1200, 50, "#3e8ef7", "members");

            _sparklinesWidget("#sparklines_basic", "area", 30, 50, "basis", 750, 2000, "#0bb2d4");
            
        }
    }
}();


// Initialize module
// ------------------------------

// When content loaded

document.addEventListener('DOMContentLoaded', getData());
document.addEventListener('DOMContentLoaded', function () {
    Widgetschart.init();
});



// donut chart
$('.donut').peity('donut');
// ------------------------------
    // Basic line chart
    // ------------------------------
    // based on prepared DOM, initialize echarts instance
        var myChart = echarts.init(document.getElementById('basic-line'));

        // specify chart configuration item and data
        var option = {
                // Setup grid
                grid: {
                     left: '1%',
                    right: '2%',
                    bottom: '3%',
                    containLabel: true
                },

                // Add Tooltip
                tooltip : {
                    trigger: 'axis'
                },

                // Add Legend
                legend: {
                    data:['Max temp','Min temp']
                },

                // Add custom colors
                color: ['#0bb2d4', '#17b3a3'],

                // Enable drag recalculate
                calculable : true,

                // Horizontal Axiz
                xAxis : [
                    {
                        type : 'category',
                        boundaryGap : false,
                        data : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
                    }
                ],

                // Vertical Axis
                yAxis : [
                    {
                        type : 'value',
                        axisLabel : {
                            formatter: '{value} °C'
                        }
                    }
                ],

                // Add Series
                series : [
                    {
                        name:'Max temp',
                        type:'line',
                        data:[10, 8, 14, 19, 17, 12, 14],
                        markPoint : {
                            data : [
                                {type : 'max', name: 'Max'},
                                {type : 'min', name: 'Min'}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name: 'Average'}
                            ]
                        },
                        lineStyle: {
                            normal: {
                                width: 3,
                                shadowColor: 'rgba(0,0,0,0.1)',
                                shadowBlur: 10,
                                shadowOffsetY: 10
                            }
                        },
                    },
                    {
                        name:'Min temp',
                        type:'line',
                        data:[2, -3, 1, 6, 4, 5, 0],
                        markPoint : {
                            data : [
                                {name : 'Week low', value : -2, xAxis: 1, yAxis: -1.5}
                            ]
                        },
                        markLine : {
                            data : [
                                {type : 'average', name : 'Average'}
                            ]
                        },
                        lineStyle: {
                            normal: {
                                width: 3,
                                shadowColor: 'rgba(0,0,0,0.1)',
                                shadowBlur: 10,
                                shadowOffsetY: 10
                            }
                        },
                    }
                ]
            };
        // use configuration item and data specified to show chart
        myChart.setOption(option);

