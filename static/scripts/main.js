const myDiv = document.querySelector('.messenger')
myDiv.addEventListener('scroll', () => {
  if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
    localStorage.setItem('dialog', parseInt(localStorage.getItem('dialog')) + 5)
    console.log(localStorage.getItem('dialog'))
    messenger()
  }
})


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
        localStorage.setItem('dialog', 5)
        messenger()
        messenger_set_select()
        socket.emit('add_sid', {data: id_real});
    })
    socket.on('user_update', function (data) {
        if(window.location.href.slice(window.location.href.length - 1) == data.data){
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
            return false;
        }
    }

})

function messenger_set_select () {
    this_select = document.getElementById('choose_dialog')
    var length = this_select.options.length;
    for (i = length-1; i >= 0; i--) {
        this_select.options[i] = null;
    }
    var opt_first = document.createElement('option');
    opt_first.value = "";
    opt_first.innerHTML = "";
    this_select.appendChild(opt_first);
    fetch('http://localhost:5000/api/v1/dialogs')
    .then((response) => {
        return response.json();
    })
    .then((myjson) => {
            dialogs = myjson.dialogs;
            for (let i = 0; i < dialogs.length; i++) {
                var opt = document.createElement('option');
                opt.value = dialogs[i].id;
                opt.innerHTML = dialogs[i].title;
                this_select.appendChild(opt);
            }
    })
}

function messenger () {
        var ul = document.getElementById("ul_messenger_id");
        ul.innerHTML += `<li><div id="mmm">
<!--        https://i.gifer.com/VAyR.gif-->
        <img src="../static/gif/loading.gif" alt="я джифка" class="gif_loading">
    </div></li>`
        fetch('http://localhost:5000/api/v1/dialogs')
        .then((response) => {
            return response.json();
        })
        .then((myjson) => {
            dialogs = myjson.dialogs;
            if(parseInt(localStorage.getItem('dialog')) < dialogs.length) {
                for (let i = localStorage.getItem('dialog') - 5; i < localStorage.getItem('dialog'); i++){
                var ul = document.getElementById("ul_messenger_id");
                ul.innerHTML += `<li id="ul` + dialogs[i].id + `">
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
            }
            else{
                if(parseInt(localStorage.getItem('dialog')) - dialogs.length < 5) {
                for (let i = localStorage.getItem('dialog') - 5; i < dialogs.length; i++){
                var ul = document.getElementById("ul_messenger_id");
                ul.innerHTML += `<li id="ul` + dialogs[i].id + `">
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
            }
            }
            $('#mmm').remove()
        });

    }