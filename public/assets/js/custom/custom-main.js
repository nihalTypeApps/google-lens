var processing_Attr = function(form_Id, message = ''){
  removeAlert();
  if(form_Id!="" && message!=""){
    $("#"+form_Id).prepend('<div class="alert alert-warning alert-dismissable"><i class="fa fa-cog fa-spin"></i>&nbsp;&nbsp;'+message+'</div>');
    $("#"+form_Id+"-btn").attr("disabled","disabled");
    $("#"+form_Id+"-btn-2").attr("disabled","disabled");
  }
  else if(form_Id!=""){
    $("#"+form_Id).prepend('<div class="alert alert-warning alert-dismissable"><i class="fa fa-cog fa-spin"></i>&nbsp;&nbsp;Processing...</div>');
    $("#"+form_Id+"-btn").attr("disabled","disabled");
    $("#"+form_Id+"-btn-2").attr("disabled","disabled");
  }
  else{
    return false;
  }
}

var warning_call = function(form_Id, message = ''){
  removeAlert();
  if(form_Id!="" && message!=""){
    $("#"+form_Id).prepend('<div class="alert custom-class-alert alert-warning alert-dismissable"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><a href="#" class="close" data-dismiss="alert" aria-label="close" title="close"><i class="fa fa-times" aria-hidden="true"></i></a>&nbsp;&nbsp;'+message+'</div>');
    $("#"+form_Id+"-btn").attr("disabled","disabled");
    $("#"+form_Id+"-btn-2").attr("disabled","disabled");
  }
  else if(form_Id!=""){
    $("#"+form_Id).prepend('<div class="alert custom-class-alert alert-warning alert-dismissable"><i class="fa fa-exclamation-triangle" aria-hidden="true"></i><a href="#" class="close" data-dismiss="alert" aria-label="close" title="close"><i class="fa fa-times" aria-hidden="true"></i></a>&nbsp;&nbsp;Processing...</div>');
    $("#"+form_Id+"-btn").attr("disabled","disabled");
    $("#"+form_Id+"-btn-2").attr("disabled","disabled");
  }
  else{
  return false;
  }
}

var successing_Attr = function(form_Id, message = '', reset = 0){
  removeAlert();
  if(form_Id == "" && message == ""){
    return false;
  }
  else{
    if(form_Id!="" && message!=""){
      $("#"+form_Id).prepend('<div class="alert custom-class-alert alert-success alert-dismissable"><i class="fa fa-check-circle"></i><a href="#" class="close" data-dismiss="alert" aria-label="close" title="close"><i class="fa fa-times" aria-hidden="true"></i></a>&nbsp;&nbsp;'+message+'</div>');
    }
    else if(form_Id!=""){
      $("#"+form_Id).prepend('<div class="alert custom-class-alert alert-success alert-dismissable"><i class="fa fa-check-circle"></i><a href="#" class="close" data-dismiss="alert" aria-label="close" title="close"><i class="fa fa-times" aria-hidden="true"></i></a>&nbsp;&nbsp;Successful</div>');
    }
    $("#"+form_Id+"-btn").removeAttr("disabled");
    $("#"+form_Id+"-btn-2").removeAttr("disabled");
    if(reset == 1){
      $("#"+form_Id)[0].reset();
    }
  }
}


var error_Attr = function(form_Id, message = '', flag = 0, time = 2000){
    removeAlert();
    if(form_Id!="" && message!=""){
			if(Array.isArray(message)){
				var erorr_str="";
				$.each(message,function(index, value){
					erorr_str+=(index+1)+". "+value+"</br>";
				});
				$("#"+form_Id).prepend('<div class="alert custom-class-alert alert-danger">'+erorr_str+'</div>');
			}
			else{
					$("#"+form_Id).prepend('<div class="alert custom-class-alert alert-danger"><i class="fa fa-ban"></i>&nbsp;&nbsp;'+message+'</div>');
			}
        $("#"+form_Id+"-btn").removeAttr("disabled");
        $("#"+form_Id+"-btn-2").removeAttr("disabled");
    }
    else if(form_Id!=""){
        $("#"+form_Id).prepend('<div class="alert custom-class-alert alert-danger"><i class="fa fa-ban"></i>&nbsp;&nbsp;Error</div>');
        $("#"+form_Id+"-btn").removeAttr("disabled");
        $("#"+form_Id+"-btn-2").removeAttr("disabled");
    }
    else{
        return false;
    }
    if(flag == 1){
      setTimeout(function(){
        removeAlert();
      },time);
    }
}

var general_Attr = function(form_Id, message_type = 1, message = '', flag = 0, time = 2000){
    removeAlert();
    var msg_class = "alert-success";
    var i_class = "fa-check-circle";
    if(message_type == 1){
      msg_class = "alert-success";
      i_class = "fa-check-circle";
    }
    else if(message_type == 2){
      msg_class = "alert-danger";
      i_class = "fa-ban";
    }
    else if(message_type == 3){
      msg_class = "alert-warning";
      i_class = "fa-exclamation-triangle";
    }
    else if(message_type == 4){
      msg_class = "alert-warning";
      i_class = "fa-cog fa-spin";
    }
    if(form_Id!="" && message!=""){
			if(Array.isArray(message)){
				var erorr_str="";
				$.each(message,function(index, value){
					erorr_str+=(index+1)+". "+value+"</br>";
				});
				$(form_Id).prepend('<div class="alert custom-class-alert '+msg_class+'">'+erorr_str+'</div>');
			}
			else{
					$(form_Id).prepend('<div class="alert custom-class-alert '+msg_class+'"><i class="fa '+i_class+'"></i>&nbsp;&nbsp;'+message+'</div>');
			}
        $(form_Id+"-btn").removeAttr("disabled");
        $(form_Id+"-btn-2").removeAttr("disabled");
    }
    else if(form_Id!=""){
        $(form_Id).prepend('<div class="alert custom-class-alert '+msg_class+'"><i class="fa '+i_class+'"></i>&nbsp;&nbsp;Error</div>');
        $(form_Id+"-btn").removeAttr("disabled");
        $(form_Id+"-btn-2").removeAttr("disabled");
    }
    else{
        return false;
    }
    if(flag == 1){
      setTimeout(function(){
        removeAlert();
      },time);
    }
}


var redirecting_Attr = function(form_Id, message = ''){
  removeAlert();
  if(form_Id!="" && message!=""){
    $("#"+form_Id).prepend('<div class="alert custom-class-alert alert-info alert-dismissable"><i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;'+message+'</div>');
  }
  else if(form_Id!=""){
    $("#"+form_Id).prepend('<div class="alert custom-class-alert alert-info alert-dismissable"><i class="fa fa-refresh fa-spin"></i>&nbsp;&nbsp;Redirecting</div>');
  }
  else{
    return false;
  }
}
var removeAlert=function(args){
  if(args!=""){
    $(args).remove(); $(".alert").remove();
  }else{
    $(".alert").remove();
  }
}


$(document).ready(function(){

    $('#leads').wrap('<div class="table-slide"></div>');
    $('#salesReps').wrap('<div class="table-slide"></div>');
});
