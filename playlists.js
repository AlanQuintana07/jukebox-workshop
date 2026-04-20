import express from "express";
import db from "#db/client";

const router = express.Router();

// GET /playlists
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM playlists;");
    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// POST /playlists
router.post("/", async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).send({ error: "Body required" });
    }

    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).send({ error: "Name and description required" });
    }

    const result = await db.query(
      "INSERT INTO playlists (name, description) VALUES ($1, $2) RETURNING *;",
      [name, description],
    );

    res.status(201).send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// GET /playlists/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send({ error: "Invalid id" });
    }

    const result = await db.query("SELECT * FROM playlists WHERE id = $1;", [
      id,
    ]);

    const playlist = result.rows[0];

    if (!playlist) {
      return res.status(404).send({ error: "Playlist not found" });
    }

    res.send(playlist);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// GET /playlists/:id/tracks
router.get("/:id/tracks", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return res.status(400).send({ error: "Invalid id" });
    }

    // check playlist exists
    const playlistCheck = await db.query(
      "SELECT * FROM playlists WHERE id = $1;",
      [id],
    );

    if (!playlistCheck.rows[0]) {
      return res.status(404).send({ error: "Playlist not found" });
    }

    const result = await db.query(
      `SELECT tracks.*
       FROM tracks
       JOIN playlists_tracks
       ON tracks.id = playlists_tracks.track_id
       WHERE playlists_tracks.playlist_id = $1;`,
      [id],
    );

    res.send(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

// POST /playlists/:id/tracks
router.post("/:id/tracks", async (req, res) => {
  try {
    const playlistId = Number(req.params.id);

    if (isNaN(playlistId)) {
      return res.status(400).send({ error: "Invalid playlist id" });
    }

    if (!req.body) {
      return res.status(400).send({ error: "Body required" });
    }

    const { trackId } = req.body;

    if (!trackId || isNaN(Number(trackId))) {
      return res.status(400).send({ error: "Invalid trackId" });
    }

    // check playlist exists
    const playlistCheck = await db.query(
      "SELECT * FROM playlists WHERE id = $1;",
      [playlistId],
    );

    if (!playlistCheck.rows[0]) {
      return res.status(404).send({ error: "Playlist not found" });
    }

    // check track exists
    const trackCheck = await db.query("SELECT * FROM tracks WHERE id = $1;", [
      trackId,
    ]);

    if (!trackCheck.rows[0]) {
      return res.status(400).send({ error: "Track does not exist" });
    }

    // prevent duplicates
    const exists = await db.query(
      `SELECT * FROM playlists_tracks
       WHERE playlist_id = $1 AND track_id = $2;`,
      [playlistId, trackId],
    );

    if (exists.rows.length > 0) {
      return res.status(400).send({ error: "Track already in playlist" });
    }

    const result = await db.query(
      `INSERT INTO playlists_tracks (playlist_id, track_id)
       VALUES ($1, $2)
       RETURNING *;`,
      [playlistId, trackId],
    );

    res.status(201).send(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

export default router;
