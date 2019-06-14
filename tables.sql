create table towns(
	id serial not null primary key,
	town_name text not null,
    loc_key text not null
);

create table regNums (
	id serial not null primary key,
    registration text not null
);