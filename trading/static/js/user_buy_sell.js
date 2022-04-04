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
$('input[type=radio][name=orderType]').change(function() {
    if (this.value == 'Limit') {
        var limitPrice=`<div class="row" id="limitPrice_row">
					    <div class="col-md-6 form-group has-feedback">
										<label for="limitPrice">Limit Price</label>
										<input required id="limitPrice" name="limitPrice" class="form-control" type="text"  min="0.001">
                                	</div>
								</div>`
		var limitExpirytext=`<div class="row" id="limitExpiry_row">
					    <div class="col-md-6 form-group has-feedback">
										<label for="limitExpiry">Limit Price</label>
										<input required id="limitExpiry" name="limitExpiry" class="form-control" type="date">
                                	</div>
								</div>`

        $('#limitdiv').append(limitPrice)
        $('#limitdiv').append(limitExpirytext)
        limitExpiry.min = getToday();
    }
    else if (this.value == 'Market') {
        $('#limitExpiry_row').remove()
        $('#limitPrice_row').remove()
    }
});

function getToday(){
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if (dd < 10) {
       dd = '0' + dd;
    }

    if (mm < 10) {
       mm = '0' + mm;
    }

    today = yyyy + '-' + mm + '-' + dd;
    return today;
}

$(document).ready(function(){
	$('#tab_content').hide()
    $('#loader_placer').append('<div style="margin-left: 400px;" class="loader" id="loader_div"></div>');
	tables_initialization();
	$('#loader_div').remove();
	$('#tab_content').show();
});
function verifyLimitForm(){
    if ($('input[name="orderType"]:checked').val() =='Limit'){
        if ($('#limitPrice').val() == '' || $('#limitExpiry').val() == ''){$('#error').append('Limit Price & Expiry are required');return false}
        else {$('#error').empty()}
    }
    return true
}
$('#form_submit').on('click',function(){
// validate if limit we have limit price.
    if (verifyLimitForm()){
        $.ajax({
        url: '/user/post/buy_sell',
        data: $('#form_buy_sell').serialize(),
        type: 'POST',
        success: function(response){

            $.toast({
                heading: 'Order Submitted Succefully',
                text: '',
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
                heading: 'Order Failed',
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