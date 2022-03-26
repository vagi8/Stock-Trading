var lands_table;
var temp_data;
function publish_lands_data(data){
	temp_data=data;
	for (key in data){
		if (key == 100){
			break;
		}
	    lands_table.row.add( [
            data[key]["FarmerLandID"],
            data[key]["LastName"],
            data[key]["LandArea"],
            data[key]["LandType"],
            data[key]["District"],
            data[key]["Locality"],
            data[key]["OwnershipType"],
            data[key]["WaterSourceType"],
            data[key]["Latitude"] +' , '+data[key]["Longitude"],
        ]).node().id='rowid_'+data[key]["FarmerLandID"]
 	lands_table.draw( false );
 	}
 	$('#loader_div').remove();
 	$('#lands_table_wrapper').show();
 
}

function get_lands_data(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/lands/0',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_lands_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

$(window).on("load",function(){
});

$(document).ready(function(){

	lands_table = $('#lands_table').DataTable({
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
	    { "width": '2%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '11%' },
	    { "width": '10%' },
	    { "width": '2%' }
	    ]
	});
	$('#lands_table_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	get_lands_data();
});
// $('#addRowButton').click(function() {
// });
$('#lands_table').on('click', 'tbody tr', function() {
	var id=parseInt(this.id.split('_')[1]);
	data=temp_data.find(x => x.FarmerCropID === id);


})