import { Migration } from '@mikro-orm/migrations';

export class Migration20240129113030 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "pokemon" alter column "flee_rate" type real using ("flee_rate"::real);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "pokemon" alter column "flee_rate" type int using ("flee_rate"::int);');
  }

}
