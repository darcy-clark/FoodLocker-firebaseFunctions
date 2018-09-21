const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.onNewOrder = functions.database.ref('/orders/{id}')
    .onCreate((snapshot, context) => {

      var order = snapshot.val();
      delete order['timestamp'];

      var message = {
        notification: {
          title: 'New Order',
          body: order.box + ' for ' + order.user
        },
        topic: 'volunteer'
      };

      return admin.messaging().send(message)
          .then((response) => {
            return response;
          })
          .catch((error) => {
            console.log(error);
          });
    });

exports.onUpdateOrder = functions.database.ref('/orders/{id}')
    .onUpdate((snapshot, context) => {

      var order = snapshot.after.val();
      if (order.status === 'ACCEPTED') {
        var message = {
          notification: {
            title: 'Accepted Order',
            body: 'Order from ' + order.user + ' accepted by ' + order.volunteer
          },
          topic: 'volunteer'
        };

        return admin.messaging().send(message)
            .then((response) => {
              return response;
            })
            .catch((error) => {
              console.log(error);
            });
      }
    });


exports.login = functions.https.onCall((user, context) => {

  var type;

  return admin.database().ref('users/' + user.username).once('value')
      .then((snapshot) => {
        if (!snapshot.exists()) {
          throw new functions.https.HttpsError('not-found', 'User does not exist', null);
        }
        if (snapshot.val().passhash !== user.passhash) {
          throw new functions.https.HttpsError('permission-denied', 'Incorrect password', null);
        }
        admin.database().ref('users/' + user.username + '/messagingToken')
            .set(user.messagingToken);
        type = snapshot.val().type;
        return admin.auth().createCustomToken(user.username);
      })
      .then((token) => {
        return {
          token: token,
          username: user.username,
          type: type
        };
      })
      .catch((error) => {
        console.log(error);
        throw error;
      });
});

