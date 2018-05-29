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
        	agent.add(speech);
    }
    
    function failure(agent){
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
    }
    
    function majors(agent)
    {
        var upper = agent.parameters.majors;
        var major = upper.toLowerCase();
        if(major == 'software dev')
        {
            major = 'software development';
        }
        else if(major == 'comp intelligence' || major == 'computer intelligence'||
        major == 'com intelligence')
        {
            major = 'computational intelligence';
        }
        else if(major == 'comp science' || major == 'comp science' || major == 'com sci'
        || major == 'comp sci')
        {
            major = 'computer science';
        }
        else if(major == 'service science')
        {
            major = 'it service science';
        }
        else if(major == 'networking' || major == 'security' || major == 'network and security')
        {
            major = 'networks and security';
        }
        var speech = '';
        var send = '';
        switch(major)
        {
            case 'software development':
            send = new Card({
                title: 'Software Development',
                imageUrl: 'https://i.imgur.com/pZuEBF5.png',
                text: 'Papers for Software Development',
                buttonText: 'More Information',
                buttonUrl: 'https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/courses/bachelor-of-computer-and-information-sciences/software-development-major'
              });
            break;
            case 'analytics':
            send = new Card({
                title: 'Analytics',
                imageUrl: 'https://i.imgur.com/sqvVuKa.png',
                text: 'Papers for Analytics',
                buttonText: 'More Information',
                buttonUrl: 'https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/courses/bachelor-of-computer-and-information-sciences/analytics-major'
              });
            break;
            case 'computational intelligence':
            send = new Card({
                title: 'Computational Intelligence',
                imageUrl: 'https://i.imgur.com/SC3o04o.png',
                text: 'Papers for Computational Intelligence',
                buttonText: 'More Information',
                buttonUrl: 'https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/courses/bachelor-of-computer-and-information-sciences/computational-intelligence-major'
              });
            break;
            case 'computer science':
            send = new Card({
                title: 'Computer Science',
                imageUrl: 'https://i.imgur.com/QEjzMU7.png',
                text: 'Papers for Computer Science',
                buttonText: 'More Information',
                buttonUrl: 'https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/courses/bachelor-of-computer-and-information-sciences/computer-science-major'
              });
            break;
            case 'it service science':
            send = new Card({
                title: 'IT Service Science',
                imageUrl: 'https://i.imgur.com/haSwM5D.png',
                text: 'Papers for IT Service Science',
                buttonText: 'More Information',
                buttonUrl: 'https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/courses/bachelor-of-computer-and-information-sciences/it-service-science-major'
              });
            break;
            case 'networks and security':
            send = new Card({
                title: 'Networks and Security',
                imageUrl: 'https://i.imgur.com/IPrJsFO.png',
                text: 'Papers for Networks and Security',
                buttonText: 'More Information',
                buttonUrl: 'https://www.aut.ac.nz/study/study-options/engineering-computer-and-mathematical-sciences/courses/bachelor-of-computer-and-information-sciences/networks-and-security-major'
              });
            break;
        }
        agent.add(send);
    }

    let intentMap = new Map(); 
    intentMap.set('Requirements', requirements);
    intentMap.set('Semester paper', semester);
    intentMap.set('Failed', failure);
    intentMap.set('Major papers', majors);
    agent.handleRequest(intentMap);
});
