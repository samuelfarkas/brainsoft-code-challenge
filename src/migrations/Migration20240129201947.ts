import { Migration } from '@mikro-orm/migrations';

export class Migration20240129201947 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "attack" ("id" serial primary key, "name" varchar(255) not null, "type_id" int not null);');

    this.addSql('create type "attack_type" as enum (\'fast\', \'special\');');
    this.addSql('create table "pokemon_attack" ("pokemon_id" int not null, "attack_id" int not null, "attack_type" "attack_type" not null, "damage" int not null, constraint "pokemon_attack_pkey" primary key ("pokemon_id", "attack_id"));');

    this.addSql('alter table "attack" add constraint "attack_type_id_foreign" foreign key ("type_id") references "type" ("id") on update cascade;');

    this.addSql('alter table "pokemon_attack" add constraint "pokemon_attack_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on update cascade;');
    this.addSql('alter table "pokemon_attack" add constraint "pokemon_attack_attack_id_foreign" foreign key ("attack_id") references "attack" ("id") on update cascade;');

    this.addSql('alter table "pokemon_type_attribute" drop constraint "pokemon_type_attribute_pokemon_id_foreign";');
    this.addSql('alter table "pokemon_type_attribute" drop constraint "pokemon_type_attribute_type_id_foreign";');

    this.addSql('alter table "pokemon_type_attribute" alter column "pokemon_id" type int using ("pokemon_id"::int);');
    this.addSql('alter table "pokemon_type_attribute" alter column "pokemon_id" set not null;');
    this.addSql('alter table "pokemon_type_attribute" alter column "type_id" type int using ("type_id"::int);');
    this.addSql('alter table "pokemon_type_attribute" alter column "type_id" set not null;');
    this.addSql('alter table "pokemon_type_attribute" add constraint "pokemon_type_attribute_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on update cascade;');
    this.addSql('alter table "pokemon_type_attribute" add constraint "pokemon_type_attribute_type_id_foreign" foreign key ("type_id") references "type" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "pokemon_attack" drop constraint "pokemon_attack_attack_id_foreign";');

    this.addSql('drop table if exists "attack" cascade;');

    this.addSql('drop table if exists "pokemon_attack" cascade;');

    this.addSql('alter table "pokemon_type_attribute" drop constraint "pokemon_type_attribute_pokemon_id_foreign";');
    this.addSql('alter table "pokemon_type_attribute" drop constraint "pokemon_type_attribute_type_id_foreign";');

    this.addSql('alter table "pokemon_type_attribute" alter column "pokemon_id" type int using ("pokemon_id"::int);');
    this.addSql('alter table "pokemon_type_attribute" alter column "pokemon_id" drop not null;');
    this.addSql('alter table "pokemon_type_attribute" alter column "type_id" type int using ("type_id"::int);');
    this.addSql('alter table "pokemon_type_attribute" alter column "type_id" drop not null;');
    this.addSql('alter table "pokemon_type_attribute" add constraint "pokemon_type_attribute_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on delete cascade;');
    this.addSql('alter table "pokemon_type_attribute" add constraint "pokemon_type_attribute_type_id_foreign" foreign key ("type_id") references "type" ("id") on delete cascade;');
  }

}
