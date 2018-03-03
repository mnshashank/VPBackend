var express = require('express');
var router = express.Router();

var db = require('../mongo');
 
 
 // get all the vacations : very generic, not to be used from UI
 router.get('/', function (req, res) {
    db.get().collection('vacation', function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.send(items);
        });
    });
});

// delete all vacations : should not be used from the UI
router.delete('/', function (req, res) {
    db.get().collection('vacation', function (err, collection) {
        collection.remove({}, { safe: true }, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred - ' + err });
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
});

// get all the vacations pertaining to employees belonging to the specified team
router.get('/team/:team', function (req, res) {
    var teamToShow = req.params.team;
    teamToShow = teamToShow.toLowerCase();
    db.get().collection('vacation', function (err, collection) {
        collection.find({ 'team': teamToShow }).toArray(function (err, items) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.send(items);
        });
    });
});

// get all the vacations pertaining to the specified employee ID
router.get('/employee/:id', function (req, res) {
    var id = req.params.id;
    console.log('Retrieving vacations for Inum : ' + id);
    db.get().collection('vacation', function (err, collection) {
        collection.find({ '_id': id }).limit(1).next(function (err, item) {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            res.send(item);
        });
    });
});

// add an entry : when user is not even created
router.post('/', function (req, res) {
    var vacationEntry = req.body;
    console.log('Adding vacation: ' + JSON.stringify(vacationEntry));

    if (vacationEntry && vacationEntry.vacationArray) {
        vacationEntry.vacationArray.forEach(eachVacationEntry => {
            var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
            eachVacationEntry.vacationId = guid;

            db.get().collection('vacation', function (err, collection) {
                collection.insert(vacationEntry, { safe: true }, function (err, result) {
                    if (err) {
                        res.send({ 'error': 'An error has occurred' });
                    } else {
                        console.log('Success: ' + JSON.stringify(result[0]));
                        res.send(result[0]);
                    }
                });
            });
        });
    } else {
        res.send({ 'error': 'Nothing sent in post body' });
    }
});

function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
}

// add a vacation entry : when user is already known
router.post('/:employeeId/', function (req, res) {
    var individualVacationEntry = req.body;
    var empId = req.params.employeeId;
    console.log('Adding vacation: ' + JSON.stringify(individualVacationEntry));

    var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    individualVacationEntry.vacationId = guid;

    db.get().collection('vacation', function (err, collection) {
        collection.update({ '_id': empId }, { $push: { 'vacationArray': individualVacationEntry } }, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
});

// app.put('/schools/:id', function (req, res) {
//     var id = req.params.id;
//     var school = req.body;
//     console.log('Updating school: ' + id);
//     console.log(JSON.stringify(school));
//     datab.collection('school', function (err, collection) {
//         collection.update({ '_id': id }, school, { safe: true }, function (err, result) {
//             if (err) {
//                 console.log('Error updating wine: ' + err);
//                 res.send({ 'error': 'An error has occurred' });
//             } else {
//                 console.log('' + result + ' document(s) updated');
//                 res.send(wine);
//             }
//         });
//     });
// });

// delete a vacation using the vacation Id and the _id specified
router.delete('/:iNum/:vacationid', function (req, res) {
    var vacId = req.params.vacationid;
    var iNum = req.params.iNum;
    console.log('Cancelling the vacation : ' + vacId);
    db.get().collection('vacation', function (err, collection) {
        collection.update({ '_id': iNum }, { $pull: { 'vacationArray': { 'vacationId': vacId } } },
            { safe: true }, function (err, result) {
                if (err) {
                    res.send({ 'error': 'An error has occurred - ' + err });
                } else {
                    console.log('' + result + ' document(s) deleted');
                    res.send(req.body);
                }
            });
    });
});

module.exports = router;