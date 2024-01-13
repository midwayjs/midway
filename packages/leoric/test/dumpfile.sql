DROP TABLE IF EXISTS `articles`;
CREATE TABLE `articles` (
  `id` bigint(20) AUTO_INCREMENT PRIMARY KEY,
  `gmt_create` timestamp(3) NULL,
  `gmt_modified` timestamp(3) NULL,
  `gmt_deleted` timestamp(3) NULL,
  `title` varchar(1000) NOT NULL,
  `content` text,
  `extra` text,
  `thumb` varchar(1000) DEFAULT NULL,
  `author_id` bigint(20) DEFAULT NULL,
  `is_private` tinyint(1) DEFAULT 0 NOT NULL,
  `summary` text,
  `word_count` int DEFAULT 0,
  `settings` text
);

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` bigint(20) AUTO_INCREMENT PRIMARY KEY,
  `gmt_create` timestamp(3) NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `name` varchar(255) NOT NULL,
  `level` decimal(10, 3) NOT NULL DEFAULT 1,
  `birthday` date,
  `sex` char
);
