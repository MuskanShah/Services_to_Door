
var url;
function url()
{
  url=document.URL;
  console.log("url is "+url);
}

  function send() {

   var fd = document.getElementById("feedback");
    var formData = {
     
      'email': fd.email.value,
      'msg': fd.msg.value,

    }
      
        var a1=document.URL.substring(22); 
        console.log("jjj"+a1); 
    fetch("http://localhost:3000/acceptFeedback/"+a1, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),

    })
    .then((response) => {
        return response.text();
    })
    .then((mytext) => {
       window.location.href = a1;
        console.log(mytext);
    })

    .catch(function () {
        console.log("error");
    });

    return false;
  }
  