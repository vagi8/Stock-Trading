var apikey="eljpxqrf8x646uxr0utpcc1fd6fpw8ht51cf32yx";
var instrumentalkey="035651ce-cb33-46d4-a924-d23dbb4d1dc7";

var users = [];
var count = [];
var dates = [];
var x = [];
var y = [];
var targets = [];
var targetcount = [];
var pie = [];
var piechannel = [];
 var pieusers = [];
var msteams = [];
var emulator = [];
var facebook = [];
var list = [];
var listofdates = [];
var msteamsactivities = [];
var emulatoractivities = [];
var facebookactivities = [];
var directlineactivities = [];
var otheractivities = [];

function getData() {


    $.ajax({
        url: "https://api.applicationinsights.io/v1/apps/" + instrumentalkey + "/query?query=let queryStartDate = ago(30d);let queryEndDate = now();let groupByInterval = 1d;customEvents | where timestamp >queryStartDate| where timestamp < queryEndDate| summarize uc=dcount(user_Id) by bin(timestamp,groupByInterval),tostring(customDimensions.channelId)| where customDimensions_channelId !='' | order by timestamp",
        headers: { 'x-api-key': apikey },
        success: function (data) {
            //for (var i = 0; i < data.tables[0].rows.length; i++) {
            //    if (data.tables[0].rows[i][1] == "") {data.tables[0].rows[i][0]="NA"}
            //    if (data.tables[0].rows[i][1] == "msteams") {
            //        msteams.push(data.tables[0].rows[i][2])
            //    }
            //    else { msteams.push(0); }
            //    if (data.tables[0].rows[i][1] == "emulator") {
            //        emulator.push(data.tables[0].rows[i][2])
            //    }
            //    else { emulator.push(0);}
            //    if (data.tables[0].rows[i][1].toLowerCase() == "facebook") {
            //        facebook.push(data.tables[0].rows[i][2])
            //    }
            //    else { facebook.push(0); }
            //    list.push(new Date(data.tables[0].rows[i][0]).toLocaleDateString());

            //}


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


            var ctx_pie = document.getElementById("piechartuser").getContext("2d");
            //            window.myLine = new Chart(ctx_pie).Line(usersbychannelchart, {
            //  responsive: true
            //});
            //        }

            var myPolarAreaChart = new Chart(ctx_pie).PolarArea(polarAreaChartData, {
                responsive: true
            });

        }
    });


    $.ajax({
        url: "https://api.applicationinsights.io/v1/apps/" + instrumentalkey + "/query?query=requests  |project itemCount,customDimensions.channelId|summarize count() by tostring(customDimensions_channelId)",
        headers: { 'x-api-key': apikey },
        success: function (data) {
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                var colour = "#F7464A";
                if (data.tables[0].rows[i][0] == "msteams") {
                    colour = "#3498DB";
                }
                else if (data.tables[0].rows[i][0] == "emulator") {
                     colour = "#BFC9CA";
                }
                item = {}
                if (data.tables[0].rows[i][0] == "") {data.tables[0].rows[i][0]="NA"}
                item["value"] = data.tables[0].rows[i][1];
                item["color"] = colour;
                item["highlight"] = colour;
                item["label"] = data.tables[0].rows[i][0];
                piechannel.push(item);
            }
           
            var ctx_pie = document.getElementById("piechartchannel").getContext("2d");
            window.myPieChart = new Chart(ctx_pie).Pie(pieChartDataChannels, {
      responsive: true
            });
        }

    });
     


    $.ajax({
        url: "https://api.applicationinsights.io/v1/apps/" + instrumentalkey + "/query?query=dependencies| project target,['type'],itemCount| summarize count() by target",
        headers: { 'x-api-key': apikey },
        success: function (data) {
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                targets.push(data.tables[0].rows[i][0]);
                targetcount.push(data.tables[0].rows[i][1]);
            }
            var ctx_pie = document.getElementById("dependencies").getContext("2d");
            window.myBar = new Chart(ctx_pie).Bar(dependencieschart, {
                responsive: true
            });


        }
    });


    $.ajax({
        url: "https://api.applicationinsights.io/v1/apps/" + instrumentalkey + "/query?query=let queryStartDate = ago(30d);let queryEndDate = now(); customEvents | where timestamp >queryStartDate| where timestamp < queryEndDate| where name=='WaterfallStart'| extend DialogId = customDimensions['DialogId']| extend instanceId = tostring(customDimensions['InstanceId'])| join kind=leftouter (customEvents | where name=='WaterfallCancel' | extend instanceId = tostring(customDimensions['InstanceId'])) on instanceId | join kind=leftouter (customEvents | where name=='WaterfallComplete' | extend instanceId = tostring(customDimensions['InstanceId'])) on instanceId | extend duration = case(not(isnull(timestamp1)), timestamp1 - timestamp,not(isnull(timestamp2)), timestamp2 - timestamp, 0s) | extend seconds = round(duration / 1s)| summarize AvgSeconds=avg(seconds) by tostring(DialogId)| order by AvgSeconds desc nulls last | render barchart with (title='Duration in Dialog')",
        headers: { 'x-api-key': apikey },
        success: function (data) {
            for (var i = 0; i < data.tables[0].rows.length; i++) {
                item = {}
                item ["value"] = data.tables[0].rows[i][1];
                item["color"] = "#F7464A";
                item["highlight"] = "#FF5A5E";
                item["label"] = data.tables[0].rows[i][0];
                pie.push(item);
            }
            var ctx_pie = document.getElementById("piechart").getContext("2d");
             window.myPieChart = new Chart(ctx_pie).Pie(pieChartData,{
              responsive: true
            });
        }

    });




    var dat3;
   
    $.ajax({
        url: 'https://api.applicationinsights.io/v1/apps/' + instrumentalkey + '/query?query=let queryStartDate = ago(30d);let queryEndDate = now();let groupByInterval = 1d;customEvents | where timestamp > queryStartDate| where timestamp < queryEndDate| summarize uc=dcount(user_Id) by bin(timestamp, groupByInterval)|order by timestamp | render timechart',
        headers: { 'x-api-key': apikey },
        success: function (data) {
            dat3 = data;
            for (var i = 0; i < dat3.tables[0].rows.length; i++) {

                x.push(new Date(dat3.tables[0].rows[i][0]).toLocaleDateString());
                //if (i == 0) {
                //    y.push(0);
                //}
                y.push(dat3.tables[0].rows[i][1]);
            }
            //alert(dat.tables[0].rows[]);
           
            var ctx_line = document.getElementById("templatemo-line-chart1").getContext("2d");

            //window.myLine = new Chart(ctx_line).Line(lineChartData1, {
            //    responsive: true
            //});

             
            window.myBar = new Chart(ctx_line).Bar(lineChartData1, {
                responsive: true
            });
        }

    });

    $.ajax({
        url: "https://api.applicationinsights.io/v1/apps/" + instrumentalkey + "/query?query=traces| project customDimensions.UserName,customDimensions.channelId| where customDimensions_UserName != tostring('')|where customDimensions_channelId != tostring('')| distinct tostring(customDimensions_UserName),tostring(customDimensions_channelId)",
        headers: { 'x-api-key': apikey },
        success: function (data1) {
            var dat1;
            dat1 = data1;
            var res;
            for (var i = 0; i < dat1.tables[0].rows.length; i++) {
                res+="<tr><td>"+(i+1)+"</td><td>" + dat1.tables[0].rows[i][0]+"</td><td>"+ dat1.tables[0].rows[i][1]+"</td></tr>"
              //  $("#person" + i).html("<tr><td>1</td><td></td><td></td><!--<td>@js</td>--></tr>" + dat1.tables[0].rows[i][0]);
              //$("#channel" + i).html(dat1.tables[0].rows[i][1]);
            }
          $("#person").html(res);
        }

    });
    //"use strict";
    
    $.ajax({
        url: "https://api.applicationinsights.io/v1/apps/" + instrumentalkey + "/query?query=let queryStartDate = ago(30d); let queryEndDate =now(); let interval = 1h; customEvents  | where timestamp > queryStartDate | where timestamp < queryEndDate | extend InstanceId =tostring(customDimensions['InstanceId'])| extend DialogId = tostring(customDimensions['DialogId'])| extend ActivityId =tostring(customDimensions['activityId'])| where DialogId != '' and InstanceId != '' and user_Id != ''|extend metric = ActivityId | summarize Count=dcount(metric) by tostring(customDimensions.channelId),format_datetime(timestamp,'yyyy-MM-dd') |order by Count desc nulls last | order by timestamp",
        headers: { 'x-api-key': apikey },
        success: function (data) {
            var dat;
            dat = data;
            for (var i = 0; i < dat.tables[0].rows.length; i++) {
                var date = new Date();

                //dat=dat.tables[0].rows[0];
                //users.push(dat.tables[0].rows[i][0]);
                if (!dates.includes(new Date(dat.tables[0].rows[i][1]).toLocaleDateString())) {
                    dates.push(new Date(dat.tables[0].rows[i][1]).toLocaleDateString());
                }
                if (dat.tables[0].rows[i][0] == "msteams") { msteamsactivities.push(dat.tables[0].rows[i][2]) }
                if (dat.tables[0].rows[i][0] == "emulator") { emulatoractivities.push(dat.tables[0].rows[i][2]) }
                if (dat.tables[0].rows[i][0] == "facebook") { facebookactivities.push(dat.tables[0].rows[i][2]) }
                if (dat.tables[0].rows[i][0] == "directline") { directlineactivities.push(dat.tables[0].rows[i][2]) }
                //count.push(dat.tables[0].rows[i][1]);
            }


            
            
            var ctx_line = document.getElementById("templatemo-line-chart").getContext("2d");

            window.myLine = new Chart(ctx_line).Bar(lineChartData, {
                responsive: true
            });
      
        }

    });
};

        
//Line Chart
var randomScalingFactor = function(){ return Math.round(Math.random()*100)};

var lineChartData = {
  labels: dates,//["January","February","March","April","May","June","July"],
  datasets : [
      {
          label:["Teams"],
        fillColor : "rgba(26, 82, 118)",
        strokeColor : "rgba(36, 113, 163)",
        pointColor : "rgba(212, 230, 241)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
        pointHighlightStroke: "rgba(253, 254, 254)",

          data: msteamsactivities//[randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
      },
  {
      label: ["facebook"],
      fillColor: "rgba(40, 55, 71)",
        strokeColor : "rgba(46, 64, 83)",
        pointColor : "rgba(52, 73, 94)",
        pointStrokeColor : "#fff",
        pointHighlightFill : "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: facebookactivities//[randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
      },
  {
    label: "direct",
    fillColor : "rgba(220, 118, 51)",
    strokeColor : "rgba(237, 187, 153)",
    pointColor : "rgba(186, 74, 0)",
    pointStrokeColor : "#fff",
    pointHighlightFill : "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: directlineactivities//[randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
  },
  {
    label: "others",
    fillColor : "rgba(151,187,205,0.2)",
    strokeColor : "rgba(249, 231, 159)",
    pointColor : "rgba(249, 231, 159)",
    pointStrokeColor : "#fff",
    pointHighlightFill : "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: emulatoractivities//[randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
  }
    ],
  legend: {display: true}
  

}

var usersbychannelchart = {
    labels: listofdates,
datasets : [
{
  type:"line",
  labels: "My First dataset",
  fillColor : "rgba(253, 254, 254  )",
  strokeColor : "rgba(220,220,220,1)",
  pointColor : "rgba(220,220,220,1)",
  pointStrokeColor : "#fff",
  pointHighlightFill : "#fff",
  pointHighlightStroke : "rgba(220,220,220,1)",
  data : msteams
},
    {
     type:"line",
  labels: "My Second dataset",
  fillColor : "rgba(253, 254, 254 )",
  strokeColor : "rgba(151,187,205,1)",
  pointColor : "rgba(151,187,205,1)",
  pointStrokeColor : "#fff",
  pointHighlightFill : "#fff",
  pointHighlightStroke : "rgba(151,187,205,1)",
  data : emulator
    },
,
{
     type:"line",
  label: "My Second dataset",
  fillColor : "rgba(253, 254, 254 )",
  strokeColor : "rgba(151,187,205,1)",
  pointColor : "rgba(151,187,205,1)",
  pointStrokeColor : "#fff",
  pointHighlightFill : "#fff",
    pointHighlightStroke: "rgba(151,187,205,1)",
    data: facebook
},

]

}


var polarAreaChartData = msteams;

var dependencieschart = {
    labels: targets,//["January","February","March","April","May","June","July"],
datasets : [
{
label: "My First dataset",
fillColor : "rgba(243, 156, 18)",
strokeColor : "rgba(40, 55, 71)",
pointColor : "rgba(151,187,205,1)",
pointStrokeColor : "#fff",
pointHighlightFill : "#fff",
      pointHighlightStroke: "rgba(151,187,205,1)",
      data: targetcount//[randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
}

]

}

var lineChartData1 = {
    labels: x,//["January","February","March","April","May","June","July"],
datasets : [
{
label: "My First dataset",
fillColor : "rgba(88, 214, 141)",
strokeColor : "rgba(151,187,205,1)",
pointColor : "rgba(151,187,205,1)",
pointStrokeColor : "#fff",
pointHighlightFill : "#fff",
  pointHighlightStroke: "rgba(151,187,205,1)",
      data: y//[randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor(),randomScalingFactor()]
  },

]

}

var pieChartData = pie
var pieChartDataChannels = piechannel // pie chart data
var pieChartDatausers = pieusers

window.onload = function () {
  window.setTimeout(function () {
    getData();
         // do whatever you want to do     
          }, 600);
var ctx_line = document.getElementById("templatemo-line-chart").getContext("2d");


};

$('#myTab a').click(function (e) {
  e.preventDefault();
  $(this).tab('show');
});

$('#loading-example-btn').click(function () {
  var btn = $(this);
  btn.button('loading');
  // $.ajax(...).always(function () {
  //   btn.button('reset');
  // });
});