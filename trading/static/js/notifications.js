
var temp;
function publish_notifications(data){
	temp=data;

	for (item in data){
		$.toast({
		        heading: data[item].heading,
		        text: data[item].text,
		        position: 'top-right',
		        loaderBg: '#ff6849',
		        icon: data[item].type,
		        hideAfter: 5000,
		        stack: 2
		    });
	}
}

function get_notifications(){
	$.ajax({
	 url: $SCRIPT_ROOT+'/get/notifications',
	    type: 'GET',
	    dataType: 'json',
	    success: function (data) {
	    	console.log(data)
	    	publish_notifications(data);
	    },
	    error: function (request, message, error) {
	        console.log(error);
	    }
	});
}

$(document).ready(function(){
	get_notifications();
});