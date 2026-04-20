import db from "#db/client";

import { createPlaylist } from "#db/queries/playlists";
import { createPlaylistTrack } from "#db/queries/playlists_tracks";
import { createTrack } from "#db/queries/tracks";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  console.log("Seeding database...");

  // OPTIONAL: clear existing data (prevents duplicates)
  await db.query("DELETE FROM playlists_tracks;");
  await db.query("DELETE FROM playlists;");
  await db.query("DELETE FROM tracks;");

  // =========================
  // CREATE TRACKS (20)
  // =========================
  const trackPromises = [];

  for (let i = 1; i <= 20; i++) {
    trackPromises.push(
      createTrack(`Track ${i}`, `Artist ${i}`, 150000 + i * 1000),
    );
  }

  const tracks = await Promise.all(trackPromises);

  // =========================
  // CREATE PLAYLISTS (10)
  // =========================
  const playlistPromises = [];

  for (let i = 1; i <= 10; i++) {
    playlistPromises.push(
      createPlaylist(`Playlist ${i}`, `Description for playlist ${i}`),
    );
  }

  const playlists = await Promise.all(playlistPromises);

  // =========================
  // CONNECT TRACKS TO PLAYLISTS
  // =========================
  const playlistTrackPromises = [];

  for (let i = 0; i < 15; i++) {
    const playlistId = playlists[1 + Math.floor(i / 2)]?.id || 1;
    const trackId = tracks[i]?.id;

    if (playlistId && trackId) {
      playlistTrackPromises.push(createPlaylistTrack(playlistId, trackId));
    }
  }

  await Promise.all(playlistTrackPromises);

  console.log("✅ Seed complete");
}
