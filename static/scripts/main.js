function formatData (data) {
  if (!data.id) { return data.text; }
  let result = 1
  fetch('http://localhost:5000/api/v1/dialogs')
        .then((response) => {
            return response.json();
        })
        .then((myjson) => {
            dialogs = myjson.dialogs;
        })

    for (let i = 0; i < dialogs.length; i++){
        if (data.id == dialogs[i].id) {
            console.log("AAAAA")
            first_url = "<span class=\"block\"><img src=\"data:image/png;base64,"
            second_url = '"'
            third_url = `alt="avatar1" class="avatar_messenger"> `
            fourth_url = `</span>`
            result = $(first_url + dialogs[i].avatar + second_url + third_url + data.text + fourth_url)
            ;
        }
    }
    if(result === 1) {
        return data.text;
    }
    else {
        return result;
    }
  }

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
        this_select = document.getElementById('choose_dialog')
        fetch('http://localhost:5000/api/v1/dialogs')
        .then((response) => {
            return response.json();
        })
        .then((myjson) => {
            dialogs = myjson.dialogs;
            var length = this_select.options.length;
            for (i = length-1; i >= 0; i--) {
                this_select.options[i] = null;
            }
            var opt_first = document.createElement('option');
                opt_first.value = "";
                opt_first.innerHTML = "";
                this_select.appendChild(opt_first);
            for (let i = 0; i < dialogs.length; i++){
                console.log(i)
                var opt = document.createElement('option');
                opt.value = dialogs[i].id;
                console.log(dialogs[i].id)
                opt.innerHTML = dialogs[i].title;
                this_select.appendChild(opt);
                var ul = document.getElementById("ul_messenger_id");
                ul.innerHTML += `<li>
                <div class="one_message">
                    <img src="data:image/png;base64,` + dialogs[i].avatar + `"` + `alt="avatar1" class="avatar_messenger">
                    <a href="https://vk.com/al_im.php" class="block">
                        <div class="fio">
                            <span>` + dialogs[i].title + `</span>
                        </div>
                    </a>
                    <div class="last_message">
                        <span>Пока</span>
                    </div>
                    <div class="last_message_time">
                        <span>18:35</span>
                    </div>
                </div>
            </li>
            <li><div class="delimiter"><span>-------------------------------------------------</span></div></li>`;
            }
        });
    }
})