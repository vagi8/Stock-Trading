var table_subscription;
function publish_appsetting_data(data){
	$('#DateFormat').val(data[0]['DateFormat']);
	$('#NumberSeparator').val(data[0]['NumberSeparator']);
	$('#Language').val(data[0]['Language']);
	$('#MaxMediaSize').val((data[0]['MaxMediaSize'])/1000000);
	$('#WorkHoursStartFrom').val(data[0]['WorkHoursStartFrom'].split('+')[0]);
	$('#WorkHoursEndBy').val(data[0]['WorkHoursEndBy'].split('+')[0]);
	$('#WorkWeekStartDay').val(data[0]['WorkWeekStartDay']);
	$('#WorkWeekEndDay').val(data[0]['WorkWeekEndDay']);
	$('#DefaultCountryCode').val(data[0]['DefaultCountryCode']);
	$('#MobileNoLength').val(data[0]['MobileNoLength']);
	$('#IDNoType').val(data[0]['IDNoType']);
	$('#IDNoLength').val(data[0]['IDNoLength']);
	$('#OOFM').val(data[0]['OofMessage']);
	if (data[0]['OOF']==true) $('#OOF').prop('checked',true);
	$('#OOF').change();
}
function publish_org_data(data){
	$('#OrganizationID').val(data[0]['OrganizationID']);
	$('#OrganizationName').val(data[0]['OrganizationName']);
	$('#RegisterationNumber').val(data[0]['RegisterationNumber']);
	$('#PrimaryContactName').val(data[0]['PrimaryContactName']);
	$('#PrimaryContactDesignation').val(data[0]['PrimaryContactDesignation']);
	$('#PrimaryContactMobileNo').val(data[0]['PrimaryContactMobileNo']);
	$('#PrimaryContactEmail').val(data[0]['PrimaryContactEmail']);
	$('#BillingContactName').val(data[0]['BillingContactName']);
	$('#BillingContactDesignation').val(data[0]['BillingContactDesignation']);
	$('#BillingContactMobileNo').val(data[0]['BillingContactMobileNo']);
	$('#BillingContactEmail').val(data[0]['BillingContactEmail']);
}
function get_org_data(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/org',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_org_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function get_form_data(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/orgsettings',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_appsetting_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_orgsubs_data(data){
  	table_subscription.clear();
  	table_subscription.draw();
	for (key in data){
	    table_subscription.row.add([
	    	data[key]["SubscriptionID"],
	        data[key]["ChannelID"],
	        data[key]["ChannelName"],
	        data[key]["NoAllotedMessages"],
	        data[key]["NoConsumedMessages"],
	        data[key]["NoRemainingMessages"],
	      	]).node().id='rowid_'+data[key]["OrganizationSubscriptionID"]
	 	table_subscription.draw( false );
 	}
}
function get_subscription_data(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/orgsubscriptions',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_orgsubs_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function tables_initialization(){
  table_subscription=$('#table_subscription').DataTable({
    dom: 'Bfrtip',
    buttons: [
      'copy', 'csv', 'excel', 'pdf', 'print'
    ],
    'paging'      : true,
    'lengthChange': false,
    'searching'   : true,
    'ordering'    : true,
    'info'        : true,
  });
}
$(document).ready(function(){
	$('#tab_content').hide()
    $('#loader_placer').append('<div style="margin-left: 400px;" class="loader" id="loader_div"></div>');
	tables_initialization();
});
$( document ).ajaxStop(function() {
 	$('#loader_div').remove();
	$('#tab_content').show();
});
//$('#submit_details').on('click',function(){
//	var data = new FormData();
//    var form_data=$('#edit_app_settings').serializeArray();
//    $.each(form_data, function (key, input) {
//        data.append(input.name, input.value);
//    });
//    if($('#OOF:checked').val()){
//    	data.append('OOF','true')
//  	}
//  	else{
//    	data.append('OOF','false')
//  	}
//	$.ajax({
//			url: '/post/update/orgsettings',
//			data: data,
//			type: 'POST',
//            processData: false,
//            contentType: false,
//			success: function(response){
//				$.toast({
//		            heading: 'Succefully Updated App setting',
//		            text: '',
//		            position: 'top-right',
//		            loaderBg: '#ff6849',
//		            icon: 'success',
//		            hideAfter: 5000,
//		            stack: 6
//		        });
//			},
//			error: function(error){
//				console.log(error);
//				$.toast({
//		            heading: 'Update Failure',
//		            text: error.responseJSON.Error,
//		            position: 'top-right',
//		            loaderBg: '#ff6849',
//		            icon: 'error',
//		            hideAfter: 5000
//		        });
//			}
//		});
//});