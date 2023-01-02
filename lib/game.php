<?php

define("CARD_OWNER_CENTER", 1);
define("CARD_OWNER_STACK", 2);

/**
 * GET μέθοδος άντλησης κατάστασης παιχνιδιού
 */
function get_game_status() {
    $game = db_read_game();

    if (!$game) {
        db_create_game();

        $game = db_read_game();
    }

    header('Content-type: application/json');
    print json_encode($game, JSON_PRETTY_PRINT);
}

/**
 * POST μέθοδος εκκίνησης/επανεκκίνησης παιχνιδιού
 */
function post_game_reset() {
    $game = db_read_game();

    if ($game &&
            $game['game_phase'] === 1 &&
            $game['game_players_cnt'] >= 2) { // Αν το παιχνίδι βρίσκεται σε φάση ένταξης παικτών και υπάρχουν ήδη 2 παίκτες ...
        // ... ενημέρωση ΒΔ για έναρξη παιχνιδιού και 1ου γύρου
        db_start_game();

        // Μοίρασμα χαρτιών
        deal($game['game_players_cnt']);
    } else {                                 // Αλλιώς ...
        // ... καθαρισμός ΒΔ από στοιχεία τρέχοντος παιχνιδιού
        db_game_reset();
    }
}

/**
 * POST μέθοδος εκκίνησης/επανεκκίνησης γύρου παιχνιδιού
 */
function post_round_reset() {
    $game = db_read_game();

    // Καθαρισμός ΒΔ από στοιχεία τρέχοντος γύρου
    db_round_reset();

    // Μοίρασμα χαρτιών
    deal($game['game_players_cnt']);
}

/**
 * GET μέθοδος άντλησης ScoreBoard
 */
function get_game_history() {
    $history = db_read_history();

    header('Content-type: application/json');
    print json_encode($history, JSON_PRETTY_PRINT);
}

/**
 * Μοίρασμα φύλλων σε Κέντρο, Στοίβα και Παίκτες
 */
function deal($players_cnt) {
    // Διάβασμα φύλλων από τη βάση

    $cards = db_read_board();

    // Ανακάτεμα φύλλων

    shuffle($cards);

    // Μοίρασμα 12 φύλλων σε κάθε παίκτη 
    // (δύο φύλλα ανά παίκτη σε κάθε γύρο του μοιράσματος)

    $deal_round_cards_cnt = $players_cnt * 2;

    for ($i = 0; $i < $players_cnt; $i++) {
        $seriesNo[$i] = 1;
    }

    for ($i = 0; $i < $players_cnt * 12; $i = $i + $deal_round_cards_cnt) {
        for ($j = 0; $j < $deal_round_cards_cnt; $j++) {
            $player_id = intdiv($j, 2);

            $cards[$i + $j]['card_owner'] = CARD_OWNER_STACK + $player_id + 1;
            $cards[$i + $j]['card_series'] = 1;
            $cards[$i + $j]['card_series_no'] = $seriesNo[$player_id]++;
        }
    }

    // Τοποθέτηση 1 ανοικτού χαρτιού στο Κέντρο

    $i = $players_cnt * 12;

    $cards[$i]['card_owner'] = CARD_OWNER_CENTER;
    $cards[$i]['card_series'] = 1;
    $cards[$i]['card_series_no'] = 1;

    // Τοποθέτηση υλοποίπων χαρτιών στη Στοίβα

    for ($i = $players_cnt * 12 + 1, $seriesNo = 1; $i < 52; $i++, $seriesNo++) {
        $cards[$i]['card_owner'] = CARD_OWNER_STACK;
        $cards[$i]['card_series'] = 1;
        $cards[$i]['card_series_no'] = $seriesNo;
    }

    // Ενημέρωση βάσης

    db_update_board($cards);
}

/**
 * Ενημέρωση κατάστασης παιχνιδιού
 */
function update_game_status($player_id, $board) {
    $game = db_read_game();

    // Καθορισμός επόμενης φάσης παιχνιδιού

    if (is_winner($player_id, $game, $board)) {
        $next_game_phase = 3; // Τερματισμός γύρου
    } else {
        $next_game_phase = $game['game_phase'];
    }

    // Καθορισμός επόμενου παίκτη

    if ($next_game_phase === 3) { // Τερματισμός γύρου
        $next_player_id = $player_id;

        update_history($player_id, $game['game_players_cnt']);
    } else {
        $next_player_id = $player_id + 1;

        if ($next_player_id > $game['game_players_cnt']) {
            $next_player_id = 1;
        }
    }

    db_update_game_status($next_player_id, $next_game_phase);
}

/**
 * Έλεγχος αν ένας παίκτης είναι νικητής (δηλ. δεν έχει φύλλα στα χέρια του)
 */
function is_winner($player_id, $game, $cards) {
    $card_cnt = 0;
    for ($i = 0; $i < 52; $i++) {
        if ($cards[$i]['card_owner'] == $player_id + 2 &&
                $cards[$i]['card_series'] == 1) {
            $card_cnt++;
        }
    }

    return $card_cnt == 0;
}

/**
 * Ενημέρωση ScoreBoard με τους πόντους του τελευταίου γύρου 
 * (μετά τον τερματισμό του)
 */
function update_history($winner_id, $game_players_cnt) {
    $points_hand = array();
    $points_hand[1] = 0;
    $points_hand[2] = 0;
    $points_hand[3] = 0;

    $points_down = array();
    $points_down[1] = 0;
    $points_down[2] = 0;
    $points_down[3] = 0;

    $cards = db_read_board();

    for ($i = 0; $i < 52; $i++) {
        if ($cards[$i]['card_owner'] > 2) {
            $player_id = $cards[$i]['card_owner'] - 2;

            $card_no = $cards[$i]['card_no'];
            $card_series = $cards[$i]['card_series'];

            if ($card_series > 1) {
                $points_down[$player_id] = $points_down[$player_id] +
                        calc_points($card_no);
            } else {
                $points_hand[$player_id] = $points_hand[$player_id] +
                        calc_points($card_no);
            }
        }
    }

    $points_down[$winner_id] = $points_down[$winner_id] + 10;

    if ($game_players_cnt >= 1) {
        if ($points_down[1] === 0) {
            $points_hand[1] = $points_hand[1] * 2;
        }
    }

    if ($game_players_cnt >= 2) {
        if ($points_down[2] === 0) {
            $points_hand[2] = $points_hand[2] * 2;
        }
    }

    if ($game_players_cnt >= 3) {
        if ($points_down[3] === 0) {
            $points_hand[3] = $points_hand[3] * 2;
        }
    }

    $history_id = db_find_max_history_id() + 1;

    db_insert_history($history_id,
            $points_down[1] - $points_hand[1],
            $points_down[2] - $points_hand[2],
            $points_down[3] - $points_hand[3]);
}

function calc_points($card_no) {
    if ($card_no === '2') {
        return 2;
    } else if ($card_no === 'A') {
        return 1.5;
    } else if ($card_no > '3' && $card_no < '6') {
        return 0.5;
    } else {
        return 1;
    }
}

//**************************** ΒΔ *********************************************/

function db_read_game() {
    global $mysqli;

    $sql = 'SELECT g.*, 
		IFNULL((SELECT MAX(history_id) FROM history), 0) + 1 game_round 
            from game g';

    $st = $mysqli->prepare($sql);

    $st->execute();

    $res = $st->get_result();

    $status = $res->fetch_assoc();

    return($status);
}

function db_create_game() {
    global $mysqli;

    $sql = 'insert into game(game_phase, game_players_cnt) values(0, 0)';
    $st = $mysqli->prepare($sql);

    $st->execute();
}

function db_update_game_after_create_player() {
    global $mysqli;

    $sql = 'update game '
            . 'set game_phase = 1, '
            . 'game_players_cnt = game_players_cnt + 1, '
            . 'game_current_player_id = 1 ';

    $st = $mysqli->prepare($sql);

    $st->execute();
}

function db_start_game() {
    global $mysqli;

    $sql = 'update game '
            . 'set game_phase = 2 ';

    $st = $mysqli->prepare($sql);

    $st->execute();
}

function db_game_reset() {
    global $mysqli;

    $sql = 'call game_reset()';

    $mysqli->query($sql);
}

function db_update_game_status($next_player_id, $next_game_phase) {
    global $mysqli;

    $sql = 'update game '
            . 'set game_phase = ?, '
            . '    game_current_player_id = ? ';

    $st = $mysqli->prepare($sql);
    $st->bind_param('ii', $next_game_phase, $next_player_id);

    $st->execute();
}

function db_round_reset() {
    global $mysqli;

    $sql = 'call round_reset()';

    $mysqli->query($sql);
}

function db_find_max_history_id() {
    global $mysqli;

    $sql = 'select max(history_id) max_history_id from history';

    $st = $mysqli->prepare($sql);
    $st->execute();

    $res = $st->get_result();

    $result = $res->fetch_assoc();

    if ($result) {
        return 0;
    } else {
        return $result['max_history_id'];
    }
}

function db_insert_history($history_id, $points1, $points2, $points3) {
    global $mysqli;

    $sql = 'insert into history(history_id, history_points1, history_points2, history_points3) '
            . 'values(?, ?, ?, ?)';

    $st = $mysqli->prepare($sql);
    $st->bind_param('iiii', $history_id, $points1, $points2, $points3);

    $st->execute();
}

function db_read_history() {
    global $mysqli;

    $sql = 'select * from history';

    $st = $mysqli->prepare($sql);

    $st->execute();

    $res = $st->get_result();

    $history = $res->fetch_all(MYSQLI_ASSOC);

    return($history);
}

?>