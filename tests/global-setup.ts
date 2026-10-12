import { resetTestDb } from '../scripts/test-db';

/** Bütün testlerden önce izole test veritabanı sıfırdan kurulur. */
export default async function setup() {
  await resetTestDb();
}
