import { Migration } from '@mikro-orm/migrations';

export class Migration20240129205635 extends Migration {

  async up(): Promise<void> {
    this.addSql('create type "pokemon_rarity" as enum (\'common\', \'mythic\', \'legendary\');');
    this.addSql('alter table "pokemon" add column "rarity" "pokemon_rarity" not null default \'common\';');
  }

  async down(): Promise<void> {
    this.addSql('alter table "pokemon" drop column "rarity";');
  }

}
