<?php

/**
 * GET μέθοδος άντλησης board από τη βάση
 */
function get_board() {
    $board = db_read_board();

    header('Content-type: application/json');
    print json_encode($board, JSON_PRETTY_PRINT);
}

/**
 * PUT μέθοδος αποθήκευσης τελευταίων κινήσεων παίκτη (επιλογή και απόρριψη φύλλων) 
 * στη βάση
 */
function put_board($player_id, $input) {
    $board = $input['board'];
    
    db_update_board($board);
    
    update_game_status($player_id, $board);
    
    header('Content-type: application/json');
    print json_encode($board, JSON_PRETTY_PRINT);
}

/* * ********************** DB ************************************************* */

function db_read_board() {
    global $mysqli;

    $sql = 'select * from cards order by card_id';

    $st = $mysqli->prepare($sql);
    $st->execute();

    $res = $st->get_result();

    $board = $res->fetch_all(MYSQLI_ASSOC);

    return($board);
}

function db_update_board($cards) {
    global $mysqli;

    for ($i = 0; $i < 52; $i++) {
        $sql = 'update cards set card_owner = ?, card_series = ?, card_series_no = ? '
                . 'where card_id = ?'; 

        $st = $mysqli->prepare($sql);
        $st->bind_param('iiii',  
                $cards[$i]['card_owner'], 
                $cards[$i]['card_series'],
                $cards[$i]['card_series_no'],
                $cards[$i]['card_id']);

        $st->execute();
    }
}

?>