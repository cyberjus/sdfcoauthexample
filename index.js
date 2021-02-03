const express = require("express");
const oauth2 = require("salesforce-oauth2");
const path = require("path");
const request = require("request");

const callbackUrl = "http://localhost:3000/callback";
const consumerKey =
  "3MVG9kBt168mda_93HkSjNCWOhz5Rqhw_er1gDB32PRF9hhzUhV.AjlJmpWi2Au0uPMjsTUm3.ZK7HZZc4cSI";
const consumerSecret =
  "6A0470A7F9872FCEC1A8CB637DC2CC9BD94C36089F01C2E899905577A82BCFB4";
const baseUrl = "https://bodhi-suncommon.cs64.force.com/customers";

var app = express();

app.use("/", express.static(path.join(__dirname, "static")));

app.get("/authenticate", function (req, res) {
  var uri = oauth2.getAuthorizationUrl({
    redirect_uri: callbackUrl,
    client_id: consumerKey,
    scope: "id", // 'id api web refresh_token'
    // You can change loginUrl to connect to sandbox or prerelease env.
    base_url: baseUrl,
  });
  return res.redirect(uri);
});

app.get("/callback", function (req, res) {
  var authorizationCode = req.param("code");
  console.log(authorizationCode);

  oauth2.authenticate(
    {
      redirect_uri: callbackUrl,
      client_id: consumerKey,
      client_secret: consumerSecret,
      code: authorizationCode,
      base_url: baseUrl,
    },
    function (error, payload) {
      if (error) {
        console.error(error);
      } else {
        console.log(payload);
        /*
 
        The payload should contain the following fields:
        
        id 				A URL, representing the authenticated user,
                        which can be used to access the Identity Service.
        
        issued_at		The time of token issue, represented as the 
                        number of seconds since the Unix epoch
                        (00:00:00 UTC on 1 January 1970).
        
        refresh_token	A long-lived token that may be used to obtain
                        a fresh access token on expiry of the access 
                        token in this response. 
 
        instance_url	Identifies the Salesforce instance to which API
                        calls should be sent.
        
        access_token	The short-lived access token.
 
 
        The signature field will be verified automatically and can be ignored.
 
        At this point, the client application can use the access token to authorize requests 
        against the resource server (the Force.com instance specified by the instance URL) 
        via the REST APIs, providing the access token as an HTTP header in 
        each request:
 
        Authorization: OAuth 00D50000000IZ3Z!AQ0AQDpEDKYsn7ioKug2aSmgCjgrPjG...
        */

        // Get User Information
        let url = payload.instance_url + "/services/oauth2/userinfo";

        request.get(
          {
            url: url,
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + payload.access_token,
            },
          },
          function (error, r, body) {
            if (error) {
              console.error("Error calling Salesforce:", error);
            }
            let userInfo = JSON.parse(body);

            console.log(body);
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end(userInfo.email);
          }
        );

        //response.statusCode = 200;
        //response.setHeader("Content-Type", "text/plain");
        //res.write(pdfmerge.merge()+ '\n');
        //response.end("Callback done");
      }
    }
  );
});

app.listen(3000, function () {
  console.log("Listening on 3000");
});
