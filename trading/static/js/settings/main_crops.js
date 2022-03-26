var table_crops;
var crop_data;
function publish_crop_data(data){
  data=data.sort(function(a, b){
      return a.CropID - b.CropID;
  });
	crop_data=data;
  table_crops.clear();
  table_crops.draw();
	for (key in data){
		if (key == 100){
			break;
		}
    status=''
    if (data[key]['Status']==true){
      status='checked'
    }
    table_crops.row.add( [
          data[key]["CropID"],
          data[key]["CropName"],
          data[key]["Description"],
          data[key]["CropCategory"],
          data[key]["CropSector"],
          data[key]["Duration"],
          '<div class="form-button-action">\
          	<div id='+data[key]["CropID"]+' type="button" data-toggle="modal" onclick="edit_crop_details(this);" data-target="#edit_crops_modal" class="btn btn-link btn-simple-primary btn-lg">\
          			<i class="fa fa-edit"></i>\
          	</div>\
          </div>',
          '<div class="form-button-action">\
    				<div class="demo-checkbox checkbox-datatable">\
    					<input id=delete_'+data[key]["CropID"]+' name=delete_'+data[key]["CropID"]+' type="checkbox" onchange="delet_row(this);" class="filled-in" '+status+' />\
    					<label for=delete_'+data[key]["CropID"]+' class="block" ></label>\
    				</div>\
    			</div>',
      ]).node().id='rowid_'+data[key]["CropID"]
 	table_crops.draw( false );
 	}
}
function update_modal(data,id){
  for (key in data){
    $('#'+id).append($('<option>', {
                  value: data[key].unnest,
                  text: data[key].unnest
              }));
  }
}
function modal_initialization(){
  $.ajax({
    url: $SCRIPT_ROOT+'/get/crops/form',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        update_modal(data['CropCategory'],'CropCategory')
        update_modal(data['CropSector'],'CropSector')
    },
      error: function (request, message, error) {
          console.log(error);
      }
  });
}
function get_crop_data(){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/crops',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_crop_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function tables_initialization(){
  table_crops=$('#table_crops').DataTable({
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
      { "width": '15%' },
      { "width": '15%' },
      { "width": '20%' },
      { "width": '20%' },
      { "width": '10%' },
      { "width": '10%' },
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
  get_crop_data();
  modal_initialization();
})

$('#add_crop_details').click(function() {
  resetForm('edit_crops_form');
  $("#DivCropID").hide();
  $("#CropName").val('');
  $("#Description").val('');
  $("#CropCategory").val('');
  $("#CropSector").val('');
  $("#Duration").val('');
  $("#submit_crop_details").text('Create');
  $("#ErrordivCropName").html('');
});

$('#submit_crop_details').click(function() {
  var crop_exists=table_crops.columns(1).data()[0].toLocaleString().toLowerCase().split(',').includes(($('#CropName').val()).toLowerCase())
  if ($('#edit_crops_form').valid()){
    var data=$('#edit_crops_form').serialize();
    if ($("#submit_crop_details").text()==='Update'){
      $("#edit_crops_modal").modal('hide');
      $("#ErrordivCropName").html('');
      $.ajax({
          url: '/post/update/crop',
          data: data,
          type: 'POST',
          success: function(response){
            get_crop_data();
            $.toast({
                    heading: 'Succefully Updated Crop Details',
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
    else if($("#submit_crop_details").text()==='Create' && !crop_exists){
      $("#edit_crops_modal").modal('hide');
      $("#ErrordivCropName").html('');
      $.ajax({
          url: '/post/insert/crop',
          data: data,
          type: 'POST',
          success: function(response){
            get_crop_data();
            $.toast({
                    heading: 'Crop Created',
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
    else if (crop_exists){
      $("#ErrordivCropName").html('<label class="error">Crop Already Exists</label>');
    }
  }
  else{
    $("#ErrordivCropName").html('');
  }
});

function edit_crop_details(element){
    resetForm('edit_crops_form');
  	data=crop_data.find(x => x.CropID === parseInt(element.id))
    $("#CropID").val(data.CropID);
    $("#DivCropID").show();
    $("#CropName").val(data.CropName);
    $("#Description").val(data.Description);
    $("#CropCategory").val(data.CropCategory);
    $("#CropSector").val(data.CropSector);
    $("#Duration").val(data.Duration);
    $("#submit_crop_details").text('Update');
    $('#edit_crops_form').valid();
}
function delet_row(element){
  var data = new FormData();
  data.append('CropID',element.id.split('_')[1])
  if($('#'+ element.id +':checked').val()){
    data.append('Status','true')
  }
  else{
    data.append('Status','false')
  }
  $.ajax({
        url: '/post/update/crop/status',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response){
          get_crop_data();
          $.toast({
                  heading: 'Succefully Updated Crop Status',
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