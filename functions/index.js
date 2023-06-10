/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const firestore = admin.firestore();
const jokesRef = firestore.collection('jokes');
const trustedIps = firestore.collection('trusted_ips');

exports.saveJoke = functions.https.onRequest(async (req, res) => {
  // look up the requester's IP address, and see if it is in the trusted_ips collection
  requestIp = req.ip;
  // logger.info('requestIp', requestIp);
  let trustedIp = false;
  await trustedIps.where('ip', '==', requestIp).get().then((doc) => {
    if (doc.size > 0) {
      trustedIp = true;
    }
  });
  // logger.info('trustedIp', trustedIp);
  if (!trustedIp) {
    res.status(403).json({'error':"I don't know you..."});
    return;
  }

  try {
    // logger.info('body', req.body);
    // if body contains an id attribute, and id is a number, store that in a variable
    let id;
    if (req.body.id && !isNaN(req.body.id)) {
        // logger.info('req.body.id', req.body.id);
        id = String(req.body.id);
    }
    nestedId = Number(id);
    let joke = req.body.joke;
    let ts = req.body.datetime;

    // logger.info('id', id);
    // logger.info('joke', joke);
    // logger.info('ts', ts);

    if (!id || id == undefined || id == '' || id == 'undefined' || id == 'NaN') {
        let lastId;
        await jokesRef.orderBy('timestamp', 'desc').limit(1).get().then((doc) => {
            lastId = doc.docs[0].data().id;
        });
        // logger.info('lastId', lastId);
        id = String(Number(lastId)+1).padStart(4, '0');
        nestedId = Number(id);
    }
    // logger.info('data.id', id);
    if (id && joke && ts) {
        const entry = await jokesRef.doc(id);
        await entry.set({'id': nestedId, 'joke':joke, 'timestamp':ts});
        res.status(201).json({'status':'success','data': await jokesRef.doc(id).get()});
    } else {
        res.status(400).json({'error':'id or joke or ts is missing.'});
    }
  } catch (error) {
    // logger.error('Error saving data:', error);
    res.status(500).json({'error':'Error saving data.'});
  }
});

exports.getRandomJoke = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await jokesRef.get();
    // logger.info('snapshot.size', snapshot.size);
    let randomIndex = 0;
    while (randomIndex == 0) {
        randomIndex = Math.floor(Math.random() * snapshot.size);
    }
    const randomJoke = snapshot.docs[randomIndex].data();
    res.status(200).json({'data':randomJoke});
  } catch (error) {
    // logger.error('Error getting data:', error);
    res.status(500).json({'error':'Error retrieving data.'});
  }
});

exports.getJokeById = functions.https.onRequest(async (req, res) => {
    try {
      const jokeId = String(req.query.id);
      // logger.info('jokeId', jokeId);
  
      if (!jokeId) {
        res.status(400).json({'error':'joke ID is missing.'});
        return;
      }
  
      const doc = await jokesRef.doc(jokeId).get();
  
      if (!doc.exists) {
        res.status(404).json({'error':'joke not found.'});
        return;
      }
  
      const joke = doc.data();
      res.status(200).json({ 'data': {
        id: joke.id,
        joke: joke.joke,
        datetime: joke.timestamp
      }});
    } catch (error) {
      // logger.error('Error getting data:', error);
      res.status(500).json('Error retrieving joke.');
    }
});
