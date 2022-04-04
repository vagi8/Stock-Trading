var stocks_table;
var stocks_data;
function tables_initialization(){
  stocks_table=$('#stocks_table').DataTable({
    dom: 'Bfrtip',
    buttons: [
      'copy', 'csv', 'excel', 'pdf', 'print'
    ],
    'paging'      : true,
    'lengthChange': false,
    'searching'   : true,
    'ordering'    : true,
    'info'        : true,
  });
}
function publish_stocks_data(data){
	data=data.sort(function(a, b){
    	return a.id - b.id;
	});
	stocks_table.clear();
	stocks_table.draw();
	stocks_data=data;
	for (key in data){
	    stocks_table.row.add([
            data[key]["id"],
            data[key]["companyName"],
            data[key]["ticker"],
            data[key]["volume"],
            data[key]["currentPrice"],
            data[key]["volume"]*data[key]["currentPrice"],
        ]).node().id='rowid_'+data[key]["id"]
 	stocks_table.draw( false );
 	}
 	var interval = setInterval(function () { stocks_timer(); }, 5000);
}
function get_stocks_data(){
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/admin/get/stocks',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
		    	publish_stocks_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function update_stocks(data){
    for (key in data){
        var temp = stocks_table.row('#rowid_'+data[key]['id']).data();
        temp[4] = data[key]['currentPrice'];
        temp[5] = temp[3]*data[key]['currentPrice'];
        stocks_table.row('#rowid_'+data[key]['id']).data( temp ).draw();
    }
}
function stocks_timer () {
    $.ajax({
	 	url: $SCRIPT_ROOT+'/admin/get/update_stocks',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	            if (data['market']){
	                update_stocks(data['stocks_data'])
	            }
	    	    else{
	    	    console.log("Market Closed")
	    	    }
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}


$(document).ready(function(){

	$('#tab_content').hide()
    $('#loader_placer').append('<div style="margin-left: 400px;" class="loader" id="loader_div"></div>');
	tables_initialization();
	get_stocks_data();
	$('#loader_div').remove();
	$('#tab_content').show();

});