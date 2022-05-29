function formatData (data) {
  if (!data.id) { return data.text; }
  if (data.id == "340") {
      $result= $(
    '<span class="block"><img src="../static/img/avatar1_ready.jpg" class="avatar_messenger"/> ' + data.text + '</span>'
      );
      return $result;
  }
    return data.text;

};

$(".js-select2").select2({
  templateResult: formatData,
  templateSelection: formatData,
    placeholder: "Choose dialog..."
});


$(document).ready(function() {
    var socket = io('http://localhost:5000/');
    fetch('/api')
        .then((response) => {
            return response.json();
        })
        .then((myjson) => {
            id_real = myjson.id;
        });
    socket.on('connect', function () {
        messenger()
        socket.emit('add_sid', {data: id_real});
    })
    socket.on('user_update', function (data) {
        console.log("ZASHEL");
        if(window.location.href.slice(window.location.href.length - 1) == data.data){
            console.log(data.data);
            document.getElementById("last_seen").textContent = data.last_seen;
        }
    })

    window.onbeforeunload = function () {
            socket.emit('delete_sid', {data: id_real});
        }

    window.onload = function () {

    //получаем идентификатор элемента
        var a = document.getElementById('my_profile');

    //вешаем на него событие
        a.onclick = function() {
            console.log("!!!!!!!!!")
            return false;
        }
    }
    function messenger () {
        fetch('http://localhost:5000/api/v1/dialogs')
        .then((response) => {
            return response.json();
        })
        .then((myjson) => {
            dialogs = myjson.dialogs;
            console.log(dialogs);
        });
    }
})