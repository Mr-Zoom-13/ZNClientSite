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
    start = null
    unread = []
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
        localStorage.setItem('dialog', 10)
        messenger(false)
        socket.emit('add_sid', {data: id_real});
    })
    socket.on('user_update', function () {
        messenger(false)
    })
    socket.on('new_message', function (data) {
        console.log(data)
        parent_div = $('#block2')
        if (data.message.date != localStorage.getItem('message_last_date')) {
            parent_div.append(`<div class="message_date_line">` + data.message.date + `</div><div class="clear-line"></div>`)
        }
        unread.push(data.message)
        if (id_real == data.message.user_id) {
            parent_div.append(`<div class="chat_messages_2 not_read" id="message` + String(data.message.id - 1) + `" data-real-msg-id="` + data.message.id + `">` + data.user.name + ` ` + data.user.surname + `<p>` + data.message.text + `</p></div><div class="message_time_2">` + data.message.time + `</div><div class="clear-line"></div>`)
        } else {
            parent_div.append(`<div class="chat_messages not_read_recipient" id="message` + String(data.message.id - 1) + `" data-real-msg-id="` + data.message.id + `">` + data.user.name + ` ` + data.user.surname + `<p>` + data.message.text + `</p></div><span class="message_time">` + data.message.time + `</span><div class="clear-line"></div>`)
        }
        parent_div.scrollTop(parent_div.prop('scrollHeight'));
    })
    socket.on("set_read_sender", function (data) {
        $(`[data-real-msg-id~="` + data.message_id + `"]`).removeClass('not_read')
        console.log("Remove class from the sender")
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
    function messenger(scrolling) {

        if (!scrolling) {
            // clear the place for new content
            clear_place()
            // add the frame of dialogs
            $('.parent').append(`    <div class="searcher_dialogs">
        <select class="js-select2 position-sticky" name="city" id="choose_dialog" placeholder="Выберите город">
            <option value=""></option>
        </select>
    </div>
    <div class="messenger main_messenger_class" id="main_messenger">
        <ul class="ul_messenger" id="ul_messenger_id">
            <li><div class="message_date_line delimiter"> </div></li>
        </ul>
    </div>`)
            // clear the counter of dialogs
            localStorage.setItem('dialog', 10)
        }

        const myDiv = document.querySelector('.messenger')
        // check for user's scrolling and if user scroll to the bottom call the function messenger()
        myDiv.addEventListener('scroll', () => {
            console.log("scrl")
            // scrollTracking()
            if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight - 10) {
                localStorage.setItem('dialog', parseInt(localStorage.getItem('dialog')) + 10)
                console.log(localStorage.getItem('dialog'))
                messenger(true)
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
                    if (parseInt(localStorage.getItem('dialog')) - dialogs.length <= 10) {
                        // call function to adding dialog
                        add_dialogs(dialogs.length);
                    } else {
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
        for (let i = localStorage.getItem('dialog') - 10; i < end_count; i++) {
            var ul = document.getElementById("ul_messenger_id");
            is_online = ` `
            if (dialogs[i].users.length == 2) {
                for (let j = 0; j < dialogs[i].users.length; j++) {
                    if (dialogs[i].users[j].id != id_real && dialogs[i].users[j].last_seen == "online") {
                        is_online = `<p class="online_circle"></p>`
                    }
                }
            }
            ul.innerHTML += `<div onclick="set_profile()">` + is_online + `<span class="fio_dialog">` + dialogs[i].title + `</span></div><li class="one_dialog_li" data-dialog-id="` + dialogs[i].id + `" id="ul` + dialogs[i].id + `" onclick="set_chat(this)" >
        <div class="one_dialog" data-dialog-id="` + dialogs[i].id + `">
            <img src="data:image/png;base64,` + dialogs[i].avatar + `"` + `alt="avatar1" class="avatar_messenger">

            <div class="last_message">` +
                dialogs[i].messages[dialogs[i].messages.length - 1].text
                + `</div>
            <div class="last_message_time">` +
                dialogs[i].messages[dialogs[i].messages.length - 1].time
                + `</div>
        </div>
        <div class="message_date_line delimiter"> </div>
    </li>`;
        }
    }

    function set_chat(_this) {
        clear_place()
        localStorage.setItem('message', 10)
        dialog_id = $(_this).attr('data-dialog-id')
        // emot socket io for connect to room(this dialog)
        socket.emit("join_dialog", {"dialog_id": dialog_id})
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
        <div class="d-inline-block but_back" onclick="messenger(false)"><< Back</div>
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
            <input type="text" placeholder="Message..." id="message" name="message" data-dialog-id="` + dialog.id + `" autofocus class="send_message">
    </div>`)
                messages = document.getElementById('block2')
                messages.addEventListener('scroll', () => {
                    if (messages.scrollTop == 0) {
                        localStorage.setItem('message', Number(localStorage.getItem('message')) + 10)
                        fill_chat(dialog)
                        my_top = $('#message' + String(Number(localStorage.getItem('start')) - 4)).offset().top
                        messages.scrollTop = my_top
                    }
                    unread = unread.filter(function (item, key) {
                        if (is_shown(`[data-real-msg-id~="` + item.id + `"]`) && $(`[data-real-msg-id~="` + item.id + `"]`).hasClass('not_read_recipient')) {
                            socket.emit("set_read", data = {'message_id': item.id})
                            return false
                        }
                        return true
                    })
                    console.log(unread)
                })
                fill_chat(dialog)
                var div = $("#block2");
                div.scrollTop(div.prop('scrollHeight'));
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
        localStorage.setItem('start', start)
        if (dialog.messages.length - localStorage.getItem('message') < 0) {
            start = 0
        } else {
            start = dialog.messages.length - localStorage.getItem('message')
        }
        for (let i = dialog.messages.length - localStorage.getItem('message') + 9; i >= start; i--) {
            if (id_real == dialog.messages[i].user.id) {
                if (dialog.messages[i].was_read == 1) {
                    parent_div.prepend(`<div class="chat_messages_2" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><div class="message_time_2">` + dialog.messages[i].time + `</div><div class="clear-line"></div>`)
                }
                else {
                    unread.push(dialog.messages[i])
                    parent_div.prepend(`<div class="chat_messages_2 not_read" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><div class="message_time_2">` + dialog.messages[i].time + `</div><div class="clear-line"></div>`)
                }
            } else {

                if (dialog.messages[i].was_read == 1) {
                    parent_div.prepend(`<div class="chat_messages" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><span class="message_time">` + dialog.messages[i].time + `</span><div class="clear-line"></div>`)

                }
                else {
                    unread.push(dialog.messages[i])
                    parent_div.prepend(`<div class="chat_messages not_read_recipient" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><span class="message_time">` + dialog.messages[i].time + `</span><div class="clear-line"></div>`)
                }
            }

            if (i - 1 >= 0) {
                checking = i - 1
            }
            if (dialog.messages[i].date != dialog.messages[checking].date) {
                parent_div.prepend(`<div class="message_date_line">` + dialog.messages[i].date + `</div><div class="clear-line"></div>`)


            }
        }
        localStorage.setItem('message_last_date', dialog.messages[dialog.messages.length - 1].date)
        $(".send_message").keyup(function (event) {
            if (event.keyCode == 13 && $(this).val()) {
                event.preventDefault();
                socket.emit("add_message", {
                    "dialog_id": $(this).attr('data-dialog-id'),
                    "user_id": id_real,
                    "text": $(this).val()
                })
                document.getElementById('message').value = ""
            }
        });
    }

    function is_shown(target) {
        console.log(target)
        try {
            var wt = $("#block2").scrollTop();
        var wh = $("#block2").height();
        var eh = $(target).outerHeight();
        var et = $(target).offset().top;

        if (wt + wh >= et && wt + wh - eh * 2 <= et + (wh - eh)) {
            return true;
        } else {
            return false;
        }
        }
        catch(e) {

        }
    }

    window.fill_chat = fill_chat;
    window.clear_place = clear_place;
    window.set_chat = set_chat;
    window.set_profile = set_profile;
    window.add_dialogs = add_dialogs;
    window.messenger = messenger;
    window.messenger_set_select = messenger_set_select;
})