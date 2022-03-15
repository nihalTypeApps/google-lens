$(document).ready(function(){
  $("#Order-Details").validate()
  $("#Pickup-Details").validate({
      errorClass: "text-danger",
      errorElement: "p",
      errorPlacement:function(error, element) {
        par=$(element);
        error.insertAfter(par);
      },
      rules:{
        phone:{
          number:true,
        }
      }
    });
  checkUploadedImages();
});
$('#customRadio1').click(function(){
  var isChecked = $("#customRadio1").prop('checked');
  if(isChecked){
    $(".describe-button").removeAttr('disabled');
  }
  else{
    $(".describe-button").attr('disabled','disabled');
  }
});


var showOrderDetails = function(){
  $('.custom-recycle li:nth-child(1) a').addClass('active').addClass('show');
  $('.custom-recycle-content #describe').addClass('active').addClass('show');

  $('.custom-recycle li:nth-child(2) a').removeClass('active').removeClass('show');
  $('.custom-recycle-content #pick-details').removeClass('active').removeClass('show');
  $('#custom-review-order').addClass('d-none').removeClass('d-block');
}

var showPickupDetails = function(){
  $('.custom-recycle li:nth-child(1) a').removeClass('active').removeClass('show');
  $('.custom-recycle-content #describe').removeClass('active').removeClass('show');

  $('.custom-recycle li:nth-child(2) a').addClass('active').addClass('show');
  $('.custom-recycle-content #pick-details').addClass('active').addClass('show');
  $('#custom-review-order').addClass('d-none').removeClass('d-block');
}

var hidePickupDetails = function(){
  $('.custom-recycle li:nth-child(2) a').removeClass('active').removeClass('show');
  $('.custom-recycle-content #pick-details').removeClass('active').removeClass('show');
  $('#custom-review-order').removeClass('d-none').addClass('d-block');
}

$("#editPickupDetails").click(function(e){
  e.preventDefault();
  showPickupDetails();
});

$("#editDeviceDetails").click(function(e){
  e.preventDefault();
  showOrderDetails();
});

$('.describe-button').click(function(e){
  e.preventDefault();
  if($("#Order-Details").valid() && $('.custom-image-container .input_img').length > 0){
    var orderDetailData = {}
    $('#Order-Details input, #Order-Details select').each(function(index){
        var input = $(this);
        switch(input.attr('name')){
          case 'category':{
            $("#order-category").text($("#Order-Details select[name=category] option:selected").text());
            $(".order-category").val(input.val());
            orderDetailData['category'] = input.val();
          } break;
          case 'company':{
            $("#order-company").text(input.val());
            $(".order-company").val(input.val());
            orderDetailData['company'] = input.val();
          } break;
          case 'quantity':{
            $("#order-quantity").text(input.val());
            $(".order-quantity").val(input.val());
            orderDetailData['quantity'] = input.val();
          } break;
          case 'is_agree':{

          } break;
          case 'is_notification':{
            var isChecked = input.prop('checked');
            var is_notification = (isChecked == true)?1:0;
            $(".order-is_notification").val(is_notification);
            orderDetailData['is_notification'] = isChecked;
          } break;
        }
    });
    sessionStorage.setItem("orderDetailData", JSON.stringify(orderDetailData));
    showPickupDetails();
  }

  if($('.custom-image-container .input_img').length == 0){
    general_Attr('#custom-imageUploadSection',2,'Upload at least one image.');
  }
});

$('.Pickup-Details-Button').click(function(e){
  e.preventDefault();
  if($("#Pickup-Details").valid()){
    var pickupDetailData = {}
    $('#Pickup-Details input, #Pickup-Details select').each(function(index){
      var input = $(this);
      //console.log('Name: ' + input.attr('name') + '| Value: ' + input.val());
      switch(input.attr('name')){
        case 'pickup_date':{
          var mydate = new Date(input.val());
          var monthNames = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

var newDate = new Date(input.val());
var formattedDate = newDate.getDate()+ ' '+monthNames[newDate.getMonth()] + ' ' + newDate.getFullYear();
          //console.log(formattedDate);
          //var str = mydate.toString("MMMM yyyy");
          $("#order-pickup-date").text(formattedDate);
          $(".order-pickup-date").val(input.val());
          pickupDetailData['pickup_date'] = input.val();
        } break;
        case 'phone':{
          $(".order-phone-number").val(input.val());
          $("#createAccount input[name=phone]").val(input.val());
          pickupDetailData['phone'] = input.val();
        } break;
        case 'address1':{
          $("#order-pickup-address").text(input.val());
          $(".order-pickup-address1").val(input.val());
          pickupDetailData['address1'] = input.val();
        } break;
        case 'address2':{
          $("#order-pickup-address-2").text(input.val());
          $(".order-pickup-address2").val(input.val());
          pickupDetailData['address2'] = input.val();
        } break;
        case 'city':{
          $("#order-city").text(input.val());
          $(".order-city").val(input.val());
          pickupDetailData['city'] = input.val();
        } break;
        case 'state':{
          $("#order-state").text(input.val());
          $(".order-state").val(input.val());
          pickupDetailData['state'] = input.val();
        } break;
        case 'postal_code':{
          $("#order-postal_code").text(input.val());
          $(".order-postal_code").val(input.val());
          pickupDetailData['postal_code'] = input.val();
        } break;
      }
    });
    sessionStorage.setItem("pickupDetailData", JSON.stringify(pickupDetailData));
    sessionStorage.setItem("isAjaxCreateAccount", 1);
    hidePickupDetails();
    if(sessionStorage.alreadySubmit){
      $("#orderReview").submit();
    }
  }
});
if(sessionStorage.orderDetailData){
  var sessionData = sessionStorage.getItem("orderDetailData");
  $.each(JSON.parse(sessionData), function(key, value){
    switch(key){
      case 'category':{
        $("#Order-Details select[name="+key+"]").val(value);
      }break;
      case 'quantity':{
        $("#Order-Details select[name="+key+"]").val(value);
      }break;
      case 'is_notification':{
        if(value == true){
          $("#Order-Details input[name="+key+"]").attr('checked','checked');
        }
      }break;
      default:{
        $("#Order-Details input[name="+key+"]").val(value);
      }
    }
  });
  setTimeout(function(){$('.describe-button').click(); }, 1000);
}

if(sessionStorage.pickupDetailData){
  var sessionData = sessionStorage.getItem("pickupDetailData");
  $.each(JSON.parse(sessionData), function(key, value){
    $("#Pickup-Details input[name="+key+"]").val(value);
  });
  setTimeout(function(){$('.Pickup-Details-Button').click(); }, 1000);
}
var uploadImge = function(element){
  var env = $(element);
  var file_data = $(element).prop('files')[0];

  var form_data = new FormData();
  form_data.append('image', file_data);
  form_data.append('location', 'Noida');
  $.ajax({
  url: base_url+'/upload_image',
  dataType: 'json',
  cache: false,
  contentType: false,
  processData: false,
  data: form_data,
  type: 'post',
  beforeSend: function(){
    removeAlert();
    //$(".Image_Upload").prepend('<i class="fa fa-cog fa-spin fa-1x fa-fw text-success custom-image-upload-process"></i>');
    env.parent().prepend('<i class="fa fa-cog fa-spin fa-1x fa-fw text-success custom-image-upload-process"></i>');
  },
  success: function (json) {
    console.log(json);
    if($.trim(json.status) == 1){
      $(".custom-image-container").append(json.image_element);
    }
    else{
      error_Attr('custom-imageUploadSection',json.message);
    }
    env.parent().find(".custom-image-upload-process").remove();
  }
  });
}

var checkUploadedImages = function(){
  var data = {};
  if(sessionStorage.visitor_token){
    data['visitor_token'] = sessionStorage.getItem('visitor_token');
  }
  $.ajax({
  url: base_url+'/check_uploaded_image',
  dataType: 'json',
  type: 'post',
  data:data,
  async: false,
  beforeSend: function(){
    removeAlert();
  },
  success: function (json) {
    if(json.status == 1){
      $(".custom-image-container").append(json.images);
    }
  }
  });
}

$("body").on('click','.custom-image-container .input_img a', function(e){
  e.preventDefault();
  var element = $(this);
  $.ajax({
  url: base_url+'/remove_uploaded_image',
  dataType: 'json',
  type: 'post',
  data:{id:$(this).attr('image-id')},
  beforeSend: function(){
    removeAlert();
    element.html('<i class="fa fa-cog fa-spin fa-1x fa-fw text-success custom-image-upload-process"></i>');
  },
  success: function (json) {
    if(json.status == 1){
      successing_Attr('custom-imageUploadSection',json.message);
      element.parent().remove();
    }
    else{
      error_Attr('custom-imageUploadSection',json.message);
    }
  }
  });
});

function initAutocomplete() {
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if(places.length == 0) {
      return;
    }
    else{
      if(places[0]){
        var address1 = '';
        var address2 = places[0]['formatted_address'];
        var formatted_address = places[0]['formatted_address'];
        var address_components = places[0]['address_components'];
        for (var i=0; i<address_components.length; i++){
          if (address_components[i].types[0] == "street_number") {
            address1 +=' '+address_components[i]['long_name'];
            $("#city").val(address_components[i]['long_name']);
          }
          if (address_components[i].types[0] == "locality") {
            address1 +=' '+address_components[i]['long_name'];
            $("#city").val(address_components[i]['long_name']);
          }
          if (address_components[i].types[0] == "administrative_area_level_1") {
            address1 +=' '+address_components[i]['long_name'];
            $("#state").val(address_components[i]['long_name']);
          }
          if (address_components[i].types[0] == "country") {
            address1 +=' '+address_components[i]['long_name'];
            $("#country").val(address_components[i]['long_name']);
          }
          if (address_components[i].types[0] == "postal_code") {
            address1 +=' '+address_components[i]['long_name'];
            var postal_code = address_components[i]['long_name'];
            $("#postal_code").val(postal_code);
            if(postal_code!=""){
              //authPincode();
            }
          }
        }
      $("#pac-input").val(address2);
      $("#Address2").val(address1);
      }
    }
  });
}


(function(){
  $("#orderReview").validate({
      errorClass: "text-danger",
      errorElement: "p",
      errorPlacement:function(error, element) {
        par=$(element);
        error.insertAfter(par);
      }
    });

  var form_options = {
    dataType: "json",
    beforeSubmit: function(formData, jqForm, options){
      var formID = jqForm.attr('id');
      var user_id = $("#orderReview input[name=user_id]").val();
      if(user_id == 0){
        $("#login").modal('show');
        sessionStorage.setItem("alreadySubmit", 1);
        return false;
      }
      processing_Attr(formID);
    },
    success: function(json, responseText, xhr, form){
      var formID = form.attr('id');
      if(json.status == 1){
        successing_Attr(formID,json.message);
        $("#congrats form input[name=order_id]").val(json.order_id);
        $("#congrats #possibility_co_emission").text(json.emission.co_emission);
        $("#congrats #possibility_metals_saved").text(json.emission.metals_saved);
        $("#congrats #possibility_reward_point").text(json.reward_point);
        $("#congrats").modal('show');
        if(json.refresh){
            location.reload();
        }
        if(json.redirect){
        setTimeout(function(){
        location.assign(json.redirect);
        },2000);
        }
      }
      else{
        error_Attr(formID,json.message);
      }
    }
  };
  $("#orderReview").ajaxForm(form_options);
})();

// $('#congrats').on('hidden.bs.modal', function () {
//   var order_id = $("#congrats form input[name=order_id]").val();
//   $.ajax({
//   url: base_url+'/remove_uploaded_image',
//   dataType: 'json',
//   type: 'post',
//   data:{id:order_id},
//   beforeSend: function(){
//
//   },
//   success: function (json) {
//
//   }
//   });
// });
$('.customAcceptBtn').click(function(){
  if(sessionStorage.pickupDetailData){
    sessionStorage.removeItem('pickupDetailData');
  }
  if(sessionStorage.orderDetailData){
    sessionStorage.removeItem('orderDetailData');
  }
  if(sessionStorage.visitor_token){
    sessionStorage.removeItem('visitor_token');
  }
  if(sessionStorage.isAjaxCreateAccount){
    sessionStorage.removeItem('isAjaxCreateAccount');
  }
});
