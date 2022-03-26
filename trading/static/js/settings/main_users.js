var table_user;
var users_data;
function publish_user_data(data){
	users_data=data;
  table_user.clear();
  table_user.draw();
	for (key in data){
		if (key == 100){
			break;
		}
    status=''
    if (data[key]['Status']==true){
      status='checked'
    }
    table_user.row.add( [
            data[key]["id"],
            data[key]["name"],
            data[key]["email"],
            data[key]["role"],
            '<div data-toggle="modal" data-target="#ResetPassword" id='+data[key]["email"]+' onclick="load_reset_password_modal(this);" class="btn btn-outline btn-pink mb-5">Reset</div>',
            '<div class="form-button-action">\
            	<div id='+data[key]["id"]+' type="button" data-toggle="modal" onclick="load_user_model(this);" data-target="#Adduser" class="btn btn-link btn-simple-primary btn-lg">\
            			<i class="fa fa-edit"></i>\
            	</div>\
            </div>',
            '<div class="form-button-action">\
    				<div class="demo-checkbox checkbox-datatable">\
    					<input  id=user_'+data[key]["id"]+' type="checkbox" id="campaign-user-sms" onchange="delet_row(this);" class="filled-in" '+status+' />\
    					<label for=user_'+data[key]["id"]+' class="block" ></label>\
    				</div>\
    			 </div>',
        ]).node().id='rowid_'+data[key]["id"]
 	table_user.draw( false );
 	}
}
function get_user_data(){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/users',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_user_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
//not  using currently, to use for dynamically update the form (role)
function update_modal(){
  $.ajax({
    url: $SCRIPT_ROOT+'/get/users/form',
      type: 'GET',
      dataType: 'json',
      success: function (data) {
        crops=data["role"];
        for (key in data["role"]){
        $('#role').append($('<option>', {
                      value: data["role"][key].roleID,
                      text: data["role"][key].roleName
                  }));
        }
      },
      error: function (request, message, error) {
          console.log(error);
      }
  });
}
function validatePassword(password,confirm_password){
  var password = $("#"+password).val();
  var confirmPassword = $("#"+confirm_password).val();

  if (password != confirmPassword){
    $("#divCheckPassword").html('<label class="error">Passwords do not match!</label>');
    $("#divReCheckPassword").html('<label class="error">Passwords do not match!</label>');
    return false;
  }
  else {
    $("#divCheckPassword").html("");
    $("#divReCheckPassword").html("");
    return true;
  }
}
$(document).ready(function () {

  table_user=$('#table_user').DataTable({
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
      { "width": '29%' },
      { "width": '28%' },
      { "width": '13%'},
      { "width": '5%' },
      { "width": '5%' },
      { "width": '5%' }
      ]
  });
  get_user_data();
})

function load_reset_password_modal(element){
  $("#pass_email").val(element.id);
  $("#pass_password").val('');
  $("#pass_confirm").val('');
  $("#divReCheckPassword").html("");
  resetForm('password_form');
}
function load_user_model(element){
  $("#divCheckPassword").html("");
  if (element.id == "add_row"){
    resetForm('user_form');
    $("#id").hide();
    $("#name").val('');
    $("#email").val('');
    $("#email").removeAttr('readonly');
    $("#role").val('');
    $("#password").val('');
    $("#confirm").val('');
    $("#addRowButton").text('Create');
    $("#new_password_div").show();
    $("#new_re_password_div").show();
  }
  else {
  	data=users_data.find(x => x.id === parseInt(element.id))
    $("#id").show();
    $("#id").val(data.id);
    $("#name").val(data.name);
    $("#email").val(data.email);
    $("#email").attr('readonly','');
    $("#role").val(data.role);
    $("#addRowButton").text('Update');
    $("#new_password_div").hide();
    $("#new_re_password_div").hide();
    resetForm('user_form');
    $('#user_form').valid();
  }

}
$('#addRowButton').click(function() {
  if($('#user_form').valid() && validatePassword('password','confirm')){
    $("#Adduser").modal('hide');
    var data = new FormData();
    var form_data=$('#user_form').serializeArray();
    $.each(form_data, function (key, input) {
        data.append(input.name, input.value);
    });
    if ($("#addRowButton").text()=='Create'){
      $.ajax({
          url: '/post/insert/user',
          data: data,
          type: 'POST',
          processData: false,
          contentType: false,
          success: function(response){
            $.toast({
                    heading: 'Succefully Created User',
                    text: 'Data will be updated the next time you reload the page',
                    position: 'top-right',
                    loaderBg: '#ff6849',
                    icon: 'success',
                    hideAfter: 5000,
                    stack: 6
                });
                get_user_data();
          },
          error: function(resp){
            if (resp.responseJSON.Error=='UserExists'){
              $.toast({
                      heading: 'User with email alread exists',
                      text: '',
                      position: 'top-right',
                      loaderBg: '#ff6849',
                      icon: 'error',
                      hideAfter: 5000
                  });
            }
            else{
              $.toast({
                      heading: 'User Creation failed',
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
    else{
      $.ajax({
          url: '/post/update/user',
          data: data,
          type: 'POST',
          processData: false,
          contentType: false,
          success: function(response){
            $.toast({
                    heading: 'Succefully Updated User',
                    text: 'Data will be updated the next time you reload the page',
                    position: 'top-right',
                    loaderBg: '#ff6849',
                    icon: 'success',
                    hideAfter: 5000,
                    stack: 6
                });
                get_user_data();
          },
          error: function(resp){
            if (resp.Error=='UserNotExists'){
              $.toast({
                      heading: 'User with email does not exists',
                      text: '',
                      position: 'top-right',
                      loaderBg: '#ff6849',
                      icon: 'error',
                      hideAfter: 5000
                  });
            }
            else{
              $.toast({
                      heading: 'User Updation failed',
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
  }
});

$('#reset_password').click(function() {
  if($('#password_form').valid() && validatePassword('pass_password','pass_confirm')){
    $("#ResetPassword").modal('hide');
    var data = new FormData();
    var form_data=$('#password_form').serializeArray();
    $.each(form_data, function (key, input) {
        data.append(input.name, input.value);
    });

    $.ajax({
        url: '/post/update/user/password',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response){
          $.toast({
                  heading: 'Succefully Updated User Password',
                  text: 'Data will be updated the next time you reload the page',
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'success',
                  hideAfter: 5000,
                  stack: 6
              });


        },
        error: function(resp){
          if (resp.Error=='UserExists'){
            $.toast({
                    heading: 'User with email alread exists',
                    text: '',
                    position: 'top-right',
                    loaderBg: '#ff6849',
                    icon: 'error',
                    hideAfter: 5000
                });
          }
          else{
            $.toast({
                    heading: 'User Password Update failed',
                    text: '',
                    position: 'top-right',
                    loaderBg: '#ff6849',
                    icon: 'error',
                    hideAfter: 5000
                }); 
          }
        }
      });
  }
});
function delet_row(element){
  var data = new FormData();
  data.append('UserID',element.id.split('_')[1])
  if($('#'+ element.id +':checked').val()){
    data.append('Status','true')
  }
  else{
    data.append('Status','false')
  }
  $.ajax({
        url: '/post/update/user/status',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response){
          $.toast({
                  heading: 'Succefully Updated User Status',
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
                  text: error,
                  position: 'top-right',
                  loaderBg: '#ff6849',
                  icon: 'error',
                  hideAfter: 5000
              });
        }
      });
}