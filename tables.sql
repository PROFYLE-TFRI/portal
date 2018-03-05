/*
 * tables.sql
 * Copyright (C) 2018 rgregoir <rgregoir@laurier>
 *
 * Distributed under terms of the MIT license.
 */

CREATE TABLE users (
    id       integer primary key autoincrement,
    name     text    not null,
    email    text    not null unique,
    phone    text    not null,
    password text    not null,
    isAdmin  integer not null,
    permissions text not null
);

INSERT INTO users
    (name, email, phone, password, isAdmin, permissions)
    VALUES
    (
        'Romain',
        'romgrk.cc@gmail.com',
        '5147781580',
        '$2a$08$F//DVY3.rh/RxlPFx6uh8Ow.pGvscK.mSbSQ2wsk3Yz9MWWx6t6pa', -- secret
        1,
        '[]'
    );


-- vim:et
