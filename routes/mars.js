var express = require('express');
var router = express.Router();
var moment = require('moment');
var bodyParser = require('body-parser');
var axios = require("axios");
var fs = require('fs');
var path = require('path');

router.use(bodyParser.json())

const API_KEY = process.env.API_KEY ? process.env.API_KEY : "DEMO_KEY";
const maxPhotosReturnedByNasa = 25;
const pathManifest = './manifest.json';

var rover_manifests = [
    {
        "name": "opportunity",
        "url": `https://api.nasa.gov/mars-photos/api/v1/manifests/opportunity?api_key=${API_KEY}`,
        "url_photos": `https://api.nasa.gov/mars-photos/api/v1/rovers/opportunity/photos?api_key=${API_KEY}&earth_date=`,
        "manifest": undefined,
        "manifest_download_date": undefined,
        "min_date": undefined,
        "max_date": undefined,
    },
    {
        "name": "spirit",
        "url": `https://api.nasa.gov/mars-photos/api/v1/manifests/spirit?api_key=${API_KEY}`,
        "url_photos": `https://api.nasa.gov/mars-photos/api/v1/rovers/spirit/photos?api_key=${API_KEY}&earth_date=`,
        "manifest": undefined,
        "manifest_download_date": undefined,
        "min_date": undefined,
        "max_date": undefined,
    },
    {
        "name": "curiosity",
        "url": `https://api.nasa.gov/mars-photos/api/v1/manifests/curiosity?api_key=${API_KEY}`,
        "url_photos": `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?api_key=${API_KEY}&earth_date=`,
        "manifest": undefined,
        "manifest_download_date": undefined,
        "min_date": undefined,
        "max_date": undefined,
    },
];

// Load the data from the file system to avoid using up our daily API limit
const readManifestFromFile = async () => {
    if (fs.existsSync(pathManifest)) {
        let rawData = fs.readFileSync(pathManifest);
        rover_manifests = JSON.parse(rawData);
    } else {
        await getLatestManifest();
    }
}

// Write the manifest to disk
const writeManifestFromFile = () => {
    let data = JSON.stringify(rover_manifests);
    fs.writeFileSync(pathManifest, data);
}

function getRoverByName(name) {
    name = name.toLowerCase();
    for (let i = 0; i < rover_manifests.length; i++) {
        if (rover_manifests[i].name === name) {
            return rover_manifests[i];
        }
    }
    return undefined;
}

// Check if the date of the manifest downloader is older than today then reload it.
const getLatestManifest = async () => {
    let fetches = [];
    let today = moment().utc().startOf('day');
    rover_manifests.forEach(rover => {
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
            rover.min_date = manifest.landing_date;
            rover.max_date = manifest.max_date;
        } else {
            throw new Error("HTTP status code " + res.status);
        }
    });
}

const downloadPhotos = async (earth_date_string) => {
    let downloadedFiles = 0;
    let cachedFiles = 0;
    let totalFiles = 0;
    let photoUrls = findPhotosInManifest(earth_date_string);
    let targetPath = path.join('./public/images', earth_date_string);
    let photoListRequests = [];

    // create the folder if it doesn't exist
    fs.mkdirSync(targetPath, { recursive: true });

    // execute the photo lists in parallel
    photoUrls.forEach(photo => {
        // let targetFile = path.join(targetPath, photo)
        let numPages = Math.trunc((photo.total_photos + maxPhotosReturnedByNasa - 1) / maxPhotosReturnedByNasa);
        for (let p = 0; p < numPages; p++) {
            const pageReq = numPages > 1 ? "&page=" + (p+1) : "";
            photoListRequests.push(axios.get(photo.url_photos + earth_date_string + pageReq));
        }
        totalFiles += photo.total_photos;
    });
    let photoListJson = await Promise.all(photoListRequests);

    let imgUrls = [];
    photoListJson.forEach(response => {
        response.data.photos.forEach(photo => {
            const urlPath = new URL(photo.img_src).pathname;
            const fileName = path.basename(urlPath);
            const targetFile = path.join(targetPath, fileName);
            // If the file already exists don't download it.
            if (fs.existsSync(targetFile)) {
                cachedFiles++;
            } else {
                downloadedFiles++;
                imgUrls.push(downloadImage(photo.img_src, targetFile));
            }
        })
    });
    let imgResults = await Promise.all(imgUrls);

    return ({
        downloadedFiles,
        cachedFiles,
        totalFiles,
    });
}

async function downloadImage(targetUrl, targetFile) {
    const writer = fs.createWriteStream(targetFile);

    const response = await axios({
        url: targetUrl,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    });
}

const findPhotosInManifest = (earth_date_string) => {
    let photoUrls = [];

    rover_manifests.forEach(rover => {
        if (earth_date_string >= rover.min_date || earth_date_string <= rover.max_date) {
            // inside of date range
            let photo = findDateInPhotos(rover.manifest.photos, earth_date_string);
            if (photo) {
                photoUrls.push({
                    "total_photos": photo.total_photos,
                    "url_photos": rover.url_photos,
                    "rover_name": rover.name
                });
            }
        }
    });
    return photoUrls;
}

const findDateInPhotos = (photos, earth_date_string) => {
    let photoUrls = [];

    for (let i = 0; i < photos.length; i++) {
        let photo = photos[i];
        if (earth_date_string < photo.earth_date) {
            // Skip testing. The entries are in ascending order.
            // Ideally we should store these as a hash by date or in a database.
            return undefined;
        }
        if (photo.earth_date === earth_date_string) {
            return photo;
        }
    }
    return undefined;
}

router.get('/:earth_date', async function (req, res, next) {
    try {
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
        let earth_date_string = earth_date.utc().format("YYYY-MM-DD");

        await getLatestManifest();
        const response = await downloadPhotos(earth_date_string);

        return res.json({
            "status": "success",
            "description": "",
            "requested_date": earth_date.utc().format("YYYY-MM-DD"),
            "files_downloaded": response.downloadedFiles,
            "files_in_cache": response.cachedFiles,
            "total_files": response.totalFiles,
        });
    } catch (e) {
        console.log(e.stack);
        res.status(500); // Bad request
        res.json({
            "status": e.isAxiosError ? "error communicating with NASA. Please try again in 20 minutes." : "error",
            "description": e.message,
            "requested_date": req.params.earth_date,
            "files_downloaded": 0,
            "files_in_cache": 0,
            "total_files": 0,
        });
        // next(e);
    }
});

module.exports = {
    router,
    writeManifestFromFile,
    readManifestFromFile
};
