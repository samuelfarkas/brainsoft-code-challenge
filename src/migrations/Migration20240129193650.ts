import { Migration } from '@mikro-orm/migrations';

export class Migration20240129193650 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "classification" ("id" serial primary key, "name" varchar(255) not null);');
    this.addSql('alter table "classification" add constraint "classification_name_unique" unique ("name");');

    this.addSql('alter table "pokemon" add column "classification_id" int not null;');
    this.addSql('alter table "pokemon" add constraint "pokemon_classification_id_foreign" foreign key ("classification_id") references "classification" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "pokemon" drop constraint "pokemon_classification_id_foreign";');

    this.addSql('drop table if exists "classification" cascade;');

    this.addSql('alter table "pokemon" drop column "classification_id";');
  }

}
