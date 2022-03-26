$('form').on('keyup change paste', 'input, select, textarea', function(e){
    if ((e.target.name && this.type!='radio') || (event.target.name && this.type!='radio')){
        formValidate(this);
    }
});
function formValidate(element){
	if ($('#'+element.name).valid()){
    	if (!element.parentElement.className.includes('validate')){
    		if (element.parentElement.className.includes('error')){
    			element.parentElement.className=element.parentElement.className.replace('error','')	
    		}
    		if (!element.parentElement.className.includes('form-group')){
    			element.parentElement.className=element.parentElement.className+' form-group validate'
    		}
    		else{
    			element.parentElement.className=element.parentElement.className+' validate'	
    		}
    	}
    }
    else{
    	if (!element.parentElement.className.includes('error')){
    		if (element.parentElement.className.includes('validate')){
    			element.parentElement.className=element.parentElement.className.replace('validate','')
    		}
    		if (!element.parentElement.className.includes('form-group')){
    			element.parentElement.className=element.parentElement.className+' form-group error'
    		}
    		else{
    			element.parentElement.className=element.parentElement.className+' error'	
    		}
    	}
    }
}
function resetForm(id){
	var form=$('#'+id);
	form.find(".error").removeClass("error");
    form.find(".validate").removeClass("validate");
	$('#'+id+' label[id*="-error"]').remove();
}
$('button').on('click',function(){
    var a=1;
    if (a){
        event.preventDefault();
    }
    
});