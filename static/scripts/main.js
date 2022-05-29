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
})