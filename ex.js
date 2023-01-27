// const users = {
//   userRandomID: {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "123",
//   },
//   user2RandomID: {
//     id: "user2RandomID",
//     email: "user2@example.com",
//     password: "456",
//   },
// };
// function userFinder(newEmail) {
//   let foundUser = null;
//   for(let userId in users) {
//     const user = users[userId];
//     if (user['email'] === newEmail) {
//       foundUser = user;
//     }
//   }
//   return foundUser;
// }
// console.log(userFinder('user@example.com'))

let urlDatabase = {
  b6UTxQ/*url ID*/: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

function urlsForUser(userId) {
  let urlData = {};
  for (let urlId in urlDatabase) {
    const info = urlDatabase[urlId];
    if (info['userID'] === userId) {
      urlData[urlId] = info["longURL"];
    }
  }
  return urlData;
}
console.log(urlsForUser("aJ48lW"))