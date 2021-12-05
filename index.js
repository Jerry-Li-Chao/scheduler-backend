require("dotenv").config();

const express = require("express");
const pg = require("pg");
const cors = require("cors");

const Client = pg.Client;

const app = express();

app.use(express.json());
app.use(cors());

app.get("/api/posts", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client.query("SELECT * FROM tasks").then((queryResponse) => {
      response.json(queryResponse.rows);
    });
  });
});

app.get("/api/posts/:id", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query("SELECT * FROM tasks WHERE id = $1", [request.params.id])
      .then((queryResponse) => {
        if (queryResponse.rows.length >= 1) {
          response.json(queryResponse.rows[0]);
        } else {
          response.status(404).send();
        }
      });
  });
});

// add tasks
app.post("/api/posts", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query(
        "INSERT INTO tasks (taskname, description, deadline, favorited, priority) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [
          request.body.taskname,
          request.body.description,
          request.body.deadline,
          request.body.favorited,
          request.body.priority,
        ]
      )
      .then((queryResponse) => {
        response.json(queryResponse);
      });
  });
});

// delete tasks
app.delete("/api/posts/:id", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query("DELETE FROM tasks WHERE id = $1", [request.params.id])
      .then((queryResponse) => {
        if (queryResponse.rowCount === 1) {
          response.status(204).send();
        } else {
          response.status(404).send();
        }
      });
  });
});

// update tasks
app.put("/api/posts/:id", (request, response) => {
  const client = createClient();

  client.connect().then(() => {
    client
      .query(
        "UPDATE tasks SET taskname = $1, description = $2, deadline = $3, favorited = $4, priority = $5 WHERE id = $6 RETURNING *",
        [
          request.body.taskname,
          request.body.description,
          request.body.deadline,
          request.body.favorited,
          request.body.priority,
          request.params.id,
        ]
      )
      .then((queryResponse) => {
        if (queryResponse.rowCount === 1) {
          response.json(queryResponse.rows[0]);
        } else {
          response.status(404).send();
        }
      });
  });
});

function createClient() {
  const client = new Client({
    connectionString: process.env.CONNECTION_STRING,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  return client;
}

app.listen(3000);
