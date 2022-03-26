var temp_data;
var counter=1;
var farmers_all;
var farmer_data;
var manual_farmer_data;
var editable_target_list;
var org_settings;
var tags_data;
var tag_ids=[];
var tag_arr=[];
var tags=[];
function campaign_media_sms_check(){
	if ($('#campaign_channel_SMS')[0].checked)
	{
        $('#campaign-media-images').attr("disabled",'');
        $('#campaign-media-doc').attr("disabled",'');
        $('#campaign-media-vid').attr("disabled",'');
        $('input[name="CampaignMedia"]').prop('checked', false);
    }
    else{
        $('#campaign-media-images').removeAttr("disabled");
        $('#campaign-media-doc').removeAttr("disabled");
        $('#campaign-media-vid').removeAttr("disabled");
    }
}
function publish_form_data(data){

	farmer_data=data["farmer_list"]
	farmer_data=farmer_data.sort(function(a, b){
    	return a.FarmerID - b.FarmerID;
	});
 	for (key in data["target_groups"]){
	 	$('#TargetGroup').append($('<option>', {
	                    value: data["target_groups"][key].FarmerGroupID,
	                    text: data["target_groups"][key].GroupName
	                }));
 	}
 	for (key in data["campaign_groups"]){
	 	$('#CampaignGroup').append($('<option>', {
	                    value: data["campaign_groups"][key].Group,
	                    text: data["campaign_groups"][key].Group
	                }));
 	}
 	for (key in data["channels"]){
 		if (data["channels"][key].Channel=='SMS'){
		 	$('#channels_checkbox').append($('<input>',{
		 		name:"campaign_channel_"+data["channels"][key].Channel,
		 		id:"campaign_channel_"+data["channels"][key].Channel,
		 		value:data["channels"][key].ChannelID,
		 		class:"filled-in",
		 		type:"checkbox",
		 		onchange:"campaign_media_sms_check();",
		 	}));
	 	}
	 	else{
	 		$('#channels_checkbox').append($('<input>',{
		 		name:"campaign_channel_"+data["channels"][key].Channel,
		 		id:"campaign_channel_"+data["channels"][key].Channel,
		 		value:data["channels"][key].ChannelID,
		 		class:"filled-in",
		 		type:"checkbox",
		 	}));
	 	}
	 	$('#channels_checkbox').append($('<label>',{
	 		for:"campaign_channel_"+data["channels"][key].Channel,
	 		text:data["channels"][key].Channel,
	 		class:"block"
	 	}));
	 }
	 for (key in data["TargetSelectionMode"]){
	 	$('#TargetSelectionMode').append($('<option>', {
	                    value: data["TargetSelectionMode"][key].unnest,
	                    text: data["TargetSelectionMode"][key].unnest
	                }));
 	}

 	// disabling query feature temporarily
 	$('option[value="Query"]').attr("disabled",'');
 	// resetting selections 
 	$('#TargetSelectionMode').val('');
 	$('#TargetGroup').val('');
 	$('#CampaignGroup').val('');
 	// setting campaign schedule date timeto default
 	$('#CampaignScheduledTime').val(get_curr_datetime());
 	$('#CampaignScheduledTime').attr("min",get_curr_datetime());
}
function get_form_data(){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/campaigns/new',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	tags_data=data['tag_data'];
	    	publish_form_data(data);
	    	if (campid){
				get_edit_campaign(campid);
			}
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
function publish_org_settings(data){
	org_settings=data;
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
function table_initialization(){
	farmers_all = $('#farmers_all').DataTable({
	  'paging'      : true,
	  'lengthChange': true,
	  'searching'   : true,
	  'ordering'    : true,
	  'info'        : true,
	  'autoWidth'   : false,
	   "columns" : [
	    { "width": '5%' },
	    { "width": '25%' },
	    { "width": '20%' },
	    { "width": '25%' },
	    { "width": '20%' },
	    { "width": '5%' }
	    ]
	});
}
function publish_edit_campaign(data){
	// filling page 1 details
	$('#CampaignName').val(data['campaign'][0].Name);
	$('#CampaignDesc').val(data['campaign'][0].Description);
	$('#TargetSelectionMode').val(data['campaign'][0].TargetSelectionMode);
	$('#TargetSelectionMode').change();
	$('#CampaignGroup').val(data['campaign'][0].Group);
	if (data['campaign'][0].TargetSelectionMode=='Group'){
		$('#TargetGroup').val(data['campaign'][0].TargetGroupID);
	}
	var d=get_curr_datetime(data['campaign'][0].StartDate)
	$('#CampaignScheduledTime').val(d);

	// filling page 2 channels
    for (key in data['TargetChannel']){
    	$('input[name*="campaign_channel_"][value='+data['TargetChannel'][key]['ChannelID']+']').prop('checked', true);
    }
    campaign_media_sms_check();
    // flling page 3 media
	
	$('input[name="CampaignMedia"][value="'+data['media'][0]['MediaType']+'"]').prop('checked', true);
	$('input[name="CampaignMedia"][value="'+data['media'][0]['MediaType']+'"]').tab('show');

	if (data['media'][0]['MediaType'] == 'Text'){
		CKEDITOR.instances.campaign_media_Text.setData(data["media"][0].Data);
	}
	else{
		$('label[for="campaign_media_'+data['media'][0]['MediaType']+'"]').text(data["media"][0].Data);
    }

    //filling page 4 target list
    if (data['campaign'][0].TargetSelectionMode=='Manual'){
    	manual_farmer_data=data['EditTargetData'];
    	update_farmer_target_data(data['EditTargetData']);
    }
    else if (data['campaign'][0].TargetSelectionMode=='Group'){
    	farmer_data=data['EditTargetData']
    	TargetID=parseInt($('#TargetGroup').val());
		target_data=farmer_data.filter(x => x.FarmerGroupID === TargetID);
		update_farmer_target_data(target_data);
    }
    else if (data['campaign'][0].TargetSelectionMode=='All'){
    	farmer_data=data['EditTargetData']
		update_farmer_target_data(farmer_data);
    }
    else if (data['campaign'][0].TargetSelectionMode=='Tags'){
    	$('input[name="TargetGroupTagType"][value="'+data['campaign'][0]['TagType']+'"]').prop('checked', true);
    	var tagnames=data['campaign'][0]['TagNames'].split(',')
    	for (i in tagnames){
    		$('#FarmerTags').tagsinput('add',tagnames[i]);
    		$('#FarmerTags').change();
    	}
    }
}
function get_edit_campaign(campid){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/campaign/edit/details/'+campid,
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	publish_edit_campaign(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}
$( document ).ajaxStart(function() {
  // $( ".log" ).text( "Triggered ajaxStart handler." );
});
$( document ).ajaxStop(function() {
 //  	$('#loader_div').remove();
	// $('#campaign_form').show();
	table_unloader('loader_div','campaign_form');
});
$(document).ready(function(){
	// table_loader('loader_placer','campaign_form');
	table_initialization();
	get_form_data();
	$('#DivTargetGroup').hide();
	get_org_settings();
	
});
function update_farmer_target_data(data,clear=true){
	if (clear){
		farmers_all.clear();
		farmers_all.draw();
		if (data.length==0) $("#ErrordivTargetList").html('<label class="error">Empty Target List</label>');
		else{ 
			$("#ErrordivTargetList").html('');
			data=data.sort(function(a, b){
		    	return a.FarmerID - b.FarmerID;
			});
		}
	}
	for (key in data){
		if (key == 100){
			break;
		}
	    farmers_all.row.add( [
            data[key]["FarmerID"],
            data[key]["FirstName"]+data[key]["LastName"],
            data[key]["MobileNo"],
            data[key]["IDNo"],
            data[key]["Geography"],
            data[key]["CreatedBy"]
        ]).node().id='rowid_'+data[key]["FarmerID"];
        farmers_all.draw( false );
 	}
}
$('.media').on('change',function(){
	file_size_check(this);
});
function file_size_check(element){
	var file_data = $('input[name="'+ element.name+'"]')[0].files;
	$('label[for="'+ element.name+'"]').text(file_data[0].name);
	var temp=$("input[name='CampaignMedia']:checked").val()
	if (temp=='Video/Audio') temp='VideoAudio'
	if (file_data[0].size > org_settings[0].MaxMediaSize){
		$('#Error'+temp+'Size').html('<label class="error">File with size not more than '+ org_settings[0].MaxMediaSize/1000 + 'kb are accepted</label>');
		return false;
	}
	$('#Error'+temp+'Size').html('');
	return true;
}
$('input[name="CampaignMedia"]').on('click',function () {
    $(this).tab('show');
    $(this).removeClass('active');
});
$('#TargetSelectionMode').on('change',function(){
	if ($('#TargetSelectionMode').val()==='Group'){
		$('#DivTargetGroup').show();
		TargetID=parseInt($('#TargetGroup').val());
		target_data=farmer_data.filter(x => x.FarmerGroupID === TargetID);
		update_farmer_target_data(target_data);
		$('#TargetGroupManual').hide();
		$('#TargetGroupTag').hide();
	}
	else if ($('#TargetSelectionMode').val()==='All'){
		$('#DivTargetGroup').hide();
		TargetID=parseInt($('#TargetGroup').val());
		target_data=farmer_data;
		update_farmer_target_data(target_data);
		$('#TargetGroupManual').hide();
		$('#TargetGroupTag').hide();
	}
	else if ($('#TargetSelectionMode').val()==='Manual'){
		farmers_all.clear();
		farmers_all.draw();
		$('#TargetGroupManual').show();
		$('#DivTargetGroup').hide();
		$('#TargetGroupTag').hide();
	}
	else if ($('#TargetSelectionMode').val()==='Tags'){
		farmers_all.clear();
		farmers_all.draw();
		$('#TargetGroupManual').hide();
		$('#DivTargetGroup').hide();
		$('#TargetGroupTag').show();
	}
	else{
		$('#TargetGroupManual').hide();
		farmers_all.clear();
		farmers_all.draw();
		$('#DivTargetGroup').hide();
		$('#TargetGroupTag').hide();
	}
});
$('#TargetGroup').on('change',function(){
	TargetID=parseInt($('#TargetGroup').val());
	target_data=farmer_data.filter(x => x.FarmerGroupID === TargetID);
	update_farmer_target_data(target_data);
});
$('#upload_farmer_button').on('click', function(){
	var data = new FormData();
	var file_data = $('#upload_farmer_formdata')[0].files;
    for (var i = 0; i < file_data.length; i++) {
        data.append('farmer_excel', file_data[i]);
    }

	$.ajax({
			url: '/post/insert/campaign/farmers',
			data: data,
			type: 'POST',
            processData: false,
            contentType: false,
            success: function(response){
            	manual_farmer_data=response;
            	update_farmer_target_data(response);
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
		            text: error.responseJSON.Error,
		            position: 'top-right',
		            loaderBg: '#ff6849',
		            icon: 'error',
		            hideAfter: 5000
		        });
			}
		});
});
$('input[type=radio][name="TargetGroupTagType"]').on('change',function(){
	farmers_all.clear();
	farmers_all.draw();
	tag_ids=[];
	tag_arr=[];
	tags=[];
	$('#FarmerTags').tagsinput('removeAll');
});
$('#FarmerTags').on('change',function(){
	table_loader('loader_placer_farmer','farmers_all_wrapper');
	var type=$('input[name="TargetGroupTagType"]:checked').val()
	if (type==='any'){
		get_tag_any_data();
	}
	if (type==='all'){
		var val=get_tag_all_data();
	}
	table_unloader('loader_div','farmers_all_wrapper');
	step3check();
	if (val==0) $('input[type=radio][name="TargetGroupTagType"]').change();
});
function get_curr_datetime(d=null){
	if (!d) {
		var now = new Date($.now())	
	}
	else{
		var now = new Date(d)
	}
	
    var year
    , month
    , date
    , hours
    , minutes
    , seconds
    , formattedDateTime
    ;

	year = now.getFullYear();
  	month = now.getMonth().toString().length === 1 ? '0' + (now.getMonth() + 1).toString() : now.getMonth() + 1;
  	date = now.getDate().toString().length === 1 ? '0' + (now.getDate()).toString() : now.getDate();
  	hours = now.getHours().toString().length === 1 ? '0' + now.getHours().toString() : now.getHours();
  	minutes = now.getMinutes().toString().length === 1 ? '0' + now.getMinutes().toString() : now.getMinutes();
  	formattedDateTime = year + '-' + month + '-' + date + 'T' + hours + ':' + minutes;
	return formattedDateTime;
}
function table_loader(loader_placer,element){
	$('#'+element).hide()
    $('#'+loader_placer).append('<div class="loader" id="loader_div"></div>');
}
function table_unloader(loader_unplacer,element){
	$('#'+element).show()
    $('#'+loader_unplacer).remove()
}
function filter_by_tag(arr,key,val){
	return arr.filter(x=>x[key]===val)
}
function get_tag_any_data(){
	var list=$("#FarmerTags").tagsinput('items');
	if (list.length>tags.length){
		//add tag 
		var add_tags=$(list).not(tags).get();//get tags list to add data for
		tags=tags.concat(add_tags);
		//get farmers data for add_tags
		var arr=[];
		for (i in add_tags){
			arr=arr.concat(filter_by_tag(tags_data,'TagName',add_tags[i].toLowerCase()))
		}
		var add_ids=Array.from(new Set(arr.map(item => item.FarmerID)))
		tag_arr=tag_arr.concat(arr);

		//add ids to farmers table
		add_ids=$(add_ids).not(tag_ids).get();
		tag_ids=tag_ids.concat(add_ids)
		var final_data=[]
		for (i in add_ids){
			final_data=final_data.concat(filter_by_tag(farmer_data,'FarmerID',add_ids[i]));
		}

		console.log(final_data)
		update_farmer_target_data(final_data,false);
	}
	else if (list.length<tags.length){
		//delete tag
		var remove_tags=$(tags).not(list).get();//get tags list to remove data for
		tags=$(tags).not(remove_tags).get();
		if (tags.length>0){
			//get farmers data for remove_tags
			var arr=[];
			for (i in remove_tags){
				arr=arr.concat(filter_by_tag(tags_data,'TagName',remove_tags[i].toLowerCase()))
			}
			var remove_ids=Array.from(new Set(arr.map(item => item.FarmerID)));

			//remove ids from farmers table
			var arr=[];
			for (i in remove_ids){
				arr=tag_arr.filter(x=>x.FarmerID==remove_ids[i] && x.TagName!=remove_tags[0]);
				if (arr.length==0){
					farmers_all.row('#rowid_'+remove_ids[i]).remove().draw();
					tag_ids=$(tag_ids).not([remove_ids[i]]).get();
				}
				//remoe from tag_arr
				tag_arr=tag_arr.filter(x=>x.FarmerID!=remove_ids[i] || x.TagName!=remove_tags[0])
			}
		}
		else{
			tag_ids=[];
			tag_arr=[];
			tags=[];
			farmers_all.clear();
			farmers_all.draw();
		}
	}
}
function get_tag_all_data(){
	var list=$("#FarmerTags").tagsinput('items');
	if (list.length>tags.length){
		//add tag
		var add_tags=$(list).not(tags).get();//get tags list to add data for
		tags=tags.concat(add_tags);//assign global tags value
		//get farmers tag data for add_tags
		var arr=[];
		for (i in add_tags){
			arr=arr.concat(filter_by_tag(tags_data,'TagName',add_tags[i].toLowerCase()))
		}
		//if tag_arr is empty, no data avaialable in table. everything needs to be added. 
		if (tag_arr.length==0){
			if (add_tags.length==1){
				tag_arr=arr;
				//add ids to farmers table
				var add_ids=Array.from(new Set(tag_arr.map(item => item.FarmerID)));
				tag_ids=add_ids;
				var final_data=[]
				for (i in add_ids){
					final_data=final_data.concat(filter_by_tag(farmer_data,'FarmerID',add_ids[i]));
				}
				console.log(final_data)
				update_farmer_target_data(final_data,false);
			}
			else{
				console.log('abc');
			}
		}
		//if tag_arr is not empty, data avaialable in table. so tag arr will only decrease from here not increase 
		else {
			var temp=Array.from(new Set(arr.map(item => item.FarmerID)));
			tag_arr=tag_arr.concat(arr);
			tag_arr=tag_arr.filter(x=>temp.includes(x.FarmerID));
			var add_ids=Array.from(new Set(tag_arr.map(item => item.FarmerID)));
			
			var remove_ids=$(tag_ids).not(add_ids).get()

			var arr=[];
			for (i in remove_ids){
				farmers_all.row('#rowid_'+remove_ids[i]).remove().draw();
				tag_ids=$(tag_ids).not([remove_ids[i]]).get();
			}
		}
	}
	else if (list.length<tags.length){
		//remove tag
		var remove_tags=$(tags).not(list).get();//get tags list to remove data for
		tags=$(tags).not(remove_tags).get();
		if (tags.length>0){
			var arr=[];
			tag_arr=tag_arr.filter(x=>x.TagName!=remove_tags[0].toLowerCase());
			for (i in tags){
				arr=arr.concat(filter_by_tag(tags_data,'TagName',tags[i].toLowerCase()));
			}
			for (i in tag_ids){
				arr=arr.filter(x=>x.FarmerID!=tag_ids[i]);
			}
			var temp=Array.from(new Set(arr.map(item => item.FarmerID)));
			var add_ids=[];
			for (i in temp){
				var temp_arr=arr.filter(x=>x.FarmerID==temp[i]);
				if (temp_arr.length==tags.length){
					add_ids.push(temp[i]);
					tag_arr.push(temp_arr);
				}
			}
			tag_ids=tag_ids.concat(add_ids);
			var final_data=[]
			for (i in add_ids){
				final_data=final_data.concat(filter_by_tag(farmer_data,'FarmerID',add_ids[i]));
			}
			console.log(final_data)
			update_farmer_target_data(final_data,false);
		}
		else{
			tag_ids=[];
			tag_arr=[];
			tags=[];
			farmers_all.clear();
			farmers_all.draw();
		}
	}
	return 1;
}