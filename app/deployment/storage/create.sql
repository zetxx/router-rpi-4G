-- with root user
create database rpi4g;
create user rpi4g with encrypted password '123';
grant all privileges on database rpi4g to rpi4g;

-- after connect with the new user
BEGIN;
    CREATE SCHEMA "rpi4g";
    CREATE TYPE "stat.type" AS ENUM ('modem', 'provider', 'is.online', 'vpn', 'ping');

    CREATE TABLE "rpi4g"."stats" (
        "id" serial NOT NULL PRIMARY KEY,
        "type" "stat.type" NOT NULL,
        "data" JSON NOT NULL,
        "inserted" bigint NOT NULL DEFAULT (date_part('epoch'::text, now()) * (1000)::double precision)
    );

    CREATE INDEX "index_type" ON "rpi4g"."stats" USING btree( "type" Asc NULLS Last );

    CREATE OR REPLACE FUNCTION rpi4g.rpi4g.getStats(t "stat.type", last integer) RETURNS TABLE(id int, data JSON) AS $$
        SELECT id, data FROM rpi4g.rpi4g.stats WHERE (type=$1) order by id asc limit $2 offset 0;
    $$ LANGUAGE SQL;
COMMIT;
