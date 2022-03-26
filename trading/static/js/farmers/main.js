var farmers_all;
var farmer_one;
var crop_one;
var land_one;
var channel_one;
var data_farmers;
var row_data;
var crops;
var resp;
var org_settings;
var broadcast_log;
var log;
var row_tag;
function publish_farmers_data(data){
	data=data.sort(function(a, b){
    	return a.FarmerID - b.FarmerID;
	});
	farmers_all.clear();
	farmers_all.draw();
	data_farmers=data;
	for (key in data){
		if (key == 100){
			break;
		}
		status='unchecked'
	    if (data[key]['Status']==true){
	      status='checked'
	    }
	    farmers_all.row.add([
            data[key]["FarmerID"],
            data[key]["FirstName"]+' '+data[key]["LastName"],
            data[key]["Gender"],
            data[key]["MobileNo"],
            data[key]["IDNo"],
            data[key]["Geography"],
            data[key]["FarmerGroupName"],
            '<div class="form-button-action">\
				<div class="demo-checkbox checkbox-datatable">\
					<input disabled id=delete_'+data[key]["FarmerID"]+' name=delete_'+data[key]["FarmerID"]+' type="checkbox" class="filled-in" '+status+' />\
					<label for=delete_'+data[key]["FarmerID"]+' class="block" ></label>\
				</div>\
			</div>'
        ]).node().id='rowid_'+data[key]["FarmerID"]
 	farmers_all.draw( false );
 	} 	
}
function publish_farmer_data(data){
	status='unchecked'
    if (data['Status']==true){
      status='checked'
    }
	farmer_one.clear();
	farmer_one.draw();
	farmer_one.row.add( [
            data["FarmerID"],
            data["FirstName"]+' '+data["LastName"],
            data["Gender"],
            data["MobileNo"],
            data["IDNo"],
            data["Geography"],
            data["FarmerGroupName"],
            '<div class="form-button-action">\
				<div class="demo-checkbox checkbox-datatable">\
					<input id=deleterow_'+data["FarmerID"]+' name=deleterow_'+data["FarmerID"]+' onchange="delete_row(this);" type="checkbox" class="filled-in" '+status+' />\
					<label for=deleterow_'+data["FarmerID"]+' class="block" ></label>\
				</div>\
			</div>'
        ]).node().id='rowid_'+data["FarmerID"]
 	farmer_one.draw( false );
	success_log= broadcast_log.filter(function(item) {
	  
	    if (item['FarmerID'] === data["FarmerID"] && item['Status'] === 'Completed')
	      {return true;}
	  return false;
	});
	success=success_log.length;
	error= broadcast_log.filter(function(item) {
	  
	    if (item['FarmerID'] === data["FarmerID"] && item['Status'] === 'Error')
	      {return true;}
	  return false;
	}).length;
	$('#SuccessfulMessages').text(success);
	$('#ErrorMessages').text(error);
	try{
		var one_day = 1000 * 60 * 60 * 24;
		var MaxDate=new Date(success_log.reduce((a,b)=>a.CreatedDate>b.CreatedDate?a:b).CreatedDate);
		var NoDays=(Math.round(new Date().getTime()-MaxDate.getTime())/(one_day)).toFixed(0);
		$('#LastInteracted').text(NoDays+' Days Ago');
	}
	catch{
		$('#LastInteracted').text('No');
	}
}
function get_farmer_data(id){
	$('#farmer_all_wrapper').hide();
	$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/'+id,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	$('#loader_div').remove();
	 		$('#farmer_all_wrapper').show();
	    	if (id==0){
	    		broadcast_log=data['broadcastlog'];
		    	publish_farmers_data(data['farmers']);
	 		}
	 		else{
	 			publish_farmer_data(data['farmers'][0]);
	 			row_data=data[0];
	 		}
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_crops_data(data){
	crop_one.clear();
	crop_one.draw();
	$('#FarmerCropID').empty()
	for (key in data){
	    crop_one.row.add( [
            data[key]["FarmerCropID"],
            data[key]["LastName"],
            data[key]["CropName"],
            data[key]["DatePlanting"],
            data[key]["YieldDate"],
            data[key]["LandArea"],
            data[key]["LandType"],
            data[key]["SoilType"],
        ]).node().id='rowid_'+data[key]["FarmerCropID"]
 	crop_one.draw( false );
   	$('#FarmerCropID').append($('<option>', {
                value: 'rowid_'+data[key].FarmerCropID,
                text: data[key].FarmerCropID
            })); 
	}
}
function get_crops_data(id){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/crops/'+id,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_crops_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_lands_data(data){
	land_one.clear();
	land_one.draw();
	$('#FarmerLandID').empty()
	for (key in data){
	    land_one.row.add( [
            data[key]["FarmerLandID"],
            data[key]["LastName"],
            data[key]["LandArea"],
            data[key]["LandType"],
            data[key]["District"],
            data[key]["Locality"],
            data[key]["OwnershipType"],
            data[key]["WaterSourceType"],
            data[key]["Latitude"] +' , '+data[key]["Longitude"],
            data[key]["SoilType"],
        ]).node().id='rowid_'+data[key]["FarmerLandID"]
 	land_one.draw( false );
 	$('#FarmerLandID').append($('<option>', {
                value: 'rowid_'+data[key].FarmerLandID,
                text: data[key].FarmerLandID
            })); 
 	}
}
function get_lands_data(id){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/lands/'+id,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_lands_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_channels_data(data){
	channel_one.clear();
	channel_one.draw();
	for (key in data){
	    channel_one.row.add( [
            data[key]["FarmerChannelID"],
            data[key]["LastName"],
            data[key]["ChannelName"],
            data[key]["Status"]
        ]).node().id='rowid_'+data[key]["FarmerChannelID"]
 	channel_one.draw( false );
 	}
	$('#ActiveChannels').text(data.length);
}
function get_channels_data(id){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/channels/'+id,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_channels_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_tags_data(data){
	$('#TagsDiv').html('')
	var e1='<div class="media media-single"><span class="font-size-24 text-success"><i class="fa fa-star"></i></span><span class="title">'
	var e2='</span></div>'
	for (key in data){
		$('#TagsDiv').append(e1+data[key]['TagName']+e2);
 	}
}
function get_tags_data(id){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/farmers/tags/'+id,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	row_tag=data;
	    	publish_tags_data(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_org_settings(data){
	org_settings=data;
	if (org_settings[0].MobileNoLength>0){
		$('#MobileNo').attr('minlength',org_settings[0].MobileNoLength);
		// $('#MobileNo').attr('maxlength',org_settings[0].MobileNoLength);
	}
	if (org_settings[0].IDNoLength>0){
		$('#IDNo').attr('maxlength',org_settings[0].IDNoLength);
		$('#IDNo').attr('minlength',org_settings[0].IDNoLength);
	}
	if (org_settings[0].IDNoType.length>0){
		$('#IDNo').attr('type',org_settings[0].IDNoType);
	}
}
function get_org_settings(){
	$.ajax({
	 	url: $SCRIPT_ROOT+'/get/organizationsettings',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_org_settings(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function tables_initialization(){
	//defining all farmers table
	farmers_all = $('#farmer_all').DataTable({
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
	    { "width": '15%' },
	    { "width": '20%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '5%' },
	    { "width": '5%' }
	    ],
	    // ajax:{
	    // 	url: $SCRIPT_ROOT+'/get/farmers',
	    // 	type: 'GET',
	    // 	dataType: 'json',
	    // },
	    // columns: [
     //        { data: "FarmerID" },
     //        { data: "FirstName"+"LastName" },
     //        { data: "MobileNo" },
     //        { data: "IDNo" },
     //        { data: "Geography" },
     //        { data: "CreatedBy" }
     //        ]
	});
	farmer_one = $('#farmer_one').DataTable({
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
	    { "width": '15%' },
	    { "width": '20%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '5%' },
	    { "width": '5%' }
	    ]
	});
	crop_one = $('#crop_one').DataTable({
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
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    { "width": '10%' },
	    ]
	});
	land_one = $('#land_one').DataTable({
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
	    { "width": '2%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '15%' },
	    { "width": '11%' },
	    { "width": '10%' },
	    { "width": '1%' },
	    { "width": '1%' },
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
	  'autoWidth'   : false,
	   "columns" : [
	    { "width": '25%' },
	    { "width": '25%' },
	    { "width": '25%' },
	    { "width": '25%' },
	    ]
	});
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
	 	url: $SCRIPT_ROOT+'/get/farmers/form',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	// update_modal(data["CropCategoryName"],"CropCategoryName");
	    	// update_modal(data["CropSector"],"CropSector");
	    	update_modal(data["OwnershipType"],"OwnershipType");
	    	update_modal(data["WaterSourceType"],"WaterSourceType");
	    	update_modal(data["LandType"],"LandType");
	    	update_modal(data["SoilType"],"SoilType");
	    	update_modal(data["SoilType"],"CropSoilType");
	    	update_modal(data["LandType"],"CropLandType");
	    	crops=data["CropName"];
	    	for (key in data["CropName"]){
				$('#CropName').append($('<option>', {
			                value: data["CropName"][key].CropID,
			                text: data["CropName"][key].CropName
			            }));
			}
			for (key in data["FarmerGroup"]){
				$('#FarmerGroup').append($('<option>', {
			                value: data["FarmerGroup"][key].FarmerGroupID,
			                text: data["FarmerGroup"][key].GroupName
			            }));
			}
		},
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
$(document).ready(function(){
	tables_initialization();
	$('#back_button').click();
	get_farmer_data(0);
	modal_initialization();
	get_org_settings();
	update_telephone('CountryCode');
});
function CheckNationalID(){
	return true;
	var idno=String($('#IDNo').val());
	if (idno.length!=13) return false;
	var now=new Date()
	now_yr=now.getFullYear().toString().slice(2,4)
	var yr=''
	if (now_yr>idno.slice(0,2)) yr=now.getFullYear().toString().slice(0,2)+idno.slice(0,2)
	else yr=String(now.getFullYear().toString().slice(0,2)-1)+idno.slice(0,2)
	if (idno.slice(2,4)-1<7){
		if ((idno.slice(2,4)-1) % 2){
			if (idno.slice(4,6)>30) return false;
		}
		else{
			if (idno.slice(4,6)>31) return false;	
		}
	}
	else if (12 > idno.slice(2,4)-1 && idno.slice(2,4)-1>6){
		if ((idno.slice(2,4)-1) % 2){
			if (idno.slice(4,6)>31) return false;
		}
		else{
			if (idno.slice(4,6)>30) return false;	
		}
	}
	else return false;
	var date = new Date(yr, idno.slice(2,4)-1,idno.slice(4,6));
	if (!date) return false;
	var g=$('#Gender').val();
	if (g=='Male'){
		if (10000>idno.slice(6,10) && idno.slice(6,10)>5000) return true;
		return false;
	}
	else if (g=='Female'){
		if (5000>idno.slice(6,10) && idno.slice(6,10)>-1) return true;
		return false;
	}
	return false;
}
$('#farmer_all').on('click', 'tbody tr', function() {
	var id=parseInt(this.id.split('_')[1]);
	row_data=data_farmers.find(x => x.FarmerID === id);
	publish_farmer_data(row_data);
	get_crops_data(id);
	get_channels_data(id);
	get_lands_data(id);
	get_tags_data(id);
	$('#all_farmers').hide();
	$('#farmer_details').show();
	$('#back_button').show();
	$('#farmer_crops').show();
	$('#farmer_lands').show();
	$('#farmer_channels').show();
	$('#farmer_tags').show();
	$('#CampaignAnalytics').show();
});
$('#back_button').on('click', function() {
	$('#all_farmers').show();
	$('#back_button').hide();
	$('#farmer_details').hide();
	$('#farmer_crops').hide();
	$('#farmer_lands').hide();
	$('#farmer_channels').hide();
	$('#farmer_tags').hide();
	$('#CampaignAnalytics').hide();
});
$('#add_farmer_details').on('click', function() {
	resetForm('edit_farmer_details_form');
	$('#CountryCode').val(org_settings[0].DefaultCountryCode);
	$("#ErrordivNationalID").html('');
	$('#DivFarmerID').hide();
	$('#FirstName').val('');
	$('#LastName').val('');
	$('#Gender').val('');
	$('#MobileNo').val('');
	$('#IDNo').val('');
	$('#Geography').val('');
	$('#FarmerGroup').val('');
	$('#FarmerTags').tagsinput('removeAll');
	$("#submit_farmer_details").text('Create');
});
$('#edit_farmer_details').on('click', function() {
	var code=parseInt(String(row_data["MobileNo"]).slice(0,String(row_data["MobileNo"]).length-org_settings[0].MobileNoLength))
	var mobile=parseInt(String(row_data["MobileNo"]).slice(String(row_data["MobileNo"]).length-org_settings[0].MobileNoLength))
	$("#ErrordivNationalID").html('');
	$('#DivFarmerID').show();
	$('#FarmerID').val(row_data["FarmerID"]);
	$('#FirstName').val(row_data["FirstName"]);
	$('#LastName').val(row_data["LastName"]);
	$('#Gender').val(row_data["Gender"]);
	$('#MobileNo').val(mobile);
	$('#CountryCode').val(code);
	$('#IDNo').val(row_data["IDNo"]);
	$('#Geography').val(row_data["Geography"]);
	$('#FarmerGroup').val(row_data["FarmerGroupID"]);
	$("#submit_farmer_details").text('Update');
	$('#FarmerTags').tagsinput('removeAll');
	for (i in row_tag){
		$('#FarmerTags').tagsinput('add',row_tag[i]['TagName']);
	}
	resetForm('edit_farmer_details_form');
	$('#edit_farmer_details_form').valid();
});
$('#submit_farmer_details').on('click', function() {
	if ($('#edit_farmer_details_form').valid() && CheckNationalID()){
		$("#edit_farmer_details_modal").modal('hide')
		if ($("#submit_farmer_details").text()==='Update'){
			$.ajax({
					url: '/post/update/farmer/details',
					data: $('#edit_farmer_details_form').serialize(),
					type: 'POST',
					success: function(response){
						get_farmer_data(parseInt(row_data.FarmerID));
						get_tags_data(parseInt(row_data.FarmerID));
						$.toast({
				            heading: 'Succefully Updated Farmer Details',
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
		else{
			$.ajax({
					url: '/post/insert/farmer',
					data: $('#edit_farmer_details_form').serialize(),
					type: 'POST',
					success: function(response){
						get_farmer_data(0);
						$.toast({
				            heading: 'Succefully Updated Farmer Details',
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
	}
	else if ($('#edit_farmer_details_form').valid()){
		$("#ErrordivNationalID").html('<label class="error">Incorrect National ID</label>');
	}
});
$('#add_crop_details').on('click',function(){
	resetForm('edit_farmer_crops_form');
	$('#DivFarmerCropID').hide();
	$('#CropName').val('');
	$('#DatePlanting').val('');
	$('#YieldDate').val('');
	$('#CropLandArea').val('');
	$('#CropLandType').val('');
	$('#CropSoilType').val('');
	$("#submit_crop_details").text('Create');
});
$('#edit_crop_details').on('click',function(){
	$('#DivFarmerCropID').show();
	$('#FarmerCropID').change();
	$("#submit_crop_details").text('Update');
	resetForm('edit_farmer_crops_form');
});
$('#FarmerCropID').on('change', function() {
	id=this.value
	data=crop_one.row('#'+id).data()
	temp_crop=crops.find(x => x.CropName===data[2])
	$('#CropName').val(temp_crop.CropID);
	$('#DatePlanting').val(data[3]);
	$('#YieldDate').val(data[4]);
	$('#CropLandArea').val(data[5]);
	$('#CropLandType').val(data[6]);
	$('#CropSoilType').val(data[7]);
	$('#edit_farmer_crops_form').valid();
});
$('#submit_crop_details').on('click', function() {
	if ($('#edit_farmer_crops_form').valid()){
		$("#edit_farmer_crops_modal").modal('hide')
		if ($("#submit_crop_details").text()==='Update'){
			$.ajax({
					url: '/post/update/farmer/crops',
					data: $('#edit_farmer_crops_form').serialize(),
					type: 'POST',
					success: function(response){
						get_crops_data(row_data.FarmerID);
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
		else{
			$.ajax({
					url: '/post/insert/farmer/crops',
					data: $('#edit_farmer_crops_form').serialize()+"&FarmerID="+parseInt(row_data["FarmerID"]),
					type: 'POST',
					success: function(response){
						get_crops_data(row_data.FarmerID);
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
	}
});
$('#add_land_details').on('click',function(){
	resetForm('edit_farmer_lands_form');
	$('#DivFarmerLandID').hide();
	$('#LandArea').val('');
	$('#LandType').val('');
	$('#District').val('');
	$('#Locality').val('');
	$('#OwnershipType').val('');
	$('#WaterSourceType').val('');
	$('#Latitude').val('');
	$('#Longitude').val('');
	$('#SoilType').val('');
	$("#submit_land_details").text('Create');
});
$('#edit_land_details').on('click',function(){
	$('#DivFarmerLandID').show();
	$('#FarmerLandID').change();
	$("#submit_land_details").text('Update');
	resetForm('edit_farmer_lands_form');
});
$('#FarmerLandID').on('change', function(){
	id=this.value
	data=land_one.row('#'+id).data()
	$('#LandArea').val(data[2]);
	$('#LandType').val(data[3]);
	$('#District').val(data[4]);
	$('#Locality').val(data[5]);
	$('#OwnershipType').val(data[6]);
	$('#WaterSourceType').val(data[7]);
	temp =data[8].split(' , ')
	$('#Latitude').val(temp[0]);
	$('#Longitude').val(temp[1]);
	$('#SoilType').val(data[9]);
	$('#edit_farmer_lands_form').valid();
});
$('#submit_land_details').on('click', function(){
	if ($('#edit_farmer_lands_form').valid()){
		$("#edit_farmer_lands_modal").modal('hide');
		if ($("#submit_land_details").text()==='Update'){
			$.ajax({
					url: '/post/update/farmer/lands',
					data: $('#edit_farmer_lands_form').serialize(),
					type: 'POST',
					success: function(response){
						get_lands_data(row_data.FarmerID);
						$.toast({
				            heading: 'Succefully Updated Land Details',
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
		else{
			$.ajax({
					url: '/post/insert/farmer/lands',
					data: $('#edit_farmer_lands_form').serialize()+"&FarmerID="+parseInt(row_data["FarmerID"]),
					type: 'POST',
					success: function(response){
						get_lands_data(row_data.FarmerID);
						$.toast({
				            heading: 'Succefully Updated Land Details',
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
	}
});
$('#FarmerImport').on('click',function(){
	resetForm('edit_farmer_excel_form');
	$('#FarmerExcel').val('');
	$('#ErrorFarmerExcel').html('');
});
$('#upload_farmer_button').on('click', function() {
	if ($('#edit_farmer_excel_form').valid()){
		$('#upload_farmers').modal('hide')
		var data = new FormData();
		var file_data = $('#FarmerExcel')[0].files;
	    for (var i = 0; i < file_data.length; i++) {
	        data.append('farmer_excel', file_data[i]);
	    }
		$.ajax({
				url: '/post/insert/farmer/excel',
				data: data,
				type: 'POST',
	            processData: false,
	            contentType: false,
	            success: function(response){
	            	get_farmer_data(0);
					$.toast({
			            heading: 'Succefully Imported Farmers',
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
			            heading: 'Import Failure',
			            text:error.responseJSON.Error,
			            position: 'top-right',
			            loaderBg: '#ff6849',
			            icon: 'error',
			            hideAfter: 5000
			        });
				}
			});
	}
});
$('#IDNo').on('keyup',function(){
	if (CheckNationalID()){
		if ($("#ErrordivNationalID").html().length > 0) $("#ErrordivNationalID").html('');
	}
	else{
		if ($("#ErrordivNationalID").html().length == 0) $("#ErrordivNationalID").html('<label class="error">Incorrect National ID</label>');
	}
});
$('#MobileNo').on('keyup',function(){
	var a=["6","7","8"]
	if (!a.includes($( "#MobileNo" ).val().substring(0,1))){
		$("#MobileNo" ).val('')
		if ($("#ErrordivMobileNo").html().length == 0) $("#ErrordivMobileNo").html('<label class="error">Mobile No should start with 6,7 or 8</label>');
	}
	else{
		if ($("#ErrordivMobileNo").html().length > 0) $("#ErrordivMobileNo").html('');	
	}
});
function delete_row(element){
	var id=parseInt(element.id.split('_')[1])
	var data = new FormData();
  	data.append('FarmerID',id)
  	if($('#'+ element.id +':checked').val()){
    	data.append('Status','true')
    	data_farmers.find(X=> X.FarmerID===id).Status=true;
    	$('#delete_'+id).prop('checked',true);
  	}
  	else{
    	data.append('Status','false')
    	data_farmers.find(X=> X.FarmerID===id).Status=false;
    	$('#delete_'+id).prop('checked',false); 	
  	}
  	$.ajax({
        url: '/post/update/farmer/status',
        data: data,
        type: 'POST',
        processData: false,
        contentType: false,
        success: function(response){
          $.toast({
                  heading: 'Succefully Updated Farmer Status',
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