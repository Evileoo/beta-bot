-- ----------------
--  DROP TABLES  --
-- ----------------

DROP TABLE IF EXISTS inhouse_mvp_votes;
DROP TABLE IF EXISTS inhouse_team;
DROP TABLE IF EXISTS inhouse_match;
DROP TABLE IF EXISTS inhouse_participant;
DROP TABLE IF EXISTS inhouse_session;
DROP TABLE IF EXISTS account;


-- ----------------
-- CREATE TABLES --
-- ----------------

CREATE TABLE IF NOT EXISTS account (
    discord_id VARCHAR(20) NOT NULL COMMENT "Identifiant du compte Discord",
    riot_puuid VARCHAR(100) NOT NULL COMMENT "Identifiant du compte Riot",
    is_main DECIMAL(1,0) NOT NULL COMMENT "Indicateur de compte principal",
    PRIMARY KEY (riot_puuid)
) ENGINE=INNODB COMMENT="Compte(s) riot connectés au compte discord d'un membre";

CREATE TABLE IF NOT EXISTS inhouse_session (
    id INT NOT NULL AUTO_INCREMENT COMMENT "Identifiant de la session InHouse",
    step VARCHAR(20) NOT NULL COMMENT "Etape de l'inhouse : Création / Inscriptions / Génération / Résultats / Vote / MVP / Terminé",
    panel_channel VARCHAR(20) NOT NULL COMMENT "Channel du panel de session InHouse",
    panel_message VARCHAR(20) COMMENT "Message du panel de session InHouse",
    players_per_role DECIMAL(2,0) COMMENT "Nombre de joueurs maximum par role",
    elomin VARCHAR(20) COMMENT "Rang minimum pour participer à l'InHouse",
    elomax VARCHAR(20) COMMENT "Rang maximum pour participer à l'InHouse",
    participant_role_id VARCHAR(20) COMMENT "Role des participants de l'InHouse",
    date_start VARCHAR(10) COMMENT "Date de début de l'InHouse",
    register_channel VARCHAR(20) COMMENT "Channel pour les inscriptions",
    register_message VARCHAR(20) COMMENT "Message des inscriptions",
    match_channel VARCHAR(20) COMMENT "Channel d'annonce des matchs",
    vote_channel VARCHAR(20) COMMENT "Channel de vote du MVP - étape 1",
    mvp_channel VARCHAR(20) COMMENT "Channel de vote du MVP - étape 2",
    mvp VARCHAR(20) COMMENT "Identifiant discord du MVP de l'inhouse",
    PRIMARY KEY (id)
) ENGINE=INNODB COMMENT="Gestion et données générales d'une session InHouse";

CREATE TABLE IF NOT EXISTS inhouse_participant (
    discord_id VARCHAR(20) NOT NULL COMMENT "Identifiant du compte Discord",
    inhouse_id INT NOT NULL COMMENT "Identifiant de l'InHouse",
    is_toplaner DECIMAL(1,0) COMMENT "Souhaite participer en tant que toplaner",
    is_jungler DECIMAL(1,0) COMMENT "Souhaite participer en tant que jungler",
    is_midlaner DECIMAL(1,0) COMMENT "Souhaite participer en tant que midlaner",
    is_botlaner DECIMAL(1,0) COMMENT "Souhaite participer en tant que botlaner",
    is_support DECIMAL(1,0) COMMENT "Souhaite participer en tant que support",
    PRIMARY KEY (discord_id, inhouse_id)
) ENGINE=INNODB COMMENT="Roles voulus pour un participant de l'InHouse";

CREATE TABLE IF NOT EXISTS inhouse_match (
    inhouse_id INT NOT NULL COMMENT "Identifiant de l'InHouse",
    match_id INT NOT NULL COMMENT "Identifiant du match",
    match_tms TIMESTAMP COMMENT "Date et heure du match",
    is_streamed DECIMAL(1,0) COMMENT "Match streamé",
    is_finished DECIMAL(1,0) COMMENT "Match terminé",
    game_id DECIMAL(10,0) COMMENT "Identifiant de la partie",
    PRIMARY KEY (inhouse_id, match_id)
) ENGINE=INNODB COMMENT="Match d'InHouse";

CREATE TABLE IF NOT EXISTS inhouse_team (
    match_id VARCHAR(20) NOT NULL COMMENT "Identifiant du match",
    inhouse_id INT NOT NULL COMMENT "Identifiant de l'InHouse",
    toplaner VARCHAR(20) NOT NULL COMMENT "Identifiant du toplaner",
    jungler VARCHAR(20) NOT NULL COMMENT "Identifiant du jungler",
    midlaner VARCHAR(20) NOT NULL COMMENT "Identifiant du midlaner",
    botlaner VARCHAR(20) NOT NULL COMMENT "Identifiant du botlaner",
    support VARCHAR(20) NOT NULL COMMENT "Identifiant du support",
    team_name VARCHAR(50) NOT NULL COMMENT "Nom de l'équipe",
    discord_role_id VARCHAR(20) NOT NULL COMMENT "Identifiant du role de l'équipe",
    PRIMARY KEY (match_id, inhouse_id)
) ENGINE=INNODB COMMENT="Team d'InHouse";

CREATE TABLE IF NOT EXISTS inhouse_mvp_votes (
    discord_id VARCHAR(20) NOT NULL COMMENT "Identifiant discord du votant",
    inhouse_id INT NOT NULL COMMENT "Identifiant de l'InHouse",
    vote1 VARCHAR(20) NOT NULL COMMENT "Identifiant discord du premier joueur voté",
    vote2 VARCHAR(20) COMMENT "Identifiant discord du deuxième joueur voté",
    vote3 VARCHAR(20) COMMENT "Identifiant discord du troisième joueur voté",
    PRIMARY KEY (discord_id, inhouse_id)
) ENGINE=INNODB COMMENT="Team d'InHouse";