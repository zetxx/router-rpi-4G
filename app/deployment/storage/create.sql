-- with root user
create database rpi4g;
create user rpi4g with encrypted password '123';
grant all privileges on database rpi4g to rpi4g;

-- after connect with the new user
BEGIN;
    CREATE SCHEMA "rpi4g";
    CREATE TYPE "stat.type" AS ENUM ('modem', 'provider', 'is.online', 'vpn');

    CREATE TABLE "rpi4g"."stats" (
        "id" serial NOT NULL PRIMARY KEY,
        "type" "stat.type" NOT NULL,
        "data" JSON NOT NULL
    );

    CREATE INDEX "index_type" ON "rpi4g"."stats" USING btree( "type" Asc NULLS Last );
COMMIT;
