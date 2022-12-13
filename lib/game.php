<?php

function get_status() {
    $game = db_read_game();

    if (!$game) {
        db_create_game();

        $game = db_read_game();
    }

    header('Content-type: application/json');
    print json_encode($game, JSON_PRETTY_PRINT);
}

function update_game_status() {
    global $mysqli;

    $status = read_status();

    $new_status = null;
    $new_turn = null;

    $st3 = $mysqli->prepare('select count(*) as aborted from players WHERE last_action< (NOW() - INTERVAL 5 MINUTE)');
    $st3->execute();
    $res3 = $st3->get_result();
    $aborted = $res3->fetch_assoc()['aborted'];
    if ($aborted > 0) {
        $sql = "UPDATE players SET username=NULL, player_token=NULL WHERE last_action< (NOW() - INTERVAL 5 MINUTE)";
        $st2 = $mysqli->prepare($sql);
        $st2->execute();
        if ($status['status'] == 'started') {
            $new_status = 'aborted';
        }
    }


    $sql = 'select count(*) as c from players where username is not null';
    $st = $mysqli->prepare($sql);
    $st->execute();
    $res = $st->get_result();
    $active_players = $res->fetch_assoc()['c'];

    switch ($active_players) {
        case 0: $new_status = 'not active';
            break;
        case 1: $new_status = 'initialized';
            break;
        case 2: $new_status = 'started';
            if ($status['p_turn'] == null) {
                $new_turn = 'W'; // It was not started before...
            }
            break;
    }

    $sql = 'update game_status set status=?, p_turn=?';
    $st = $mysqli->prepare($sql);
    $st->bind_param('ss', $new_status, $new_turn);
    $st->execute();
}

//**************************** DB *********************************************/

function db_read_game() {
    global $mysqli;

    $sql = 'select * from game';

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

function db_update_game_adding_new_player() {
    global $mysqli;
    
    $sql = 'update game '
            . 'set game_phase = 1, '
            . 'game_players_cnt = game_players_cnt + 1, '
            . 'game_current_player_id = 1 ';
                
    $st = $mysqli->prepare($sql);
    
    $st->execute();
}

?>