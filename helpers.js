const generateRandomString = function(length) {
  let shortURL = '';
  let range = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    shortURL += range[Math.floor(Math.random() * range.length)];
  }
  return shortURL;
};

//returns an object with user's information
const getUserByEmail = function(email, database) {
  let foundUser = undefined;
  for (const userID in database) {
    const user = database[userID];
    if (user["email"] === email) {
      foundUser = user;
    }
  }
  return foundUser;
};

//returns object with shortURL as a key and longURL as a value
const urlsForUser = function(userId, database) {
  let urlData = {};
  for (let urlId in database) {
    const info = database[urlId];
    if (info['userID'] === userId) {
      urlData[urlId] = info["longURL"];
    }
  }
  return urlData;
};

/* checks if url exists, if user is logged in or if url belongs to user.
Returns true if everything OK, or false and relevant message
if condition is not met
*/
const checkingAccess = function(req, res, database) {
  const id = req.params.id;
  if (!Object.keys(database).includes(id)) {
    res.send("URL is not found");
    return false;
  }
  const userID = req.session.user_id;
  if (!userID) {
    res.send("Please log in");
    return false;
  }
  const usersUrl = database[id];
  if (usersUrl["userID"] !== userID) {
    res.send("You don't have access");
    return false;
  }
  return true;
}

module.exports = { getUserByEmail, generateRandomString, urlsForUser, checkingAccess };