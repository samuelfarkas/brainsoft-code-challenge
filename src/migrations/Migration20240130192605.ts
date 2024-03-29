import { Migration } from '@mikro-orm/migrations';

export class Migration20240130192605 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_favorite_pokemons" ("user_id" int not null, "pokemon_id" int not null, constraint "user_favorite_pokemons_pkey" primary key ("user_id", "pokemon_id"));');

    this.addSql('alter table "user_favorite_pokemons" add constraint "user_favorite_pokemons_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_favorite_pokemons" add constraint "user_favorite_pokemons_pokemon_id_foreign" foreign key ("pokemon_id") references "pokemon" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "user_favorite_pokemons" cascade;');
  }

}
