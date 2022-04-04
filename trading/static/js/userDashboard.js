var portfolio_table;
function publish_portfolio_data(data){
	data=data.sort(function(a, b){
    	return a.id - b.id;
	});
	portfolio_table.clear();
	portfolio_table.draw();
	for (key in data){
	    portfolio_table.row.add([
            data[key]["id"],
            data[key]["companyName"],
            data[key]["ticker"],
            data[key]["units"],
            data[key]["purchasePrice"]
        ]).node().id='rowid_'+data[key]["id"]
 	portfolio_table.draw( false );
 	}
}
function get_portfolio_data(){
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/user/get/portfolio',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
		    	publish_portfolio_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
$(document).ready(function(){
	portfolio_table = $('#portfolio_table').DataTable({
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
	});
	$('#portfolio_table_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	get_portfolio_data();
	$('#loader_div').remove();
 	$('#portfolio_table_wrapper').show();
});
