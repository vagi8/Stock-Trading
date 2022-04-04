var djangoData = $('#my-data').data();
var trans_data;
var trans_table;
var cash_table;
var cash_data;
function tables_initialization(){
  cash_table=$('#table_subscription2').DataTable({
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
  trans_table=$('#table_subscription1').DataTable({
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
function publish_trans_data(data){
	data=data.sort(function(a, b){
    	return a.id - b.id;
	});
	trans_table.clear();
	trans_table.draw();
	trans_data=data;
	var current_date=new Date().toString();
	var action_button=''
	for (key in data){
	    if (data[key]['limitExpiry'] && data[key]['status']=='open'){
	        var date=new Date(data[key]['limitExpiry']).toUTCString().split('GMT')[0]
	        if (date > current_date){
	        action_button='<div type="button" class="btn btn-primary btn-round ml-auto mb-3" onclick="cancel_order(this);" id="cancelOrder_'+ data[key]["id"] + '" >Cancel Order</div>';
            }
            else{
                action_button=''
            }
	    }
	    else{
	        date=''
	        action_button=''
	    }
	    trans_table.row.add([
            data[key]["id"],
            data[key]["ticker"],
            data[key]["transactionType"],
            data[key]["orderType"],
            data[key]["orderVolume"],
            data[key]["status"],
            data[key]['limitPrice'],
            date,
            data[key]["log"],
            action_button
        ]).node().id='rowid_'+data[key]["id"]
 	trans_table.draw( false );
 	}
}
function get_transaction_data_data(id){
	$('#table_subscription1_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/user/get/transaction_history/'+djangoData.userid,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
	 		$('#table_subscription1_wrapper').show();
		    	publish_trans_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_cash_data(data){
	data=data.sort(function(a, b){
    	return a.id - b.id;
	});
	cash_table.clear();
	cash_table.draw();
	cash_data=data;
	var current_date=new Date().toString();
	var action_button=''
	for (key in data){
	    cash_table.row.add([
            data[key]["id"],
            data[key]["transactionType"],
            data[key]["amount"],
            new Date(data[key]['dateTime']).toUTCString().split('GMT')[0]
        ]).node().id='rowid_'+data[key]["id"]
 	cash_table.draw( false );
 	}
}
function get_cash_data_data(id){
	$('#table_subscription1_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/user/get/cash_history/'+djangoData.userid,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
	 		$('#table_subscription1_wrapper').show();
		    	publish_cash_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function cancel_order(element){
    var id=element.id.split('_')[1]
    $.ajax({
        url: '/user/post/cancel_transaction/'+id,
        data: $('#form_buy_sell').serialize(),
        type: 'POST',
        success: function(response){
            $.toast({
                heading: 'Order has been cancelled',
                text: '',
                position: 'top-right',
                loaderBg: '#ff6849',
                icon: 'success',
                hideAfter: 5000,
                stack: 6
            });
//            location.reload(true);
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
$(document).ready(function(){
	$('#tab_content').hide()
    $('#loader_placer').append('<div style="margin-left: 400px;" class="loader" id="loader_div"></div>');
	tables_initialization();
	get_transaction_data_data(djangoData.userid);
	get_cash_data_data(djangoData.userid);
	$('#loader_div').remove();
	$('#tab_content').show();
});