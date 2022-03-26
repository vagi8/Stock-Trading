// JavaScript source code
$('#data_loader_placer').append('<div class="loader" id="data_loader_div"></div>');
    var oldquestion;
    var listofoldquestions = [];
    var questionid;
    var oldanswer;
    var APItotalquestionupdate = [];
    var APItotaldeletedquestion = [];

//var kbid ="bae984fe-783e-4372-845f-1d2a22bf9fa8";
//var subid ="9049ac18c5434285835490af26da0abd";

var kbid = "bae984fe-783e-4372-845f-1d2a22bf9fa8";
var subid = "9c07833e814d42e6ab2f8cea5c91dc32";
var Endpoint = "https://dardleaqna.cognitiveservices.azure.com";


    var Globaloldquestionlist = [];
    var Globalnewquestionlist = [];

        $(document).ready(function () {

        $(document).ajaxStart(function () {
            $("#loading").show();
        }).ajaxStop(function () {
            $("#loading").hide();
        });
    //publish
    //end
            var settings = {
                //   "url": end"/qnamaker/v4.0/knowledgebases/" + kbid + "/Prod/qna",
                "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid + "/Prod/qna",
    "method": "GET",
    "timeout": 0,
                "headers": {
                    "Ocp-Apim-Subscription-Key": subid
},
};

$('#modelbody').hide();
$('#modelfooter').hide();
$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
$('.text').text('');

            $.ajax(settings).done(function (response) {
                $('#modelbody').show();
                $('#modelfooter').show();
                $('#loader_div').remove();
    var lengthofanswers = response.qnaDocuments.length;
    var i = 0;
    var j = 0;
                // $("#questionlist").append("<tr><th > Answer</th><th >Question</th><th >Edit Q&A Pair</th></tr>");
                for (i = 0; i < lengthofanswers; i++) {
                    var answervalue = response.qnaDocuments[i].answer;
  var lengthofquestions = response.qnaDocuments[i].questions.length;
                    for (j = 0; j < lengthofquestions; j++) {
        $("#questionlist").append("<tr><td  id='answer1'><a href='javascript:void(0)'>" + answervalue + "</a></td><td id='question1'><span class='text-muted'>" + response.qnaDocuments[i].questions[j] + "</span></td><td><button type='submit' value='" + response.qnaDocuments[i].id + "@" + answervalue + "@" + response.qnaDocuments[i].questions[j] + "' id='" + response.qnaDocuments[i].id + "" + j + "' style='bgcolor='blue'; data-toggle='modal' data-target='#modal-center' onclick='valuedata(" + response.qnaDocuments[i].id + "" + j + ")'><i class='fa fa-edit'></i></button></td></tr>");
}
}
$('#data_loader_div').remove();
var coll = document.getElementsByClassName("collapsible");
var i;

                for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function () {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        });
}
});
});

function valuedata(id) {
        oldanswer = "";
    questionid = "";
    Gobaloldquestionlist = [];

    $("#questiondata").tagsinput("removeAll");
    listofoldquestions = [];

    var data = $("#" + id).val();
    var answer = data.split('@');
    var questionval;
    var answerval;
    var idval;
    var newquestions;




            $.each(answer, function (key, val) {
                if (key == "0") {
        idval = val;
}
                else if (key == "1") {answerval = val; }
                else if (key == "2") {questionval = val; }

});

//api calling for all questions
    var settings = {
        "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid + "/Prod/qna",
    "method": "GET",
    "timeout": 0,
                "headers": {
        "Ocp-Apim-Subscription-Key": subid
},
};

$('#modelbody').hide();
$('#modelfooter').hide();
$('#loader_placer').append('<div class="loader" id="loader_div"></div>');
$('.text').text('');

            $.ajax(settings).done(function (response) {
                $('#modelbody').show();
                $('#modelfooter').show();
                $('#loader_div').remove();
    var lengthofanswers = response.qnaDocuments.length;

    var j = 0;
                 for (i = 0; i < lengthofanswers; i++) {
                    if (response.qnaDocuments[i].id == idval) {
                      var lengthofquestions = response.qnaDocuments[i].questions.length;
                        for (j = 0; j < lengthofquestions; j++) {
        listofoldquestions.push(response.qnaDocuments[i].questions[j]);
  $("#questiondata").tagsinput('add', response.qnaDocuments[i].questions[j]);

}
}

}

//end

Globaloldquestionlist = listofoldquestions;

                $.each(listofoldquestions, function (key, val) {
                    var newqna = "";
    newquestions = newqna.concat(listofoldquestions);
});


$("#answerdata").val(answerval);

$("#Updateqna").val(idval);

$("#questiondata").val(newquestions);
questionid = idval;
oldanswer = answerval;
oldquestion = questionval;
});
}
        function pageRedirect() {
        window.location.replace("sample_blank_QNA.html");
}
function UpdateQna() {
    Globalnewquestionlist = [];
    var answerupdate = $("#answerdata").val();
    var questionupdate = $("#questiondata").val();
    var idupdate = $("#Updateqna").val();
    var updatequestiondata = [];
    updatequestiondata = questionupdate.split(',');
    Globalnewquestionlist = updatequestiondata;
    //api calling

    var lengthofnewarray = Globalnewquestionlist.length;
    var lengthofoldarray = Globaloldquestionlist.length;
    var deletetemp;
    var k;
    var l;
            for (k = 0; k < lengthofoldarray; k++)
            {
                for (l = 0; l< lengthofnewarray; l++)
                {
                    if (Globaloldquestionlist[k] == Globalnewquestionlist[l]) {
        deletetemp = "";
    break;
}
                    else {
        deletetemp = Globaloldquestionlist[k];
}
}
                if (deletetemp == "") {}
    else {
        APItotaldeletedquestion.push(deletetemp);
}
}


APItotalquestionupdate = Globalnewquestionlist;
       
    var arlene2 = [];
    //add and remote button for questions
    var answer;
    //end


    $('#modelbody').hide();
    $('#modelfooter').hide();
    $('#loader_placer').append('<div class="loader" id="loader_div"></div>');
    $('.text').text('');

    //Api
            if (($('#answerdata').val().length != 0) && $('#questiondata').val().length != 0) {
                if ($('#answerdata').val() == oldanswer) {
                    var settings = {
                       // "url": "https://westus.api.cognitive.microsoft.com/qnamaker/v4.0/knowledgebases/" + kbid",
                        "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "PATCH",
    "timeout": 0,
                        "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
                        //"data": JSON.stringify({"add": null, "delete": null, "update": {"name": "IS", "qnaList": [{"id": idupdate, "answer": answerupdate, "source": "Editorial", "questions": {"add": updatequestiondata, "delete": listofoldquestions }, "metadata": {"add": [], "delete": [] }, "alternateQuestionClusters": {"delete": [] }, "context": {"isContextOnly": false, "prompts": [] } }], "urls": [] } }),
                        "data": JSON.stringify({"add": null, "delete": null, "update": {"name": "IS", "qnaList": [{"id": idupdate, "answer": answerupdate, "source": "Editorial", "questions": {"add": APItotalquestionupdate, "delete": APItotaldeletedquestion }, "metadata": {"add": [], "delete": [] }, "alternateQuestionClusters": {"delete": [] }, "context": {"isContextOnly": false, "prompts": [] } }], "urls": [] } }),
  };

                    $.ajax(settings).done(function (response) {
 
    //API
                        var settings = {
                            "url": Endpoint + "/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "POST",
    "timeout": 0,
                            "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
};

                        $.ajax(settings).done(function (response2) {

                            var settings = {
                                "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "POST",
    "timeout": 0,
                                "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
};

                            $.ajax(settings).done(function (response3) {

                                var settings = {
                                    "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "POST",
    "timeout": 0,
                                    "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
};

$.ajax(settings).done(function (response4) {
        $('#modelbody').show();
        $('#modelfooter').show();
        $('#loader_div').remove();

    swal({   
        title: "Success",   
        text: "Successfully Added Question and Answer pair",   
        type: "success",
        confirmButtonColor: "rgb(89 207 164)",   
        confirmButtonText: "OK",   
        closeOnConfirm: true 
    }, function(){   
        window.location.href=$SCRIPT_ROOT+'/Settings/faqs'
    });
});

});

});

//end
});
}
else
                {
                    var idval;
                    function randomString(length, chars) {
                        var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    idval = result;
    // return result;
}

randomString(8, '0123456789');

                    var settings = {
                        "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "PATCH",
    "timeout": 0,
                        "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
 },
                       //  "data": JSON.stringify({"add": {"qnaList": [{"id": idval, "answer": answerupdate, "source": "Editorial", "questions": APItotalquestionupdate, "metadata": null }], "urls": null, "files": null }, "delete": {"ids": [questionid] }, "update": null }),
                         "data": JSON.stringify({"add": {"qnaList": [{"id": idval, "answer": answerupdate, "source": "Editorial", "questions": APItotalquestionupdate, "metadata": null }], "urls": null, "files": null }, "delete": {"ids": [] }, "update": null }),
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

                        $.ajax(settings).done(function (response2) {
                            var settings = {
                                "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "POST",
    "timeout": 0,
                                "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
};

                            $.ajax(settings).done(function (response3) {

                                var settings = {
        "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "POST",
    "timeout": 0,
                                    "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
};

                                $.ajax(settings).done(function (response4) {
                $('#modelbody').show();
                $('#modelfooter').show();
                $('#loader_div').remove();

    swal({   
        title: "Success",   
        text: "Successfully Added Question and Answer pair",   
        type: "success",
        confirmButtonColor: "rgb(89 207 164)",   
        confirmButtonText: "OK",   
        closeOnConfirm: true 
    }, function(){   
        window.location.href=$SCRIPT_ROOT+'/Settings/faqs'
    });
});
});

});

//end
});
}
//end
}
            else {
        $('#img').hide();
    swal({   
        title: "Error",   
        text: "Failed to add Q&A Pair",   
        type: "success",   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "OK",   
        closeOnConfirm: true 
    }, function(){   
        window.location.href=$SCRIPT_ROOT+'/Settings/faqs'
    });
}
//end
}
function deleteqna()
        {
    $('#modelbody').hide();
    $('#modelfooter').hide();
    $('#loader_placer').append('<div class="loader" id="loader_div"></div>');
    $('.text').text('');

    //Api
            if (($('#answerdata').val().length != 0) && $('#questiondata').val().length != 0) {

                var settings = {
                    "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "PATCH",
    "timeout": 0,
                    "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
                    "data": JSON.stringify({"add": null, "delete": {"ids": [questionid] }, "update": null }),
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

                    $.ajax(settings).done(function (response2) {

                        var settings = {
                            "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "POST",
    "timeout": 0,
                            "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
};

                        $.ajax(settings).done(function (response3) {

                            var settings = {
                                "url": Endpoint+"/qnamaker/v4.0/knowledgebases/" + kbid,
    "method": "POST",
    "timeout": 0,
                                "headers": {
        "Ocp-Apim-Subscription-Key": subid,
    "Content-Type": "application/json"
},
};

                            $.ajax(settings).done(function (response4) {
        $('#modelbody').show();
                $('#modelfooter').show();
                $('#loader_div').remove();

    
    swal({   
        title: "Success",   
        text: "Successfully Deleted Q&A pair ",   
        type: "success",   
        confirmButtonColor: "rgb(89 207 164)",   
        confirmButtonText: "OK",   
        closeOnConfirm: true 
    }, function(){   
        window.location.href=$SCRIPT_ROOT+'/Settings/faqs'
    });
});
});

});

//end
});
//end
}
            else {
        $('#modelbody').show();
                $('#modelfooter').show();
                $('#loader_div').remove();
    swal({   
        title: "Error",   
        text: "Failed to Delete Q&A Pair",   
        type: "success",   
        confirmButtonColor: "#DD6B55",   
        confirmButtonText: "OK",   
        closeOnConfirm: true 
    }, function(){   
        window.location.href=$SCRIPT_ROOT+'/Settings/faqs'
    });
}

}

//method for search
        function myFunction() {
        $("#searchdata").on("keyup", function () {
            var value = $(this).val().toLowerCase();
            $("#questionlist tr").filter(function () {
                $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        });
}
