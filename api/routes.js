const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

/* INIT */
const connection = mysql.createPool({
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
  if (!connection)
    console.log('no hay conección con la DB');

  connection.getConnection((err, connection) => {
    connection.query('SELECT * FROM users', (error, results, fields) => {
      if (error) throw error;
      res.send(results)
    });
  });
});

/* POST */
app.post('/setUser', (req, res) => {
  const query = `INSERT INTO users (rut,name,mail,hash) VALUES ('${req.body.rut}','${req.body.name}','${req.body.mail}','${req.body.hash}')`;
  const log = { status: '', method: 'POST', msg: '', rut: req.body.rut, hash: req.body.hash };

  if (!connection)
    console.log('no hay conección con la DB');

  connection.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'Nuevo Usuario insertado';
      console.log(log); res.send(log);
    });
  });
});

app.post('/updateUser', (req, res) => {
  const query = `INSERT INTO users (rut,name,mail,hash) VALUES ('${req.body.rut}','${req.body.name}','${req.body.mail}','${req.body.hash}')`;
  const log = { status: '', method: 'POST', msg: '', rut: req.body.rut, hash: req.body.hash };

  if (!connection)
    console.log('no hay conección con la DB');

  connection.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'Nuevo Usuario insertado';
      console.log(log); res.send(log);
    });
  });
});

app.post('/setArea', (req, res) => {
  const query = `INSERT INTO areas (name,hash) VALUES ('${req.body.name}','${req.body.hash}')`;
  const log = { status: '', method: 'POST', msg: '', area: req.body.name, hash: req.body.hash };

  if (!connection)
    console.log('no hay conección con la DB');

  connection.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'Nuevo Usuario insertado';
      console.log(log); res.send(log);
    });
  });
});

/* DELETE */
app.delete('/deleteUser', (req, res) => {
  const query = `DELETE FROM users WHERE rut = '${req.body.rut}'`;
  const log = { status: '', method: 'DELETE', msg: '', rut: req.body.rut };

  if (!connection)
    console.log('no hay conección con la DB');

  connection.getConnection((err, connection) => {
    console.log(query);
    connection.query(query, (error, results, fields) => {
      if (error) {
        log.status = 'error'; log.msg = error.code;
        console.log(log); res.send(log);
        return 0;
      }
      log.status = 'ok'; log.msg = 'Usuario eliminado';
      console.log(log); res.send(log);
    });
  });
});

// Starting our server.
app.listen(3000, () => {
  console.log('Listen port 3000');
});