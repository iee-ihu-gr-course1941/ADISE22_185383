-- --------------------------------------------------------
-- Διακομιστής:                  127.0.0.1
-- Έκδοση διακομιστή:            8.0.27 - MySQL Community Server - GPL
-- Λειτ. σύστημα διακομιστή:     Win64
-- HeidiSQL Έκδοση:              12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for πίνακας adise22_185383.cards
CREATE TABLE IF NOT EXISTS `cards` (
  `card_id` int NOT NULL,
  `card_no` varchar(2) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '2' COMMENT 'Αριθμός (2..10, J, Q, K, A)',
  `card_symbol` enum('H','C','D','S') NOT NULL DEFAULT 'H' COMMENT 'Σύμβολο (Η. Κούπα, C. Σπαθί, D. Καρό, S. Μπαστούνι) ',
  `card_owner` smallint NOT NULL DEFAULT '0' COMMENT 'Κάτοχος (0. Κανένας, 1. Κέντρο, 2. Στοίβα, 3...Ν. Παίκτης )',
  `card_series` smallint NOT NULL DEFAULT '0' COMMENT 'Σειρά φύλλων (0. Καμία, 1...Ν. Αριθμός Σειράς)',
  `card_series_no` smallint NOT NULL DEFAULT '0' COMMENT 'Θέση φύλλου στη Σειρά',
  PRIMARY KEY (`card_id`),
  UNIQUE KEY `card_no_card_symbol` (`card_no`,`card_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Data exporting was unselected.

-- Dumping structure for πίνακας adise22_185383.game
CREATE TABLE IF NOT EXISTS `game` (
  `game_id` int NOT NULL AUTO_INCREMENT,
  `game_phase` smallint NOT NULL DEFAULT '0' COMMENT 'Φάση (0. Αρχική, 1. Ένταξη παικτών, 2. Παίξιμο Γύρου, 3. Τερματισμός Γύρου)',
  `game_players_cnt` smallint NOT NULL DEFAULT '0',
  `game_current_player_id` int DEFAULT NULL,
  `game_current_player_step` smallint NOT NULL DEFAULT '0' COMMENT 'Βήμα Παίκτη (0. Κανένα, 1. Επιλογή φύλλων, 2. Κατέβασμα, 3. Πέταγμα στο κέντρο)',
  PRIMARY KEY (`game_id`) USING BTREE,
  KEY `FK_game_players` (`game_current_player_id`),
  CONSTRAINT `FK_game_players` FOREIGN KEY (`game_current_player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb3;

-- Data exporting was unselected.

-- Dumping structure for procedure adise22_185383.game_reset
DELIMITER //
CREATE PROCEDURE `game_reset`()
BEGIN
   CALL round_reset();
   
   delete FROM `game`;
   
	delete from `players`;
END//
DELIMITER ;

-- Dumping structure for πίνακας adise22_185383.history
CREATE TABLE IF NOT EXISTS `history` (
  `history_id` int NOT NULL AUTO_INCREMENT,
  `history_points1` int NOT NULL,
  `history_points2` int NOT NULL,
  `history_points3` int NOT NULL,
  `history_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Data exporting was unselected.

-- Dumping structure for πίνακας adise22_185383.players
CREATE TABLE IF NOT EXISTS `players` (
  `player_id` int NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `player_token` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `player_name` (`player_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Data exporting was unselected.

-- Dumping structure for procedure adise22_185383.round_reset
DELIMITER //
CREATE PROCEDURE `round_reset`()
BEGIN
	UPDATE `cards` AS c 
	SET c.card_owner = 0, 
		c.card_series = 0,
		c.card_series_no = 0;  
		
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
