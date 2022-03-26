var table_group;
var group_data;
function publish_group_data(data){
  table_group.clear();
  table_group.draw();
	group_data=data;
	for (key in data){
		if (key == 100){
			break;
		}
    status=''
    if (data[key]['Status']==true){
      status='checked'
    }
	  table_group.row.add( [
            data[key]["RecID"],
            data[key]["Group"],
            data[key]["Description"],
            '<div class="form-button-action">\
            	<div id='+data[key]["RecID"]+' type="button" data-toggle="modal" onclick="edit_campaigngroup_details(this);" data-target="#edit_campaigngroups_modal" class="btn btn-link btn-simple-primary btn-lg">\
            			<i class="fa fa-edit"></i>\
            	</div>\
            </div>',
            '<div class="form-button-action">\
      				<div class="demo-checkbox checkbox-datatable">\
      					<input id=delete_'+data[key]["RecID"]+' name=delete_'+data[key]["RecID"]+' type="checkbox" onchange="delet_row(this);" class="filled-in" '+status+' />\
      					<label for=delete_'+data[key]["RecID"]+' class="block" ></label>\
      				</div>\
      			</div>',
        ]).node().id='rowid_'+data[key]["RecID"]
 	table_group.draw( false );
 	}
}

function get_group_data(){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/campaign_groups',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_group_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

function tables_initialization(){
  table_group=$('#table_group').DataTable({
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
$(document).ready(function () {
  tables_initialization();
  get_group_data();
})

$('#add_campaigngroup_details').click(function() {
  resetForm('edit_campaigngroups_form');
  $("#DivGroupID").hide();
  $("#GroupName").val('');
  $("#Description").val('');
  $("#GroupName").removeAttr('readonly');
  $("#submit_campaigngroup_details").text('Create');
});

$('#submit_campaigngroup_details').click(function() {
  if ($('#edit_campaigngroups_form').valid()){
    $("#edit_campaigngroups_modal").modal('hide');
    var data=$('#edit_campaigngroups_form').serialize();
    if ($("#submit_campaigngroup_details").text()==='Update'){
      $.ajax({
          url: '/post/update/campaigngroup',
          data: data,
          type: 'POST',
          success: function(response){
            get_group_data();
            $.toast({
                    heading: 'Succefully Updated Campaign Group Details',
                    text: 'Data will be updated the next time you reload the page',
                    position: 'top-right',
                    loaderBg: '#ff6849',
                    icon: 'success',
                    hideAfter: 5000,
                    stack: 6
                });


          },
          error: function(error){
            console.log(error.Error);
            $.toast({
                    heading: 'Update Failure',
                    text: error.responseJSON.Error,
                    position: 'top-right',
                    loaderBg: '#ff6849',
                    icon: 'error',
                    hideAfter: 5000
                });
          }
        });
    }
    else{
      $.ajax({
          url: '/post/insert/campaigngroup',
          data: data,
          type: 'POST',
          success: function(response){
            get_group_data();
            $.toast({
                    heading: 'Campaign Group Created',
                    text: 'Data will be updated the next time you reload the page',
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
                    heading: 'Creation Failure',
                    text: error.responseJSON.Error,
                    position: 'top-right',
                    loaderBg: '#ff6849',
                    icon: 'error',
                    hideAfter: 5000
                });
          }
        });
    }
  }
});

function edit_campaigngroup_details(element){
    resetForm('edit_campaigngroups_form');
    data=group_data.find(x => x.RecID === parseInt(element.id))
    $("#GroupName").attr('readonly','');
    $("#DivGroupID").show();
    $("#GroupID").val(data.RecID);
    $("#GroupName").val(data.Group);
    $("#Description").val(data.Description);
    $("#submit_campaigngroup_details").text('Update');
    $('#edit_campaigngroups_form').valid();
}
function delet_row(element){
  var data = new FormData();
  data.append('GroupID',element.id.split('_')[1])
  if($('#'+ element.id +':checked').val()){
    data.append('Status','true')
  }
  else{
    data.append('Status','false')
  }
  $.ajax({
        url: '/post/update/campaigngroup/status',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response){
          get_group_data();
          $.toast({
                  heading: 'Succefully Updated Campaign Group Status',
                  text: 'Data will be updated the next time you reload the page',
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'success',
                  hideAfter: 5000,
                  stack: 6
              });


        },
        error: function(error){
          $.toast({
                  heading: 'Update Failure',
                  text: error.responseJSON.Error,
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'error',
                  hideAfter: 5000
              });
        }
      });
}