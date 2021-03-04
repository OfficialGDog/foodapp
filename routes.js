const database = require("./database").getDb();
const express = require("express");
const router = express.Router();
var latregex = new RegExp(/^(-?[1-8]?\d(?:\.\d{1,18})?|90(?:\.0{1,18})?)$/);
var lngregex = new RegExp(/^(-?(?:1[0-7]|[1-9])?\d(?:\.\d{1,18})?|180(?:\.0{1,18})?)$/);

router.get("/location/get", async (req, res) => {
  try {
    let { 
      lat,
      lng, 
      radius 
    } = req.query;

    if (!lat || !lng || !radius) {
      res.status(400).json({ error: "Query string was invalid." });
      return;
    } 
  
    if(!(latregex.test(lat)) || !(lngregex.test(lng)) || !(parseInt(radius))) {  
      res.status(400).json({ error: "Query string was invalid." });
      return;
    }

    lat = parseFloat(lat);
    lng = parseFloat(lng);
    radius = parseInt(radius);

    let query = {location: {$near: { $maxDistance: radius, $geometry: { type: "Point", coordinates: [lng, lat]}}}};
    let sightings = await database.collection("sightings").find(query).toArray();
    res.status(200); 
    res.json(sightings);
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

    if (!lat || !lng) {
      res.status(204).json({ error: "Invalid Request Body" });
      return;
    }

    if(!(latregex.test(lat)) || !(lngregex.test(lng))) {  
      res.status(204).json({ error: "Invalid Request Body" });
      return;
    }

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
