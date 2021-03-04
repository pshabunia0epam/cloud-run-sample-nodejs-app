const express = require('express');
const { readFileSync } = require('fs');
const handlebars = require('handlebars');

const fetch = require('node-fetch')
const BACKEND_SERVER_HOSTNAME = "cloud-run-sample-java-app-npzvnnogkq-uc.a.run.app"
const BACKEND_SERVER_URL = "https://" + BACKEND_SERVER_HOSTNAME;

// Fetch quote from backend server
const payload = fetch(BACKEND_SERVER_URL + '/quote')
  .then(res => res.json())
  .catch(err => {
    console.log(err);
    return {}
  });

const app = express();
// Serve the files in /assets at the URI /assets.
app.use('/assets', express.static('assets'));

// The HTML content is produced by rendering a handlebars template.
// The template values are stored in global state for reuse.
const cloud_run_info = {
  service: process.env.K_SERVICE || '???',
  revision: process.env.K_REVISION || '???',
};

let template;
app.get('/', async (req, res) => {
  // The handlebars template is stored in global state so this will only once.
  if (!template) {
    // Load Handlebars template from filesystem and compile for use.
    try {
      template = handlebars.compile(readFileSync('index.html.hbs', 'utf8'));
    } catch (e) {
      console.error(e);
      res.status(500).send('Internal Server Error');
    }
  }

  // Apply the template to the parameters to generate an HTML string.
  try {
    const data = Object.assign({}, cloud_run_info, await payload);
    const output = template(data);
    res.status(200).send(output);
  } catch (e) {
    console.error(e);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(
    `The app started successfully and is listening for HTTP requests on ${PORT}`
  );
});

// proxy server to handle backend calls (around CORS)
// const http = require('http');
// const httpProxy = require('http-proxy');
// const proxy = httpProxy.createProxyServer({});
// const PPORT = Number(PORT) + 1;
// http.createServer(function (req, res) {
//   req.headers.host = BACKEND_SERVER_HOSTNAME;
//   proxy.web(req, res, { target: BACKEND_SERVER_URL });
// }).listen(PPORT, () => {
//   console.log(
//     `The proxy server started successfully and is listening for HTTP requests on ${PPORT}`
//   );
// });