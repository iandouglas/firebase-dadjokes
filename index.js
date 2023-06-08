const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const firestore = admin.firestore();

exports.saveData = functions.https.onRequest(async (req, res) => {
  try {
    const data = req.body.data;
    await firestore.collection('strings').add({ data });
    res.status(200).send('Data saved successfully!');
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).send('Error saving data.');
  }
});

exports.getRandomString = functions.https.onRequest(async (req, res) => {
  try {
    const snapshot = await firestore.collection('strings').get();
    const randomIndex = Math.floor(Math.random() * snapshot.size);
    const randomString = snapshot.docs[randomIndex].data().data;
    res.status(200).json({ randomString });
  } catch (error) {
    console.error('Error retrieving data:', error);
    res.status(500).send('Error retrieving data.');
  }
});

