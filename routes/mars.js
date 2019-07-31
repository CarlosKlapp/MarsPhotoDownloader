var express = require('express');
var router = express.Router();
var moment = require('moment');
var bodyParser = require('body-parser');
var axios = require("axios");

const API_KEY = "DEMO_KEY";

router.use(bodyParser.json())

const photos_url = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?api_key=${API_KEY}&earth_date=`
var rovers_manifests = [
    {
        "name": "opportunity",
        "url": `https://api.nasa.gov/mars-photos/api/v1/manifests/opportunity?api_key=${API_KEY}`,
        "manifest": undefined,
        "manifest_download_date": undefined,
        "min_date": undefined,
        "max_date": undefined,
    },
    {
        "name": "spirit",
        "url": `https://api.nasa.gov/mars-photos/api/v1/manifests/spirit?api_key=${API_KEY}`,
        "manifest": undefined,
        "manifest_download_date": undefined,
        "min_date": undefined,
        "max_date": undefined,
    },
    {
        "name": "curiosity",
        "url": `https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=${API_KEY}`,
        "manifest": undefined,
        "manifest_download_date": undefined,
        "min_date": undefined,
        "max_date": undefined,
    },
];

function getRoverByName(name) {
    name = name.toLowerCase();
    for(let i=0; i<rovers_manifests.length; i++) {
        if (rovers_manifests[i].name === name) {
            return rovers_manifests[i];
        }
    }
    return undefined;
}

const getLatestManifest = async () => {
    let fetches = [];
    let today = moment().utc().startOf('day');
    rovers_manifests.forEach(rover => {
        // Avoid downloading the manifest if we already have the latest
        if (!rover.manifest_download_date || rover.manifest_download_date < today) {
            fetches.push(axios.get(rover.url));
        }
    });

    if (fetches.length === 0) {
        return;
    }

    let responses = await Promise.all(fetches);
    responses.forEach(res => {
        if (res.status === 200) {
            const manifest = res.data.photo_manifest;
            let rover = getRoverByName(manifest.name); // if it returns undefined. the error will be handled by middleware.
            rover.manifest = manifest;
            rover.manifest_download_date = today;
            rover.min_date = new moment.utc(manifest.landing_date, "YYYY-MM-DD");
            rover.max_date = new moment.utc(manifest.max_date, "YYYY-MM-DD");
        } else {
            throw new Error("HTTP status code " + res.status);
        }
    });
}

router.get('/:earth_date', async function (req, res, next) {
    console.log("earth_date is " + req.params.earth_date);

    let earth_date = new moment.utc(req.params.earth_date, "YYYYMMDD"); // parse as UTC
    if (!earth_date.isValid() || req.params.earth_date.length != 8) {
        res.status(400); // Bad request
        return res.json({
            "status": "error",
            "description": "Requested date is has an invalid format. The expected date format is YYYYMMDD.",
            "requested_date": req.params.earth_date,
            "files_downloaded": 0,
        });
    }

    try {
        await getLatestManifest();
        const response = await axios.get(photos_url + earth_date.utc().format("YYYY-MM-DD"));
        const data = response.data;
        console.log(data);

        return res.json({
            "status": "success",
            "description": "",
            "requested_date": earth_date.utc().format("YYYY-MM-DD"),
            "files_downloaded": 0,
        });
    } catch (e) {
        res.status(500); // Bad request
        res.json({
            "status": e.isAxiosError ? "error communicating with NASA. Please try again in 20 minutes." : "error",
            "description": e.message,
            "requested_date": req.params.earth_date,
            "files_downloaded": 0,
        });
        // next(e);
    }
});

module.exports = router;
