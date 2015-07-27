package store

const createTaskSQL = `
id serial NOT NULL,
author_id int NOT NULL,
project_id int NOT NULL,
parent_id int NOT NULL,
title text NOT NULL,
description text NOT NULL,
status text NOT NULL,
tags text[],
start_date timestamp NOT NULL,
end_date timestamp NOT NULL,
created_at timestamp NOT NULL`
