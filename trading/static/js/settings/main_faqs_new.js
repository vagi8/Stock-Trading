$(document).ready(function () {

    var kbid = "bae984fe-783e-4372-845f-1d2a22bf9fa8";
    var subid = "9c07833e814d42e6ab2f8cea5c91dc32";
    var Endpoint = "https://dardleaqna.cognitiveservices.azure.com";


    $(document).ajaxStart(function () {
        $("#loading").show();
    }).ajaxStop(function () {
        $("#loading").hide();
    });

    var idval;
    function randomString(length, chars) {

         var result = '';

         for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];

         idval = result;
     }

    var arlene2 = [];
    //add and remote button for questions
    var answer;
    //end

    $("#Traindata").click(function () {
        if ($('#add_faq').valid() && $('#questions').val().length != 0){
            $('#Traindata').hide();
            $('#loader_placer').append('<div class="loader" id="loader_div"></div>');
            $('.text').text('');
            answer = $("#answer").val();
          
            var question = $("#questions").val();
           
            var res = question.split(",");
          
            $.each(res, function (i) {
           
                arlene2.push(res[i]);

            });
            //Api
            if (($('#answer').val().length != 0) && $('#questions').val().length != 0) {

                var settings = {
                    "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
                    "method": "PATCH",
                    "timeout": 0,
                    "headers": {
                        "Ocp-Apim-Subscription-Key": subid,
                        "Content-Type": "application/json"
                    },
                    "data": JSON.stringify({ "add": { "qnaList": [{ "id": idval, "answer": answer, "source": "Editorial", "questions": arlene2, "metadata": null }], "urls": null, "files": null }, "delete": null, "update": null }),
                };

                $.ajax(settings).done(function (response) {


                    //API
                    var settings = {
                        "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
                        "method": "POST",
                        "timeout": 0,
                        "headers": {
                            "Ocp-Apim-Subscription-Key": subid,
                            "Content-Type": "application/json"
                        },
                    };

                    $.ajax(settings).done(function (response) {
                        var settings = {
                        "url": Endpoint + "/qnamaker/v4.0/knowledgebases/" + kbid,
                        "method": "POST",
                        "timeout": 0,
                            "headers": {
                                "Ocp-Apim-Subscription-Key": subid,
                            "Content-Type": "application/json"
                        },
                    };

                    $.ajax(settings).done(function (response) {
                        $('#loader_div').remove();
                        $('#Traindata').show();
                        swal({   
                            title: "Success",   
                            text: "Successfully added Question and Answer Pair",   
                            type: "success",   
                            confirmButtonText: "OK",   
                            closeOnConfirm: true 
                        }, function(){   
                            $('#answer').val('');
                            $('#questions').tagsinput('removeAll');
                        });
                    });
                    });

                    //end
                });
                //end
            }
            else{
                $('#loader_div').remove();
                $('#Traindata').show();
                swal({   
                    title: "Error",   
                    text: "Failed to add Question and Answer Pair",   
                    type: "error",   
                    confirmButtonText: "OK",   
                    closeOnConfirm: true 
                }, function(){
                });
            }
        } 
    });

});