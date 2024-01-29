import { Migration } from '@mikro-orm/migrations';

export class Migration20240129182303 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "evolution_item" ("id" serial primary key, "name" varchar(255) not null);');

    this.addSql('create table "pokemon_evolution_requirement" ("id" serial primary key, "evolution_item_id" int not null, "amount" int not null);');

    this.addSql('create table "pokemon_previous_evolutions" ("pokemon_1_id" int not null, "pokemon_2_id" int not null, constraint "pokemon_previous_evolutions_pkey" primary key ("pokemon_1_id", "pokemon_2_id"));');

    this.addSql('create table "pokemon_evolutions" ("pokemon_1_id" int not null, "pokemon_2_id" int not null, constraint "pokemon_evolutions_pkey" primary key ("pokemon_1_id", "pokemon_2_id"));');

    this.addSql('alter table "pokemon_evolution_requirement" add constraint "pokemon_evolution_requirement_evolution_item_id_foreign" foreign key ("evolution_item_id") references "evolution_item" ("id") on update cascade;');

    this.addSql('alter table "pokemon_previous_evolutions" add constraint "pokemon_previous_evolutions_pokemon_1_id_foreign" foreign key ("pokemon_1_id") references "pokemon" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "pokemon_previous_evolutions" add constraint "pokemon_previous_evolutions_pokemon_2_id_foreign" foreign key ("pokemon_2_id") references "pokemon" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "pokemon_evolutions" add constraint "pokemon_evolutions_pokemon_1_id_foreign" foreign key ("pokemon_1_id") references "pokemon" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "pokemon_evolutions" add constraint "pokemon_evolutions_pokemon_2_id_foreign" foreign key ("pokemon_2_id") references "pokemon" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "pokemon" add column "evolution_requirements_id" int null;');
    this.addSql('alter table "pokemon" add constraint "pokemon_evolution_requirements_id_foreign" foreign key ("evolution_requirements_id") references "pokemon_evolution_requirement" ("id") on update cascade on delete set null;');
    this.addSql('alter table "pokemon" add constraint "pokemon_evolution_requirements_id_unique" unique ("evolution_requirements_id");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "pokemon_evolution_requirement" drop constraint "pokemon_evolution_requirement_evolution_item_id_foreign";');

    this.addSql('alter table "pokemon" drop constraint "pokemon_evolution_requirements_id_foreign";');

    this.addSql('drop table if exists "evolution_item" cascade;');

    this.addSql('drop table if exists "pokemon_evolution_requirement" cascade;');

    this.addSql('drop table if exists "pokemon_previous_evolutions" cascade;');

    this.addSql('drop table if exists "pokemon_evolutions" cascade;');

    this.addSql('alter table "pokemon" drop constraint "pokemon_evolution_requirements_id_unique";');
    this.addSql('alter table "pokemon" drop column "evolution_requirements_id";');
  }

}
