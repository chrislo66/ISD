const GoalData = require('../models/goaldata.model');
const Goal = require('../models/goal.model');
const Student = require('../models/student.model');
var CryptoJS = require("crypto-js");
var LZUTF8 = require('lzutf8');

// functions for encryption of db
async function encryption(string) {
    let ciphertext = await CryptoJS.AES.encrypt(string, 'secret key 123').toString();
    return ciphertext;
}

async function decryption(ciphertext) {
    // await console.log("decryption")
    var bytes  = await CryptoJS.AES.decrypt(ciphertext, 'secret key 123');
    // await console.log("bytes:", bytes);
    var originalText = await bytes.toString(CryptoJS.enc.Utf8);
    // await console.log("originalText", originalText);
    return originalText;
}

// function that creates goaldata in db
exports.goaldata_create = async function (req, res) {
    try {
        // console.log("req.body", req.body)
        // console.log("uncompressed", req.body.filecontents);
        // console.log("compressed", LZUTF8.compress(req.body.filecontents));
        let goaldata = new GoalData(
            {
                goalID: req.params.goalid,
                score: req.body.score,
                count: req.body.count,
                rubricOption: req.body.optionsRadios,
                support: req.body.support,
                comments: await encryption(req.body.comments),
                time: Date.now(),
                teacherEmail: req.body.useremail,
                filename: req.body.file,
                file: req.body.filecontents
            }
        );

        // saves goal after pushing goaldata onto its array
        Goal.findOneAndUpdate({_id: req.params.goalid}, {$push: {goaldata: goaldata}}, function (err, goal) {
            goaldata.save(function (err) { 
                if (err) {
                    res.send(err);
                }
            });
        });
        setTimeout(() => { res.redirect("/student/" + req.params.studentid + "/goal/" + req.params.goalid); }, 1000);
    } catch(err) {
        console.log(err);
        res.render('./error');
    }
};

// deletes the goal data from the database
exports.goaldata_delete = function (req, res) {
    try {
        GoalData.findByIdAndRemove(req.params.goaldataid, function (err) {
            if (err) return next(err);
            res.redirect('/student/' + req.params.studentid + '/goal/' + req.params.goalid);
        })
    } catch(err) {
        console.log(err);
        res.render('/error');
    }
};

// exports.goaldata_redirect_edit = async function (req, res) {
//     console.log("redirecting to goald.ata edit page");
//     try {
//         User.findById(req.params.userid, async function (err, user) {
//             Student.findById(req.params.studentid, async function (err, student) {
//                 Goal.findById(req.params.goalid, async function (err, goal) {
//                     // console.log("goal pre decrypt", goal)
//                     goal.name = await decryption(goal.name);
//                     goal.description = await decryption(goal.description);
//                     goal.userid = goal.userid
//                     // console.log("goal post decrypt", goal)

//                     res.render('pages/EditGoal', {
//                         student: student,
//                         user: user,
//                         goalid: req.params.goalid,
//                         goal: goal
//                     });
//                 });
//             });
//         });
//     } catch (err) {
//         console.log("exports.student_redirect_edit");
//         console.log(err);
//         res.render('pages/error');
//     }
// }

// edit the goal data from the database
exports.goaldata_edit = function (req, res) {
    try {
        GoalData.findByIdAndRemove(req.params.goaldataid, function (err) {
            if (err) return next(err);
            res.redirect('/student/' + req.params.studentid + '/goal/' + req.params.goalid);
        })
    } catch(err) {
        console.log(err);
        res.render('/error');
    }
};


