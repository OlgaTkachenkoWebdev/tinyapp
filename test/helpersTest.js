const { assert } = require('chai');

const { getUserByEmail, urlsForUser } = require('../helpers');

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


let urlDatabase = {
  b6UTxQ/*url ID*/: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "user2RandomID",
  },
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const userID = getUserByEmail("user@example.com", testUsers)["id"];
    const expectedUserID = "userRandomID";
    assert.equal(userID, expectedUserID);
  });
  it('should return undefined if email is not found', function() {
    const userID = getUserByEmail("user3@example.com", testUsers);
    const expectedUserID = undefined;
    assert.equal(userID, expectedUserID);
  })
});

describe("urlsForUser", function() {
  it('should return pair shortened URL - long URL if user has valid ID', function() {
    const shortURL = urlsForUser('userRandomID', urlDatabase);
    const expectedURL = { b6UTxQ: 'https://www.tsn.ca' };
    assert.deepEqual(shortURL, expectedURL)
  });
  it('should return empty object if user does not have valid ID', function() {
    const shortURL = urlsForUser('notValidID', urlDatabase);
    const expectedURL = {};
    assert.deepEqual(shortURL, expectedURL)
  })
});