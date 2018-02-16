$(document).ready(() => {
    /*-------------------------------------------------------------------------------------------------------------- */
    var sendMessage = (type, message) => {
        return new PNotify({
            type: type,
            text: message,
        });
    }
    /*-------------------------------------------------------------------------------------------------------------- */
    const socket = io();
    /*-------------------------------------------------------------------------------------------------------------- */
    if (socket !== 'undefined') {
        console.log('Connected IO');
        /*-------------------------------------------------------------------------------------------------------------- */
        $('#frm_send').submit((e) => {
            e.preventDefault();
            $.post('/save', { title: $('#title').val(), message: $('#message').val() }, data => {
                sendMessage(data.type, data.message)
            });
        });
        /*-------------------------------------------------------------------------------------------------------------- */
        socket.on('getall', data => {
            $('#message').val('');
            $('#btnclear').css({ 'display': 'block' });
            $.each(data, (key, value) => {
                var style = value.id !== 'undefined' ? 'display: inline-block' : 'display: none';
                $('.list-group').append('<li class="list-group-item" >' + value.title + ': ' + value.body + ' <button class="btn btn-outline-warning btnchanges" style="' + style + '" value=' + value.id + '>Change status</button></li>');

            });
        });
        /*-------------------------------------------------------------------------------------------------------------- */
        $('#btnclear').click(() => {
            socket.emit('deletes', {});
        });
        /*-------------------------------------------------------------------------------------------------------------- */
        $(document).on('click', '.btnchanges', function () {
            $.post('/update', { id: $(this).attr('value'), status: 'inactive' }, data => {
                if (data.reload) {
                    location.reload();
                } else {
                    sendMessage(data.type, data.message)
                }
            });
        });
        /*-------------------------------------------------------------------------------------------------------------- */
        socket.on('reload_page', data => {
            if (data.clear) {
                sendMessage(data.type, data.message)
                setTimeout(() => location.reload() , 1000);
            }
        });
        /*-------------------------------------------------------------------------------------------------------------- */
        let docMessage = document.querySelector('#docMessage');
        docMessage.addEventListener('keyup', () => {
            socket.emit('MessageRealTime', { message: docMessage.value });
        })

        socket.on('previewMessage',data=>{
            docMessage.value = data.message;
        })

    }

    fetch('/post', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify({ name: 'wil', lastname: 'salas' })
    })
        .then(res => {
            if (res.ok) {
                return res.json();
            }
            else {
                throw new Error('Bad http stuff')
            }
        })
        .then(data => {
            console.info(data)
        })
        .catch(err => console.error("Error: " + err.message))


});
