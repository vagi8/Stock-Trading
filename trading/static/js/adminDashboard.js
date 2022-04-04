var stocks_table;
var stocks_data;
var sch_table;
var sch_data;
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
  sch_table=$('#sch_table').DataTable({
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
            data[key]["initialPrice"],
            data[key]["currentPrice"]
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
        temp[5] = data[key]['currentPrice'];
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

function publish_sch_data(data){
	data=data.sort(function(a, b){
    	return a.id - b.id;
	});
	sch_table.clear();
	sch_table.draw();
	sch_data=data;
	var action_button;
	for (key in data){
	    action_button='<div type="button" class="btn btn-primary btn-round ml-auto mb-3" onclick="delete_holiday(this);" id="cancelOrder_'+ data[key]["id"] + '" >Delete</div>'
	    sch_table.row.add([
            data[key]["id"],
            new Date(data[key]['day']).toUTCString().split('00:00:00')[0],
            action_button
        ]).node().id='rowid_'+data[key]["id"]
 	sch_table.draw( false );
 	}
 	var interval = setInterval(function () { stocks_timer(); }, 5000);
}
function delete_holiday(element){
    var id=element.id.split('_')[1]
    $.ajax({
        url: '/admin/post/delete_holiday/'+id,
        data: $('#form_buy_sell').serialize(),
        type: 'POST',
        success: function(response){
            $.toast({
                heading: 'Holiday cancelled',
                text: '',
                position: 'top-right',
                loaderBg: '#ff6849',
                icon: 'success',
                hideAfter: 5000,
                stack: 6
            });
        },
        error: function(error){
            console.log(error);
            $.toast({
                heading: 'Failed',
                text: error.responseJSON.Error,
                position: 'top-right',
                loaderBg: '#ff6849',
                icon: 'error',
                hideAfter: 5000
            });
        }
    });
}
function get_sch_data(){
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/admin/get/market_holidays',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
		    	publish_sch_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function verifyschForm(){
    if ($('#day').val()==''){
        $('#scherror').append('This field is required');
        return false
    }
    else{
        $('#scherror').empty();
        return true
    }
}
$('#holidays_submit').on('click',function(){
    if (verifyschForm()){
        $.ajax({
        url: '/admin/post/changeMarketHolidays',
        data: $('#market_hours_form').serialize(),
        type: 'POST',
        success: function(response){
            $.toast({
                heading: 'Holiday added succefully',
                text: '',
                position: 'top-right',
                loaderBg: '#ff6849',
                icon: 'success',
                hideAfter: 5000,
                stack: 6
            });

        },
        error: function(error){
            console.log(error);
            $.toast({
                heading: 'Order Failed',
                text: error.responseJSON.Error,
                position: 'top-right',
                loaderBg: '#ff6849',
                icon: 'error',
                hideAfter: 5000
            });
        }
    });
    }
});
$(document).ready(function(){

	$('#tab_content').hide()
    $('#loader_placer').append('<div style="margin-left: 400px;" class="loader" id="loader_div"></div>');
	tables_initialization();
	get_stocks_data();
	get_sch_data();
	$('#loader_div').remove();
	$('#tab_content').show();

});