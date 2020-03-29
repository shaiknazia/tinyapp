const bcrypt = require('bcrypt');

generateRandomString = () => {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let stringLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * stringLength));
  }
  return result;
};


const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
};

const checkPassword = function(email, password, database) {
  let userExist = false;
  for (let user in database) {
    if (database[user].email === email && bcrypt.compareSync(password, database[user].password)) {
      userExist = true;
    }
  }
  return userExist;
};


module.exports = { getUserByEmail, generateRandomString, checkPassword };