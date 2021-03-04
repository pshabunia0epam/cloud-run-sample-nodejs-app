const assert = require('assert');
const {request} = require('gaxios');

const port = process.env.PORT || '8080';
const url = process.env.SERVICE_URL || `http://localhost:${port}`;

describe('Render Page', () => {
  it('can respond to an HTTP request', async () => {
    console.log(`    - Requesting GET ${url}/...`)
    const res = await request({
      url: url + '/',
      timeout: 5000,
    });

    assert.equal(res.status, '200');
    assert.ok(
      res.data.includes('Quote of the day'),
    );
  });
});
