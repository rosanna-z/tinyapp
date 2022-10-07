const { assert } = require('chai');
const { findUserbyEmail, urlsForUser, generateRandomString } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  a2345b: {
    longURL: "https://www.google.com",
    userID: "12345",
  },
};

describe('findUserbyEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserbyEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.strictEqual(user.id, expectedUserID);
  });

  it('should return null when email is not found in database', function() {
    const user = findUserbyEmail("abc@example.com", testUsers);
    assert.strictEqual(user, null);
  });
});

describe('urlsForUser', function() {
  it('should return the urls object', function() {
    const user = urlsForUser("12345", urlDatabase);
    const expectedList = { a2345b: { longURL: "https://www.google.com", userID: "12345" }};
    assert.deepEqual(user, expectedList);
  });

  it('should return empty object', function() {
    const user = urlsForUser("abcde", urlDatabase);
    assert.deepEqual(user, {});
  });
});

  describe('generateRandomString', function() {
    it('generates a string', function() {
      const input = generateRandomString();
      assert.typeOf(input, 'string');
    });
});