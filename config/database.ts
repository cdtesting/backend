import fs from 'fs';
import path from 'path';

export default ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST'),
      port: env.int('DATABASE_PORT'),
      database: env('DATABASE_NAME'),
      user: env('DATABASE_USERNAME'),
      password: env('DATABASE_PASSWORD'),
      ssl: {
        ca: env('DATABASE_SSL_CA').replace(/\\n/g, '\n'),
        rejectUnauthorized: env.bool('DATABASR_SSL_SELF', false), 
    }
    },
    acquireConnectionTimeout: 1000000,
         pool: {
            min: 0,
            max: 4,
            acquireTimeoutMillis: 600000,
            createTimeoutMillis: 600000,
            destroyTimeoutMillis: 600000,
            idleTimeoutMillis: 60000,
            reapIntervalMillis: 2000,
            createRetryIntervalMillis: 4000,
         },
         debug: false,
  },
});