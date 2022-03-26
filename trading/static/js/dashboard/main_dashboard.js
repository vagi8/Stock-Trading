//[Dashboard Javascript]

//Project:	UltimatePro Admin - Responsive Admin Template
//Primary use:   Used only for the main dashboard (index.html)

// ------------------------------


var channelnames = "";
var whatsappcount7 = [];
var smscount7 = [];
var facebookcount7 = [];
var telegramcount7 = [];
var teamscount7 = [];

var createdcount7 = []; var completedcount7 = []; var canclledcount7 = []; var errorcount7 = [];


var dateArray = new Array();
var today = new Date();
var currentDate = new Date(today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + (today.getDate()));
var s = new Date(today.setDate(today.getDate()-7)).toLocaleDateString();

while (currentDate >= new Date(s)) {
    dateArray.push(new Date(currentDate).toDateString());
    currentDate.setDate(currentDate.getDate() - 1)
}
var msg_status='<div class="col-xl-4 col-12">\
            <div class="info-box bg-success bg-channel">\
              <span class="info-box-icon push-bottom rounded-circle"><i class="fa fa-channel"></i></span>\
              <div class="info-box-content">\
                <span class="info-box-text">ChannelName</span>\
                <span class="info-box-number">RemainingNo</span><p>Remaining</p>\
                <div class="progress">\
                  <div class="progress-bar" style="width: ChannelProgress%"></div>\
                </div>\
                <span class="progress-description">\
                    UsedNo / AllotedNo Used\
                </span>\
              </div>\
            </div>\
          </div>'
function getdata(){
    $.ajax({
        url: $SCRIPT_ROOT+'/get/orgsubscriptions',
        type: 'GET',
        dataType: 'json',
        success: function (data){
            for (key in data){
                var temp=msg_status;
                temp=temp.replace('ChannelName',data[key]['ChannelName']);
                temp=temp.replace('RemainingNo',data[key]['NoAllotedMessages']-data[key]['NoConsumedMessages']);
                temp=temp.replace('ChannelProgress',data[key]['NoConsumedMessages']/data[key]['NoAllotedMessages']*100);
                temp=temp.replace('UsedNo',data[key]['NoConsumedMessages']);
                temp=temp.replace('AllotedNo',data[key]['NoAllotedMessages']);
                if (data[key]['ChannelName']=='Whatsapp'){
                    temp=temp.replace('bg-channel','bg-whatsapp')
                    temp=temp.replace('fa-channel','fa-whatsapp')
                }
                else if (data[key]['ChannelName']=='Facebook Messenger'){
                    temp=temp.replace('bg-channel','bg-facebook')
                    temp=temp.replace('fa-channel','fa-facebook')
                }
                else if (data[key]['ChannelName']=='Telegram'){
                    temp=temp.replace('bg-channel','bg-telegram')
                    temp=temp.replace('fa-channel','fa-telegram')
                }
                else if (data[key]['ChannelName']=='Microsoft Teams'){
                    temp=temp.replace('bg-channel','bg-teams')
                    temp=temp.replace('<i class="fa fa-channel"></i>','<img class="fa" src="/static/images/teams.ico">')
                }
                else if (data[key]['ChannelName']=='SMS'){
                    temp=temp.replace('bg-channel','bg-sms')
                    temp=temp.replace('fa-channel','fa-envelope')
                }
                $('#SubscriptionStatus').append(temp);
            }
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/campaignsummary',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dat=data['campaigns']
            $("#totalfarmers").html(data['farmers']);
            $("#totalmessages").html(data['success']);
            $("#totalerrormessages").html(data['errors']);
            $("#totalcampaigns").html(data['campaigns']);
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/MessagesCampaign',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dat=data;
            var res = "";
            var count = "";
            var messagesbycampaign = [];
            var campaignvalues = [];
            for (var i = 0; i < dat.length; i++) {
                if (i < 10) {
                    res += "<li class=\"flexbox mb - 5\"><div><span class=\"badge badge - dot badge - lg mr - 1\" style=\"background - color: #ff4c52\"></span><span>" + dat[i]["Name"].toUpperCase() + "</span></div><div>" + dat[i]["count1"] + "</div></li>";
                    count += "'" + parseInt(dat[i]["count1"]) + "'" + ",";
                    messagesbycampaign.push({ "value": dat[i]["count1"], "name": dat[i]["Name"].toUpperCase().toString() });
                    campaignvalues.push(dat[i]["Name"].toUpperCase().toString());
                }
            }
            $("#messagesbycampaign").html(res);
            $("#messagescounts").html(count);

            var basicpieChart = echarts.init(document.getElementById('campaign'));
            var option = {
                // Add tooltip
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} messages ({d}%)"//{a} <br/>
                },

                toolbox: {
                    show: true,
                    feature: {
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                // Add custom colors
                color: ['#17b3a3', '#faa700', '#009933', '#ff4c52', '#3e8ef7', '#6633FF', '#6D4C41', '#D32F2F', '#33CC66', '#7E57C2', '#FDD835', '#0033CC','#FF0099'],


                // Enable drag recalculate
                calculable: true,

                // Add series
                series: [{
                    name: 'Messages',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '57.5%'],
                    data: messagesbycampaign
                }]
            };

            basicpieChart.setOption(option);
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/MessagesbyCampaignNames',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dat=data;
            var campaignnames = [];
            var campaignwhatsapp = []; var facebookcampaign = [];
            var campaigntelegram = []; var campaignsms = []; var campaignteams = [];
            for (var j = 0; j < dat.length; j++) {
                if (!campaignnames.includes(dat[j]["Name"]) && campaignnames.length < 4) { campaignnames.push(dat[j]["Name"]) }

            }
            for (var i = 0; i < campaignnames.length; i++) {
                for (var j = 0; j < dat.length; j++) {
                    if (campaignnames[i] == dat[j]["Name"]) {
                        if (dat[j]["Channel"].toLowerCase() == "whatsapp") { campaignwhatsapp.push(dat[j]["count"].toString()) }
                        if (dat[j]["Channel"].toLowerCase() == "microsoft teams") { campaignteams.push(dat[j]["count"].toString()) }
                        if (dat[j]["Channel"].toLowerCase() == "facebook messenger") { facebookcampaign.push(dat[j]["count"].toString()) }
                        if (dat[j]["Channel"].toLowerCase() == "telegram") { campaigntelegram.push(dat[j]["count"].toString()) }
                        if (dat[j]["Channel"].toLowerCase() == "sms") { campaignsms.push(dat[j]["count"].toString()) }
                    }
                }

                try { if (campaignsms[i].toString() == ""); } catch{ campaignsms.push(0); }
                try { if (campaignteams[i].toString() == ""); } catch{ campaignteams.push(0); }
                try { if (campaigntelegram[i].toString() == ""); } catch{ campaigntelegram.push(0); }
                try { if (facebookcampaign[i].toString() == ""); } catch{ facebookcampaign.push(0); }
                try { if (campaignwhatsapp[i].toString() == ""); } catch{ campaignwhatsapp.push(0); }
            }
            var myChart = echarts.init(document.getElementById('basic-linecampaign'));

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

                // Add Legend
                legend: {
                    data: ['Max temp', 'Min temp']
                },

                // Add custom colors
                color: ['#009933', '#6633FF' , '#faa700', '#ff4c52', '#3e8ef7', '#17b3a3' ],

                // Enable drag recalculate
                calculable: true,

                // Horizontal Axiz
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: true,
                        data: campaignnames
                    }
                ],

                // Vertical Axis
                yAxis: [
                    {
                        type: 'value',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],

                // Add Series
                series: [
                    {
                        name: 'Whatsapp',
                        type: 'bar',
                        data: campaignwhatsapp,
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
                        name: 'Teams',
                        type: 'bar',
                        data: campaignteams,
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
                        name: 'Facebook',
                        type: 'bar',
                        data: facebookcampaign,
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
                        name: 'SMS',
                        type: 'bar',
                        data: campaignsms,
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
                        name: 'Telegram',
                        type: 'bar',
                        data: campaigntelegram,
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
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/MessagesbyStatus7',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dat=data;
            for (var i = 0; i < dateArray.length; i++) {
                for (var j = 0; j < dat.length; j++) {
                    if (new Date(dateArray[i]).toLocaleDateString() == new Date(dat[j]["date"]).toLocaleDateString()) {
                        if (dat[j]["Status"].toLowerCase() == "completed") { completedcount7.push(dat[j]["count"]) }
                        if (dat[j]["Status"].toLowerCase() == "cancelled") { canclledcount7.push(dat[j]["count"]) }
                        if (dat[j]["Status"].toLowerCase() == "created") { createdcount7.push(dat[j]["count"]) }
                        if (dat[j]["Status"].toLowerCase() == "error") { errorcount7.push(dat[j]["count"]) }
                    }
                }
                try { if (completedcount7[i].toString() == ""); } catch{ completedcount7.push(0); }
                try { if (canclledcount7[i].toString() == ""); } catch{ canclledcount7.push(0); }
                try { if (createdcount7[i].toString() == ""); } catch{ createdcount7.push(0); }
                try { if (errorcount7[i].toString() == ""); } catch{ errorcount7.push(0); }
            }


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
                tooltip: {
                    trigger: 'axis'
                },

                // Add Legend
                legend: {
                    data: ['Max temp', 'Min temp']
                },

                // Add custom colors
                color: ['#17b3a3', '#009933', '#faa700', '#ff4c52', '#3e8ef7', '#6633FF'],

                // Enable drag recalculate
                calculable: true,

                // Horizontal Axiz
                xAxis: [
                    {
                        type: 'category',
                        boundaryGap: false,
                        data: dateArray//['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
                    }
                ],

                // Vertical Axis
                yAxis: [
                    {
                        type: 'value',
                        axisLabel: {
                            formatter: '{value}'
                        }
                    }
                ],

                // Add Series
                series: [
                    {
                        name: 'Created',
                        type: 'line',
                        data: createdcount7,
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
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
                        name: 'Completed',
                        type: 'line',
                        data: completedcount7,//[2, -3, 1, 6, 4, 5, 0],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
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
                        name: 'Cancelled',
                        type: 'line',
                        data: canclledcount7,//[2, -3, 1, 6, 4, 5, 0],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
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
                        name: 'Error',
                        type: 'line',
                        data: errorcount7,//[2, -3, 1, 6, 4, 5, 0],
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
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
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/Messagesbycampaigngroup',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dat=data;
            var res = "";
            var messagesbycampaign = [];
            var groupvalues = [];
            for (var i = 0; i < dat.length; i++) {
                if (i < 6) {
                    res += "<li class=\"flexbox mb - 5\"><div><span class=\"badge badge - dot badge - lg mr - 1\" style=\"background - color: #ff4c52\"></span><span>" + dat[i]["Group"].toUpperCase() + "</span></div><div>" + dat[i]["count"] + "</div></li>";
                    messagesbycampaign.push({ "value": dat[i]["count"], "name": dat[i]["Group"].toUpperCase().toString() });
                    groupvalues.push(dat[i]["Group"].toUpperCase().toString());
                }
            }
            $("#messagesgroupbycampaign").html(res);
            var basicpieChart = echarts.init(document.getElementById('campaigngroup'));
            var option = {
                // Add tooltip
                tooltip: {
                    trigger: 'item',
                    formatter: "{b}: {c} messages ({d}%)"//{a} <br/>
                },
                toolbox: {
                    show: true,
                    feature: {
                        restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },

                // Add custom colors
                color: ['#17b3a3', '#faa700', '#009933', '#ff4c52', '#3e8ef7', '#6633FF', '#6D4C41', '#D32F2F', '#33CC66', '#7E57C2', '#FDD835', '#0033CC', '#FF0099'],

                
                // Enable drag recalculate
                calculable: true,

                // Add series
                series: [{
                    name: 'Messages',
                    type: 'pie',
                    radius: '70%',
                    center: ['50%', '57.5%'],
                    data: messagesbycampaign
                }]
            };

            basicpieChart.setOption(option);
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        // url: "https://dardlea.azurewebsites.net/api/Messageshistory",
        url: $SCRIPT_ROOT+'/get/dashboard/Messageshistory',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            // var dat = JSON.parse(data);
            var dat=data;
            $("#totalmessagesofthismonth").html(dat[0]["count"] );
            $("#totalmessagesoflastmonth").html(dat[1]["count"]);
            $("#difference").html((parseInt(dat[0]["count"]) - parseInt(dat[1]["count"])).toString());
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        url: $SCRIPT_ROOT+'/get/dashboard/MessagesbyChannelpast7days',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            var dat=data;
            for (var i = 0; i < dateArray.length; i++) {
                for (var j = 0; j < dat.length; j++) {
                    if (new Date(dateArray[i]).toLocaleDateString() == new Date(dat[j]["date"]).toLocaleDateString()) {
                        if (dat[j]["Channel"].toLowerCase() == "whatsapp") { whatsappcount7.push(dat[j]["count"]) }
                        if (dat[j]["Channel"].toLowerCase() == "sms") { smscount7.push(dat[j]["count"]) }
                        if (dat[j]["Channel"].toLowerCase() == "telegram") { telegramcount7.push(dat[j]["count"]) }
                        if (dat[j]["Channel"].toLowerCase() == "facebook messenger") { facebookcount7.push(dat[j]["count"]) }
                        if (dat[j]["Channel"].toLowerCase() == "microsoft teams") { teamscount7.push(dat[j]["count"]) }
                    }
                }
                try { if (whatsappcount7[i].toString() == ""); } catch{ whatsappcount7.push(0); }
                try { if (smscount7[i].toString() == ""); } catch{ smscount7.push(0); }
                try { if (telegramcount7[i].toString() == ""); } catch{ telegramcount7.push(0); }
                try { if (facebookcount7[i].toString() == ""); } catch{ facebookcount7.push(0); }
                try { if (teamscount7[i].toString() == ""); } catch{ teamscount7.push(0); }
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
                    data: ["Whatsapp", "SMS", "Facebook Messenger", "Telegram","Microsoft Teams"]
                },
                toolbox: {
                    show: true,
                    feature: {

                        magicType: { show: true, type: ['line', 'bar'] },
                        //restore: { show: true },
                        saveAsImage: { show: true }
                    }
                },
                color: ["#28B463", "#F4D03F", "#3498DB", "#2E4053","#3F51B5"],
                calculable: true,
                xAxis: [
                    {
                        type: 'category',
                        data: dateArray//[new Date().toLocaleDateString(), new Date().getDate + 1, 'Mar', 'Apr', 'May', 'Jun', 'July']
                    }
                ],
                yAxis: [
                    {
                        type: 'value'
                    }
                ],
                series: [
                    {
                        name: 'Whatsapp',
                        type: 'bar',
                        data: whatsappcount7,
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                    },
                    {
                        name: 'SMS',
                        type: 'bar',
                        data: smscount7,
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                    },
                    {
                        name: 'Telegram',
                        type: 'bar',
                        data: telegramcount7,
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                        
                    },
                    {
                        name: 'Facebook Messenger',
                        type: 'bar',
                        data: facebookcount7,
                        markPoint: {
                            data: [
                                { type: 'max', name: 'Max' },
                                { type: 'min', name: 'Min' }
                            ]
                        },
                       
                    },
                    {
                        name: 'Microsoft Teams',
                        type: 'bar',
                        data: teamscount7,
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
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        // url: "https://dardlea.azurewebsites.net/api/MessagesbyChanneltoday",
        url: $SCRIPT_ROOT+'/get/dashboard/MessagesbyChanneltoday',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            // var dat = JSON.parse(data);
            var dat=data;
            var resw=""; var resf="";
            var ress = ""; var rest = "";
            var resm = "";
            
            for (var i = 0; i < dat.length; i++) {
                if (dat[i]["Channel"].toLowerCase() == "whatsapp") { resw = dat[i]["count"]; }
                if (dat[i]["Channel"].toLowerCase() == "sms") { ress = dat[i]["count"]; }
                if (dat[i]["Channel"].toLowerCase() == "facebook messenger") { resf = dat[i]["count"]; }
                if (dat[i]["Channel"].toLowerCase() == "telegram") { rest = dat[i]["count"]; }
                if (dat[i]["Channel"].toLowerCase() == "microsoft teams") { resm = dat[i]["count"]; }
                
            }
            if (resf == "") { resf = "0" }; if (resw == "") { resw = "0" }; if (resm == "") { resm = "0" }; if (ress == "") { ress = "0" }; if (rest == "") { rest = "0" };
            $("#messagesbychannelwhatsapp").html(resw);
            $("#messagesbychannelsms").html(ress);
            $("#messagesbychannelfacebook").html(resf);
            $("#messagesbychanneltelegram").html(rest);
            $("#messagesbychannelteams").html(resm);
        },
        Error: function error() { alert("API error"); }
    });
    $.ajax({
        // url: "https://dardlea.azurewebsites.net/api/MessagesbyStatustoday",
        url: $SCRIPT_ROOT+'/get/dashboard/MessagesbyStatustoday',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            // var dat = JSON.parse(data);
            var dat=data;
            var resc = ""; var resca = ""; var rese = "";
            var resco = ""; var respr = "";
            for (var i = 0; i < dat.length; i++) {
                if (dat[i]["Status"].toLowerCase() == "created") { resc = dat[i]["count"]; }
                if (dat[i]["Status"].toLowerCase() == "cancelled") { resca = dat[i]["count"]; }
                if (dat[i]["Status"].toLowerCase() == "completed") { resco = dat[i]["count"]; }
                if (dat[i]["Status"].toLowerCase() == "error") { rese = dat[i]["count"]; }
            }
            if (resc == "") { resc = "0" }; if (resco == "") { resco = "0" }; if (resca == "") { resca = "0" }; if (respr == "") { respr = "0" }; if (rese == "") { rese = "0" };
            $("#messagesbystatuscreated").html(resc);
            $("#messagesbystatuscompleted").html(resco); $("#messagesbystatuscancelled").html(resca); $("#messagesbystatuserror").html(rese);
        },
        Error: function error() { alert("API error"); }
    });
    $("#baralc").sparkline([32, 24, 26, 24, 32, 26, 40, 34, 22, 24, 22, 24, 34, 32, 38, 28, 36, 36, 40, 38, 30, 34, 38], {
        type: 'bar',
        height: '90',
        barWidth: 6,
        barSpacing: 4,
        barColor: '#ba69aa',
    }); 
}
document.addEventListener('DOMContentLoaded', getdata() );
// donut chart
$('.donut').peity('donut');

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else { 
    console.log("Geolocation is not supported by this browser.")
  }
}
function showPosition(position) {
  console.log("Latitude: " + position.coords.latitude + 
    " Longitude: " + position.coords.longitude);
  $('#weather_data').attr('data-location-lon',position.coords.longitude);
  $('#weather_data').attr('data-location-lat',position.coords.latitude);
}
// document.addEventListener('DOMContentLoaded', getLocation() );
Morris.Area({
    element: 'area-chart3',
    data: [{
        period: '2013',
        data1: 0,
        data2: 0,
        data3: 0
    }, {
        period: '2014',
        data1: 55,
        data2: 20,
        data3: 10
    }, {
        period: '2015',
        data1: 25,
        data2: 55,
        data3: 70
    }, {
        period: '2016',
        data1: 65,
        data2: 17,
        data3: 12
    }, {
        period: '2017',
        data1: 35,
        data2: 25,
        data3: 125
    }, {
        period: '2018',
        data1: 30,
        data2: 85,
        data3: 45
    }, {
        period: '2019',
        data1: 15,
        data2: 15,
        data3: 15
    }


    ],
    lineColors: ['#17b3a3', '#3e8ef7', '#faa700'],
    xkey: 'period',
    ykeys: ['data1', 'data2', 'data3'],
    labels: ['Data 1', 'Data 2', 'Data 3'],
    pointSize: 0,
    lineWidth: 0,
    resize: true,
    fillOpacity: 0.8,
    behaveLikeLine: true,
    gridLineColor: '#e0e0e0',
    hideHover: 'auto'
});