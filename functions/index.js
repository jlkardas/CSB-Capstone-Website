const functions = require("firebase-functions");
const rp = require("request-promise");

exports.checkRecaptcha = functions.https.onCall((data) => {
  const response = data.response;
  console.log("recaptcha response", response);
  return rp({
    uri: "https://recaptcha.google.com/recaptcha/api/siteverify",
    method: "POST",
    formData: {
      secret: "6LdvReoUAAAAANwPpohUsHzouAtOpaW-wEcaXM4-",
      response: response,
    },
    json: true,
  })
    .then((result) => {
      console.log("recaptcha result", result);
      return result;
    })
    .catch((reason) => {
      console.log("Recaptcha request failure", reason);
      return reason;
    });
});
