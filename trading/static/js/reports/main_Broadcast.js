var broadcast_all;

function publish_broadcast_data(data){
	data=data.sort(function(a, b){
    	return a.BrodcastID - b.BrodcastID;
	});
	for (key in data){
		if (key == 100){
			break;
		}
		var status=data[key]["Status"]
	    broadcast_all.row.add( [
            data[key]["BrodcastID"],
            data[key]["Name"],
            data[key]["FarmerID"],
            data[key]["Channel"],
            data[key]["CreatedDate"],
            data[key]["Status"],
        ]).node().id='rowid_'+data[key]["BrodcastID"];
        broadcast_all.draw( false );
 	}
 
}

function get_broadcast_data(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/broadcast_log',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_broadcast_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

$(window).on("load",function(){
});

$(document).ready(function(){

	broadcast_all = $('#broadcast_all').DataTable({
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
	    { "width": '30%' },
	    { "width": '10%' },
	    { "width": '30%' },
	    { "width": '20%' },
	    { "width": '5%' }
	    ]
	});
	get_broadcast_data();
});
function DeleteRow(element){

}