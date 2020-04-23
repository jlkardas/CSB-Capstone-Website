$(document).ready(function () {
  // Update text label to file name when new file is uplaoded'
  $("#submit").prop("disabled", true);
  $("#fileInput").on("change", function () {
    var fileName = $(this).val().replace("C:\\fakepath\\", "");
    $(this).next(".custom-file-label").html(fileName);
  });

  // Bootstrap validation effects
  window.addEventListener(
    "load",
    function () {
      // Fetch all the forms we want to apply custom Bootstrap validation styles to
      var forms = document.getElementsByClassName("needs-validation");
      // Loop over them and prevent submission
      var validation = Array.prototype.filter.call(forms, function (form) {
        form.addEventListener(
          "submit",
          function (event) {
            if (form.checkValidity() === false) {
              event.preventDefault();
              event.stopPropagation();
            }
            form.classList.add("was-validated");
          },
          false
        );
      });
    },
    false
  );

  // Attach submitForm method to Submit button
  document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    submitForm();
  });
});

// Firebase Firestore
var db = firebase.firestore();

// Firebase Storage reference
var storageRef = firebase.storage().ref();
var uploadsRef = storageRef.child("sponsor-uploads"); // point to /sponsor-uploads directory

// Constant variable that specifies who the email should be sent to
const sendTo = "gsw2@lehigh.edu";

// Submit form
function submitForm() {
  var name, email, message;
  var testEmail = /^[A-Z0-9._%+-]+@([A-Z0-9-]+\.)+[A-Z]{2,4}$/i;

  // Make sure input is given
  if (!$("#name").val() || !$("#email").val() || !$("#message").val()) {
    return;
  } else if (!testEmail.test($("#email").val())) {
    $("#email").addClass("is-invalid");
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

  // If there is a file, upload it to Storage
  if ($("#fileInput")[0].files.length !== 0) {
    var file = document.getElementById("fileInput").files[0];
    var metadata = {
      contentType: "application/octet-stream",
    };
    uploadFile(file, metadata, function (url) {
      pushToDatabaseWithFile(name, email, message, url);
      document.getElementById("fileLabel").innerHTML = "";
    });
  } else {
    // no file, just update database
    pushToDatabase(name, email, message);
  }

  // $(this)[0].reset();
  setTimeout(function () {
    grecaptcha.reset();
    $("#email").removeClass("is-invalid");
    $("#contactForm").removeClass("was-validated");
    document.getElementById("contactForm").reset();
    updateSubmitButton("btn-success", "btn-brown", "Success!");
    setTimeout(function () {
      updateSubmitButton("btn-brown", "btn-success", "Submit Request");
      $("#submit").prop("disabled", true);
    }, 1000);
  }, 2000);
}

function updateSubmitButton(addClass, removeClass, html) {
  $("#submit").removeClass(removeClass);
  $("#submit").addClass(addClass);
  $("#submit").html(html);
}

// Uploads specified file to firebase storage and executes custom 'onSuccess' callback
function uploadFile(file, metadata, onSuccess) {
  var uploadTask = storageRef.child("sponsor-uploads/" + file.name).put(file, metadata);
  // Listen for state changes, errors, and completion of the upload.
  uploadTask.on(
    firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
    function (snapshot) {
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
    function (error) {
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
      }
    },
    function () {
      // Upload completed successfully, now we can get the download URL
      uploadTask.snapshot.ref.getDownloadURL().then(function (downloadURL) {
        // console.log("File available at", downloadURL);
        onSuccess(downloadURL); // pass the downloaded URL to callback
      });
    }
  );
}

// Add new document with user information in Firestore 'requests' collection
function pushToDatabase(name, email, message) {
  var date = getDate();
  var document = {
    to: sendTo,
    message: {
      subject: "New CSB Capstone Request",
      html:
        "<div class=”body”><b>Name:</b> " +
        name +
        "<br><b>Email:</b> " +
        email +
        "<br><b>Message:</b> " +
        message +
        "<br><b>Date:</b> " +
        date +
        "</div>",
    },
  };
  db.collection("requests")
    .add(document)
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
  // console.log("Successfully updated database.");
}

// Add new document with user information *and FILE* in Firestore 'requests' collection
function pushToDatabaseWithFile(name, email, message, fileURL) {
  let date = getDate();
  db.collection("requests")
    .add({
      to: sendTo,
      message: {
        subject: "New CSB Capstone Request",
        html:
          "<div class=”body”><b>Name:</b> " +
          name +
          "<br><b>Email:</b> " +
          email +
          "<br><b>Message:</b> " +
          message +
          "<br><b>File Upload:</b> " +
          fileURL +
          "<br><b>Date:</b> " +
          date +
          "</div>",
      },
    })
    .then(function (docRef) {
      console.log("Document written with ID: ", docRef.id);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
    });
  // console.log("Successfully updated database.");
}

// reCAPTCHA data callback method
function dataCallback(response) {
  return new Promise(function (resolve, reject) {
    var checkRecaptcha = firebase.functions().httpsCallable("checkRecaptcha");
    checkRecaptcha({ response: encodeURIComponent(response) })
      .then((result) => {
        if (result["data"].success === true) {
          $("#submit").prop("disabled", false);
        }
        resolve();
      })
      .catch((error) => {
        console.log(error);
      });
  });
}

// reCAPTCHA data expired callback method
function dataExpiredCallback() {
  console.log("dataExpiredCallback");
}

function getDate() {
  return new Date(Date.now()).toLocaleString();
}
