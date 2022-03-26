var crops_table;
var temp_data;
function publish_crops_data(data){
	temp_data=data;
	for (key in data){
		if (key == 100){
			break;
		}
	    crops_table.row.add( [
            data[key]["FarmerCropID"],
            data[key]["LastName"],
            data[key]["CropName"],
            data[key]["LandArea"],
            data[key]["LandType"],
            data[key]["DatePlanting"],
            data[key]["YieldDate"],
            data[key]["SoilType"],
        ]).node().id='rowid_'+data[key]["FarmerCropID"]
 	crops_table.draw( false );
 	}
 	$('#loader_div').remove();
 	$('#crops_table_wrapper').show();
 
}

function get_crops_data(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/crops/0',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_crops_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

$(window).on("load",function(){
});

$(document).ready(function(){

	crops_table = $('#crops_table').DataTable({
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
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '5%' }
	    ]
	});
	$('#crops_table_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	get_crops_data();
});
// $('#addRowButton').click(function() {
// });
$('#crops_table').on('click', 'tbody tr', function() {
	var id=parseInt(this.id.split('_')[1]);
	data=temp_data.find(x => x.FarmerCropID === id);


})