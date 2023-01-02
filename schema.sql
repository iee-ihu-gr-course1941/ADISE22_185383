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
  `card_code` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `card_symbol` enum('H','C','D','S') NOT NULL DEFAULT 'H' COMMENT 'Σύμβολο (Η. Κούπα, C. Σπαθί, D. Καρό, S. Μπαστούνι) ',
  `card_owner` smallint NOT NULL DEFAULT '0' COMMENT 'Κάτοχος (0. Κανένας, 1. Κέντρο, 2. Στοίβα, 3...Ν. Παίκτης )',
  `card_series` smallint NOT NULL DEFAULT '0' COMMENT 'Σειρά φύλλων (0. Καμία, 1...Ν. Αριθμός Σειράς)',
  `card_series_no` smallint NOT NULL DEFAULT '0' COMMENT 'Θέση φύλλου στη Σειρά',
  PRIMARY KEY (`card_id`),
  UNIQUE KEY `card_no_card_symbol` (`card_no`,`card_symbol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table adise22_185383.cards: ~52 rows (approximately)
DELETE FROM `cards`;
INSERT INTO `cards` (`card_id`, `card_no`, `card_code`, `card_symbol`, `card_owner`, `card_series`, `card_series_no`) VALUES
	(1, '2', '&#127154;', 'H', 0, 0, 0),
	(2, '2', '&#127186;', 'C', 0, 0, 0),
	(3, '2', '&#127170;', 'D', 0, 0, 0),
	(4, '2', '&#127138;', 'S', 0, 0, 0),
	(5, '3', '&#127155;', 'H', 0, 0, 0),
	(6, '3', '&#127187;', 'C', 0, 0, 0),
	(7, '3', '&#127171;', 'D', 0, 0, 0),
	(8, '3', '&#127139;', 'S', 0, 0, 0),
	(9, '4', '&#127156;', 'H', 0, 0, 0),
	(10, '4', '&#127188;', 'C', 0, 0, 0),
	(11, '4', '&#127172;', 'D', 0, 0, 0),
	(12, '4', '&#127140;', 'S', 0, 0, 0),
	(13, '5', '&#127157;', 'H', 0, 0, 0),
	(14, '5', '&#127189;', 'C', 0, 0, 0),
	(15, '5', '&#127173;', 'D', 0, 0, 0),
	(16, '5', '&#127141;', 'S', 0, 0, 0),
	(17, '6', '&#127158;', 'H', 0, 0, 0),
	(18, '6', '&#127190;', 'C', 0, 0, 0),
	(19, '6', '&#127174;', 'D', 0, 0, 0),
	(20, '6', '&#127142;', 'S', 0, 0, 0),
	(21, '7', '&#127159;', 'H', 0, 0, 0),
	(22, '7', '&#127191;', 'C', 0, 0, 0),
	(23, '7', '&#127175;', 'D', 0, 0, 0),
	(24, '7', '&#127143;', 'S', 0, 0, 0),
	(25, '8', '&#127160;', 'H', 0, 0, 0),
	(26, '8', '&#127192;', 'C', 0, 0, 0),
	(27, '8', '&#127176;', 'D', 0, 0, 0),
	(28, '8', '&#127144;', 'S', 0, 0, 0),
	(29, '9', '&#127161;', 'H', 0, 0, 0),
	(30, '9', '&#127193;', 'C', 0, 0, 0),
	(31, '9', '&#127177;', 'D', 0, 0, 0),
	(32, '9', '&#127145;', 'S', 0, 0, 0),
	(33, '10', '&#127162;', 'H', 0, 0, 0),
	(34, '10', '&#127194;', 'C', 0, 0, 0),
	(35, '10', '&#127178;', 'D', 0, 0, 0),
	(36, '10', '&#127146;', 'S', 0, 0, 0),
	(37, 'J', '&#127163;', 'H', 0, 0, 0),
	(38, 'J', '&#127195;', 'C', 0, 0, 0),
	(39, 'J', '&#127179;', 'D', 0, 0, 0),
	(40, 'J', '&#127147;', 'S', 0, 0, 0),
	(41, 'Q', '&#127165;', 'H', 0, 0, 0),
	(42, 'Q', '&#127197;', 'C', 0, 0, 0),
	(43, 'Q', '&#127181;', 'D', 0, 0, 0),
	(44, 'Q', '&#127149;', 'S', 0, 0, 0),
	(45, 'K', '&#127166;', 'H', 0, 0, 0),
	(46, 'K', '&#127198;', 'C', 0, 0, 0),
	(47, 'K', '&#127182;', 'D', 0, 0, 0),
	(48, 'K', '&#127150;', 'S', 0, 0, 0),
	(49, 'A', '&#127153;', 'H', 0, 0, 0),
	(50, 'A', '&#127185;', 'C', 0, 0, 0),
	(51, 'A', '&#127169;', 'D', 0, 0, 0),
	(52, 'A', '&#127137;', 'S', 0, 0, 0);

-- Dumping structure for πίνακας adise22_185383.game
CREATE TABLE IF NOT EXISTS `game` (
  `game_id` int NOT NULL AUTO_INCREMENT,
  `game_phase` smallint NOT NULL DEFAULT '0' COMMENT 'Φάση (0. Αρχική, 1. Ένταξη παικτών, 2. Παίξιμο Γύρου, 3. Τερματισμός Γύρου)',
  `game_players_cnt` smallint NOT NULL DEFAULT '0',
  `game_current_player_id` int DEFAULT NULL,
  PRIMARY KEY (`game_id`) USING BTREE,
  KEY `FK_game_players` (`game_current_player_id`),
  CONSTRAINT `FK_game_players` FOREIGN KEY (`game_current_player_id`) REFERENCES `players` (`player_id`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table adise22_185383.game: ~0 rows (approximately)
DELETE FROM `game`;

-- Dumping structure for procedure adise22_185383.game_reset
DELIMITER //
CREATE PROCEDURE `game_reset`()
BEGIN
	UPDATE `cards` AS c 
	SET c.card_owner = 0, 
		c.card_series = 0,
		c.card_series_no = 0;  
   
   delete from `history`;

   delete FROM `game`;
   
	delete from `players`;
END//
DELIMITER ;

-- Dumping structure for πίνακας adise22_185383.history
CREATE TABLE IF NOT EXISTS `history` (
  `history_id` int NOT NULL,
  `history_points1` int DEFAULT NULL,
  `history_points2` int DEFAULT NULL,
  `history_points3` int DEFAULT NULL,
  `history_timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`history_id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table adise22_185383.history: ~0 rows (approximately)
DELETE FROM `history`;

-- Dumping structure for πίνακας adise22_185383.players
CREATE TABLE IF NOT EXISTS `players` (
  `player_id` int NOT NULL,
  `player_name` varchar(100) NOT NULL,
  `player_token` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`player_id`),
  UNIQUE KEY `player_name` (`player_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Dumping data for table adise22_185383.players: ~0 rows (approximately)
DELETE FROM `players`;

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
	    g.game_current_player_id = 1;
END//
DELIMITER ;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
