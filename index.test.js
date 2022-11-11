const setup = require('./index')
const process = require('process');
const cp = require('child_process');
const path = require('path');
const { expect } = require('@jest/globals');

// example test for testing a throw
//test('throws invalid number', async () => {
//  await expect(setup(12)).rejects.toThrow('some error message');
//});

test('run setup', async () => {
  await expect(setup('latest')).resolves.toReturn();
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  process.env['INPUT_VERSION'] = 'latest';
  const ip = path.join(__dirname, 'index.js');
  const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
  console.log(result);
})

