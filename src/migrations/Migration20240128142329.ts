import { Migration } from '@mikro-orm/migrations';

export class Migration20240128142329 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "pokemon" ("id" serial primary key, "catalog_id" varchar(255) not null, "flee_rate" int not null, "max_cp" int not null, "max_hp" int not null, "max_weight" int not null, "min_weight" int not null, "max_height" int not null, "min_height" int not null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "pokemon" cascade;');
  }

}
