import { Migration } from '@mikro-orm/migrations';

export class Migration20240128170044 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "pokemon" ("id" serial primary key, "catalog_id" varchar(255) not null, "flee_rate" int not null, "max_cp" int not null, "max_hp" int not null, "weight_kg" jsonb null, "height_meters" jsonb null);');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "pokemon" cascade;');
  }

}
