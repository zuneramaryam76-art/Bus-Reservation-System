const express = require("express");
const mysql = require("mysql8");

const app = express();

app.use(express.json());
app.use(express.static("public"));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Root",
  database: "bus"
});

db.connect((err) => {
  if (err) throw err;
  console.log("Connected to MySQL");
});

// Get all buses
app.get("/buses", (req, res) => {
  db.query("SELECT * FROM bus", (err, result) => {
    if (err) {
      res.status(500).send(err.message);
      return;
    }

    res.json(result);
  });
});

// Get one bus by bus number
app.get("/buses/:busNo", (req, res) => {
  db.query(
    "SELECT * FROM bus WHERE bus_no = ?",
    [req.params.busNo],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }

      res.json(result);
    }
  );
});

// Add a bus
app.post("/buses", (req, res) => {
  const { busNo, source, destination, timeOfDeparture, totalNoOfSeats } = req.body;

  db.query(
    `INSERT INTO bus
      (bus_no, source, destination, time_of_departure, total_no_of_seats)
     VALUES (?, ?, ?, ?, ?)`,
    [busNo, source, destination, timeOfDeparture, totalNoOfSeats],
    (err) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }

      res.send("Bus inserted");
    }
  );
});

// Update a bus
app.put("/buses/:busNo", (req, res) => {
  const { source, destination, timeOfDeparture, totalNoOfSeats } = req.body;

  db.query(
    `UPDATE bus
     SET source = ?,
         destination = ?,
         time_of_departure = ?,
         total_no_of_seats = ?
     WHERE bus_no = ?`,
    [
      source,
      destination,
      timeOfDeparture,
      totalNoOfSeats,
      req.params.busNo
    ],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).send("Bus not found");
        return;
      }

      res.send("Bus updated");
    }
  );
});

// Delete a bus
app.delete("/buses/:busNo", (req, res) => {
  db.query(
    "DELETE FROM bus WHERE bus_no = ?",
    [req.params.busNo],
    (err, result) => {
      if (err) {
        res.status(500).send(err.message);
        return;
      }

      if (result.affectedRows === 0) {
        res.status(404).send("Bus not found");
        return;
      }

      res.send("Bus deleted");
    }
  );
});

app.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});