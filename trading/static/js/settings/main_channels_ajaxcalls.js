$('#add_channel_details').click(function() {
  $("#ChannelID").val('');
  $("#ChannelName").val('');
  $("#Description").val('');
  $("#submit_channel_details").text('Create')
});
$('#submit_channel_details').click(function() {
  var data=$('#edit_channel_form').serialize()
  if ($("#submit_channel_details").text()==='Update'){
    $.ajax({
      url: '/post/update/channel',
      data: data,
      type: 'POST',
      success: function(response){
        get_channel_data();
        $.toast({
                heading: 'Succefully Updated Channel Details',
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
  else{
    $.ajax({
        url: '/post/insert/channel',
        data: data,
        type: 'POST',
        success: function(response){
          get_channel_data();
          $.toast({
                  heading: 'Channel Created',
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
});
function edit_channel_details(element){
	data=channel_data.find(x => x.ChannelID === parseInt(element.id))
  $("#ChannelID").val(data.ChannelID);
  $("#ChannelName").val(data.Channel);
  $("#Description").val(data.Description);
  $("#submit_channel_details").text('Update')
}
function delet_row(element){
  var data = new FormData();
  data.append('ChannelID',element.id.split('_')[1])
  if($('#'+ element.id +':checked').val()){
    data.append('Status','true')
  }
  else{
    data.append('Status','false')
  }
  $.ajax({
        url: '/post/update/channel/status',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response){
          get_channel_data();
          $.toast({
                  heading: 'Succefully Updated Channel Status',
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