var table_channel;
var channel_data;
function publish_channel_data(data){
	channel_data=data;
  table_channel.clear();
  table_channel.draw();
	for (key in data){
		if (key == 100){
			break;
		}
    status=''
    if (data[key]['Status']==true){
      status='checked'
    }
    
    table_channel.row.add( [
          data[key]["ChannelID"],
          data[key]["Channel"],
          data[key]["Description"],
          '<div class="form-button-action">\
          	<div id='+data[key]["ChannelID"]+' type="button" onclick="edit_channel_details(this);" style="color: rgb(123 123 123 / 30%)!important;class=" btn btn-link btn-simple-primary btn-lg">\
          			<i class="fa fa-edit"></i>\
          	</div>\
          </div>',
          '<div class="form-button-action">\
    				<div class="demo-checkbox checkbox-datatable">\
    					<input id=delete_'+data[key]["ChannelID"]+' name=delete_'+data[key]["ChannelID"]+' type="checkbox" onchange="delet_row(this);" disabled class="filled-in" '+status+' />\
    					<label for=delete_'+data[key]["ChannelID"]+' class="block" ></label>\
    				</div>\
    			</div>',
      ]).node().id='rowid_'+data[key]["ChannelID"]
 	table_channel.draw( false );
 	}
}

function get_channel_data(){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/channels',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_channel_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

function tables_initialization(){
  table_channel=$('#table_channel').DataTable({
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
      { "width": '30%' },
      { "width": '30%' },
      { "width": '30%' },
      { "width": '5%' },
      { "width": '5%' }
      ]
  });
}
$(window).on("load",function(){
	// get_farmer_data();
});

$(document).ready(function () {
  tables_initialization();
  get_channel_data();
})
