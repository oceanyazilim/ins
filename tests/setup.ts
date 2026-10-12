process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgres://ocean:ocean@localhost:54329/ocean_test';
process.env.SITE_URL = 'https://oceaninsaat.com.tr';
process.env.APP_SECRET = 'test-secret-test-secret-test-secret-0000';
process.env.STORAGE_DIR = './.data/test-storage';
