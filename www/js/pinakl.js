const PlayerSteps = {// Βήματα Παίκτη:
    None: 0, // 0. Κανένα
    TakingCards: 1, // 1. Επιλογή φύλλων (είτε από το κέντρο είτε από τη στοίβα)
    ThrowingCards: 2    // 2. Απόρριψη φύλλων (είτε κάνοντας σειρές είτε, τελικώς, στο κέντρο)
}

const BackCardCode = '&#127136;';
var me = {player_token: null, player_id: null, player_name: null};

var game_status = {};
var board = {};
var current_player_step = PlayerSteps.None;
var timer = null;

var card_tomove = null;
var old_board = null;
var game_history_enabled = false;

$(function () {
    $('#btn_login').click(login_to_game);
    $('#btn_round_reset').click(round_reset);
    $('#btn_game_reset').click(game_reset);
    $('#btn_history').click(show_game_history);

    game_status_reload();
});

/**************************** Status ******************************************/

function game_status_reload() {
    clearTimeout(timer);

    $.ajax({
        url: "pinakl.php/game/",
        success: do_game_status_reload,
        headers: {"X-Token": me.player_token}
    });
}

function do_game_status_reload(data) {
    game_status = data;

    if (me.player_id && me.player_id > game_status.game_players_cnt) { // Αν έχει γίνει επανεκκίνηση από άλλο παίκτη ...
        // ... Καθαρισμός στοιχείων παίκτη

        me = {player_token: null, player_id: null, player_name: null};

        set_current_player_step(PlayerSteps.None);
    }

    var timer_period = 3000;

    // Προσωρινή απενεργοποίηση timer

    clearTimeout(timer);

    // Είσοδος παίκτη

    if (me.player_id !== null) {
        if ($('#div_player').is(':visible')) {
            $('#div_player').hide(1000);
        }
    } else {
        if (!$('#div_player').is(':visible')) {
            $('#div_player').show(1000);
        }
    }

    // Στοιχεία παιχνιδιού

    show_game_info();

    // Φύλλα παικτών και στοιχεία κίνησης

    if (me.player_id !== null &&
            game_status.game_current_player_id === me.player_id) {
        if (current_player_step === PlayerSteps.None) {
            fill_board();
        }

        // Αναμονή για κίνηση τρέχοντος παίκτη
        timer_period = 15000;
    } else {
        fill_board();
    }

    // Εκκίνηση/επανεκκίνηση γύρου

    if (me.player_id !== null &&
            game_status.game_current_player_id === me.player_id &&
            game_status.game_phase > 1) {
        if (!$('#btn_round_reset').is(':visible')) {
            $('#btn_round_reset').show(1000);
        }
    } else {
        if ($('#btn_round_reset').is(':visible')) {
            $('#btn_round_reset').hide(1000);
        }
    }

    // Εκκίνηση/επανεκκίνηση παιχνιδιού

    if (me.player_id !== null &&
            game_status.game_current_player_id === me.player_id &&
            game_status.game_players_cnt >= 2) {
        $('#btn_game_reset').prop('disabled', false);
    } else {
        $('#btn_game_reset').prop('disabled', true);
    }

    // Scoreboard

    if (me.player_id !== null) {
        if (!$('#btn_history').is(':visible')) {
            $('#btn_history').show(1000);
        }

        if (!$('#div_history').is(':visible') && game_history_enabled) {
            $('#div_history').show(1000);
        }
    } else {
        if ($('#btn_history').is(':visible')) {
            $('#btn_history').hide(1000);
        }

        if ($('#div_history').is(':visible')) {
            $('#div_history').hide(1000);
        }
    }

    if (game_history_enabled) {
        game_history_reload();
    }

    // Ενεργοποίηση timer

    timer = setTimeout(function () {
        game_status_reload();
    }, timer_period);
}

function show_game_info() {
    var action = 'Επιλογή φύλλων από Κέντρο ή ενός φύλλου από Στοίβα...';
    if (current_player_step > PlayerSteps.TakingCards) {
        action = 'Απόρριψη Φύλλων είτε κάνοντας Σειρές είτε, τελικά, στο Κέντρο...'
    }

    var html = '';

    if (me.player_id !== null) {
        html = '<b>Είστε ο Παίκτης <em>#' + me.player_id + '</em></b> (Όνομα: <em>' + me.player_name + '</em>, Token: <em>' + me.player_token + '</em>)<br>' +
                'Φάση παιχνιδιού: <em>' + get_game_phase_description(game_status.game_phase, game_status.game_round) + '</em><br>';

        if (game_status.game_phase === 2) { // Παίξιμο
            html = html +
                    '<b>Παίζει ο Παίκτης <em>#' + game_status.game_current_player_id + '</em></b><br>' +
                    'Αναμενόμενη ενέργεια: <em>' + action + '</em><br>';
        } else if (game_status.game_phase === 3) { // Τερματισμός
            html = html +
                    '<b>Νικητής είναι ο Παίκτης <em>#' + game_status.game_current_player_id + '</em></b><br>';
        }
    }

    $('#div_game_info').html(html);
}

/**************************** Login *******************************************/

/**
 * Είσοδος νέου παίκτη στο παιχνίδι
 */
function login_to_game() {
    if ($('#player_name').val() === '') {
        alert('Δεν έχει καθοριστεί το Όνομα Παίκτη-Χρήστη!');
        return;
    }

    var player_id = parseInt($('#player_id').val());

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

    game_status_reload();
}

function login_error(data) {
    var x = data.responseJSON;

    alert(x.errormesg);
}

/********************** Game/Round ********************************************/

/**
 * Εκκίνηση/επανεκκίνηση παιχνιδιού 
 * με πλήρη καθαρισμό των στοιχείων του προηγούμενου παιχνιδιού 
 * (π.χ. παίκτες, πόντοι κλπ.)
 */
function game_reset() {
    if (game_status.game_phase !== 1 ||
            game_status.game_players_cnt < 2) {
        me = {player_token: null, player_id: null, player_name: null};
    }

    set_current_player_step(PlayerSteps.None);

    $.ajax({
        url: "pinakl.php/game/",
        headers: {"X-Token": me.token},
        method: 'POST',
        success: game_status_reload});
}

/**
 * Εκκίνηση/επανεκκίνηση γύρου, στο τρέχον παιχνίδι, 
 * με διατήρηση παικτών και πόντων.
 */
function round_reset() {
    set_current_player_step(PlayerSteps.None);

    $.ajax({
        url: "pinakl.php/round/",
        headers: {"X-Token": me.token},
        method: 'POST',
        success: game_status_reload});
}

/**
 * Εμφάνιση/απόκρυψη ScoreBoard
 */
function show_game_history() {
    if (!game_history_enabled) {
        game_history_enabled = true;

        $('#btn_history').text('ΑΠΟΚΡΥΨΗ SCOREBOARD ΠΑΙΧΝΙΔΙΟΥ');
        $('#div_history').show(1000);

        game_history_reload();
    } else {
        game_history_enabled = false;

        $('#btn_history').text('SCOREBOARD ΠΑΙΧΝΙΔΙΟΥ');
        $('#div_history').hide(1000);
    }
}

/**
 * Άντληση πόντων από το API
 */
function game_history_reload() {
    $.ajax({
        url: "pinakl.php/history/",
        success: do_game_history_reload,
        headers: {"X-Token": me.player_token}
    });
}

/**
 * Εμφάνιση πίνακα πόντων
 */
function do_game_history_reload(data) {
    var total_points1 = 0;
    var total_points2 = 0;
    var total_points3 = 0;

    var html = `<table>
                        <tr>
                            <th>Γύρος</th>     
                            <th>Παίκτης 1</th>     
                            <th>Παίκτης 2</th>     
                            <th>Παίκτης 3</th>     
                        </tr>`;

    for (let i = 0; i < data.length; i++) {
        var round = data[i];

        html = html +
                `<tr>
                    <td>${round.history_id}</td>     
                    <td>${round.history_points1}</td>     
                    <td>${round.history_points2}</td>     
                    <td>${round.history_points3}</td>     
                </tr>`;

        total_points1 = total_points1 + round.history_points1;
        total_points2 = total_points2 + round.history_points2;
        total_points3 = total_points3 + round.history_points3;
    }

    const max_total_points = Math.max(total_points1, total_points2, total_points3);

    var class1 = '';
    var class2 = '';
    var class3 = '';

    if (max_total_points !== 0) {
        if (total_points1 === max_total_points) {
            class1 = "class='winner'";
        }
        if (total_points2 === max_total_points) {
            class2 = "class='winner'";
        }
        if (total_points3 === max_total_points) {
            class3 = "class='winner'";
        }
    }

    html = html +
            `   <tr>
                    <th>Σύνολο</th>
                    <th ${class1}>${total_points1}</th>     
                    <th ${class2}>${total_points2}</th>     
                    <th ${class3}>${total_points3}</th>     
                </tr>`;

    html = html + '</table';

    $('#div_history').html(html);
}

/*************************** Board ********************************************/

/**
 * Άντληση και εμφάνιση board τρέχοντος παίκτη
 */
function fill_board() {
    $.ajax({url: "pinakl.php/board/",
        headers: {"X-Token": me.token},
        success: do_fill_board});
}

/**
 * Αποθήκευση τελευταίων κινήσεων παίκτη (επιλογή και απόρριψη φύλλων) στη βάση
 */
function save_board() {
    var player_id = me.player_id;

    $.ajax({url: "pinakl.php/board/" + player_id,
        method: 'PUT',
        dataType: "json",
        headers: {"X-Token": me.player_token},
        contentType: 'application/json',
        data: JSON.stringify({board: board, player_id: player_id}),
        success: game_status_reload});
}

function do_fill_board(data) {
    board = data;

    show_board();
}

function show_board() {
    sort_board();

    const board_element = $("#div_board");

    board_element.html('');

    if (me.player_id && game_status.game_phase >= 2) {
        // Φύλλα κέντρου

        show_board_band(board_element, 1);

        // Φύλλα στοίβας

        show_board_band(board_element, 2);

        // Φύλλα παίκτη

        show_board_band(board_element, player_id_2_band_id(me.player_id));
    }
}

/**
 * Ταξινόμηση των φύλλων ως προς Κάτοχο, Σειρά και Αριθμό Σειράς
 */
function sort_board() {
    if (board) {
        board.sort(
                function (card1, card2) {
                    if (card1.card_owner < card2.card_owner) {
                        return -1;
                    } else if (card1.card_owner === card2.card_owner) {
                        if (card1.card_series < card2.card_series) {
                            return -1;
                        } else if (card1.card_series === card2.card_series) {
                            if (card1.card_series_no < card2.card_series_no) {
                                return -1;
                            } else if (card1.card_series_no === card2.card_series_no) {
                                return 0;
                            } else {
                                return 1;
                            }
                        } else {
                            return 1;
                        }
                    } else {
                        return 1;
                    }
                }
        );
    }
}

/**
 * Εμφάνιση των φύλλων μίας Ζώνης (Κατόχου)
 */
function show_board_band(board_element, band_id) {
    var band_html = `<div class='band' id='band_${band_id}'
                          ondrop="drop(event)" ondragover="allowDrop(event)" >
                        <label class='bandtitle' id='bandtitle_${band_id}'
                               ondrop="drop(event)" ondragover="allowDrop(event)">${get_band_description(band_id)}</label>
                        <div class='bandcontent' id='bandcontent_${band_id}'
                             ondrop="drop(event)" ondragover="allowDrop(event)">`;

    var series = 0;

    var cards_html = '';

    if (!board) {
        return;
    }

    for (let i = 0; i < board.length; i++) {
        const card = board[i];

        if (card.card_owner === band_id) {
            if (card.card_series !== series) {
                series = card.card_series;

                if (cards_html !== '') {
                    cards_html = cards_html + '</ul></div>';

                    band_html = band_html + cards_html;
                }

                var series_style = '';
                if (card.card_series !== 1) {
                    series_style = "style='background-color: tan'";
                }

                cards_html = `<div class='series' id='series_${band_id}_${card.card_series}' ${series_style}
                                   ondrop="drop(event)" ondragover="allowDrop(event)">
                               <ul class='series_content' id='seriescontent_${band_id}_${card.card_series}'
                                   ondrop="drop(event)" ondragover="allowDrop(event)">`;
            }

            var card_code = card.card_code;
            if (band_id === 2) { // Στοίβα
                card_code = BackCardCode;
            }

            cards_html = cards_html +
                    `<li class='card' id='card_${band_id}_${card.card_series}_${card.card_id}' 
                        ondrop="drop(event)" ondragover="allowDrop(event)" 
                        draggable="true" ondragstart="drag(event)">${card_code}</li>`;
        }
    }

    if (cards_html !== '') {
        cards_html = cards_html + '</ul></div>';

        band_html = band_html + cards_html;
    }

    band_html = band_html + '</div></div>';

    board_element.append(band_html);
}

/**
 * Έναρξη drag-and-drop ενός φύλλου από τον παίκτη
 */
function drag(ev) {
    card_tomove = ev.target.id;

    if (game_status.game_current_player_id === me.player_id &&
            current_player_step === PlayerSteps.None) {
        set_current_player_step(PlayerSteps.TakingCards);
    }
}

/**
 * Έλεγχος drop ενός φύλλου, σε ένα σημείο, με βάση τους κανόνες του παιχνιδιού
 * και την τρέχουσα κατάστασή του
 */
function allowDrop(ev) {
    if (me.player_id !== game_status.game_current_player_id) {
        return;
    }

    var valid = false;

    if (is_band(ev.target.id) || is_series(ev.target.id) || is_card(ev.target.id)) {
        const card_id = extract_card_id(card_tomove);
        const card = find_card(card_id);

        const target_band_id = extract_band_id(ev.target.id);
        const target_series_id = get_target_series_id(target_band_id, ev.target.id);

        switch (current_player_step) {
            case PlayerSteps.TakingCards:
                if (target_band_id === player_id_2_band_id(me.player_id) &&
                        target_series_id === 1) {
                    if (card.card_owner === 1) { // Κέντρο
                        valid = true;
                    } else if (card.card_owner === 2) { // Στοίβα
                        valid = card.card_series_no === find_max_series_no(card.card_owner, 1);
                    }
                }

                break;
            case PlayerSteps.ThrowingCards:
                if (card.card_owner === player_id_2_band_id(me.player_id)) {
                    if (card.card_series === 1) {
                        if (target_band_id === player_id_2_band_id(me.player_id)) {
                            valid = target_series_id > 1 &&
                                    get_count_of_cards(card.card_owner, card.card_series) > 1;
                        } else if (target_band_id === 1) {
                            valid = target_series_id === 1;
                        }
                    } else {
                        if (target_band_id === player_id_2_band_id(me.player_id)) {
                            valid = target_series_id === card.card_series;
                        }
                    }
                }


                break;
        }
    }

    if (valid) {
        ev.preventDefault();
    }
}

/**
 * drop ενός φύλλου σε ένα αποδεκτό σημείο
 */
function drop(ev) {
    const card_id = extract_card_id(card_tomove);

    const target_band_id = extract_band_id(ev.target.id);
    const target_series_id = get_target_series_id(target_band_id, ev.target.id);
    const target_card_id = extract_card_id(ev.target.id);

    do_move(card_id, target_band_id, target_series_id, target_card_id);

    ev.preventDefault();

    ev.stopPropagation();
}

function get_target_series_id(band_id, target_id) {
    var series_id;

    if (is_series(target_id) || is_card(target_id)) {
        series_id = extract_series_id(target_id);
    } else {
        switch (current_player_step) {
            case PlayerSteps.TakingCards:
                series_id = 1;

                break;
            case PlayerSteps.ThrowingCards:
                if (band_id === 1) {
                    series_id = 1;
                } else {
                    series_id = find_max_series(band_id) + 1;
                }

                break;
        }
    }

    return series_id;
}

/**
 * Εκτέλεση μετακίνησης ενός φύλλου από ένα σημείο σε ένα άλλο (κατά το drop)
 */
function do_move(card_id, target_band_id, target_series_id, target_card_id) {
    var card = find_card(card_id);

    var target_max_series_no = find_max_series_no(target_band_id, target_series_id);

    if (card.card_owner === 1) {       // Από Κέντρο ...
        // ... τοποθέτηση μετακινούμενου φύλλου, 
        // καθώς και των δεξιότερων από αυτό, στο τέλος της επιλεγμένης ζώνης

        const source_max_series_no = find_max_series_no(card.card_owner, card.card_series);

        const card_owner = card.card_owner;
        const card_series = card.card_series;
        const card_series_no = card.card_series_no;

        for (let i = card_series_no; i <= source_max_series_no; i++) {
            const c = find_card_by_data(card_owner, card_series, i);

            if (c) {
                c.card_owner = target_band_id;
                c.card_series = target_series_id;
                c.card_series_no = ++target_max_series_no;
            }
        }
    } else if (card.card_owner === 2) { // Από Στοίβα ...
        // ... τοποθέτηση μετακινούμενου φύλλου στο τέλος της επιλεγμένης ζώνης

        card.card_owner = target_band_id;
        card.card_series = target_series_id;
        card.card_series_no = ++target_max_series_no;
    } else {                            // Από φύλλα Παίκτη ...
        if (target_band_id === 1) { //... προς Κέντρο
            // ... τοποθέτηση μετακινούμενου φύλλου στο τέλος της επιλεγμένης ζώνης

            card.card_owner = target_band_id;
            card.card_series = target_series_id;
            card.card_series_no = ++target_max_series_no;
        } else {                    //... προς κατεβασμένες σειρές φύλλων παίκτη
            var target_card = find_card(target_card_id);

            if (target_card) { // Αν γίνεται drop πάνω σε φύλλο ...
                // ... τοποθέτηση μετακινούμενου φύλλου αριστερά του επιλεγμένου

                var temp = new Map();

                for (let i = target_card.card_series_no; i <= target_max_series_no; i++) {
                    if (card.card_series_no !== i) {
                        const c = find_card_by_data(target_band_id, target_series_id, i);

                        if (c) {
                            temp.set(c.card_id, i + 1);
                        }
                    }
                }

                card.card_owner = target_band_id;
                card.card_series = target_series_id;
                card.card_series_no = target_card.card_series_no;

                for (const key of temp.keys()) {
                    const c = find_card(key);
                    if (c) {
                        c.card_series_no = temp.get(key);
                    }
                }
            } else {          // αλλιώς ...
                // ... τοποθέτηση μετακινούμενου φύλλου στο τέλος

                card.card_owner = target_band_id;
                card.card_series = target_series_id;
                card.card_series_no = ++target_max_series_no;
            }
        }
    }

    move_result(target_band_id);
}

/**
 * Ολοκλήρωση μετακίνησης ενός φύλλου, ενημέρωση κατάστασης παιχνιδιού και 
 * αποθήκευση στη βάση
 */
function move_result(target_band_id) {
    switch (current_player_step) {
        case PlayerSteps.TakingCards:
            set_current_player_step(PlayerSteps.ThrowingCards);

            old_board = JSON.stringify(board);

            break;
        case PlayerSteps.ThrowingCards:
            if (target_band_id === 1) {
                if (is_player_board_valid()) { // Αν τα κατεβασμένα φύλλα ικανοποιούν τους κανόνες του παιχνιδιού ...
                    // Επαναφορά παιξίματος σε ουδέτερη κατάσταση
                    set_current_player_step(PlayerSteps.None);

                    // Αποθήκευση στη βάση των τελευταίων κινήσεων (επιλογή και απόρριψη φύλλων)
                    save_board();
                } else {                      // Αλλιώς .... 
                    // "Ακύρωση" τελευταίας κίνησης και επαναφορά παιξίματος σε κατάσταση απόρριψης φύλλων
                    board = JSON.parse(old_board);

                    old_board = null;
                }
            }

            break;
    }

    show_board();
}

/**
 * Έλεγχος αν τα κατεβασμένα φύλλα του τρέχοντος παίκτη (σειρές) ικανοποιούν τους
 * κανόνες του παιχνιδιού.
 */
function is_player_board_valid() {
    const band_id = player_id_2_band_id(me.player_id);
    const max_series_id = find_max_series(band_id);

    var valid = true;

    var series_id = 2;
    while (series_id <= max_series_id && valid) {
        var max_series_no = find_max_series_no(band_id, series_id);

        var first_no;
        var first_symbol;

        const first = find_first_normal_card_by_data(band_id, series_id, max_series_no);

        if (first) {
            first_no = first.card_no;
            first_symbol = first.card_symbol;
        }

        // Έλεγχος σειράς από φύλλα ίδιου αριθμού

        var same_number = true;

        var cnt = 0;

        for (let i = 1; i <= max_series_no; i++) {
            const c = find_card_by_data(band_id, series_id, i);

            if (c) {
                if (c.card_no !== first_no && c.card_no !== '2') {
                    same_number = false;
                    break;
                } else {
                    cnt++;
                }
            }
        }

        if (same_number && cnt < 3) {
            valid = false;
        }

        if (!same_number && valid) {
            // Έλεγχος ίδιου συμβόλου

            var same_symbol = true;

            for (let i = 1; i <= max_series_no; i++) {
                const c = find_card_by_data(band_id, series_id, i);

                if (c) {
                    if (c.card_symbol !== first_symbol && c.card_no !== '2') {
                        same_symbol = false;
                        break;
                    }
                }
            }

            if (same_symbol) {
                var cnt = 0;

                for (let i = 1; i <= max_series_no; i++) {
                    const c = find_card_by_data(band_id, series_id, i);

                    if (c) {
                        if (c.card_no !== '2') {
                            const prev = find_card_by_data(band_id, series_id, i - 1);

                            if (prev) {
                                if (prev.card_no === '2' || get_card_no_val(c.card_no) - get_card_no_val(prev.card_no) === 1) {
                                    cnt++;
                                }
                            } else {
                                cnt++;
                            }
                        } else {
                            cnt++;
                        }
                    }
                }

                valid = cnt >= 3;
            } else {
                valid = false;
            }
        }

        series_id++;
    }

    return valid;
}

function is_band(html_id) {
    return html_id.startsWith("band");
}

function is_series(html_id) {
    return html_id.startsWith("series");
}

function is_card(html_id) {
    return html_id.startsWith("card");
}

function extract_band_id(html_id) {
    const target = $('#' + html_id);

    var parts = html_id.split('_');

    if (parts.length >= 2) {
        return parseInt(parts[1]);
    } else {
        return null;
    }
}

function extract_series_id(html_id) {
    const target = $('#' + html_id);

    var parts = html_id.split('_');

    if (parts.length >= 3) {
        return parseInt(parts[2]);
    } else {
        return null;
    }
}

function extract_card_id(html_id) {
    const target = $('#' + html_id);

    var parts = html_id.split('_');

    if (parts.length >= 4) {
        return parseInt(parts[3]);
    } else {
        return null;
    }
}

function find_max_series(band_id) {
    var max = 0;

    for (let i = 0; i < board.length; i++) {
        const card = board[i];

        if (card.card_owner === band_id) {
            if (card.card_series > max) {
                max = card.card_series;
            }
        }
    }

    return max;
}

function find_max_series_no(band_id, series_id) {
    var max = 0;

    for (let i = 0; i < board.length; i++) {
        const card = board[i];

        if (card.card_owner === band_id && card.card_series === series_id) {
            if (card.card_series_no > max) {
                max = card.card_series_no;
            }
        }
    }

    return max;
}

function find_min_series_no(band_id, series_id) {
    var min = 9999;

    for (let i = 0; i < board.length; i++) {
        const card = board[i];

        if (card.card_owner === band_id && card.card_series === series_id) {
            if (card.card_series_no < min) {
                min = card.card_series_no;
            }
        }
    }

    return min;
}

function find_card(card_id) {
    if (card_id) {
        for (let i = 0; i < board.length; i++) {
            const card = board[i];

            if (card.card_id === card_id) {
                return card;
            }
        }
    }

    return null;
}

function find_card_by_data(band_id, series, series_no) {
    for (let i = 0; i < board.length; i++) {
        const card = board[i];

        if (card.card_owner === band_id &&
                card.card_series === series &&
                card.card_series_no === series_no) {
            return card;
        }
    }

    return null;
}

function find_first_normal_card_by_data(band_id, series, max_series_no) {
    var first;

    var i = 1;
    var found = false;

    while (i <= max_series_no && !found) {
        first = find_card_by_data(band_id, series, i);

        if (first && first.card_no !== '2') {
            found = true;
        } else {
            i++;
        }
    }

    if (found) {
        return first;
    } else {
        return null;
    }
}

function get_count_of_cards(target_band_id, target_series_id) {
    var cnt = 0;

    for (let i = 0; i < board.length; i++) {
        const card = board[i];

        if (card.card_owner === target_band_id &&
                card.card_series === target_series_id) {
            cnt++;
        }
    }

    return cnt;
}

function get_card_no_val(card_no) {
    switch (card_no) {
        case 'A':
            return 14;
        case 'K':
            return 13;
            break;
        case 'Q':
            return 14;
        case 'J':
            return 11;
        default:
            return parseInt(card_no);
    }
}

function get_game_phase_description(phase, round) {
    switch (phase) {
        case 1:
            return 'Ένταξη παικτών στο παιχνίδι';
        case 2:
            return 'Παίξιμο γύρου #' + round;
        case 3:
            return 'Τερματισμός γύρου #' + (round - 1);
        default:
            return 'Αρχική';
    }
}

function get_band_description(band_id) {
    switch (band_id) {
        case 1:
            return 'Κέντρο';
        case 2:
            return 'Στοίβα';
        default:
            return 'Φύλλα παίκτη';
    }
}

function set_current_player_step(player_step) {
    current_player_step = player_step;

    show_game_info();
}

function player_id_2_band_id(player_id) {
    return player_id + 2;
}