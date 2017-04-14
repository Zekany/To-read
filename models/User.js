const Sequelize = require('sequelize')

const bcrypt = require('bcryptjs')

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define('user', {
    username: {
      type: Sequelize.STRING,
      unique: true,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    }
  }, {
    classMethods: {
    },
    hooks: {
      afterValidate: function (user) {
        if (user.password.length >= 7) {
          return bcrypt.hash(user.password, 12).then(function (hash) {
            user.password = hash
            return user
          })
        }
      }
    }
  })
  return User
}
