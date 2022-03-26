var farmers_all;
var farmer_one;
var crop_one;
var land_one;
var channel_one;
var data_farmers;
var row_data;
var crops;
var resp;
function publish_farmers_data(data){
	data=data.sort(function(a, b){
    	return a.FarmerID - b.FarmerID;
	});
	data_farmers=data;
	for (key in data){
		if (key == 100){
			break;
		}
	    farmers_all.row.add( [
            data[key]["FarmerID"],
            data[key]["FirstName"]+' '+data[key]["LastName"],
            data[key]["Gender"],
            data[key]["MobileNo"],
            data[key]["IDNo"],
            data[key]["Geography"],
            data[key]["FarmerGroupName"]
        ]).node().id='rowid_'+data[key]["FarmerID"]
 	farmers_all.draw( false );
 	}
}
function get_farmer_data(id){
	$('#farmer_all_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/'+id,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
	 		$('#farmer_all_wrapper').show();
	    	if (id==0){
		    	publish_farmers_data(data['farmers']);
	 		}
	 		else{
	 			publish_farmer_data(data[0]);
	 			row_data=data[0];
	 		}
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
$(window).on("load",function(){
	// get_farmer_data();
});
function tables_initialization(){
	//defining all farmers table
	farmers_all = $('#farmer_all').DataTable({
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
	    { "width": '20%' },
	    { "width": '20%' },
	    { "width": '20%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '5%' }
	    ],
	    // ajax:{
	    // 	url: $SCRIPT_ROOT+'/get/farmers',
	    // 	type: 'GET',
	    // 	dataType: 'json',
	    // },
	    // columns: [
     //        { data: "FarmerID" },
     //        { data: "FirstName"+"LastName" },
     //        { data: "MobileNo" },
     //        { data: "IDNo" },
     //        { data: "Geography" },
     //        { data: "CreatedBy" }
     //        ]
	});
}
$(document).ready(function(){
	$('#back_button').click();
	tables_initialization();
	get_farmer_data(0);
});