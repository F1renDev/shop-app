const path = require("path");

//This is a path to the file that started the application - root file (app.js in this case)
module.exports = path.dirname(process.mainModule.filename);
