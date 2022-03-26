var enum_data;
var table_crop_sector;

function publish_enum_data(data){
  enum_data=data;
  table_crop_sector.clear();
  table_crop_sector.draw();

  for (key in data['CropSector']){
    table_crop_sector.row.add( [
          data['CropSector'][key].unnest
      ]).node().id='rowid_'+data['CropSector'][key].unnest
  table_crop_sector.draw( false );
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
  table_crop_sector=$('#table_crop_sector').DataTable({
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
$('#add_crop_sector').on('click',function(){
  $('#CropSectorName').val('');
  $('#ErrordivCropSector').html('');
});
$('#submit_crop_sector_details').on('click',function(){
  var sector_exists=table_crop_sector.columns(0).data()[0].toLocaleString().toLowerCase().split(',').includes(($('#CropSectorName').val()).toLowerCase())
  if ($('#edit_crops_form').valid() && !sector_exists){
    $("#edit_crops_sector_modal").modal('hide');
    $("#ErrordivCropSector").html('');
    var data=$('#edit_crops_form').serialize()
    $.ajax({
        url: '/post/insert/CropSector',
        data: data,
        type: 'POST',
        success: function(response){
          enum_initialization();
          $.toast({
                  heading: 'Succefully Added Crop Sector',
                  text: '',
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'success',
                  hideAfter: 5000,
                  stack: 6
              });


        },
        error: function(error){
            $.toast({
                  heading: 'Sector Already Exists',
                  text: error.responseJSON.Error,
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'error',
                  hideAfter: 5000
              });
        }
      });
  }
  else if (sector_exists){
    $("#ErrordivCropSector").html('<label class="error">Crop Sector Already Exists</label>');
  }
  else{
    $("#ErrordivCropSector").html('')
  }
});
