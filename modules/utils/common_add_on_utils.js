const {OAuth2Client} = require("google-auth-library");

// See https://developers.google.com/workspace/add-ons/guides/alternate-runtimes#extract_the_user_id_and_email
// and https://developers.google.com/workspace/add-ons/guides/alternate-runtimes#get_the_client_id on how to configure
async function getPayloadFromEvent(event, oauthClientId) {
  const oAuth2Client = new OAuth2Client();
  const decodedToken = await oAuth2Client.verifyIdToken({
    idToken: event.authorizationEventObject.userIdToken,
    audience: oauthClientId,
  });
  const payload = decodedToken.getPayload();

  console.log("User ID token payload: " + JSON.stringify(payload));
  // E.g. payload.email for email,  payload.sub for user ID
  return payload;
}

// See https://developers.google.com/workspace/add-ons/guides/alternate-runtimes#validate-requests-from-google
async function authenticateRequest(request, serviceAccountEmail) {
  let idToken = request.token; // Using express-bearer-token middleware
  if (!idToken) throw 'Missing bearer token';
  const audience = `${request.protocol}://${request.hostname}${request.originalUrl}`;
  const authClient = new OAuth2Client();
  const ticket = await authClient.verifyIdToken({idToken, audience});
  if (ticket.getPayload().email !== serviceAccountEmail) {
    throw 'Invalid service account email. You cannot run this code for this add-on.';
  }
}

exports.getPayloadFromEvent = getPayloadFromEvent;
exports.authenticateRequest = authenticateRequest;