/*
 * tables.sql
 * Copyright (C) 2018 rgregoir <rgregoir@laurier>
 *
 * Distributed under terms of the MIT license.
 */

CREATE TABLE users (
    id       integer primary key autoincrement,
    name     text    not null,
    email    text    not null,
    phone    text    not null,
    password text    not null,
    isAdmin  integer not null,
    permissions text not null
);


-- vim:et
