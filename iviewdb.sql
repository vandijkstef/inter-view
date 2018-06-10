-- MySQL Script generated by MySQL Workbench
-- Sun Jun 10 17:10:46 2018
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema iviewdb
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema iviewdb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `iviewdb` DEFAULT CHARACTER SET utf8 ;
USE `iviewdb` ;

-- -----------------------------------------------------
-- Table `iviewdb`.`scripts`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `iviewdb`.`scripts` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NULL,
  `description` TEXT NULL,
  `lastSaved` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `iviewdb`.`questions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `iviewdb`.`questions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `script_id` INT NULL,
  `question` TEXT NULL,
  `lastSaved` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `id_idx` (`script_id` ASC),
  CONSTRAINT `SCRIPT`
    FOREIGN KEY (`script_id`)
    REFERENCES `iviewdb`.`scripts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `iviewdb`.`respondent`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `iviewdb`.`respondent` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `psuedo` VARCHAR(255) NULL,
  `lastSaved` DATETIME NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `iviewdb`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `iviewdb`.`users` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NULL,
  `displayname` VARCHAR(255) NULL,
  `password` VARCHAR(255) NULL,
  `email` VARCHAR(255) NULL,
  `lastSaved` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `iviewdb`.`response`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `iviewdb`.`response` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `question_id` INT NULL,
  `respondent_id` INT NULL,
  `interviewer_id` INT NULL,
  `audiofile` VARCHAR(255) NULL,
  `rating` INT NULL,
  `tags` TEXT NULL,
  `lastSaved` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `question_id_idx` (`question_id` ASC),
  INDEX `respondent_id_idx` (`respondent_id` ASC),
  INDEX `interviewer_id_idx` (`interviewer_id` ASC),
  CONSTRAINT `question_id`
    FOREIGN KEY (`question_id`)
    REFERENCES `iviewdb`.`questions` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `respondent_id`
    FOREIGN KEY (`respondent_id`)
    REFERENCES `iviewdb`.`respondent` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `interviewer_id`
    FOREIGN KEY (`interviewer_id`)
    REFERENCES `iviewdb`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `iviewdb`.`scripts_meta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `iviewdb`.`scripts_meta` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `script_id` INT NULL,
  `key` VARCHAR(255) NULL,
  `type` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  INDEX `scriptid_idx` (`script_id` ASC),
  CONSTRAINT `scriptid`
    FOREIGN KEY (`script_id`)
    REFERENCES `iviewdb`.`scripts` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `iviewdb`.`respondent_meta`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `iviewdb`.`respondent_meta` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `respondent_id` INT NULL,
  `meta_id` INT NULL,
  `value` TEXT NULL,
  `lastSaved` DATETIME NULL,
  PRIMARY KEY (`id`),
  INDEX `respondent_id_idx` (`respondent_id` ASC),
  INDEX `meta_id_idx` (`meta_id` ASC),
  CONSTRAINT `respondentid`
    FOREIGN KEY (`respondent_id`)
    REFERENCES `iviewdb`.`respondent` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `metaid`
    FOREIGN KEY (`meta_id`)
    REFERENCES `iviewdb`.`scripts_meta` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
