var channels_table;
var temp_data;
function publish_channels_data(data){
	temp_data=data;
	for (key in data){
		if (key == 100){
			break;
		}
	    channels_table.row.add( [
            data[key]["FarmerChannelID"],
            data[key]["LastName"],
            data[key]["ChannelName"],
            data[key]["Status"]
        ]).node().id='rowid_'+data[key]["FarmerChannelID"]
 	channels_table.draw( false );
 	}
 	$('#loader_div').remove();
 	$('#channels_table_wrapper').show();
 
}

function get_channels_data(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/channels/0',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_channels_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

$(window).on("load",function(){
});

$(document).ready(function(){

	channels_table = $('#channels_table').DataTable({
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
	    { "width": '25%' },
	    { "width": '25%' },
	    { "width": '25%' },
	    { "width": '25%' },
	    ]
	});
	$('#channels_table_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	get_channels_data();
});
// $('#addRowButton').click(function() {
// });
$('#channels_table').on('click', 'tbody tr', function() {
	var id=parseInt(this.id.split('_')[1]);
	data=temp_data.find(x => x.FarmerChannelID === id);


})