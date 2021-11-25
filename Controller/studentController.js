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
    var { studentId, studentName , studentGrade, studentSection, visitDate, timeStamp, timeIn, timeOut, nurse, 
        bodyTemp, systolicBP, diastolicBP, pulseRate, respirationRate, complaint, treatment,
        medicationAssign, prescribedBy, medicineList, purposeList, amountList, intervalList, startMedList, endMedList,
        diagnosisAssign, diagnosis, notes, status } = req.body;

    var i, key;
    var time = Math.round(+new Date()/1000);

    var database = firebase.database();
    var clinicVisitRef = database.ref("clinicVisit");

    var record = {
        id: studentId, 
        studentName: studentName,
        grade: studentGrade,
        section: studentSection,
        visitDate: visitDate,
        timestamp: timeStamp,
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

    // for(i = 0; i < medicineList.length; i++){
    //     // left side is the field name in firebase
    //     medication = {
    //         medicines: medicineList[i],
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
        timestamp: time
    }

    var diagnosisForm = {
        task: "Clinic Visit",
        description: "Diagnosis",
        formId: key,
        assignedBy: nurse,
        dateAssigned: visitDate,
        timestamp: time
    }

    var assignBoth = {
        task: "Clinic Visit",
        description: "Diagnosis & Medication",
        formId: key,
        assignedBy: nurse,
        dateAssigned: visitDate,
        timestamp: time
    }

    var userNotification = database.ref("notifications/"+medicationAssign+"/"+key);

    var notif = {
        type: "form",
        message: "You have been assigned to a new form!",
        date: visitDate,
        timestamp: time,
        seen: false
    }

    if(medicationAssign == diagnosisAssign){
        assignMedication.push(assignBoth);
    } else {
        assignMedication.push(medicationForm);
        assignDiagnosis.push(diagnosisForm);
        userNotification.set(notif);
    }
    
    //res.status(200).send();
}

exports.editClinicVisit = function(req, res){
    var { userKey , formId, 
        studentId, studentName , studentGrade, studentSection, visitDate, timeStamp, timeIn, timeOut, nurse, 
        bodyTemp, systolicBP, diastolicBP, pulseRate, respirationRate, complaint, treatment,
        medicationAssign, prescribedBy, medicationList, purposeList, amountList, intervalList, startMedList, endMedList,
        diagnosisAssign, diagnosis, notes, status } = req.body;
    var i, formKey, notifKey;
    
    var database = firebase.database();
    var clinicVisitRef = database.ref("clinicVisit/"+formId);
    var record = {
        id: studentId, 
        studentName: studentName,
        grade: studentGrade,
        section: studentSection,
        visitDate: visitDate,
        timestamp: timeStamp,
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

        //medicationAssigned: medicationAssign,
        //medicationPrescribed: prescribedBy,
        medication: "", // array of medications

        //diagnosisAssigned: diagnosisAssign,
        diagnosis: diagnosis,
        status: status,
        notes: notes,
    };

    clinicVisitRef.set(record);

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
    //     //database.ref('clinicVisit/"+ formId + '/medication').update(medication);
    // }

    var formRef = database.ref("assignedForms/"+ userKey);
    formRef.orderByChild("formId").equalTo(formId).on('value', (snapshot) => { 
        snapshot.forEach(function(childSnapshot) {
            formKey = childSnapshot.key;
        });
    })
    
    database.ref("assignedForms/"+ userKey + "/" + formKey).remove();
    
    // var notifRef = database.ref("notifications/"+ userKey + "/" + formId).remove();
    // notifRef.equalTo(formId).on('value', (snapshot) => {
    //     notifKey = snapshot.key;
    // })
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
                                forms.reverse();
                            })  
                        })
                        console.log(forms);
                        res(forms);
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
    var database = firebase.database();
    var formRef = database.ref("clinicVisit/"+formId);
    var medication = [], details = [];
    var childSnapshotData, nurse, fname, lname;
    var medicationAssigned, diagnosisAssigned, bothAssigned;
    
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
            nurseKey: nurse,
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
            diagnosis: snapshot.child("diagnosis").val(),
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
            notifs.reverse();
            res.send(notifs);
        })
    })
}

exports.addAPE = function(req, res){
    var schoolYear= req.body.schoolYear;
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
    console.log(schoolYear);
    apeRef.child(schoolYear).push(record);
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
    var schoolYear= req.body.schoolYear;
    var t1=0,t2=0,t3=0,t4=0,t5=0,t6=0,c1=0,c2=0,c3=0,c4=0,c5=0,c6=0;
    var p1=0,p2=0,p3=0,p4=0,p5=0,p6=0;
    //t# - total of grade #; c#- total of grade # that got APE; p# - percentage of c#/t#

    var database = firebase.database();
    var studentRef = database.ref("studentInfo");
    var healthHistory = database.ref("studentHealthHistory");

    studentRef.on('value', (snapshot) =>{
        snapshot.forEach(function(childSnapshot){
            if(childSnapshot.child("grade").val()=="1"){
                t1=t1+1;
                healthHistory.child(childSnapshot.key).child("ape").on('value',(ss)=>{
                    ss.forEach(function(cs){
                        if(cs.key.toString() == schoolYear){
                            c1=c1+1;
                        }
                    })
                });
            }
            else if(childSnapshot.child("grade").val()=="2"){
                console.log(childSnapshot.key);
                t2=t2+1;
                healthHistory.child(childSnapshot.key).child("ape").on('value',(ss)=>{
                    ss.forEach(function(cs){
                        if(cs.key.toString() == schoolYear){
                            c2=c2+1;
                        }
                    })
                });
                
            }
            else if(childSnapshot.child("grade").val()=="3"){
                t3=t3+1;
                healthHistory.child(childSnapshot.key).child("ape").on('value',(ss)=>{
                    ss.forEach(function(cs){
                        if(cs.key.toString() == schoolYear){
                            c3=c3+1;
                        }
                    })
                });
            }
            else if(childSnapshot.child("grade").val()=="4"){
                t4=t4+1;
                healthHistory.child(childSnapshot.key).child("ape").on('value',(ss)=>{
                    ss.forEach(function(cs){
                        if(cs.key.toString() == schoolYear){
                            c4=c4+1;
                        }
                    })
                });
            }
            else if(childSnapshot.child("grade").val()=="5"){
                t5=t5+1;
                healthHistory.child(childSnapshot.key).child("ape").on('value',(ss)=>{
                    ss.forEach(function(cs){
                        if(cs.key.toString() == schoolYear){
                            c5=c5+1;
                        }
                    })
                });
            }
            else if(childSnapshot.child("grade").val()=="6"){
                t6=t6+1;
                healthHistory.child(childSnapshot.key).child("ape").on('value',(ss)=>{
                    ss.forEach(function(cs){
                        if(cs.key.toString() == schoolYear){
                            c6=c6+1;
                        }
                    })
                });
            }
        })
        p1=c1/t1;
        p2=c2/t2;
        p3=c3/t3;
        p4=c4/t4;
        p5=c5/t5;
        p6=c6/t6;
        console.log("Total per grade:");
        console.log(t1);
        console.log(t2);   
        console.log(t3);
        console.log(t4); 
        console.log(t5);
        console.log(t6);  
        console.log("Currently has APE:")
        console.log(c1);
        console.log(c2);   
        console.log(c3);
        console.log(c4); 
        console.log(c5);
        console.log(c6);
        console.log("Percentage of APE:")
        console.log(p1);
        console.log(p2);   
        console.log(p3);
        console.log(p4); 
        console.log(p5);
        console.log(p6);
        var data={
            p1:p1,
            p2:p2,
            p3:p3,
            p4:p4,
            p5:p5,
            p6:p6,
            t1:t1,
            t2:t2,
            t3:t3,
            t4:t4,
            t5:t5,
            t6:t6,
            c1:c1,
            c2:c2,
            c3:c3,
            c4:c4,
            c5:c5,
            c6:c6
        };
        res.send(data);
    })      
}