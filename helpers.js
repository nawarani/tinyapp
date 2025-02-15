const generateRandomString = function() {
  const str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let id = '';
  for(let c = 0; c < 6; c++) {
    let i = Math.floor(Math.random()*str.length);
    id += str[i];
  }
  return id;
};

const getUserByEmail = function(email, database) {
  if (email !== '') {
    for (id in database) {
      if (database[id].email === email) {
        return database[id];
      }
    }
  }
  return null;
};

const loggedIn = (req, res, users) => {
  console.log('session: ', req.session);
  return Boolean(users[req.session.user_id]);
}

const urlsForUser = (id, database) => {
  const obj = {};
  for (urlID in database) {
    if (database[urlID].userID === id) {
      obj[urlID] = database[urlID];
    }
  }
  console.log('return from urluser func: ', obj);
  return obj;
};

module.exports = {
  generateRandomString,
  getUserByEmail,
  loggedIn,
  urlsForUser
};