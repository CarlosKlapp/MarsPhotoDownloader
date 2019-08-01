# MarsPhotoDownloader
RestAPI to download Mars photos from NASA


# Table of contents
* [Notable features](#Learn_More)
* [Setup instructions](#setup)
    * [Install Node](#Install_Node)
    * [Clone source code](#Clone)
    * [Install node modules](#Install_Node)
    * [Start node app](#Start_web_app)
* [Node scripts](#Node_scripts)
    * [Available Scripts](#Available_Scripts)
        * [npm run dev](#npm_start)
        * [npm run build](#npm_run_build)
    * [Test links](#Test)

# Notable features
* The app downloads all files in parallel where possible.
* The downloading of the images is made faster by piping the response into a file stream.
* The rover manifests are cached to disk when the app exits using Ctrl+C.
* On startup, the rover manifests are loaded from disk. This saves on requests to NASA.
* The rover manifests are only downloaded once per day.
* If the image already exists on disk then skip downloading it again.
* When searching the rover manifest, take advantage of the images listed in ascending order. This speeds up locating the desired date.
* The files are downloaded to the folder {project folder}/public/images.

# Setup instructions <a name="setup"></a>
These instructions are for setting up the node RestAPI server and any additional node modules.

## Install Node <a name="Install_Node"></a>
Install Current Version of Node from https://nodejs.org/en/download/
Current Version as of this document: 12.2.0+

Via Homebrew:
>brew install node

## Clone source code <a name="Clone"></a>
**NOTE:** The folder name doesn't affect anything.

Lower case folder name
>git clone https://github.com/CarlosKlapp/MarsPhotoDownloader marsphotodownloader

Pascal case folder name
>git clone https://github.com/CarlosKlapp/MarsPhotoDownloader

## Install node modules <a name="Install_node_modules"></a>
>cd MarsPhotoDownloader

>npm install

If any install errors occur run:
>sudo npm install

## Start node app <a name="Start_web_app"></a>
>npm run dev

"npm run dev" will start the node development server

# Node scripts <a name="Node_scripts"></a>
This project was bootstrapped with [Express Generator](https://expressjs.com/en/starter/generator.html).

## Available Scripts <a name="Available_Scripts"></a>

In the project directory, you can run:

### `npm run dev` <a name="npmstart"></a>

Runs the app in the development mode.<br>

The app will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build` <a name="npm_run_build"></a>

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Test links <a name="Test"></a>

no images
http://localhost:3001/mars/30990101

error - bad date
http://localhost:3001/mars/201901012

no files
http://localhost:3001/mars/20150613

25 files
http://localhost:3001/mars/20150614

145 files
http://localhost:3001/mars/20190608
