'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();


exports.webhook = functions.https.onRequest((request, response) => {
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
    
    const params = request.body.result.parameters;
    let action = request.body.result.action;

    switch(action)
    {
        case 'show-requirements':

        var pre = 'Temp';
        var co = 'Temp';
        var output = [];

        var speech = 'The paper ' +params.papers +' has the requirements: \n';
        db.collection('papers').get()
            .then((querySnapshot) => {
                var output = [];
                querySnapshot.forEach((doc) => {output.push(doc.data()) });
                output.forEach((eachOutput, index) => {
                    if(eachOutput.name == params.papers)
                    {
                        speech += 'Pre-requisites: ' +eachOutput.re +'\n';
                        speech += 'Co-requisites: ' +eachOutput.co +'\n';
                    }
                    response.send({
                        speech: speech
                    });
                })
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
                speech = 'The paper ' +params.papers +' does not exist in our database: \n';
                response.send({
                    speech: speech
                });
            });

        break;

        case 'show-possibilities':

        var output = [];
        var speech = '';
        db.collection('papers').get()
            .then((querySnapshot) => {
                var output = [];
                querySnapshot.forEach((doc) => {output.push(doc.data()) });
                output.forEach((eachOutput, index) => {
                    if(params.possibility == 'can' || params.possibility == 'available')
                    {
                        speech += 'These are the remaining papers you can take: ';
                        if(eachOutput.re != params.papers)
                        {
                            speech += eachOutput.name;
                        }
                    }
                    else if(params.possibility == "can't" || params.possibility == 'cant' 
                    || params.possibility == 'restrictions' || params.possibility == 'restricted')
                    {
                        speech += 'These are the papers you cannot take: ';
                        if(eachOutput.re == params.papers)
                        {
                            speech += eachOutput.name;
                        }
                    }
                    
                })
                response.send({
                    speech: speech
                });
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
                speech = 'The paper ' +params.papers +' does not exist in our database: \n';
                response.send({
                    speech: speech
                });
            });

        break;
    }
});