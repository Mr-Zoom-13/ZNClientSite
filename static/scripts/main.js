const SERVER_URL = 'http://localhost:5000/'
const SERVER_API = 'api/v1/'

// function for format data for searching dialog select
function formatData(data) {
    if (!data.id) {
        return data.text;
    }
    let result = 1
    // sending a request to the server's API
    fetch(SERVER_URL + SERVER_API + 'dialogs')
        // return error code if is exists
        .then((response) => {
            return response.json();
        })
        // the main handler of request
        .then((myjson) => {
            dialogs = myjson.dialogs.filter(function (item, key) {
                flag_real = false;
                for (let i = 0; i < item.users.length; i++) {
                    if (item.users[i].id == id_real) flag_real = true
                }
                if (flag_real) {
                    return true;
                } else {
                    return false
                }
            });
        })
    // adding avatar with text for select's option
    for (let i = 0; i < dialogs.length; i++) {
        if (data.id == dialogs[i].id) {

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
    var socket = io(SERVER_URL);
    // get the real id of user
    fetch('/api')
        .then((response) => {
            return response.json();
        })
        .then((myjson) => {
            id_real = myjson.id;
        });
    // connect to the socket.io server
    socket.on('connect', function () {
        localStorage.setItem('dialog', 10)
        messenger(false)
        socket.emit('add_sid', {data: id_real});
    })
    // event for connect another member in dialog
    socket.on('user_update', function (data) {
        fetch(SERVER_URL + SERVER_API + 'dialogs')
            // return error code if is exists
            .then((response) => {
                return response.json();
            })
            // the main handler of request
            .then((myjson) => {
                // getting all dialogs
                if (id_real != data.user_id) {

                    dialogs = myjson.dialogs.filter(function (item, key) {
                        flag_real = false;
                        flag_user = false;
                        for (let i = 0; i < item.users.length; i++) {
                            if (item.users[i].id == id_real) flag_real = true
                            if (item.users[i].id == data.user_id) flag_user = true
                        }
                        if (flag_real && flag_user) {
                            return true;
                        } else {
                            return false
                        }
                    });

                    current_viewing = Number(localStorage.getItem('dialog'))
                    // checking length of dialogs and current user's viewing
                    if (current_viewing > dialogs.length) current_viewing = dialogs.length
                    // changing status in dialogs
                    for (let i = 0; i < current_viewing; i++) {
                        dialog_set_profile = $("#set_profile" + String(dialogs[i].id))
                        if (data.online) {

                            members_online = Number(dialog_set_profile.attr("data-members-online")) + 1
                        } else {

                            members_online = Number(dialog_set_profile.attr("data-members-online")) - 1
                        }
                        dialog_set_profile.attr("data-members-online", String(members_online))
                        dialog_set_profile.empty()
                        is_online = ` `
                        if (dialogs[i].users.length == 2 && members_online == 1) {
                            is_online = `<p class="online_circle"></p>`
                        } else {
                            if (members_online != 0) {
                                is_online = `<p class="online_circle"></p><p class="online_title">` + String(members_online) + `/` + String(dialogs[i].users.length - 1) + `</p>`
                            }
                        }
                        dialog_set_profile.prepend(`<span class="fio_dialog">` + dialogs[i].title + `</span>`)
                        dialog_set_profile.prepend(is_online)
                    }
                }
            })
    })
    // event for getting new messages
    socket.on('new_message', function (data) {
        parent_div = $('#block2')
        var div_sh = $(parent_div)[0].scrollHeight,
            div_h = parent_div.height();
        // checking the need for scrolling
        if (parent_div.scrollTop() + 1 >= div_sh - div_h) {
            flag_scrolling = true;
        } else {
            flag_scrolling = false;
        }
        // get the date of message
        date = data.message.datetime_send.split(" ")[0].split("-")
        date.reverse()
        date = date.join(".")

        if (date != localStorage.getItem('message_last_date')) {
            parent_div.append(`<div class="message_date_line">` + date + `</div><div class="clear-line"></div>`)
        }
        unread.push(data.message)
        if (id_real == data.message.user_id) {
            parent_div.append(`<div class="chat_messages_2 not_read" id="message` + String(data.message.id - 1) + `" data-real-msg-id="` + data.message.id + `">` + data.user.name + ` ` + data.user.surname + `<p>` + data.message.text + `</p></div><div class="message_time_2">` + data.message.datetime_send.split(" ")[1].split(":").slice(0, 2).join(":") + `</div><div class="clear-line"></div>`)
        } else {
            parent_div.append(`<div class="chat_messages not_read_recipient" id="message` + String(data.message.id - 1) + `" data-real-msg-id="` + data.message.id + `">` + data.user.name + ` ` + data.user.surname + `<p>` + data.message.text + `</p></div><span class="message_time">` + data.message.datetime_send.split(" ")[1].split(":").slice(0, 2).join(":") + `</span><div class="clear-line"></div>`)
        }
        // set read messages
        unread = unread.filter(function (item, key) {
            if ($(`[data-real-msg-id~="` + item.id + `"]`).hasClass('not_read_recipient') && is_shown(`[data-real-msg-id~="` + item.id + `"]`)) {
                socket.emit("set_read", data = {'message_id': item.id})
                return false
            }
            return true
        })
        if (flag_scrolling == true) {
            parent_div.scrollTop(parent_div.prop('scrollHeight'));
        }
        localStorage.setItem('message_last_date', date)
    })
    // event reading messages
    socket.on("set_read_sender", function (data) {
        $(`[data-real-msg-id~="` + data.message_id + `"]`).removeClass('not_read')
        console.log("Remove class from the sender")
    })
    // event for typing in dialogs
    socket.on('update_typing_sender', function (data) {
        if (data.user_id != id_real) {
            if (data.typing.length > 0) {
                $('.div_typing').replaceWith(`<div class="div_typing"><br />` + data.typing.join(", ") + ` typing<img class="gif_typing" src="/static/gif/loading.gif"></div>`)
            } else {
                $('.div_typing').replaceWith(`<div class="div_typing"></div>`)
            }

        }
    })
    // delete the sid at the socket.io server
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
        $('.js-select2').on("select2:select", function (e) {

            set_chat($(this).find('option:selected'))
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
        fetch(SERVER_URL + SERVER_API + 'dialogs')
            // return error code if is exists
            .then((response) => {
                return response.json();
            })
            // the main handler of request
            .then((myjson) => {
                dialogs = myjson.dialogs.filter(function (item, key) {
                    flag_real = false;
                    for (let i = 0; i < item.users.length; i++) {
                        if (item.users[i].id == id_real) flag_real = true
                    }
                    if (flag_real) {
                        return true;
                    } else {
                        return false
                    }
                });
                for (let i = 0; i < dialogs.length; i++) {
                    var opt = document.createElement('option');
                    opt.value = dialogs[i].id;
                    opt.innerHTML = dialogs[i].title;
                    opt.setAttribute("data-dialog-id", dialogs[i].id)
                    opt.setAttribute('onclick', "testi()")
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

            // scrollTracking()
            if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight - 10) {
                localStorage.setItem('dialog', parseInt(localStorage.getItem('dialog')) + 10)

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
        fetch(SERVER_URL + SERVER_API + 'dialogs')
            // return error code if is exists
            .then((response) => {
                return response.json();
            })
            // the main handler of request
            .then((myjson) => {
                // getting all dialogs
                dialogs = myjson.dialogs.filter(function (item, key) {
                    flag_real = false;
                    for (let i = 0; i < item.users.length; i++) {
                        if (item.users[i].id == id_real) flag_real = true
                    }
                    if (flag_real) {
                        return true;
                    } else {
                        return false
                    }
                });
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
            members_online = 0
            for (let j = 0; j < dialogs[i].users.length; j++) {
                if (dialogs[i].users[j].id != id_real && dialogs[i].users[j].last_seen == "online") {
                    members_online += 1;
                }
            }
            if (dialogs[i].users.length == 2 && members_online == 1) {
                is_online = `<p class="online_circle"></p>`
            } else {
                if (members_online != 0) {
                    is_online = `<p class="online_circle"></p><p class="online_title">` + String(members_online) + `/` + String(dialogs[i].users.length - 1) + `</p>`
                }
            }
            ul.innerHTML += `<div onclick="set_profile()" id="set_profile` + dialogs[i].id + `" data-members-online="` + members_online + `">` + is_online + `<span class="fio_dialog">` + dialogs[i].title + `</span></div><li class="one_dialog_li" data-dialog-id="` + dialogs[i].id + `" id="ul` + dialogs[i].id + `" onclick="set_chat(this)" >
        <div class="one_dialog" data-dialog-id="` + dialogs[i].id + `">
            <img src="data:image/png;base64,` + dialogs[i].avatar + `"` + `alt="avatar1" class="avatar_messenger">

            <div class="last_message">` +
                dialogs[i].messages[dialogs[i].messages.length - 1].text
                + `</div>
            <div class="last_message_time">` +
                dialogs[i].messages[dialogs[i].messages.length - 1].datetime_send.split(" ")[1].split(":").slice(0, 2).join(":")
                + `</div>
        </div>
        <div class="message_date_line delimiter"> </div>
    </li>`;
        }
    }

// function for open the chat
    function set_chat(_this) {
        clear_place()
        localStorage.setItem('message', 10)
        dialog_id = $(_this).attr('data-dialog-id')
        // emot socket io for connect to room(this dialog)
        socket.emit("join_dialog", {"dialog_id": dialog_id})
        // sending a request to the server's API
        fetch(SERVER_URL + SERVER_API + 'dialogs/' + String(dialog_id))
            // return error code if is exists
            .then((response) => {
                return response.json();
            })
            // the main handler of request
            .then((myjson) => {
                // getting this dialog
                dialog = myjson.dialog;

                if (dialog.typing.length > 0) {
                    typing = `<br /><div class="div_typing">` + dialog.typing.join(", ") + ` typing<img class="gif_typing" src="/static/gif/loading.gif"></div>`
                } else {
                    typing = `<div class="div_typing"></div>`
                }
                $('.parent').append(`<div class="messenger dialog" id="header_chat">
        <div class="d-inline-block but_back" onclick="messenger(false)"><< Back</div>
            <a href="https://vk.com/al_im.php" class="d-inline-block text-decoration-none link_profile_in_chat">
                <img  src="data:image/png;base64,` + dialog.avatar + `" class="avatar_messenger d-inline-block">
                <div class="d-inline-block">
                    <h1>` + dialog.title + `</h1>
                </div>
            </a>` + typing + `
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
                        try {
                            my_top = $('#message' + String(Number(localStorage.getItem('start')) - 4)).offset().top
                            messages.scrollTop = my_top
                        } catch (e) {
                            messages.scrollTop = messages.scrollHeight
                        }
                    }
                    // set read messages
                    unread = unread.filter(function (item, key) {
                        if ($(`[data-real-msg-id~="` + item.id + `"]`).hasClass('not_read_recipient') && is_shown(`[data-real-msg-id~="` + item.id + `"]`)) {
                            socket.emit("set_read", data = {'message_id': item.id})
                            return false
                        }
                        return true
                    })
                })
                fill_chat(dialog)
                // typing module
                flag_typing = false;
                document.getElementById('message').addEventListener('keyup', function (e) {
                    if (!flag_typing) {
                        flag_typing = true;

                        socket.emit("start_typing", {
                            "dialog_id": dialog_id,
                            "user_id": id_real
                        })
                    }
                    elm = $(this);
                    time = (new Date()).getTime();
                    delay = 500;

                    elm.attr({'keyup': time});
                    elm.off('keydown');
                    elm.off('keypress');
                    elm.on('keydown', function (e) {
                        $(this).attr({'keyup': time});
                    });
                    elm.on('keypress', function (e) {
                        $(this).attr({'keyup': time});
                    });

                    setTimeout(function () {
                        oldtime = parseFloat(elm.attr('keyup'));
                        if (oldtime <= (new Date()).getTime() - delay & oldtime > 0 & elm.attr('keyup') != '' & typeof elm.attr('keyup') !== 'undefined') {
                            // end typing
                            flag_typing = false;

                            socket.emit("end_typing", {
                                "dialog_id": dialog_id,
                                "user_id": id_real
                            })
                            elm.removeAttr('keyup');
                        }
                    }, delay);
                });
                var div = $("#block2");
                div.scrollTop(div.prop('scrollHeight'));
            })
    }

// while the function for opening the profile is empty
    function set_profile() {
        alert('PROFIIIILE')
    }

// function for clearing the place for new block of content
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

// filling out a chat message
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
                    parent_div.prepend(`<div class="chat_messages_2" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><div class="message_time_2">` + dialog.messages[i].datetime_send.split(" ")[1].split(":").slice(0, 2).join(":") + `</div><div class="clear-line"></div>`)
                } else {
                    unread.push(dialog.messages[i])
                    parent_div.prepend(`<div class="chat_messages_2 not_read" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><div class="message_time_2">` + dialog.messages[i].datetime_send.split(" ")[1].split(":").slice(0, 2).join(":") + `</div><div class="clear-line"></div>`)
                }
            } else {

                if (dialog.messages[i].was_read == 1) {
                    parent_div.prepend(`<div class="chat_messages" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><span class="message_time">` + dialog.messages[i].datetime_send.split(" ")[1].split(":").slice(0, 2).join(":") + `</span><div class="clear-line"></div>`)

                } else {
                    unread.push(dialog.messages[i])
                    parent_div.prepend(`<div class="chat_messages not_read_recipient" id="message` + i + `" data-real-msg-id="` + dialog.messages[i].id + `">` + dialog.messages[i].user.name + ` ` + dialog.messages[i].user.surname + `<p>` + dialog.messages[i].text + `</p></div><span class="message_time">` + dialog.messages[i].datetime_send.split(" ")[1].split(":").slice(0, 2).join(":") + `</span><div class="clear-line"></div>`)
                }
            }
            checking = 0
            if (i - 1 >= 0) {
                checking = i - 1
            }
            // getting dates to compare them
            date = dialog.messages[i].datetime_send.split(" ")[0].split("-")
            date.reverse()
            date = date.join(".")
            date_previous = dialog.messages[checking].datetime_send.split(" ")[0].split("-")
            date_previous.reverse()
            date_previous = date_previous.join(".")


            if (date != date_previous) {
                parent_div.prepend(`<div class="message_date_line">` + date + `</div><div class="clear-line"></div>`)
            }
        }

        date = dialog.messages[dialog.messages.length - 1].datetime_send.split(" ")[0].split("-")
        date.reverse()
        date = date.join(".")
        localStorage.setItem('message_last_date', date)
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

// checking is target in the visibility area?
    function is_shown(target) {
        var wt = $("#block2").scrollTop();
        var wh = $("#block2").height();
        var eh = $(target).outerHeight();
        var et = $(target).offset().top;
        if (et >= wt && et + eh <= wh + wt) {
            return true;
        } else {
            return false;
        }
    }

// declaring functions global
    window.fill_chat = fill_chat;
    window.clear_place = clear_place;
    window.set_chat = set_chat;
    window.set_profile = set_profile;
    window.add_dialogs = add_dialogs;
    window.messenger = messenger;
    window.messenger_set_select = messenger_set_select;
})