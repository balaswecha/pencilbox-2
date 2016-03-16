function populateInitialData() {
    var fs = require('fs');
    var dbName = 'grades';
    var dumpFile = 'app/js/BalaSwechaInitialData.txt';


    fs.readFile(dumpFile, 'utf8', function (err, data) {
        if (err) {
            return console.log("Unable to read the file:" + dumpFile + "! \nResolve these errors :" + err);
        }
        var db = new PouchDB(dbName);
        var myDumpedString = data;

        db.load(myDumpedString).then(function () {
            console.log("PouchDB is dumped with initial data successfully");
        }).catch(function (err) {
            console.log("File was read! But enable to dump to PouchDB:" + dbName + "! \nResolve these errors: " + err);
        });
    });
}