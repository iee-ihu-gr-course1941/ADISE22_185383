Table of Contents
=================
   * [Εγκατάσταση](#εγκατάσταση)
      * [Απαιτήσεις](#απαιτήσεις)
      * [Οδηγίες Εγκατάστασης](#οδηγίες-εγκατάστασης)
   * [Περιγραφή Παιχνιδιού](#περιγραφή-παιχνιδιού)
   * [Εφαρμογή](#εφαρμογή)
      * [Αρχιτεκτονική](#αρχιτεκτονική)
      * [Υλοποίηση](#υλοποίηση)
      * [Συντελεστές](#συντελεστές)
   * [Περιγραφή API](#περιγραφή-api)
      * [Methods](#methods)
         * [players](#players)
            * [Είσοδος Παίκτη](#είσοδος-παίκτη)
         * [game](#game)
            * [Ανάγνωση τρέχουσας κατάστασης Παιχνιδιού](#ανάγνωση-τρέχουσας-κατάστασης-παιχνιδιού)
            * [Εκκίνηση Παιχνιδιού](#εκκίνηση-παιχνιδιού)
         * [round](#round)
            * [Εκκίνηση γύρου Παιχνιδιού](#εκκίνηση-γύρου-παιχνιδιού)
         * [board](#board)
            * [Ανάγνωση Board](#ανάγνωση-board)
            * [Αποθήκευση τελευταίων κινήσεων Παίκτη](#αποθήκευση-τελευταίων-κινήσεων-παίκτη)
         * [history](#history)
            * [Ανάγνωση Scoreboard](#ανάγνωση-scoreboard)
      * [Entities](#entities)
         * [Game](#game-entity)
         * [Players](#players-entity)
         * [Cards](#cards-entity)
         * [History](#history-entity)

# Demo Page
Μπορείτε να κατεβάσετε τοπικά ή να επισκευτείτε την σελίδα: 
https://users.it.teithe.gr/~it185383/ADISE22_185383

# Εγκατάσταση
## Απαιτήσεις
* Apache2
* MySQL Server
* php

## Οδηγίες Εγκατάστασης
 * Κάντε clone το project σε κάποιον φάκελο: <br/>
  `$ git clone https://github.com/iee-ihu-gr-course1941/ADISE22_185383.git`

 * Βεβαιωθείτε ότι ο φάκελος είναι προσβάσιμος από τον Apache Server.

 * Θα πρέπει να δημιουργήσετε στη MySQL τη βάση με όνομα 'adise22_185383' και να φορτώσετε σε αυτήν τα δεδομένα από το αρχείο schema.sql.

 * Θα πρέπει να φτιάξετε το αρχείο lib/db_upass.php το οποίο να περιέχει:
```
    <?php
	$DB_PASS = 'Κωδικός Χρήστη';
	$DB_USER = 'Όνομα Χρήστη';
    ?>
```

# Περιγραφή Παιχνιδιού
Το πινάκλ είναι ένα παιχνίδι που παίζεται με 2 ή τρία άτομα και μία τράπουλα με όλα τα φύλλα εκτός των Joker. 

Σκοπός του παιχνιδιού είναι να δημιουργηθούν είτε τριάδες είτε μεγαλύτερες σειρές φύλλων (τετράδες, πεντάδες κτλ). Μια σειρά μπορεί να αποτελείται είτε από τρία ή τέσσερα φύλλα ίδιου αριθμού (π.χ. 3 τεσσάρια ή 4 Βαλέδες κτλ) είτε από σειρά φύλλων ίδιου χρώματος σε αριθμητική συνέχεια (π.χ. Καρό από το 5 μέχρι το 8). Στην περίπτωση σειράς φύλλων η αριθμητική συνέχεια των φύλλων είναι 1 έως 10, J, Q, K, A. Ο μπαλαντέρ του παιχνιδιού που μπορείτε να τον χρησιμοποιήσετε στην θέση οποιοδήποτε φύλλου είναι το 2.

Κάθε φορά που ένας παίκτης έχει μια τριάδα (ή περισσότερα) φύλλων μπορεί να τα κατεβάσει απο το χέρι του κάτω (τα τοποθετεί ανοιχτά μπροστά του). Νικητής της παρτίδας (γύρου) είναι αυτός που θα "βγεί" δηλαδή, θα κατεβάσει όλα τα φύλλα του και θα μείνει χωρίς φύλλο στο χέρι. Νικητής του παιχνιδιού είναι αυτός που θα συγκεντρώσει τους περισσότερους πόντους σε όλες τις παρτίδες (γύρους) που θα παιχθούν.

Κατά την διάρκεια μίας παρτίδας:

Μοιράζονται 12 χαρτιά σε κάθε παίκτη - μοιράζοντας 2 την φορά στον καθένα - και τοποθετείται ένα ακόμα ανοιχτό στο τραπέζι. Τα φυλλα που περισσεύουν τοποθετούνται δίπλα στο ανοικτό φύλλο και ονομάζονται πλέον στοίβα.

Ξεκινάει ο 1ος παίκτης. 

Κάθε παίκτης κάνει με την σειρά τις εξής κινήσεις:

1. Παίρνει είτε ένα φύλλο από τη στοίβα ή από τα χαρτιά που υπάρχουν κάτω όσα θέλει.
2. Κατεβάζει από τα χέρια του τις τριάδες, τετράδες κτλ. (εάν μπορεί και εάν θέλει να τις κατεβάσει).
3. Πετάει υποχρεωτικά ένα φύλλο πάνω στα ανοικτά φύλλα που βρίσκονται στο κέντρο.
4. Παίζει ο επόμενος.

# Εφαρμογή
Η εφαρμογή προσφέρει τις ακόλουθες βασικές λειτουργίες:
* Ένταξη παικτών στο Παιχνίδι
* Έλεγχος σύνδεσης παικτών (χωρίς password) και αυθεντικοποίηση  
* Εκτέλεση παρτίδων (γύρων) του Παιχνιδιού
* Καταγραφή πόντων παικτών (scoreboard)

## Αρχιτεκτονική
Η εφαρμογή ακολουθεί την αρχιτεκτονική που περιγράφεται στο μάθημα:
* MySQL
* Web API
* GUI

## Υλοποίηση
Η υλοποίηση βασίστηκε επίσης στις τεχνολογίες που χρησιμοποιήθηκαν στο μάθημα:
* MySQL
* PHP
* JavaScript
* Ajax
* JQuery

## Συντελεστές
Προγραμματιστής 1: Σχεδιασμός MySQL, PHP, HTML, CSS, JavaScript

# Περιγραφή API
## Methods
### players
#### Είσοδος Παίκτη

```
POST /players/
```
Json Data:

| Field           | Description | Required    |
| ------------ | ------------- | ------------ |
| `player_name` | Όνομα Παίκτη | yes |
| `player_id` | Κωδικός Παίκτη | yes |

Ελέγχει την εγκυρότητα των στοιχείων του παίκτη, τον εισάγει στη βάση και, τελικά, επιστρέφει τα στοιχεία του ως [Players](#players-entity).

### game
#### Ανάγνωση τρέχουσας κατάστασης Παιχνιδιού

```
GET /game/
```

Επιστρέφει την τρέχουσα κατάσταση του παιχνιδιού ως [Game](#game-entity).

#### Εκκίνηση Παιχνιδιού

```
POST /game/
```

Καθαρίζει πλήρως τα στοιχεία του τρέχοντος παιχνιδιού (δηλ. παίκτες, scroreboard κλπ.) και ξεκινά νέο παιχνίδι.

### round

#### Εκκίνηση γύρου Παιχνιδιού
```
POST /round/
```

Καθαρίζει τα στοιχεία του τρέχοντος γύρου του παιχνιδιού (αν υπάρχει) και ξεκινά νέο γύρο (με τους ίδιους παίκτες), διατηρώντας την ιστορικότητα πόντων.

### board

#### Ανάγνωση Board
```
GET /board/
```

Επιστρέφει το Board ως λίστα από [Cards](#cards-entity).

#### Αποθήκευση τελευταίων κινήσεων Παίκτη
```
PUT /board/:player_id
```
Json Data:

| Field                  | Description                                               | Required |
| ----------------- | -------------------------------------------- | ---------- |
| `board` | To τρέχον board ως λίστα από [Cards](#cards-entity) | yes |
| `player_id` | Κωδικός τρέχοντος Παίκτη | yes |

Επιστρέφει το board ως λίστα από [Cards](#cards-entity).

### history

#### Ανάγνωση Scoreboard
```
GET /history/
```

Επιστρέφει το Scoreboard ως λίστα από [History](#history-entity).

## Entities
### Game Entity
---------

H κατάσταση παιχνιδιού έχει τα παρακάτω στοιχεία:

| Attribute                       | Description                    | Values                                |
|--------------------------|---------------------------|------------------------------|
| `game_id`                     | ID Παιχνιδιού             | INT (Auto_Increment)|
| `game_phase`              | Φάση Παιχνιδιού           | SMALLINT (0.Αρχική, 1.Ένταξη παικτών, 2.Παίξιμο Γύρου, 3.Τερματισμός Γύρου)                        |
| `game_players_cnt`     | Πλήθος Παικτών            | SMALLINT                     |  
| `game_current_player_id` | Τρέχον παίκτης            | INT                          |

### Players Entity
---------

O κάθε παίκτης έχει τα παρακάτω στοιχεία:

| Attribute      | Description               | Values                       |
|----------------|---------------------------|------------------------------|
| `player_id`    | ID Παίκτη                 | INT (1, 2 ή 3)               |
| `player_name`  | Όνομα Παίκτη              | VARCHAR                      |
| `player_token` | To κρυφό token του Παίκτη | ΗΕΧ (επιστρέφεται τη στιγμή της εισόδου του παίκτη στο παιχνίδι) |


### Cards Entity
---------

To σύνολο των φύλλων με τα οποία παίζεται κάθε γύρος του παιχνιδιού. 

Κάθε φύλλο περιέχει τα παρακάτω:

| Attribute               | Description               | Values                      |
|-------------------------|---------------------------|-----------------------------|
| `card_id`               | ID φύλλου                 | INT                         |
| `card_no`               | Αριθμός Φύλλου            | VARCHAR (2..10, J, Q, K, A) |
| `card_symbol`           | Σύμβολο φύλλου            | ENUM (Η.Κούπα, C.Σπαθί, D.Καρό, S.Μπαστούνι) |
| `card_owner`            | Κάτοχος φύλλου (κατά την διάρκεια ενός γύρου) | SMALLINT (0.Κανένας, 1.Κέντρο, 2.Στοίβα, 3.Παίκτης #1, 4.Παίκτης #2 ή 5.Παίκτης #3)|
| `card_series`           | Σειρά φύλλων (κατά την διάρκεια ενός γύρου) | SMALLINT (Όταν ο Κάτοχος έχει τιμή 1 (Κέντρο) ή 2 (Στοίβα), η Σειρά έχει πάντα τιμή 1. Όταν ο Κάτοχος είναι 3 (1ος Παίκτης), 4 (2ος Παίκτης) ή 5 (3ος Παίκτης), η Σειρά έχει τιμή 1 για τα χαρτιά που έχει - ο παίκτης - στο χέρι του και από 2 και πάνω για κάθε κατεβασμένη σειρά φύλλων)| 
| `card_series_no`        | Θέση φύλλου στη Σειρά (κατά την διάρκεια ενός γύρου)|  SMALLINT |

### History Entity
---------

Για κάθε γύρο ενός Παιχνιδιού, αποθηκεύονται τα παρακάτω στοιχεία:

| Attribute           | Description               | Values                       |
|---------------------|---------------------------|------------------------------|
| `history_id`        | ID (αριθμός) Γύρου        | INT                          |
| `history_points1`   | Πόντοι Παίκτη #1          | INT                          |
| `history_points2`   | Πόντοι Παίκτη #2          | INT                          |
| `history_points3`   | Πόντοι Παίκτη #3          | INT                          |
| `history_timestamp` | Timestamp ενημέρωσης      | TIMESTAMP                    |