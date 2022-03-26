    $(".tab-wizard").steps({
    headerTag: "h6"
    , bodyTag: "section"
    , transitionEffect: "fade"
    , titleTemplate: '<span class="step">#index#</span> #title#'
    , labels: {
        finish: "Broadcast"
    },
    onFinished: function (event, currentIndex) {
        // loading gif
        $('#campaign_form').hide()
        $('#loader_placer').append('<div class="loader" id="loader_div"></div>');

        var data = new FormData();
        var form_data=$('#campaign_form').serializeArray();
        var manual_farmer_jsondata=JSON.stringify(manual_farmer_data)
        data.append('ManualFarmerData',manual_farmer_jsondata)
        $.each(form_data, function (key, input) {
            data.append(input.name, input.value);
        });
        data.append('campid',campid);
        var media_type=$("input[name='CampaignMedia']:checked").val();
        if (media_type != 'Text'){
            var file_data = $('input[name="campaign_media_'+media_type+'"]')[0].files;
            if (!campid || file_data.length>0){
                for (var i = 0; i < file_data.length; i++) {
                    data.append('campaign_media_'+media_type, file_data[i]);
                }
                data.append('blob_url','')
            }
            else{
                var temp=$('label[for="campaign_media_'+media_type+'"]').text()
                data.append('blob_url',temp)
            }
        }
        else{
            data.set('campaign_media_Text', CKEDITOR.instances.campaign_media_Text.getData());
        }
        data.append('ScheduleTime',new Date($('#CampaignScheduledTime').val()).toISOString());
        data.append('Status', 'Scheduled');
        var CampaignID;
        $.toast({
            heading: 'Campaign is being created',
            text: '',
            position: 'top-right',
            loaderBg: '#ff6849',
            icon: 'info',
            hideAfter: 5000,
            stack: 6
            });
        $.ajax({
                url: '/post/insert/campaign',
                data: data,
                type: 'POST',
                processData: false,
                contentType: false,
                success: function(response){
                    $('#loader_div').remove();
                    CampaignID=parseInt(response.CampaignID);
                    swal({   
                        title: "Success",   
                        text: "Campaign has been successfull Created and is Scheduled. Campaign ID = "+CampaignID,   
                        type: "success",   
                        confirmButtonText: "OK",   
                        closeOnConfirm: true 
                    }, function(){   
                        window.location.href=$SCRIPT_ROOT+'/Campaign/List'
                    });
                },
                error: function(error){
                    $('#loader_div').remove();
                    $('#campaign_form').show();
                    swal({   
                        title: "Error",   
                        text: error.responseJSON.Error,   
                        type: "success",   
                        confirmButtonColor: "#DD6B55",   
                        confirmButtonText: "OK",   
                        closeOnConfirm: true 
                    }, function(){   
                        // window.location.href=$SCRIPT_ROOT+'/Campaign/List'
                    });
                }
            });
        
       // swal("Your Order Submitted!", "Sed dignissim lacinia nunc. Curabitur tortor. Pellentesque nibh. Aenean quam. In scelerisque sem at dolor. Maecenas mattis. Sed convallis tristique sem. Proin ut ligula vel nunc egestas porttitor.");       
    },
    onSaveDraft: function (event,currentIndex){
        // loading gif
        $('#campaign_form').hide()
        $('#loader_placer').append('<div class="loader" id="loader_div"></div>');

        var data = new FormData();
        var form_data=$('#campaign_form').serializeArray();
        $.each(form_data, function (key, input) {
            data.append(input.name, input.value);
        });
        data.append('campid',campid);
        var manual_farmer_jsondata=JSON.stringify(manual_farmer_data)
        data.append('ManualFarmerData',manual_farmer_jsondata)
        var media_type=$("input[name='CampaignMedia']:checked").val();
        if (media_type != 'Text'){
            var file_data = $('input[name="campaign_media_'+media_type+'"]')[0].files;
            if (!campid || file_data.length>0){
                for (var i = 0; i < file_data.length; i++) {
                    data.append('campaign_media_'+media_type, file_data[i]);
                }
                data.append('blob_url','')
            }
            else{
                var temp=$('label[for="campaign_media_'+media_type+'"]').text()
                data.append('blob_url',temp)
            }
        }
        else{
            data.set('campaign_media_Text', CKEDITOR.instances.campaign_media_Text.getData());
        }
        
        data.append('ScheduleTime',new Date($('#CampaignScheduledTime').val()).toISOString());
        data.append('Status', 'Created');
        $.ajax({
                url: '/post/insert/campaign',
                data: data,
                type: 'POST',
                processData: false,
                contentType: false,
                success: function(response){
                    $('#loader_div').remove();
                    CampaignID=parseInt(response.CampaignID);
                    swal({   
                        title: "Success",   
                        text: "Campaign has been successfull Created! Campaign ID = "+CampaignID,   
                        type: "success",   
                        confirmButtonColor: "rgb(89 207 164)",   
                        confirmButtonText: "OK",   
                        closeOnConfirm: true 
                    }, function(){   
                        window.location.href=$SCRIPT_ROOT+'/Campaign/List'
                    });
                },
                error: function(error){
                    $('#loader_div').remove();
                    $('#campaign_form').show();
                    swal({   
                        title: "Error",   
                        text: error.responseJSON.Error,   
                        type: "success",   
                        confirmButtonColor: "#DD6B55",   
                        confirmButtonText: "OK",   
                        closeOnConfirm: true 
                    }, function(){   
                        // window.location.href=$SCRIPT_ROOT+'/Campaign/List'
                    });
                }
            });
    },
    onStepChanging: function (event, currentIndex, newIndex) {
        if (currentIndex==0){
            return step0check();
        }
        else if (currentIndex==1){
            return step1check();
        }
        else if (currentIndex==2){
            return step2check();
        }
        else{
            return true;
        }
    },
    onFinishing: function (event,currentIndex,newIndex){
        if (step0check() && step1check() && step2check() && step3check()){
            return true;
        }
        return false;
    }
});
function redirect(url){
    window.location.href= $SCRIPT_ROOT+url;
}
function step0check(){
    if ($('#campaign_form-p-0 input,select').valid()){
                return true;        
            }
    return false;
}
function step1check(){
    if ($('input[name*="campaign_channel"]:checked').length>0){
        return true;
    }
    return false;
}
function step2check(){
    if ($('input[name*="CampaignMedia"]:checked').length>0 ){
        var media_type=$("input[name='CampaignMedia']:checked").val();
        if (media_type != 'Text' && !$('input[name*="campaign_channel_SMS"]:checked')[0]){
            var file_data = $('input[name="campaign_media_'+media_type+'"]')[0].files;
            if (!campid || file_data.length>0){
                if (file_data.length>0 && file_data[0].size<org_settings[0].MaxMediaSize){
                    return true;        
                }
                else{
                    return false;
                }
            }
            else{
                var temp=$('label[for="campaign_media_'+media_type+'"]').text()
                if (temp.includes('https://','.blob.core.windows.net')){
                    return true
                }
                else{
                    return false
                }
            }
        }
        else if(media_type == 'Text'){
            if (CKEDITOR.instances.campaign_media_Text.getData().length>0 && CKEDITOR.instances.campaign_media_Text.getData()!="<p>Type Your Message Here</p>\n"){
                return true;
            }
            else{
                return false;
            }
        }
    }
    return false;
}
function step3check(){
    if (farmers_all.rows()[0].length){
        $("#ErrordivTargetList").html('');
        return true;
    }
    $("#ErrordivTargetList").html('<label class="error">Empty Target List</label>');
    return false;
}