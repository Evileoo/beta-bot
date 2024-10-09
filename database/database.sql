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
    discord_id VARCHAR(30) NOT NULL COMMENT "Identifiant discord du compte",
    riot_puuid VARCHAR(100) NOT NULL COMMENT "Identifiant riot du compte"
) ENGINE=INNODB COMMENT="Synchronisation lol / discord enregistré dans le bot";

-- inhouse_session
CREATE TABLE IF NOT EXISTS inhouse_session (
    id INT NOT NULL AUTO_INCREMENT COMMENT "Identifiant de la session InHouse",
    tms VARCHAR(10) NOT NULL COMMENT "Date et heure de l'in house",
    elomin VARCHAR(20) NULL DEFAULT "UNRANKED" COMMENT "Rang minimum pour participer à l'InHouse",
    elomax VARCHAR(20) NULL DEFAULT "CHALLENGER" COMMENT "Rang maximum pour participer à l'InHouse",
    role_limit INT COMMENT "Nombre de joueurs maximum par role",
    guild_id VARCHAR(30) NOT NULL COMMENT "Guilde dans laquelle le message a été envoyé",
    channel_id VARCHAR(30) NOT NULL COMMENT "Channel de la guilde dans laquelle le message a été envoyé",
    message_id VARCHAR(30) NOT NULL COMMENT "Message d'annonce de l'inhouse",
    inhouse_status VARCHAR(30) COMMENT "Etat de l'inhouse",
    PRIMARY KEY (id)
) ENGINE=INNODB COMMENT="Sessions inhouse";

-- inhouse_partcipants
CREATE TABLE IF NOT EXISTS inhouse_participants (
    discord_id VARCHAR(30) NOT NULL COMMENT "Identifiant discord du compte",
    inhouse_id INT NOT NULL COMMENT "Identifiant de la session InHouse",
    toplaner_priority DECIMAL(1,0) NULL DEFAULT 1 COMMENT "Priorité définie pour jouer en toplane",
    jungler_priority DECIMAL(1,0) NULL DEFAULT 1 COMMENT "Priorité définie pour jouer en jungle",
    midlaner_priority DECIMAL(1,0) NULL DEFAULT 1 COMMENT "Priorité définie pour jouer en midlane",
    botlaner_priority DECIMAL(1,0) NULL DEFAULT 1 COMMENT "Priorité définie pour jouer en botlane",
    support_priority DECIMAL(1,0) NULL DEFAULT 1 COMMENT "Priorité définie pour jouer en support"
) ENGINE=INNODB COMMENT="Participation à un inhouse";