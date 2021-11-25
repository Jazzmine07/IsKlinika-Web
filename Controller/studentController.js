const firebase = require('../firebase');
const bodyParser = require('body-parser');
const { use } = require('../routes');

var TAG = "studentController.js";

exports.getStudent = function(req, res){
    var id = req.body.studentVisit;
    var database = firebase.database();
    var studentRef = database.ref("studentInfo/"+ id);
    var studentInfo;

    studentRef.on('value', (snapshot) => {
        if(snapshot.exists()){
            studentInfo = {
                firstName: snapshot.child('firstName').val(),
                middleName: snapshot.child('middleName').val(),
                lastName: snapshot.child('lastName').val(),
                grade: snapshot.child('grade').val(),
                section: snapshot.child('section').val(),
                studentType: snapshot.child('studentType').val(),
                birthday: snapshot.child('birthday').val(),
                //nationailty: snapshot.child('nationality').val(),
                //religion: snapshot.child('religion').val(),
                age: snapshot.child('age').val(),
                sex: snapshot.child('sex').val(),
                address: snapshot.child('address').val(),
                fatherName: snapshot.child('fatherName').val(),
                fatherEmail: snapshot.child('fatherEmail').val(),
                fatherContact: snapshot.child('fatherContact').val(),
                motherName: snapshot.child('motherName').val(),
                motherEmail: snapshot.child('motherEmail').val(),
                motherContact: snapshot.child('motherContact').val(),
            }
            res.send(studentInfo);
        } else {
            res.send({
                error: true,
                error_msg: "No student with that id number!"
            })
        }
    })
}

exports.addClinicVisit = function(req, res){
    // visit details
    var id = req.body.studentId;
    var name = req.body.studentName;
    var grade = req.body.studentGrade;
    var section = req.body.studentSection;
    var visitDate = req.body.visitDate;
    var timestamp = req.body.timeStamp;
    var timeIn = req.body.timeIn;
    var timeOut = req.body.timeOut;
    var nurse = req.body.nurse;
    var bodyTemp = req.body.bodyTemp;
    var systolicBP = req.body.systolicBP;
    var diastolicBP = req.body.diastolicBP;
    var pulseRate = req.body.pulseRate;
    var respirationRate = req.body.respirationRate;                      
    var complaint = req.body.complaint;
    var treatment = req.body.treatement;
    
    // medication
    var medicationAssign = req.body.medicationAssign;
    var prescribedBy = req.body.prescribedBy;
    var medicationList = req.body.medicineList;
    var purposeList = req.body.purposeList;
    var amountList = req.body.amountList;
    var intervalList = req.body.intervalList;
    var startMedList = req.body.startMed;
    var endMedList = req.body.endMed;
    
    // diagnosis
    var diagnosisAssign = req.body.diagnosisAssign;
    var diagnosis = req.body.diagnosis;

    var notes = req.body.notes;
    var status = req.body.status;

    var i, key;
    
    var database = firebase.database();
    var clinicVisitRef = database.ref("clinicVisit");
    var record = {
        id: id, 
        studentName: name,
        grade: grade,
        section: section,
        visitDate: visitDate,
        timestamp: timestamp,
        timeIn: timeIn,
        timeout: timeOut,
        attendingNurse: nurse,
        bodyTemp: bodyTemp,
        systolicBP: systolicBP,
        diastolicBP: diastolicBP,
        pulseRate: pulseRate,
        respirationRate: respirationRate,   

        visitReason: complaint,
        treatment: treatment,

        medicationAssigned: medicationAssign,
        medicationPrescribed: prescribedBy,
        medication: "", // array of medications

        diagnosisAssigned: diagnosisAssign,
        diagnosis: diagnosis,
        status: status,
        notes: notes,
    };

    key = clinicVisitRef.push(record).key;

    // for(i = 0; i < medicationList.length; i++){
    //     // left side is the field name in firebase
    //     medication = {
    //         medicines: medicationList[i],
    //         purpose: purposeList[i],
    //         amount: amountList[i],
    //         interval: intervalList[i]
    //         startDate: startMedList[i],
    //         endDate: endMedList[i]
    //     };
    //     //database.ref('clinicVisit/' + key + '/medication').push(medication);
    // }

    var assignMedication = database.ref("assignedForms/"+ medicationAssign);
    var assignDiagnosis = database.ref("assignedForms/"+diagnosisAssign);

    var medicationForm = {
        task: "Clinic Visit",
        description: "Medication",
        formId: key,
        assignedBy: nurse,
        dateAssigned: visitDate,
        timestamp: timestamp,
        status: "Pending"
    }

    var diagnosisForm = {
        task: "Clinic Visit",
        description: "Diagnosis",
        formId: key,
        assignedBy: nurse,
        dateAssigned: visitDate,
        timestamp: timestamp,
        status: "Pending"
    }

    var assignBoth = {
        task: "Clinic Visit",
        description: "Diagnosis & Medication",
        formId: key,
        assignedBy: nurse,
        dateAssigned: visitDate,
        timestamp: timestamp,
        status: "Pending"
    }

    var userNotification = database.ref("notifications/"+medicationAssign);

    var notif = {
        type: "form",
        message: "You have been assigned to a new form!",
        date: visitDate,
        timestamp: timestamp,
        seen: false
    }

    if(medicationAssign == diagnosisAssign){
        assignMedication.push(assignBoth);
    } else {
        assignMedication.push(medicationForm);
        assignDiagnosis.push(diagnosisForm);
        userNotification.push(notif);
    }
    
    res.redirect('/clinic-visit');
}

exports.getClinicVisits = function(req, res){
    var database = firebase.database();
    var databaseRef = database.ref();
    var clinicVisitRef = database.ref("clinicVisit");
    var query = clinicVisitRef.orderByChild("timestamp");
    var i, temp =[];
    var childSnapshotData;

    databaseRef.once('value', (snapshot) => {
        if(snapshot.hasChild("clinicVisit")){
            query.on('value', (childSnapshot) => {
                childSnapshot.forEach(function(innerChildSnapshot){                  // Getting primary keys of users
                    childSnapshotData = innerChildSnapshot.exportVal();  // Exports the entire contents of the DataSnapshot as a JavaScript object.
                    
                    temp.push({ // contains all data (not grouped by date)
                      studentName: childSnapshotData.studentName,
                      timeIn: childSnapshotData.timeIn,
                      timeOut: childSnapshotData.timeOut,
                      status: childSnapshotData.status,
                      visitDate: childSnapshotData.visitDate
                    })         
                })
                
                var filtered = [];
                temp.reverse().forEach(record => {
                    var found = false;
                    for(i = 0; i < filtered.length; i++){
                        if(record.visitDate == filtered[i].date){   // filters if same date
                            filtered[i].visitDetails.push(record);
                            filtered[i].count++;
                            found = true;
                            break;
                        } 
                    }
                    if(!found){
                        filtered.push({
                            date: record.visitDate,
                            visitDetails: [],
                            count: 1
                        })
                        filtered[i].visitDetails.push(record);
                    }          
                });
                res(filtered);
            })
        }
        else {
            res(temp);
        }
    })
}

exports.getAssignedForms = function(req, res){
    var user = req;
    var database = firebase.database();
    var databaseRef = database.ref();
    var formsReference = database.ref("assignedForms");
    var formsRef = database.ref("assignedForms/"+user);
    var userRef = database.ref("clinicUsers");
    var query = formsRef.orderByChild("timestamp");
    var forms =[];
    var childSnapshotData;
    var fname, lname;
    
    databaseRef.once('value', (dbSnapshot) => {
        if(dbSnapshot.hasChild("assignedForms")){
            formsReference.once('value', (formSnapshot) => {
                if(formSnapshot.hasChild(user)){
                    query.on('value', (snapshot) => {
                        snapshot.forEach(function(childSnapshot){                 
                            childSnapshotData = childSnapshot.exportVal();  // Exports the entire contents of the DataSnapshot as a JavaScript object.
                            userRef.child(childSnapshotData.assignedBy).on('value', (userSnapshot) => {
                                fname = userSnapshot.child('firstName').val();
                                lname = userSnapshot.child('lastName').val();
                                forms.push({ // contains all data (not grouped by date)
                                    task: childSnapshotData.task,
                                    description: childSnapshotData.description,
                                    formId: childSnapshotData.formId,
                                    assignedBy: fname + " " + lname,
                                    dateAssigned: childSnapshotData.dateAssigned
                                })  
                                console.log("forms controller");
                                console.log(forms);
                                forms.reverse();
                            })  
                            res(forms);      
                        })
                    })
                } else {
                    res(forms);
                }
            })
        } else {
            res(forms);
        }
    })
}

exports.getClinicVisitForm = function(req, res){
    var formId = req.params.id;
    console.log("formid "+formId);
    var database = firebase.database();
    var formRef = database.ref("clinicVisit/"+formId);
    var medication = [], details = [];
    var childSnapshotData, nurse, fname, lname;
    
    formRef.on('value', (snapshot) => {
        // snapshot.child("medication").on('value', (childSnapshot) => {
        //     childSnapshot.forEach(function(data){
        //         childSnapshotData = data.exportVal();
        //         medication = {
        //             medicines: childSnapshotData.medicines,
        //             purpose: childSnapshotData.purpose,
        //             amount: childSnapshotData.amount,
        //             interval: childSnapshotData.interval,
        //             startDate: childSnapshotData.startDate,
        //             endDate: childSnapshotData.endDate,
        //         }
        //     })
        // })
        nurse = snapshot.child("attendingNurse").val();
        database.ref("clinicUsers/"+nurse).on('value', (userSnapshot) => {
            fname = userSnapshot.child('firstName').val();
            lname = userSnapshot.child('lastName').val();
        })
        
        details = {
            formId: formId,
            idNum: snapshot.child("id").val(),
            studentName: snapshot.child("studentName").val(),
            studentGrade: snapshot.child("grade").val(),
            studentSection: snapshot.child("section").val(),
            visitDate: snapshot.child("visitDate").val(),
            timeIn: snapshot.child("timeIn").val(),
            timeOut: snapshot.child("timeOut").val(),
            attendingNurse: fname + " " + lname,
            bodyTemp: snapshot.child("bodyTemp").val(),
            systolicBP: snapshot.child("systolicBP").val(),
            diastolicBP: snapshot.child("diastolicBP").val(),
            pulseRate: snapshot.child("pulseRate").val(),
            respirationRate: snapshot.child("respirationRate").val(),
            visitReason: snapshot.child("visitReason").val(),
            treatment: snapshot.child("treatment").val(),

            //medicationPrescribed: snapshot.child("medicationPrescribed").val(),
            //medication: medication,

            status: snapshot.child("status").val(),
            notes: snapshot.child("notes").val(),

        }
        res(details);
    })
}

exports.getNotifications = function(req, res){
    var user = req;
    var database = firebase.database();
    var notifRef = database.ref("notifications/"+user);
    var childSnapshotData;
    var notifs = [];

    notifRef.on('value', (snapshot) => {
        snapshot.forEach(function(childSnapshot){
            childSnapshotData = childSnapshot.exportVal();
            notifs.push({
                type: childSnapshotData.type,
                message: childSnapshotData.message,
                date: childSnapshotData.date,
                seen: childSnapshotData.seen
            })
            res.send(notifs);
        })
    })
}

exports.addAPE = function(req, res){
    //var sy= req.body.schoolYear;
    var id= req.body.studentId;
    var name = req.body.studentName;
    var apeDate = req.body.visitDate;
    var clinician = req.body.clinician;
    var temp= req.body.bodyTemp;
    var bp = req.body.bp;
    var pr = req.body.pr;
    var rr = req.body.rr;
    var sf = req.body.skinFindings;
    var weight = req.body.weight;
    var height = req.body.height;
    var bmi = req.body.bmi;
    var odVision = req.body.odVision;
    var osVision = req.body.osVision;
    var odGlasses = req.body.odGlasses;
    var osGlasses = req.body.osGlasses;
    var medProb = req.body.medProb;
    var allergies = req.body.allergies;
    var concern = req.body.concern;
    var assess = req.body.assess;
    var normal = req.body.normal;

    var database = firebase.database();
    var apeRef = database.ref("studentHealthHistory/"+id+"/ape");
    var record = {
        id: id,
        name: name,
        apeDate: apeDate,
        clinician: clinician,
        temp: temp,
        bp: bp,
        pr: pr,
        rr: rr,
        sf: sf,
        weight: weight,
        height: height,
        bmi: bmi,
        odVision: odVision,
        osVision: osVision,
        odGlasses: odGlasses,
        osGlasses: osGlasses,
        medProb: medProb,
        allergies: allergies,
        concern: concern,
        assess: assess
        // normal: normal
    }
    apeRef.push(record);
    // key = apeRef.push(record).key;
    
    res.send({
        success: true,
        success_msg: "Record added!"
    });
}

exports.getSectionStudents = function(req, res){
    var schoolYear= req.body.schoolYear;
    var section = req.body.section;
    var studentId= req.body.studentId;
    var students = [];

    var database = firebase.database();
    var studentRef = database.ref("studentInfo");

    if(section != null){
        console.log(schoolYear);
        console.log(section);
        studentRef.orderByChild("section").equalTo(section).on('value', (snapshot) => {
            if(snapshot.exists()){
                snapshot.forEach(function(childSnapshot){
                    console.log("looking for section:" + section);
                    console.log("Key: "+childSnapshot.key);
                    console.log("Section: "+childSnapshot.child("section").val());
                    console.log("Id Number: "+childSnapshot.child("idNum").val());
                    students.push(childSnapshot.key);
                })
                console.log("Students in "+ section +":"+students);
            }
            res.send(students);
        });
    }
    else if(studentId !=null){
        console.log(schoolYear);
        console.log(studentId);
        students.push(studentId);
        res.send(students);
    }
    
}

exports.getAPEPercentage = function(req, res){
    var t1=0,t2=0,t3=0,t4=0,t5=0,t6=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0;
    var p1,p2,p3,p4,p5,p6;
    //t# - total of grade #; c#- total of grade # that got APE; p# - percentage of c#/t#

    var database = firebase.database();
    var studentRef = database.ref("studentInfo");
    var healthHistory = database.ref("studentHealthHistory");

    studentRef.on('value', (snapshot) =>{
        snapshot.forEach(function(childSnapshot){
            if(childSnapshot.child("grade").equalTo("1")){
                t1=t1+1;
                healthHistory.child(childSnapshot.key).child("ape").orderByChild("schoolYear").on(value,(ss) =>{
                    if(!ss==null && !ss==""){
                        
                    }
                })
            }
            else if(childSnapshot.child("grade").equalTo("2")){
                t12=t2+1;
            }
            else if(childSnapshot.child("grade").equalTo("3")){
                t3=t3+1;
            }
            else if(childSnapshot.child("grade").equalTo("4")){
                t4=t4+1;
            }
            else if(childSnapshot.child("grade").equalTo("5")){
                t5=t5+1;
            }
            else if(childSnapshot.child("grade").equalTo("6")){
                t6=t6+1;
            }


        })
    })   

        
}