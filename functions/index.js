const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.onNewOrder = functions.database.ref('/orders/{id}')
    .onCreate((snapshot, context) => {

      console.log(snapshot.val());
      var order = snapshot.val();
      delete order['timestamp'];
      console.log(order);

      var message = {
        notification: {
          title: 'New Order',
          body: order.box + ' for ' + order.user
        },
        topic: "volunteer"
      };

      return admin.messaging().send(message)
          .then((response) => {
            console.log('Notification has been sent');
            return response;
          })
          .catch((error) => {
            console.log('We encountered an error');
            console.log(error);
          });
    });

