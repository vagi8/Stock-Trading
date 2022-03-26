var enum_data;
var table_crop_category;

function publish_enum_data(data){
  enum_data=data;

  table_crop_category.clear();
  table_crop_category.draw();

  for (key in data['CropCategory']){
    table_crop_category.row.add( [
          data['CropCategory'][key].unnest
      ]).node().id='rowid_'+data['CropCategory'][key].unnest
  table_crop_category.draw( false );
  }
}
function enum_initialization(){
  $.ajax({
    url: $SCRIPT_ROOT+'/get/crops/form',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        publish_enum_data(data)
    },
      error: function (request, message, error) {
          console.log(error);
      }
  });
}
function tables_initialization(){
  table_crop_category=$('#table_crop_category').DataTable({
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
  });
}
$(document).ready(function () {
  tables_initialization();
  enum_initialization();
})

$('#add_crop_category').on('click',function(){
  $('#CropCategoryName').val('');
  $('#ErrordivCropCategory').html('');

});
$('#submit_crop_category_details').on('click',function(){
  var cat_exists=table_crop_category.columns(0).data()[0].toLocaleString().toLowerCase().split(',').includes(($('#CropCategoryName').val()).toLowerCase())
  if ($('#edit_crops_form').valid() && !cat_exists){
    $("#edit_crops_category_modal").modal('hide');
    $("#ErrordivCropCategory").html('');
    var data=$('#edit_crops_form').serialize()
    $.ajax({
        url: '/post/insert/CropCategory',
        data: data,
        type: 'POST',
        success: function(response){
          enum_initialization();
          $.toast({
                  heading: 'Succefully Added Crop Category',
                  text: '',
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'success',
                  hideAfter: 5000,
                  stack: 6
              });


        },
        error: function(error){
          if (error.responseJSON.Error=='AlreadyExists'){
            $.toast({
                  heading: 'Category Already Exists',
                  text: error.responseJSON.Error,
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'error',
                  hideAfter: 5000
              });  
          }
          else{
            $.toast({
                  heading: 'Insert Failure',
                  text: error.responseJSON.Error,
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'error',
                  hideAfter: 5000
              });
          }
        }
      });
  }
  else if(cat_exists){
    $("#ErrordivCropCategory").html('<label class="error">Crop Category Already Exists</label>');
  }
  else{
    $("#ErrordivCropCategory").html('');
  }
});
