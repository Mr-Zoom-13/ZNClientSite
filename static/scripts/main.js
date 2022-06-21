// function for format data for searching dialog select
function formatData(data) {
    if (!data.id) {
        return data.text;
    }
    let result = 1
    // sending a request to the server's API
    fetch('http://localhost:5000/api/v1/dialogs')
        // return error code if is exists
        .then((response) => {
            return response.json();
        })
        // the main handler of request
        .then((myjson) => {
            dialogs = myjson.dialogs;
        })
    // adding avatar with text for select's option
    for (let i = 0; i < dialogs.length; i++) {
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
    if (result === 1) {
        return data.text;
    } else {
        return result;
    }
}


$(document).ready(function () {
    // connect to the socket.io server
    var socket = io('http://localhost:5000/');
    // get the real id of user
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
        socket.emit('add_sid', {data: id_real});
    })
    socket.on('user_update', function (data) {
        if (window.location.href.slice(window.location.href.length - 1) == data.data) {
            document.getElementById("last_seen").textContent = data.last_seen;
        }
    })

    window.onbeforeunload = function () {
        socket.emit('delete_sid', {data: id_real});
    }

    // interception of a link click
    window.onload = function () {
        var a = document.getElementById('my_profile');
        a.onclick = function () {
            return false;
        }
    }

})


// set select of searching dialogs function
function messenger_set_select() {
    // select2 module for the best select design
    $(".js-select2").select2({
        templateResult: formatData,
        templateSelection: formatData,
        placeholder: "Choose dialog..."
    });
    this_select = document.getElementById('choose_dialog')
    var length = this_select.options.length;
    // clear select
    for (i = length - 1; i >= 0; i--) {
        this_select.options[i] = null;
    }
    // add first option
    var opt_first = document.createElement('option');
    opt_first.value = "";
    opt_first.innerHTML = "";
    this_select.appendChild(opt_first);
    // sending a request to the server's API
    fetch('http://localhost:5000/api/v1/dialogs')
        // return error code if is exists
        .then((response) => {
            return response.json();
        })
        // the main handler of request
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

// function for updating info about dialogs
function messenger() {
    // clear the place for new content
    clear_place()
    // add the frame of dialogs
    $('.parent').append(`    <div class="searcher_dialogs">
        <select class="js-select2 position-sticky" name="city" id="choose_dialog" placeholder="Выберите город">
            <option value=""></option>
        </select>
    </div>
    <div class="messenger" id="main_messenger">
        <ul class="ul_messenger" id="ul_messenger_id">
            <li><div class="delimiter"><span>-------------------------------------------------</span></div></li>
        </ul>
    </div>`)
    const myDiv = document.querySelector('.messenger')
    // check for user's scrolling and if user scroll to the bottom call the function messenger()
    myDiv.addEventListener('scroll', () => {
        if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
            localStorage.setItem('dialog', parseInt(localStorage.getItem('dialog')) + 5)
            console.log(localStorage.getItem('dialog'))
            messenger()
        }
    })
    // adding the gif of loading
    //   https://i.gifer.com/VAyR.gif  -  another gif for loading
    var ul = document.getElementById("ul_messenger_id");
    ul.innerHTML += `<li><div id="id_gif">
    <img src="../static/gif/loading.gif" alt="loading..." class="gif_loading">
    </div></li>`
    // sending a request to the server's API
    fetch('http://localhost:5000/api/v1/dialogs')
        // return error code if is exists
        .then((response) => {
            return response.json();
        })
        // the main handler of request
        .then((myjson) => {
            // getting all dialogs
            dialogs = myjson.dialogs;
            // checking the correctness condition of the local storage
            if (parseInt(localStorage.getItem('dialog')) < dialogs.length) {
                // call function to adding dialog
                add_dialogs(localStorage.getItem('dialog'))
            } else {
                if (parseInt(localStorage.getItem('dialog')) - dialogs.length < 5) {
                    // call function to adding dialog
                    add_dialogs(dialogs.length);
                }
            }
            // del gif-loading
            $('#id_gif').remove()
            messenger_set_select()
        })
}

// function to add dialog
function add_dialogs(end_count) {
    for (let i = localStorage.getItem('dialog') - 5; i < end_count; i++) {
        var ul = document.getElementById("ul_messenger_id");
        ul.innerHTML += `<div onclick="set_profile()"><span>` + dialogs[i].title + `</span></div><li class="one_dialog_li" data-dialog-id="` + dialogs[i].id + `" id="ul` + dialogs[i].id + `" onclick="set_chat(this)" >
        <div class="one_dialog" data-dialog-id="` + dialogs[i].id + `">
            <img src="data:image/png;base64,` + dialogs[i].avatar + `"` + `alt="avatar1" class="avatar_messenger">

            <div class="last_message">` +
            dialogs[i].messages[dialogs[i].messages.length - 1].text
            + `</div>
            <div class="last_message_time">` +
            dialogs[i].messages[dialogs[i].messages.length - 1].time
            + `</div>
        </div>
        <div class="delimiter"><span>-------------------------------------------------</span></div>
    </li>`;
    }
}

function set_chat(_this) {
    clear_place()
    dialog_id = $(_this).attr('data-dialog-id')
    // sending a request to the server's API
    fetch('http://localhost:5000/api/v1/dialogs/' + String(dialog_id))
        // return error code if is exists
        .then((response) => {
            return response.json();
        })
        // the main handler of request
        .then((myjson) => {
            // getting this dialog
            dialog = myjson.dialog;
            $('.parent').append(`<div class="messenger dialog" id="header_chat">
        <div class="d-inline-block but_back" onclick="messenger()"><< Back</div>
            <a href="https://vk.com/al_im.php" class="d-inline-block text-decoration-none link_profile_in_chat">
                <img  src="data:image/png;base64,` + dialog.avatar + `" class="avatar_messenger d-inline-block">
                <div class="d-inline-block">
                    <h1>` + dialog.title + `</h1>
                </div>
            </a>
    </div>
    <div class="messenger chat_other indent" id="chat">
                <div class="messages" id="block2">
                </div>
            <input type="text" placeholder="Message..." id="message" name="message" autofocus class="send_message">
    </div>`)
            fill_chat(dialog)
        })
}

function set_profile() {
    alert('PROFIIIILE')
}

function clear_place() {
    if ($('.parent').find('.searcher_dialogs')) {
        $('.searcher_dialogs').remove()
        $('#main_messenger').remove()
    }
    if ($('.parent').find('#header_chat')) {
        $('#header_chat').remove()
        $('#chat').remove()
    }
}

function fill_chat(dialog) {
    parent_div = $('#block2')
    current_date = 0
    for (let i = 0; i < dialog.messages.length; i++) {
        if (current_date == 0) {
            current_date = dialog.messages[i].date
            parent_div.append(`<div class="message_date_line">` + current_date + `</div><div class="clear-line"></div>`)
        } else {
            if (current_date != dialog.messages[i].date) {
                current_date = dialog.messages[i].date
                parent_div.append(`<div class="message_date_line">` + current_date + `</div><div class="clear-line"></div>`)
            }
        }
        if (id_real == dialog.messages[i].user.id) {
            parent_div.append(`<div class="chat_messages_2">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><div class="message_time_2">` + dialog.messages[i].time + `</div><div class="clear-line"></div>`)
        } else {
            parent_div.append(`<div class="chat_messages">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><span class="message_time">` + dialog.messages[i].time + `</span><div class="clear-line"></div>`)
        }
    }
}