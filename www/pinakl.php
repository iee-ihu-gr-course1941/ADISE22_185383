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
        switch ($b = array_shift($request)) {
            case '':
            case null:
                handle_board($method, $input);
                break;
            case 'piece':
                handle_piece($method, $request[0], $request[1], $input);
                break;
            default:
                header("HTTP/1.1 404 Not Found");
                break;
        }
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
    /* ////
      switch ($b = array_shift($p)) {
      //	case '':
      //	case null: if($method=='GET') {show_users($method);}
      //			   else {header("HTTP/1.1 400 Bad Request");
      //					 print json_encode(['errormesg'=>"Method $method not allowed here."]);}
      //                break;
      case 'B':
      case 'W': handle_user($method, $b, $input);
      break;
      default: header("HTTP/1.1 404 Not Found");
      print json_encode(['errormesg' => "Player $b not found."]);
      break;
      }
      } */
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

        // Έκκίνηση νέου γύρου
        post_round_reset();
    } else {
        header('HTTP/1.1 405 Method Not Allowed');
    }
}

function handle_board($method, $input) {
    if ($method == 'GET') {
        show_board($input);
    } else if ($method == 'POST') {
        reset_board();
        show_board($input);
    } else {
        header('HTTP/1.1 405 Method Not Allowed');
    }
}

function handle_piece($method, $x, $y, $input) {
    if ($method == 'GET') {
        show_piece($x, $y);
    } else if ($method == 'PUT') {
        move_piece($x, $y, $input['x'], $input['y'],
                $input['token']);
    }
}

?>
