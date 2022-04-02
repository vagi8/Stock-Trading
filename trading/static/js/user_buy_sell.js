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
										<input id="limitPrice" name="limitPrice" class="form-control" type="text"  min="0.001">
                                	</div>
								</div>`
		var limitExpirytext=`<div class="row" id="limitExpiry_row">
					    <div class="col-md-6 form-group has-feedback">
										<label for="limitExpiry">Limit Price</label>
										<input id="limitExpiry" name="limitExpiry" class="form-control" type="date">
                                	</div>
								</div>`

        $('#limitdiv').append(limitPrice)
        $('#limitdiv').append(limitExpirytext)
        limitExpiry.min = new Date().toISOString().split("T")[0];
    }
    else if (this.value == 'Market') {
        $('#limitExpiry_row').remove()
        $('#limitPrice_row').remove()
    }
});
$(document).ready(function(){
	$('#tab_content').hide()
    $('#loader_placer').append('<div style="margin-left: 400px;" class="loader" id="loader_div"></div>');
	tables_initialization();
	$('#loader_div').remove();
	$('#tab_content').show();
});