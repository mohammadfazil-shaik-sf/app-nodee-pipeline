const cool = require('cool-ascii-faces')
const express = require('express')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 5000
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const app = express();

const enforce = require('express-sslify');

app.use(enforce.HTTPS({ trustProtoHeader: true }));

app.get('/times', (req, res) => res.send(showTimes()))
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/cool', (req, res) => res.send(cool()))
  .get('/db', async (req, res) => {
    try {
      const client = await pool.connect()
      const result = await client.query('SELECT * FROM test_table');
      const results = { 'results': (result) ? result.rows : null};
      res.render('pages/db', results );
      client.release();
    } catch (err) {
      console.error(err);
      res.send("Error " + err);
    }
  });

// var url   = require('url');
// var Redis = require('ioredis');
// redis_uri = url.parse(process.env.REDIS_URL);
// var redis = new Redis({
//   port: Number(redis_uri.port) + 1,
//   host: redis_uri.hostname,
//   password: redis_uri.auth.split(':')[1],
//   db: 0,
//   tls: {
//     rejectUnauthorized: false,
//     requestCert: true,
//     agent: false
//   }
// });

  http.createServer(app).listen(PORT, () => console.log(`Listening on ${ PORT }`));
showTimes = () => {
   let result = ''
   const times = process.env.TIMES || 5
   for (i = 0; i < times; i++) {
     result += i + ' '
   }
   return result;
}
