$("body").on("click", ".editOrder", function(e){
  e.preventDefault();
  var order_id = $(this).attr('data-id');
  $.ajax({
    url: base_url+'/edit_order',
    dataType: 'json',
    // cache: false,
    // contentType: false,
    // processData: false,
    data: {order_id:order_id},
    type: 'post',
    beforeSend: function(){
      //removeAlert();
    },
    success: function (json) {
      console.log(json);
      if(json.status == 1){
        sessionStorage.setItem("orderDetailData", JSON.stringify(json.orderDetailData));
        sessionStorage.setItem("pickupDetailData", JSON.stringify(json.pickupDetailData));
        sessionStorage.setItem('visitor_token',json.visitor_token);
        location.assign('recycle');
      }
      else{
        alert('Invalid Request');
      }
    }
  });
});

// $(".editOrder").click(function(e){
//   e.preventDefault();
//   var order_id = $(this).attr('data-id');
//   $.ajax({
//     url: base_url+'/edit_order',
//     dataType: 'json',
//     // cache: false,
//     // contentType: false,
//     // processData: false,
//     data: {order_id:order_id},
//     type: 'post',
//     beforeSend: function(){
//       //removeAlert();
//     },
//     success: function (json) {
//       console.log(json);
//       if(json.status == 1){
//         sessionStorage.setItem("orderDetailData", JSON.stringify(json.orderDetailData));
//         sessionStorage.setItem("pickupDetailData", JSON.stringify(json.pickupDetailData));
//         sessionStorage.setItem('visitor_token',json.visitor_token);
//         location.assign('recycle');
//       }
//       else{
//         alert('Invalid Request');
//       }
//     }
//   });
// });

$(".custom-cancel").click(function(){
  var orderId = $(this).attr('data-id');
  $("#custom-confirm a").attr('href',base_url+'/cancel_order/'+orderId);
});
