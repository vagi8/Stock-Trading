var table_farmergroup;
var farmergroup_data;
function publish_farmergroup_data(data){
  table_farmergroup.clear();
  table_farmergroup.draw();
  data=data.sort(function(a, b){
      return a.CropID - b.CropID;
  });
	farmergroup_data=data;
	for (key in data){
		if (key == 100){
			break;
		}
    status=''
    if (data[key]['Status']==true){
      status='checked'
    }
	  table_farmergroup.row.add( [
            data[key]["FarmerGroupID"],
            data[key]["GroupName"],
            data[key]["Description"],
            '<div class="form-button-action">\
              <div id='+data[key]["FarmerGroupID"]+' type="button" data-toggle="modal" onclick="edit_farmergroup_details(this);" data-target="#edit_farmergroups_modal" class="btn btn-link btn-simple-primary btn-lg">\
                  <i class="fa fa-edit"></i>\
              </div>\
            </div>',
            '<div class="form-button-action">\
              <div class="demo-checkbox checkbox-datatable">\
                <input id=delete_'+data[key]["FarmerGroupID"]+' name=delete_'+data[key]["FarmerGroupID"]+' type="checkbox" onchange="delet_row(this);" class="filled-in" '+status+' />\
                <label for=delete_'+data[key]["FarmerGroupID"]+' class="block" ></label>\
              </div>\
            </div>',
        ]).node().id='rowid_'+data[key]["FarmerGroupID"]
 	table_farmergroup.draw( false );
 	}
}

function get_farmergroup_data(){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/farmergroup',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_farmergroup_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

function tables_initialization(){
  table_farmergroup=$('#table_farmergroup').DataTable({
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
      { "width": '10%' },
      { "width": '35%' },
      { "width": '35%' },
      { "width": '10%' },
      { "width": '10%' },
      ]
  });
}
$(document).ready(function () {
  tables_initialization();
  get_farmergroup_data();
})

$('#add_farmergroup_details').click(function() {
  resetForm('edit_farmergroups_form');
  $("#ErrordivGroup").html('');
  $("#DivGroupID").hide();
  $("#GroupName").val('');
  $("#Description").val('');
  $("#submit_farmergroup_details").text('Create');
});

$('#submit_farmergroup_details').click(function() {
  var group_exists=table_farmergroup.columns(1).data()[0].toLocaleString().toLowerCase().split(',').includes(($('#GroupName').val()).toLowerCase())
  if ($('#edit_farmergroups_form').valid() && !group_exists){
    $("#edit_farmergroups_modal").modal('hide');
    $("#ErrordivGroup").html('');
    var data=$('#edit_farmergroups_form').serialize();
    if ($("#submit_farmergroup_details").text()==='Update'){
      $.ajax({
          url: '/post/update/farmergroup',
          data: data,
          type: 'POST',
          success: function(response){
            get_farmergroup_data();
            $.toast({
                    heading: 'Succefully Updated Farmer Group Details',
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
          url: '/post/insert/farmergroup',
          data: data,
          type: 'POST',
          success: function(response){
            get_farmergroup_data();
            $.toast({
                    heading: 'Farmer Group Created',
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
  else if (group_exists){
    $("#ErrordivGroup").html('<label class="error">Group Name Already Exists</label>');
  }
  else{
    $("#ErrordivGroup").html('');
  }
});

function edit_farmergroup_details(element){
    resetForm('edit_farmergroups_form');
    data=farmergroup_data.find(x => x.FarmerGroupID === parseInt(element.id))
    $("#DivGroupID").show();
    $("#GroupID").val(data.FarmerGroupID);
    $("#GroupName").val(data.GroupName);
    $("#Description").val(data.Description);
    $("#submit_farmergroup_details").text('Update');
    $('#edit_farmergroups_form').valid();
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
        url: '/post/update/farmergroup/status',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response){
          get_farmergroup_data();
          $.toast({
                  heading: 'Succefully Updated Farmer Group Status',
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