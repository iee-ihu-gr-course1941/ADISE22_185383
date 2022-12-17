var me = {player_token: null, player_id: null, player_name: null};
var game_status = {};
var board = {};
var last_update = new Date().getTime();
var timer = null;

$(function () {
    fill_board();

    $('#btn_login').click(login_to_game);
    $('#btn_round_reset').click(round_reset);
    $('#btn_game_reset').click(game_reset);
    $('#do_move').click(do_move);
    $('#div_move').hide();

    game_status_update();
});

/**************************** Status ******************************************/

function game_status_update() {
    clearTimeout(timer);

    $.ajax({
        url: "pinakl.php/game/",
        success: on_game_status_update_success,
        headers: {"X-Token": me.player_token}
    });
}

function on_game_status_update_success(data) {
    last_update = new Date().getTime();

    var game_status_old = game_status;

    game_status = data;

    do_update_game_status(game_status_old);
}

function do_update_game_status(game_status_old) {
    var timer_period = 4000;

    // Προσωρινή απενεργοποίηση timer

    clearTimeout(timer);

    // Είσοδος παίκτη

    if (me.player_id) {
        if ($('#div_player').is(':visible')) {
            $('#div_player').hide(1000);
        }
    } else {
        if (!$('#div_player').is(':visible')) {
            $('#div_player').show(1000);
        }
    }

    // Στοιχεία παιχνιδιού

    if (me.player_id) {
        $('#div_game_info').html('Είστε ο παίκτης #' + me.player_id + ' (Όνομα: ' + me.player_name + ', Token: ' + me.player_token + ')<br>' +
                'Φάση Παιχνιδιού: ' + game_status.game_phase + '<br>' +
                'Παίζει ο Παίκτης #' + game_status.game_current_player_id);
    }

    // Φύλλα παικτών και στοιχεία κίνησης

    if (game_status.game_current_player_id === me.player_id && me.player_id !== null) {
        if (game_status_old.game_current_player_id !== game_status.game_current_player_id) {
            fill_board();
        }

        if (!$('#div_move').is(':visible')) {
            $('#div_move').show(1000);
        }

        // Αναμονή για κίνηση τρέχοντος παίκτη
        timer_period = 15000;
    } else {
        if ($('#div_move').is(':visible')) {
            $('#div_move').hide(1000);
        }
    }

    // Εκκίνηση/επανεκκίνηση γύρου

    if (game_status.game_phase > 1) {
        if (!$('#btn_round_reset').is(':visible')) {
            $('#btn_round_reset').show(1000);
        }
    } else {
        if ($('#btn_round_reset').is(':visible')) {
            $('#btn_round_reset').hide(1000);
        }
    }

    // Εκκίνηση/επανεκκίνηση παιχνιδιού

    if (game_status.game_players_cnt < 2) {
        $('#btn_game_reset').prop('disabled', true);
    } else {
        $('#btn_game_reset').prop('disabled', false);
    }

    // Ενεργοποίηση timer

    timer = setTimeout(function () {
        game_status_update();
    }, timer_period);
}

/**************************** Login *******************************************/

function login_to_game() {
    if ($('#player_name').val() === '') {
        alert('Δεν έχει καθοριστεί το Όνομα Παίκτη-Χρήστη!');
        return;
    }

    var player_id = parseInt($('#player_id').val());

    ////fill_board();

    $.ajax({url: "pinakl.php/players/" + player_id,
        method: 'POST',
        dataType: "json",
        headers: {"X-Token": me.player_token},
        contentType: 'application/json',
        data: JSON.stringify({player_name: $('#player_name').val(), player_id: player_id}),
        success: login_success,
        error: login_error});
}

function login_success(data) {
    me = data;

    do_update_game_status(); // για πιο άμεση ενημέρωση της κατάστασης

    game_status_update();
}

function login_error(data) {
    var x = data.responseJSON;

    alert(x.errormesg);
}

/********************** Game/Round ********************************************/

function game_reset() {
    $.ajax({
        url: "pinakl.php/game/",
        headers: {"X-Token": me.token},
        method: 'POST',
        success: fill_board_by_data});
    
    ////$('#div_move').hide();
    ////$('#div_player').show(2000);
}

function round_reset() {
    $.ajax({
        url: "pinakl.php/round/",
        headers: {"X-Token": me.token},
        method: 'POST',
        success: fill_board_by_data});
    
    ////$('#div_move').hide();
    ////$('#div_player').show(2000);
}

function fill_board() {
    ////
    /*$.ajax({url: "chess.php/board/",
     headers: {"X-Token": me.token},
     success: fill_board_by_data});*/
}

function fill_board_by_data(data) {
    ////

    /*board = data;
     for (var i = 0; i < data.length; i++) {
     var o = data[i];
     var id = '#square_' + o.x + '_' + o.y;
     var c = (o.piece != null) ? o.piece_color + o.piece : '';
     var pc = (o.piece != null) ? 'piece' + o.piece_color : '';
     var im = (o.piece != null) ? '<img class="piece ' + pc + '" src="images/' + c + '.png">' : '';
     $(id).addClass(o.b_color + '_square').html(im);
     }
     
     $('.ui-droppable').droppable("disable");
     
     if (me && me.piece_color != null) {
     $('.piece' + me.piece_color).draggable({start: start_dragging, stop: end_dragging, revert: true});
     }
     if (me.piece_color != null && game_status.p_turn == me.piece_color) {
     $('#div_move').show(1000);
     } else {
     $('#div_move').hide(1000);
     }*/
}

function do_move() {
    ////
    /*
     var s = $('#the_move').val();
     
     var a = s.trim().split(/[ ]+/);
     if (a.length != 4) {
     alert('Must give 4 numbers');
     return;
     }
     $.ajax({url: "chess.php/board/piece/" + a[0] + '/' + a[1],
     method: 'PUT',
     dataType: "json",
     contentType: 'application/json',
     data: JSON.stringify({x: a[2], y: a[3]}),
     headers: {"X-Token": me.player_token},
     success: move_result,
     error: login_error});*/

}

function move_result(data) {
    game_status_update();
    fill_board_by_data(data);
}



