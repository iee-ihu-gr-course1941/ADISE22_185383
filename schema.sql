-- --------------------------------------------------------
-- Διακομιστής:                  127.0.0.1
-- Έκδοση διακομιστή:            10.4.27-MariaDB - mariadb.org binary distribution
-- Λειτ. σύστημα διακομιστή:     Win64
-- HeidiSQL Έκδοση:              12.2.0.6576
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for πίνακας pinakl.cards
CREATE TABLE IF NOT EXISTS `cards` (
  `card_id` int(11) NOT NULL,
  `card_no` smallint(6) NOT NULL DEFAULT 2 COMMENT 'Αριθμός (2..10, J, Q, K, A)',
  `card_symbol` enum('H','C','D','S') NOT NULL DEFAULT 'H' COMMENT 'Σύμβολο (Η. Κούπα, C. Σπαθί, D. Καρό, S. Μπαστούνι) ',
  `card_figure` varchar(2) NOT NULL DEFAULT '2H' COMMENT 'Φιγούρα',
  `card_round_tank` smallint(6) NOT NULL DEFAULT 0 COMMENT 'Κάτοχος (0. Κανένας, 1. Π1, 2. Π2, 3. Π3, 4. Στοίβα, 5. Κέντρο)',
  `card_round_series_player_id` int(11) DEFAULT NULL COMMENT 'Σειρά φύλλων - Παίκτης ',
  `card_round_series_no` smallint(6) DEFAULT NULL COMMENT 'Σειρά φύλλων - Αριθμός',
  PRIMARY KEY (`card_id`),
  UNIQUE KEY `card_no_card_symbol` (`card_no`,`card_symbol`),
  KEY `FK_cards_players` (`card_round_series_player_id`),
  CONSTRAINT `FK_cards_players` FOREIGN KEY (`card_round_series_player_id`) REFERENCES `players` (`player_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Data exporting was unselected.

-- Dumping structure for πίνακας pinakl.game
CREATE TABLE IF NOT EXISTS `game` (
  `game_id` int(11) NOT NULL AUTO_INCREMENT,
  `game_phase` smallint(6) NOT NULL DEFAULT 0 COMMENT 'Φάση (0. Αρχική, 1. Ένταξη παικτών, 2. Παίξιμο Γύρου, 3. Τερματισμός Γύρου)',
  `game_players_cnt` smallint(6) NOT NULL DEFAULT 0,
  `game_current_player_id` int(11) DEFAULT NULL,
  `game_current_player_step` smallint(6) NOT NULL DEFAULT 0 COMMENT 'Βήμα Παίκτη (0. Κανένα, 1. Επιλογή φύλλων, 2. Κατέβασμα, 3. Πέταγμα στο κέντρο)',
  PRIMARY KEY (`game_id`) USING BTREE,
  KEY `FK_game_players` (`game_current_player_id`),
  CONSTRAINT `FK_game_players` FOREIGN KEY (`game_current_player_id`) REFERENCES `players` (`player_id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Data exporting was unselected.

-- Dumping structure for procedure pinakl.game_reset
DELIMITER //
CREATE PROCEDURE `game_reset`()
BEGIN
   CALL round_reset();
   
   delete FROM `game`;
   
	delete from `players`;
END//
DELIMITER ;

-- Dumping structure for πίνακας pinakl.history
CREATE TABLE IF NOT EXISTS `history` (
  `history_id` int(11) NOT NULL AUTO_INCREMENT,
  `history_points1` int(11) NOT NULL,
  `history_points2` int(11) NOT NULL,
  `history_points3` int(11) NOT NULL,
  `history_timestamp` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`history_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Data exporting was unselected.

-- Dumping structure for πίνακας pinakl.players
CREATE TABLE IF NOT EXISTS `players` (
  `player_id` int(11) NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `player_token` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `player_name` (`player_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

-- Data exporting was unselected.

-- Dumping structure for procedure pinakl.round_reset
DELIMITER //
CREATE PROCEDURE `round_reset`()
BEGIN
	UPDATE `cards` AS c 
	SET c.card_round_tank = 0, 
		c.card_round_series_player_id = NULL, 
		c.card_round_series_no = NULL; 
		
	UPDATE `game` AS g 
	SET g.game_phase = 2,
	    g.game_current_player_id = 1,
		 g.game_current_player_step = 1;
END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
