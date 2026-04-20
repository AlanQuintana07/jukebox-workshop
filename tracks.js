import express from "express";
import db from "#db/client";

const router = express.Router();

// GET /tracks
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM tracks;");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// GET /tracks/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    // check if id is a number
    if (isNaN(id)) {
      return res.status(400).send({ error: "Invalid id" });
    }

    const result = await db.query("SELECT * FROM tracks WHERE id = $1;", [id]);

    const track = result.rows[0];

    // check if track exists
    if (!track) {
      return res.status(404).send({ error: "Track not found" });
    }

    res.send(track);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

export default router;
