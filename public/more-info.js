$(document).ready(function() {
  // $("#submit").html("Submit Request");
});

var database = firebase.database();
var storageRef = firebase.storage().ref();
var uploadsRef = storageRef.child("sponsor-uploads");

// Listen for form submit
document.getElementById("contactForm").addEventListener("submit", submitForm);

// Submit form
function submitForm(e) {
  e.preventDefault();
  var name, email, message;
  // Make sure input is given
  if ($("#name").val() == "" || $("#email").val() == "" || $("#message").val() == "") {
    $("#staticBackdrop").modal("show");
    return;
  } else {
    name = $("#name").val();
    email = $("#email").val();
    message = $("#message").val();
  }
  // Update UI
  var spinner = document.createElement("div");
  spinner.id = "spinner";
  spinner.className = "spinner-border spinner-border-sm";
  $("#submit").html("Uploading...   ");
  $("#submit").append(spinner);
  // If there is a file, upload it to storafe
  if ($("#fileInput").val() != "") {
    var file = document.getElementById("fileInput").files[0];
    var metadata = {
      contentType: "application/octet-stream"
    };
    uploadFile(file, metadata, function(url) {
      pushToDatabase(name, email, message, url);
      document.getElementById("fileLabel").innerHTML = "";
    });
  } else {
    // no file, just update database
    pushToDatabase(name, email, message);
  }

  // Reset UI
  setTimeout(function() {
    updateSubmitButton("btn-success", "btn-brown", "Success!");
    document.getElementById("contactForm").reset();
    setTimeout(function() {
      updateSubmitButton("btn-brown", "btn-success", "Submit Request");
    }, 2000);
  }, 1000);
}

function updateSubmitButton(addClass, removeClass, html) {
  $("#submit").removeClass(removeClass);
  $("#submit").addClass(addClass);
  $("#submit").html(html);
}

// Uploads specified file to firebase storage and executes custom 'onSuccess' method after
function uploadFile(file, metadata, onSuccess) {
  var uploadTask = storageRef.child("sponsor-uploads/" + file.name).put(file, metadata);
  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    function(snapshot) {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log("Upload is " + progress + "% done");
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log("Upload is paused");
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log("Upload is running");
          break;
      }
    },
    function(error) {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
      }
    },
    function() {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {
        // console.log("File available at", downloadURL);
        onSuccess(downloadURL);
      });
    }
  );
}

// Function to push data to real-time firebase database
function pushToDatabase(name, email, message, fileURL) {
  let date = getDate();
  firebase
    .database()
    .ref("requests/")
    .push({
      name: name,
      email: email,
      message: message,
      file: fileURL,
      date: date
    });
  // console.log("Successfully updated database.");
}

// Function to push data to real-time firebase database
function pushToDatabase(name, email, message) {
  let date = getDate();
  firebase
    .database()
    .ref("requests/")
    .push({
      name: name,
      email: email,
      message: message,
      date: date
    });
  // console.log("Successfully updated database.");
}

function getDate() {
  return new Date(Date.now()).toLocaleString();
}
