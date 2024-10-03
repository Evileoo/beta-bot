-- --------------
-- DROP TABLES --
-- --------------
DROP TABLE IF EXISTS inhouse_participants;
DROP TABLE IF EXISTS inhouse_session;
DROP TABLE IF EXISTS comptes;

-- ----------------
-- CREATE TABLES --
-- ----------------

-- comptes
CREATE TABLE IF NOT EXISTS comptes (
    id INT NOT NULL AUTO_INCREMENT COMMENT "Identifiant local du compte",
    discord_id VARCHAR(30) NOT NULL COMMENT "Identifiant discord du compte",
    riot_puuid VARCHAR(100) NOT NULL COMMENT "Identifiant riot du compte",
    toplaner_priority DECIMAL(1,0) NULL DEFAULT 0 COMMENT "Priorité définie pour jouer en toplane",
    jungler_priority DECIMAL(1,0) NULL DEFAULT 0 COMMENT "Priorité définie pour jouer en jungle",
    midlaner_priority DECIMAL(1,0) NULL DEFAULT 0 COMMENT "Priorité définie pour jouer en midlane",
    botlaner_priority DECIMAL(1,0) NULL DEFAULT 0 COMMENT "Priorité définie pour jouer en botlane",
    support_priority DECIMAL(1,0) NULL DEFAULT 0 COMMENT "Priorité définie pour jouer en support",
    link_status VARCHAR(20) COMMENT "État de la création du compte",
    PRIMARY KEY (id)
) ENGINE=INNODB COMMENT="Synchronisation lol / discord enregistré dans le bot";

-- inhouse_session
CREATE TABLE IF NOT EXISTS inhouse_session (
    id INT NOT NULL AUTO_INCREMENT COMMENT "Identifiant de la session InHouse",
    tms TIMESTAMP NOT NULL COMMENT "Date et heure de l'in house",
    elomin VARCHAR(20) NULL DEFAULT "UNRANKED" COMMENT "Rang minimum pour participer à l'InHouse",
    elomax VARCHAR(20) NULL DEFAULT "CHALLENGER" COMMENT "Rang maximum pour participer à l'InHouse",
    PRIMARY KEY (id)
) ENGINE=INNODB COMMENT="Sessions inhouse";

-- inhouse_partcipants
CREATE TABLE IF NOT EXISTS inhouse_partcipants (
    compte_id INT NOT NULL COMMENT "Identifiant local du compte",
    inhouse_id INT NOT NULL COMMENT "Identifiant de la session InHouse"
) ENGINE=INNODB COMMENT="Participation à un inhouse";