const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

/* INIT */
const db = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'users'
});

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

/* GET */
app.get('/users', (req, res) => {
  const query = `SELECT * FROM users WHERE deleted=0`;
  const log = { status: '', method: 'GET', msg: ''};

  if (!db)
    console.log('DB connection error');

  db.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log);res.status(500).send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'Users';
      console.log(log);res.status(200).send(results);
      return 0;
    });
  });
});

app.get('/getUser', (req, res) => {
  const query = `SELECT name, mail, hash FROM users WHERE rut = '${req.query.rut}' AND deleted=0`;
  const log = { status: '', method: 'GET', msg: '', rut: req.query.rut};

  if (!db)
    console.log('DB connection error');

  db.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log);res.status(500).send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'User found';
      if (results.length < 1) log.msg = 'User not found';
      console.log(log);res.status(200).send(results);
      return 0;
    });
  });
});

/* POST */
app.post('/setUser', (req, res) => {
  const query = `INSERT INTO users (rut,name,mail,hash) VALUES ('${req.body.rut}','${req.body.name}','${req.body.mail}',${req.body.hash})`;
  const log = { status: '', method: 'POST', msg: '', rut: req.body.rut, hash: req.body.hash };

  if (!db)
    console.log('DB connection error');

  db.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.status(500).send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'User successfully inserted';
      console.log(log); res.status(200).send(log);
      return 0;
    });
  });
});

app.post('/syncUser', (req, res) => {
  if (!db)
    console.log('DB connection error');

  let rows = 0;
  const query = `SELECT * FROM users WHERE rut = '${req.body.rut}'`;
  db.getConnection((err, connection) => {
    connection.query(query, (error, results, fields) => {
      if (error) { res.status(500).send(error); return 0; }
      rows = results.length;

      let query2 = '';
      if (rows < 1) {
        query2 = `INSERT INTO users (rut,name,mail,hash,deleted) VALUES ('${req.body.rut}','${req.body.name}','${req.body.mail}',${req.body.hash},${req.body.deleted})`;
        log = { status: '', method: 'POST', msg: 'User successfully inserted', rut: req.body.rut, hash: req.body.hash };
      } else {
        query2 = `UPDATE users SET name='${req.body.name}', mail='${req.body.mail}', hash=${req.body.hash}, deleted=${req.body.deleted} where rut='${req.body.rut}'`;
        log = { status: '', method: 'POST', msg: 'User successfully updated', rut: req.body.rut, hash: req.body.hash };
      }

      db.getConnection((err, connection) => {
        console.log(query2);
        connection.query(query2, (error, results, fields) => {
          if (error) {
            log.status = 'error'; log.msg = error.code;
            console.log(log); res.status(500).send(log);
            return 0;
          }
          log.status = 'ok';
          console.log(log); res.status(200).send(log);
          return 0;
        });
      });
    });
  });
});

app.post('/updateUser', (req, res) => {
  const query = `UPDATE users SET name='${req.body.name}', mail='${req.body.mail}', hash=${req.body.hash} where rut='${req.body.rut}'`;
  const log = { status: '', method: 'POST', msg: '', rut: req.body.rut, hash: req.body.hash };

  if (!db)
    console.log('DB connection error');

  db.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.status(500).send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'User successfully updated';
      console.log(log); res.status(200).send(log);
      return 0;
    });
  });
});

app.post('/setArea', (req, res) => {
  const query = `INSERT INTO areas (name,hash) VALUES ('${req.body.name}','${req.body.hash}')`;
  const log = { status: '', method: 'POST', msg: '', area: req.body.name, hash: req.body.hash };

  if (!db)
    console.log('DB connection error');

  db.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.status(500).send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'User successfully inserted';
      console.log(log); res.status(200).send(log);
      return 0;
    });
  });
});

app.post('/syncArea', (req, res) => {
  const query = `INSERT INTO areas (name,hash) VALUES ('${req.body.name}','${req.body.hash}')`;
  const log = { status: '', method: 'POST', msg: '', area: req.body.name, hash: req.body.hash };

  if (!db)
    console.log('DB connection error');

  db.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.status(500).send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'User successfully inserted';
      console.log(log); res.status(200).send(log);
      return 0;
    });
  });
});

/* DELETE */
app.delete('/deleteUser', (req, res) => {
  const query = `UPDATE users SET deleted=1 where rut='${req.body.rut}'`;
  const log = { status: '', method: 'DELETE', msg: '', rut: req.body.rut };

  if (!db)
    console.log('DB connection error');

  db.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.status(500).send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'User successfully deleted';
      console.log(log); res.status(200).send(log);
      return 0;
    });
  });
});

// Starting our server.
app.listen(3000, () => {
  console.log('Listen port 3000');
});