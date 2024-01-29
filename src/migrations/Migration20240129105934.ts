import { Migration } from '@mikro-orm/migrations';

export class Migration20240129105934 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "type" ("id" serial primary key, "name" varchar(255) not null);');
    this.addSql('create index "type_name_index" on "type" ("name");');
    this.addSql('alter table "type" add constraint "type_name_unique" unique ("name");');

    this.addSql('create type "attribute_type_enum" as enum (\'weakness\', \'resistance\');');
    this.addSql('create table "pokemon_type_attribute" ("pokemon_id" int null, "type_id" int null, "attribute_type" "attribute_type_enum" not null, constraint "pokemon_type_attribute_pkey" primary key ("pokemon_id", "type_id"));');

    this.addSql('create table "pokemon_types" ("pokemon_id" int not null, "type_id" int not null, constraint "pokemon_types_pkey" primary key ("pokemon_id", "type_id"));');

    this.addSql('alter table "pokemon_type_attribute" add constraint "pokemon_type_attribute_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on delete cascade;');
    this.addSql('alter table "pokemon_type_attribute" add constraint "pokemon_type_attribute_type_id_foreign" foreign key ("type_id") references "type" ("id") on delete cascade;');

    this.addSql('alter table "pokemon_types" add constraint "pokemon_types_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "pokemon_types" add constraint "pokemon_types_type_id_foreign" foreign key ("type_id") references "type" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "pokemon" add column "name" varchar(255) not null;');
    this.addSql('create index "pokemon_name_index" on "pokemon" ("name");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "pokemon_type_attribute" drop constraint "pokemon_type_attribute_type_id_foreign";');

    this.addSql('alter table "pokemon_types" drop constraint "pokemon_types_type_id_foreign";');

    this.addSql('drop table if exists "type" cascade;');

    this.addSql('drop table if exists "pokemon_type_attribute" cascade;');

    this.addSql('drop table if exists "pokemon_types" cascade;');

    this.addSql('drop index "pokemon_name_index";');
    this.addSql('alter table "pokemon" drop column "name";');
  }

}
