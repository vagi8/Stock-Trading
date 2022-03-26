var data_campaigns;
var campaign_all;
var row_data;
var campaign_one;
var channel_one;
var targetlist_one;
var broadcastlog_one;
function publish_campaigns_data(data){
	campaign_all.clear();
	campaign_all.draw();
	data=data.sort(function(a, b){
    	return a.CampaignID - b.CampaignID;
	});
	data_campaigns=data;
	for (key in data){
		if (key == 100){
			break;
		}
		var status=data[key]["Status"]
		var color=''
		if (status == 'Created'){
			color='black'
		}
		else if (status == 'Completed'){
			color='green'
		}
		else if (status == 'Error'){
			color='red'
		}
		else if (status == 'InProgress'){
			color='goldenrod'
		}
		status='<div style="display:grid; color:'+ color +';">'+ status +'</div>'
	    campaign_all.row.add( [
            data[key]["CampaignID"],
            data[key]["Name"],
            data[key]["Description"],
            data[key]["Group"],
            data[key]["InitiatedBy"],
            data[key]["StartDate"],
            data[key]["CreatedDate"],
            status
        ]).node().id='rowid_'+data[key]["CampaignID"];
        campaign_all.draw( false );
 	}
}
function get_campaign_data(){
	$('#campaign_all_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/campaigns',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
	    	$('#campaign_all_wrapper').show();
	    	publish_campaigns_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_campaign_chanels(data,channels){

	channel_one.clear();
	channel_one.draw();
	for (key in data){
		var status=data[key]["Status"]
		var color=''
		if (status == 'Completed'){
			color='green'
		}
		else if (status == 'Error'){
			color='red'
		}
		else if (status == 'InProgress'){
			color='goldenrod'
		}
		status='<div style="display:grid; color:'+ color +';">'+ status +'</div>'
		channel_one.row.add([
	            data[key]["CampaignTargetChannelID"],
	            data[key]["ChannelID"],
	            channels.find(x => x.ChannelID===data[key]["ChannelID"]).Channel,
	            status,
	            data[key]["Comments"]
	        ]).node().id='rowid_'+data[key]["CampaignTargetChannelID"];
	        channel_one.draw( false );
	}
	$('#TargetedChannels').text(data.length);
}
function publish_campaign_targetlist(data){
	targetlist_one.clear();
	targetlist_one.draw();
	for (key in data){
		targetlist_one.row.add([
	            data[key]["CampaignTargetID"],
	            data[key]["FarmerID"],
	            data[key]["FarmerName"]
	        ]).node().id='rowid_'+data[key]["CampaignTargetID"];
	        targetlist_one.draw( false );
	}
	$('#TargetedContacts').text(data.length);
}
function publish_campaign_details(data){
	campaign_one.clear();
	campaign_one.draw();
	var status=data["Status"]
	var color=''
	if (status == 'Completed'){
		color='green'
	}
	else if (status == 'Error'){
		color='red'
	}
	else if (status == 'InProgress'){
		color='goldenrod'
	}
	status='<div style="display:grid; color:'+ color +';">'+ status +'</div>'
    campaign_one.row.add( [
        data["CampaignID"],
        data["Name"],
        data["Description"],
        data["Group"],
        data["InitiatedBy"],
        data["StartDate"],
        data["CreatedDate"],
        status
    ]).node().id='rowid_'+data["CampaignID"];
    campaign_one.draw( false );
}
function publish_broadcast_data(data){
	broadcastlog_one.clear();
	broadcastlog_one.draw();
	for (key in data){
		if (key == 100){
			break;
		}
		var status=data[key]["Status"]
		var color=''
		if (status == 'Completed'){
			color='green'
		}
		else if (status == 'Error'){
			color='red'
		}
		else if (status == 'InProgress'){
			color='goldenrod'
		}
		status='<div style="color:'+ color +';">'+ status +'</div>'
	    broadcastlog_one.row.add( [
            data[key]["BrodcastID"],
            data[key]["FarmerName"],
            data[key]["FarmerID"],
            data[key]["Channel"],
            data[key]["CreatedDate"],
            status,
        ]).node().id='rowid_'+data[key]["BrodcastID"];
        broadcastlog_one.draw( false );
 	}
 	var Completed=data.filter(x=>x.Status==="Completed").length
	$('#SuccessfulMessages').text(Completed);
	var Errors=data.filter(x=>x.Status==="Error").length
	$('#ErrorMessages').text(Errors);
}
function get_campaign_details(id){
	publish_campaign_details(row_data);
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/campaign/details/'+id,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_campaign_chanels(data['TargetChannel'],data['channels']);
	    	publish_campaign_targetlist(data['TargetList']);
	    	publish_broadcast_data(data['BroadcastLog']);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function table_initialization(){
	campaign_all = $('#campaign_all').DataTable({
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
	    { "width": '20%' },
	    { "width": '20%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '5%' }
	    ]
	});
	campaign_one = $('#campaign_one').DataTable({
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
	    { "width": '20%' },
	    { "width": '20%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '5%' }
	    ]
	});
	channel_one = $('#channel_one').DataTable({
	  dom: 'Bfrtip',
	  buttons: [
	    'copy', 'csv', 'excel', 'pdf', 'print'
	  ],
	  'paging'      : true,
	  'lengthChange': false,
	  'searching'   : true,
	  'ordering'    : true,
	  'info'        : true,
	  'autoWidth'   : false
	});
	targetlist_one = $('#targetlist_one').DataTable({
	  dom: 'Bfrtip',
	  buttons: [
	    'copy', 'csv', 'excel', 'pdf', 'print'
	  ],
	  'paging'      : true,
	  'lengthChange': false,
	  'searching'   : true,
	  'ordering'    : true,
	  'info'        : true,
	  'autoWidth'   : false
	});
	broadcastlog_one=$('#broadcastlog_one').DataTable({
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
$(document).ready(function(){
	table_initialization();
	$('#back_button').click();
	get_campaign_data();
});
$('#campaign_all').on('click', 'tbody tr', function() {
	var id=parseInt(this.id.split('_')[1]);
	row_data=data_campaigns.find(x => x.CampaignID === id);

	if (row_data['Status']=='Created' || row_data['Status']=='Cancelled'){
		$('#cancel_funtions').hide();
		$('#edit_funtions').show();
		$('#campaign_duplicate_button').hide();
	}
	else if(row_data['Status']=='Completed'){
		$('#cancel_funtions').hide();
		$('#campaign_duplicate_button').show();
		$('#edit_funtions').hide();
	}
	else if(row_data['Status']=='Scheduled'){
		$('#campaign_duplicate_button').hide();
		$('#edit_funtions').hide();
		$('#cancel_funtions').show();
	}
	else{
		$('#cancel_funtions').hide();
		$('#edit_funtions').hide();
		$('#campaign_duplicate_button').hide();
	}
	get_campaign_details(id);
	$('#all_campaigns').hide();
	$('#campaign_details').show();
	$('#back_button').show();
	$('#campaign_channels').show();
	$('#campaign_targetlist').show();
	$('#campaign_broadcastlog').show();
	$('#CampaignAnalytics').show();
	// $('#campaign_media').show();
});
$('#back_button').on('click', function() {
	$('#all_campaigns').show();
	$('#back_button').hide();
	$('#campaign_details').hide();
	$('#campaign_channels').hide();
	$('#campaign_targetlist').hide();
	$('#campaign_broadcastlog').hide();
	// $('#campaign_media').hide();
	$('#CampaignAnalytics').hide();
	row_data=''
});
$('#edit_campaign_details').on('click',function(){
	window.location.href= $SCRIPT_ROOT+'/Campaign/Edit/'+row_data["CampaignID"];
});
$('#delete_campaign_details').on('click',function(){
	var campid=row_data['CampaignID']
	$('#back_button').click();
	$('#campaign_all_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
		url: '/post/update/campaign/delete/'+campid,
		type: 'POST',
		success: function(response){
			$.toast({
	            heading: 'Succefully Deleted',
	            text: '',
	            position: 'top-right',
	            loaderBg: '#ff6849',
	            icon: 'success',
	            hideAfter: 5000,
	            stack: 6
	        });
	        $('#loader_div').remove();
	    	$('#campaign_all_wrapper').show();
	        get_campaign_data();
			
		},
		error: function(error){
			console.log(error);
			$.toast({
	            heading: 'Deletion Failure',
	            text: error.responseJSON.Error,
	            position: 'top-right',
	            loaderBg: '#ff6849',
	            icon: 'error',
	            hideAfter: 5000
	        });
	        $('#loader_div').remove();
	    	$('#campaign_all_wrapper').show();
	        get_campaign_data();
		}
	});
});
$('#campaign_duplicate_campaign').on('click',function(){
	var campid=row_data['CampaignID']
	$('#back_button').click();
	$('#campaign_all_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
		url: '/post/insert/campaign/duplicate/'+campid,
		type: 'POST',
		success: function(response){
			CampaignID=parseInt(response.CampaignID);
			$.toast({
	            heading: 'Succefully Duplicated Campaign',
	            text: 'CampaignID = '+CampaignID,
	            position: 'top-right',
	            loaderBg: '#ff6849',
	            icon: 'success',
	            hideAfter: 5000,
	            stack: 6
	        });
	        $('#loader_div').remove();
	    	$('#campaign_all_wrapper').show();
			get_campaign_data();
			
		},
		error: function(error){
			console.log(error);
			$.toast({
	            heading: 'Campaign Failure',
	            text: error.responseJSON.Error,
	            position: 'top-right',
	            loaderBg: '#ff6849',
	            icon: 'error',
	            hideAfter: 5000
	        });
			$('#loader_div').remove();
	    	$('#campaign_all_wrapper').show();
	        get_campaign_data();
		}
	});
});
$('#cancel_campaign_details').on('click',function(){
	var campid=row_data['CampaignID']
	swal({   
        title: "NOTE",   
        text: "Campaigns with status `Scheduled` can only be cancelled if the time left for campaign is more than 10 minutes",   
        type: "warning",   
        confirmButtonText: "OK",   
        closeOnConfirm: true 
    }, function(){
    	$('#back_button').click();
		$('#campaign_all_wrapper').hide();
		$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
        $.ajax({
			url: '/post/update/campaign/cancel/'+campid,
			type: 'POST',
			success: function(response){
				$.toast({
		            heading: 'Succefully Cancelled Campaign',
		            text: '',
		            position: 'top-right',
		            loaderBg: '#ff6849',
		            icon: 'success',
		            hideAfter: 5000,
		            stack: 6
		        });
				$('#loader_div').remove();
		    	$('#campaign_all_wrapper').show();
				get_campaign_data();
				
			},
			error: function(error){
				if (error.responseJSON.Error=='Invalid'){
					$.toast({
			            heading: 'Scheduled time has less than 10 minutes, Cannot be deleted',
			            text: error.responseJSON.Error,
			            position: 'top-right',
			            loaderBg: '#ff6849',
			            icon: 'error',
			            hideAfter: 5000
			        });
					$('#loader_div').remove();
			    	$('#campaign_all_wrapper').show();
			        get_campaign_data();
			    }
			    else{
			    	$.toast({
			            heading: 'Error',
			            text: error.responseJSON.Error,
			            position: 'top-right',
			            loaderBg: '#ff6849',
			            icon: 'error',
			            hideAfter: 5000
			        });
					$('#loader_div').remove();
			    	$('#campaign_all_wrapper').show();
			        get_campaign_data();
			    }

			}
		});
    });
});