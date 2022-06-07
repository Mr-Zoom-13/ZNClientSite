const myDiv = document.querySelector('.messenger')
// check for user's scrolling and if user scroll to the bottom call the function messenger()
myDiv.addEventListener('scroll', () => {
  if (myDiv.offsetHeight + myDiv.scrollTop >= myDiv.scrollHeight) {
    localStorage.setItem('dialog', parseInt(localStorage.getItem('dialog')) + 5)
    console.log(localStorage.getItem('dialog'))
    messenger()
  }
})


// function for format data for searching dialog select
function formatData (data) {
  if (!data.id) { return data.text; }
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

// select2 module for the best select design
$(".js-select2").select2({
  templateResult: formatData,
  templateSelection: formatData,
    placeholder: "Choose dialog..."
});


$(document).ready(function() {
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

    // interception of a link click
    window.onload = function () {
        var a = document.getElementById('my_profile');
        a.onclick = function() {
            return false;
        }
    }

})


// set select of searching dialogs function
function messenger_set_select () {
    this_select = document.getElementById('choose_dialog')
    var length = this_select.options.length;
    // clear select
    for (i = length-1; i >= 0; i--) {
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
function messenger () {
    // adding the gif of loading
    //   https://i.gifer.com/VAyR.gif  -  another gif for loading
    var ul = document.getElementById("ul_messenger_id");
    ul.innerHTML += `<li><div id="id_gif">
    <img src="../static/gif/loading.gif" alt="я джифка" class="gif_loading">
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
            if(parseInt(localStorage.getItem('dialog')) < dialogs.length) {
                // call function to adding dialog
                add_dialog(localStorage.getItem('dialog'))
            }
            else {
                if (parseInt(localStorage.getItem('dialog')) - dialogs.length < 5) {
                    // call function to adding dialog
                    add_dialog(dialogs.length);
                }
            }
        // del gif-loading
        $('#id_gif').remove()
        })
}

// function to add dialog
function add_dialog (end_count) {
    for (let i = localStorage.getItem('dialog') - 5; i < end_count; i++){
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