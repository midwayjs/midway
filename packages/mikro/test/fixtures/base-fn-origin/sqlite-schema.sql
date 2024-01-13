pragma
foreign_keys = off;

CREATE TABLE
  `author`
(
  `id`                integer not null primary key autoincrement,
  `created_at`        datetime(3) DEFAULT NULL,
  `updated_at`        datetime(3) DEFAULT NULL,
  `terms_accepted`    tinyint(1) DEFAULT NULL,
  `name`              varchar(255) DEFAULT NULL,
  `email`             varchar(255) DEFAULT NULL,
  `age`               integer DEFAULT NULL,
  `born`              datetime     DEFAULT NULL,
  `favourite_book_id` int(11) DEFAULT NULL
);
CREATE TABLE
  `book_to_book_tag`
(
  `id`          integer not null primary key autoincrement,
  `book_id`     integer DEFAULT NULL,
  `book_tag_id` integer DEFAULT NULL
);
CREATE TABLE
  `book_tag`
(
  `id`   integer not null primary key autoincrement,
  `name` varchar(50) DEFAULT NULL
);
CREATE TABLE
  `book`
(
  `id`           integer not null primary key autoincrement,
  `created_at`   datetime(3) DEFAULT NULL,
  `updated_at`   datetime(3) DEFAULT NULL,
  `title`        varchar(255) DEFAULT NULL,
  `foo`          varchar(255) DEFAULT NULL,
  `author_id`    integer      DEFAULT NULL,
  `publisher_id` integer      DEFAULT NULL
);
CREATE TABLE
  `publisher`
(
  `id`   integer not null primary key autoincrement,
  `name` varchar(255) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL
);

pragma
foreign_keys = on;
