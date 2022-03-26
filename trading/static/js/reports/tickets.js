var table_tickets;
var data_tickets;
var row_data;
var crops;
var resp;
function publish_tickets_data(data){
	data=data.sort(function(a, b){
    	return a.TicketID - b.TicketID;
	});
	data_tickets=data;
	table_tickets.clear();
	table_tickets.draw();
	for (key in data){
		if (key == 100){
			break;
		}
	    table_tickets.row.add( [
            data[key]["TicketID"],
            data[key]["Category"],
            data[key]["Description"],
            data[key]["Requestername"],
            data[key]["Requesterchannel"],
            data[key]["AssignedtouserID"],
            data[key]["Datecreated"],
            data[key]["Dateclosed"],
            data[key]["Status"],
        ]).node().id='rowid_'+data[key]["TicketID"]
 	table_tickets.draw( false );
 	}
 	$('#TotalTickets').text(data.length);
	var open=data.filter(x=>x.Status==="Open").length
	$('#OpenTickets').text(open);
	var closed=data.filter(x=>x.Status==="Closed").length
	$('#Resolved').text(closed);
	var pending=data.filter(x=>x.Status==="Requested").length+open
	$('#Pending').text(pending);
	load_pie();
	load_bar();
}
function get_ticket_data(){
	$('#ticket_all_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/tickets',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
	 		$('#ticket_all_wrapper').show();
		    publish_tickets_data(data);
	 		
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function tables_initialization(){
	//defining all tickets table
	table_tickets = $('#table_tickets').DataTable({
	  dom: 'Bfrtip',
	  buttons: [
	    'copy', 'csv', 'excel', 'pdf', 'print'
	  ],
	  'paging'      : true,
	  'lengthChange': false,
	  'searching'   : true,
	  'ordering'    : true,
	  'info'        : true,
	  'autoWidth'   : false,
	   "columns" : [
	    { "width": '5%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '5%' }
	    ]
	});
}
$(document).ready(function(){
	tables_initialization();
	get_ticket_data();
});
function load_bar(){
	var users=Array.from(new Set(data_tickets.map(item => item.AssignedtouserID)))
	var user_count_data=[]
	var colors=['burlywood','cadetblue','goldenrod','darkslategray','darksalmon','darkcyan','cornflowerblue','crimsonred','darkorange','darkseagreen','indianred']
	for (item in users){
		user_count_data.push({'value':data_tickets.reduce((n, x) => n + (x.AssignedtouserID === users[item] ), 0),'itemStyle':{ 'normal': { 'color': colors[item] }}});
	}
    var myChart = echarts.init(document.getElementById('TicketsByAgent'));

    // specify chart configuration item and data
    option = {
	    legend:{
	        data: users
	    },
	    tooltip:{
        	trigger:'item'
    	},
	    xAxis: {
	        type: 'category',
	        data: users
	    },
	    yAxis: {
	        type: 'value',
	        show:false
	    },
	    series: [{
	        data: user_count_data,
	        type: 'bar',
	        showBackground: true,
	        backgroundStyle: {
	            color: 'rgba(220, 220, 220, 0.8)'
	        },
        	color:'#004093'
	    }]
	}
    myChart.setOption(option);
}
function load_pie(){
	var channels=Array.from(new Set(data_tickets.map(item => item.Requesterchannel)))
	var data=[]
	var value;
	ul_list=""
	for (i in channels){
		value=data_tickets.reduce((n, x) => n + (x.Requesterchannel === channels[i] ), 0)
		data.push({'name':channels[i],'value':value})
		ul_list=ul_list+"<li class='flexbox mb-5'><span>"+channels[i]+"</span><div>"+value+"</div></li>"
	}
	var basicpieChart = echarts.init(document.getElementById('TicketsByChannel'));
    var option = {
        // Add tooltip
        tooltip: {
            trigger: 'item',
            formatter: "{b}: {c} tickets ({d}%)"//{a} <br/>
        },
        // Add custom colors
        //color: ['#17b3a3', '#faa700', '#009933', '#ff4c52', '#3e8ef7', '#6633FF', '#6D4C41', '#D32F2F', '#33CC66', '#7E57C2', '#FDD835', '#0033CC','#FF0099'],


        // Enable drag recalculate
        calculable: true,

        // Add series
        series: [{
            name: 'Messages',
            type: 'pie',
            radius: '70%',
            center: ['50%', '57.5%'],
            data: data
        }]
    };

    basicpieChart.setOption(option);
    $('#TicketsByChannelul').html(ul_list);
}