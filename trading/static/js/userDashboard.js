var portfolio_table;
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
//	   "columns" : [
//	    { "width": '25%' },
//	    { "width": '25%' },
//	    { "width": '25%' },
//	    { "width": '25%' },
//	    ]
	});
	$('#portfolio_table_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$('#loader_div').remove();
 	$('#portfolio_table_wrapper').show();
});
