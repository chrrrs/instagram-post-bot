const { init } = require("./bot");

/**
 * Setup bot dependant constants
 * These elements could ideally be given by a database
 * See the example folder for how this might be done in cloud functions
 */
const username = "YOUR_USERNAME";
const password = "YOUR_PASSWORD";
const filepath = "./images/example.png";
const description = "Test #test";

init(username, password, filepath, description);
