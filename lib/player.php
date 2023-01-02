<?php

define("CHECK_NEW_PLAYER_VALID_PLAYER_NOT_EXISTS", 1);
define("CHECK_NEW_PLAYER_VALID_PLAYER_EXISTS", 2);
define("CHECK_NEW_PLAYER_ERROR_PLAYER_ID_EXISTS", -1);
define("CHECK_NEW_PLAYER_ERROR_PLAYER_NAME_EXISTS", -2);
define("CHECK_NEW_PLAYER_ERROR_INVALID_ID", -3);

/**
 * POST μέθοδος εισαγωγής νέου παίκτη στο παιχνίδι
 */
function post_player($player_id, $input) {
    if (!isset($input['player_name']) || $input['player_name'] == '') {
        header("HTTP/1.1 400 Bad Request");
        print json_encode(['errormesg' => "Δεν δόθηκε Όνομα Παίκτη!"]);
        exit;
    }

    $player_name = $input['player_name'];

    $check_player_results = check_new_player($player_id, $player_name);

    switch ($check_player_results) {
        case CHECK_NEW_PLAYER_ERROR_PLAYER_ID_EXISTS:
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg' => "Ο Παίκτης $player_id υπάρχει ήδη! Παρακαλώ, επιλέξτε άλλο Παίκτη."]);
            exit;
            
        case CHECK_NEW_PLAYER_ERROR_PLAYER_NAME_EXISTS:
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg' => "To Όνομα $player_name χρησιμοποιείται ήδη! Παρακαλώ, επιλέξτε άλλο Όνομα."]);
            exit;
            
        case CHECK_NEW_PLAYER_ERROR_INVALID_ID:
            header("HTTP/1.1 400 Bad Request");
            print json_encode(['errormesg' => "Μη αποδεκτό ID παίκτη!"]);
            exit;

        case CHECK_NEW_PLAYER_VALID_PLAYER_EXISTS:
            $player = db_read_player($player_id);
            break;
        
        default: 
            // Προσθήκη νέου παίκτη
            
            db_create_player($player_id, $player_name);

            db_update_game_after_create_player();

            $player = db_read_player($player_id);
            break;
    }

    header('Content-type: application/json');
    print json_encode($player, JSON_PRETTY_PRINT);
}

/**
 * Έλεγχος εγκυρότητας εισόδου νέου παίκτη στο παιχνίδι
 */
function check_new_player($player_id, $player_name) {
    // Έλεγχος ως προς το player_id

    $player1 = db_read_player($player_id);

    if ($player1) {
        // Αν υπάρχει παίκτης με το ίδιο $player_id ...

        if ($player1['player_name'] != $player_name) {
            // Aν το player_name, στη βάση, είναι διαφορετικό από το $player_name ...

            return CHECK_NEW_PLAYER_ERROR_PLAYER_ID_EXISTS;
        } else {
            return CHECK_NEW_PLAYER_VALID_PLAYER_EXISTS;
        }
    }

    // Έλεγχος ως προς το player_name

    $player2 = db_find_other_player_by_name($player_id, $player_name);

    if ($player2) {
        // Aν το $player_name χρησιμοποιειται από άλλο παίκτη ...

        return CHECK_NEW_PLAYER_ERROR_PLAYER_NAME_EXISTS;
    }
    
    // Έλεγχος κάλυψης όλων των προηγουμένων θέσεων από παίκτες
    // (για παράδειγμα, δε μπορεί να δηλωθεί ένας παίκτης ως 3ος ενώ δεν έχει
    //  δηλωθεί ο 2ος)
    
    $max_player_id = db_find_max_player_id();
    
    if ($player_id - $max_player_id !== 1) {
        return CHECK_NEW_PLAYER_ERROR_INVALID_ID;
    }

    return CHECK_NEW_PLAYER_VALID_PLAYER_NOT_EXISTS;
}

//**************************** ΒΔ *********************************************/

function db_read_players() {
    global $mysqli;
    
    $sql = 'select * from players order by player_id';
    
    $st = $mysqli->prepare($sql);
    $st->execute();
    
    $res = $st->get_result();
    
    $players = $res->fetch_all(MYSQLI_ASSOC);
    
    return($players);
}

function db_read_player($player_id) {
    global $mysqli;

    $sql = 'select * from players where player_id = ?';

    $st = $mysqli->prepare($sql);
    $st->bind_param('i', $player_id);

    $st->execute();

    $res = $st->get_result();

    $player = $res->fetch_assoc();

    return $player;
}

function db_find_other_player_by_name($player_id, $player_name) {
    global $mysqli;

    $sql = 'select player_id from players where player_name = ? and player_id <> ?';

    $st = $mysqli->prepare($sql);
    $st->bind_param('si', $player_name, $player_id);

    $st->execute();

    $res = $st->get_result();

    $player = $res->fetch_assoc();

    return $player;
}

function db_find_max_player_id() {
    global $mysqli;
    
    $sql = 'select max(player_id) max_player_id from players';
    
    $st = $mysqli->prepare($sql);
    $st->execute();
    
    $res = $st->get_result();
    
    $result = $res->fetch_assoc();
    
    if (!$result) {
        return 0;
    }
    else {
        return $result['max_player_id'];
    }
}

function db_create_player($player_id, $player_name) {
    global $mysqli;

    $sql = 'insert into players (player_id, player_name, player_token) values(?, ?, md5(CONCAT(?, NOW())))';

    $st = $mysqli->prepare($sql);
    $st->bind_param('isi', $player_id, $player_name, $player_id);

    $st->execute();
}

?>
