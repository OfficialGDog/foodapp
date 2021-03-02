const database = require("./database").getDb();
const express = require("express");
const router = express.Router();

router.get("/location/list", async (req, res) => {
  try {
    const sightings = await database.collection("sightings").find("").toArray();
    res.json({sightings});
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json({ error: "Unable to get sighting" });
  }
});

router.post("/location/new", async (req, res) => {
  try {
    const {
      location: { lat, lng },
    } = req.body;

    const result = await database.collection("sightings").insertOne({
      location: {
        type: "Point",
        coordinates: [lng, lat],
      },
      created: new Date(),
    });

    res.status(201);

    res.json(result.ops);
  } catch (err) {
    console.log(err);
    res.status(500);
    res.json({ error: "Unable to insert sighting" });
  }
});

module.exports = router;
