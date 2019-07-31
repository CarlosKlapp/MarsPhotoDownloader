# MarsPhotoDownloader
RestAPI to download Mars photos from NASA


# Table of contents
* [Setup instructions](#setup)
    * [Install Node](#Install_Node)
    * [Clone source code](#Clone)
    * [Install node modules](#Install_Node)
    * [Start web app](#Start_web_app)
* [Node scripts](#Node_scripts)
    * [Available Scripts](#Available_Scripts)
        * [npm start](#npm_start)
        * [npm test](#npm_test)
        * [npm run build](#npm_run_build)
        * [npm run eject](#npm_run_eject)
    * [Learn More](#Learn_More)

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
>cd fishclassifier_web
>npm install

If any install errors occur run:
>sudo npm install

## Start web app <a name="Start_web_app"></a>
>npm start

"npm start" will start the node development server and open a browser page to http://localhost:3000/

# Node scripts <a name="Node_scripts"></a>
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts <a name="Available_Scripts"></a>

In the project directory, you can run:

### `npm start` <a name="npmstart"></a>

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test` <a name="npm_test"></a>

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build` <a name="npm_run_build"></a>

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject` <a name="npm_run_eject"></a>

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More <a name="Learn_More"></a>

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
