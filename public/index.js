$(document).ready(function() {
  setupButtons();
});

function setupButtons() {
  var storageRef = firebase.storage().ref();

  var contractRef = storageRef.child("contract");
  // Get list of all files in 'contract' folder
  contractRef
    .listAll()
    .then(function(result) {
      result.items.forEach(function(ref) {
        storageRef
          .child(ref.location.path)
          .getDownloadURL()
          .then(function(url) {
            // console.log(url);
            $("button#contract").click(function() {
              window.open(url);
            });
          })
          .catch(function(error) {});
        return;
      });
    })
    .catch(function(error) {});

  var NDARef = storageRef.child("NDA");
  // Get list of all files in 'NDA' folder
  NDARef.listAll()
    .then(function(result) {
      result.items.forEach(function(ref) {
        storageRef
          .child(ref.location.path)
          .getDownloadURL()
          .then(function(url) {
            // console.log(url);
            $("button#NDA").click(function() {
              window.open(url);
            });
          })
          .catch(function(error) {});
        return;
      });
    })
    .catch(function(error) {});
}
