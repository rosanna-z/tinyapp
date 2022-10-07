const findUserbyEmail = function(email, database) {
  for (const userId in database) {
    const userDb = database[userId];
    if (userDb.email === email) {
      return userDb;
    }
    return null;
  }
};

function urlsForUser(id, database) {
  let list = {};
  for (const shortURL in database) {
    if (id === database[shortURL].userID) {
      list[shortURL] = database[shortURL];
    }
  }
  return list;
}

function generateRandomString() {
  let string = '';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
  for (var i = 0; i < 6; i++) {
    string += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return string;
}

module.exports = { findUserbyEmail, urlsForUser, generateRandomString };