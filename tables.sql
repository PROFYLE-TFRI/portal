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


CREATE TABLE peers (
    id       text    primary key,
    url      text    not null unique,
    apiKey   text    not null,
    isActive integer not null
);


INSERT INTO peers
    (id, url, apiKey, isActive)
    VALUES
    (
        'local',
        'http://localhost:3002',
        'H6TY5YZ5Y5H3CHF',
        1
    );

-- vim:et
