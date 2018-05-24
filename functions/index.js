'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Text, Card, Image, Suggestion, Payload} = require('dialogflow-fulfillment');

admin.initializeApp(functions.config().firebase);
const db = admin.firestore();


exports.webhook = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({ request, response });
    console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
    console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

    function requirements(agent) {
      
        const paper = agent.parameters.papers;
        var output = [];
        var speech = 'The paper ' +paper +' has the requirements: \n';
        var paperRef = db.collection('papers');
        var query = paperRef.get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {output.push(doc.data()) });
                output.forEach((eachOutput, index) => 
                {
                  	if(eachOutput.name == paper)
                    {
                      speech += 'Pre-requisites: ' +eachOutput.re +'\n';
                      speech += 'Co-requisites: ' +eachOutput.co +'\n'; 
                    }
                })
                response.json({ 'fulfillmentText': speech });
            })
            .catch(function(error) {
                console.log("Error getting documents: ", error);
                speech = 'The paper ' +paper +' does not exist in our database: \n';
                agent.add(speech);
            });
      		console.log(speech);
        	//agent.add(speech);
    }

    let intentMap = new Map(); 
    intentMap.set('Requirements', requirements);
    agent.handleRequest(intentMap);

    /*switch(action)
    {
        case 'show-requirements':

        

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
    }*/
});