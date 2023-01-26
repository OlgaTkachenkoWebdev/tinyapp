const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "456",
  },
};
function userFinder(newEmail) {
  let foundUser = null;
  for(let userId in users) {
    const user = users[userId];
    if (user['email'] === newEmail) {
      foundUser = user;
      console.log(foundUser)
    }
  }
  return foundUser;
}
console.log(userFinder('user@example.com'))