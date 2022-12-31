<?php

require_once "../lib/dbconnect.php";
require_once "../lib/board.php";
require_once "../lib/game.php";
require_once "../lib/player.php";

$method = $_SERVER['REQUEST_METHOD'];

$request = explode('/', trim($_SERVER['PATH_INFO'], '/'));

// Καθορισμός input κλήσης API

$input = json_decode(file_get_contents('php://input'), true);
if ($input == null) {
    $input = [];
}

if (isset($_SERVER['HTTP_X_TOKEN'])) {
    $input['token'] = $_SERVER['HTTP_X_TOKEN'];
} else {
    $input['token'] = '';
}

// API 

switch ($r = array_shift($request)) {
    // Players

    case 'players':
        handle_player($method, $request, $input);
        break;

    // Game

    case 'game':
        if (sizeof($request) == 0) {
            handle_game($method);
        } else {
            header("HTTP/1.1 404 Not Found");
        }
        break;

    // Game round

    case 'round':
        if (sizeof($request) == 0) {
            handle_round($method);
        } else {
            header("HTTP/1.1 404 Not Found");
        }
        break;

    // Board

    case 'board' :
        handle_board($method, $request, $input);
        break;

    default: header("HTTP/1.1 404 Not Found");
        exit;
}

function handle_player($method, $p, $input) {
    if ($method == 'POST') {
        $player_id = (int) array_shift($p);

        // Εισαγωγή παίκτη

        post_player($player_id, $input);
    } else {
        header('HTTP/1.1 405 Method Not Allowed');
    }
}

function handle_game($method) {
    if ($method == 'GET') {
        // Τρέχουσα κατάσταση παιχνιδιού

        get_game_status();
    } else if ($method == 'POST') {

        // Έκκίνηση/Επανεκκίνηση παιχνιδιού
        post_game_reset();
    } else {
        header('HTTP/1.1 405 Method Not Allowed');
    }
}

function handle_round($method) {
    if ($method == 'POST') {

        // Έκκίνηση/Επανεκκίνηση γύρου
        post_round_reset();
    } else {
        header('HTTP/1.1 405 Method Not Allowed');
    }
}

function handle_board($method, $p, $input) {
    if ($method == 'GET') {
        // Διάβασμα τρέχουσας κατάστασης

        get_board();
    } else if ($method == 'POST') {
        $player_id = (int) array_shift($p);

        // Αποθήκευση κινήσεων παίκτη

        post_board($player_id, $input);
    } else {
        header('HTTP/1.1 405 Method Not Allowed');
    }
}

?>
