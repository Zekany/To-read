const Sequelize = require('sequelize')
const User = require('./User.js')

module.exports = function (sequelize, DataTypes) {
  const Book = sequelize.define('book', {
    title: {
      type: Sequelize.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    author: {
      type: Sequelize.STRING,
      allowNull: true
    },
    priority: {
      type: Sequelize.ENUM,
      values: ['Low', 'Medium', 'High'],
      allowNull: true
    },
    finished: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    }
  }, {
    hooks: {},
    classMethods: {
      associate: function (models) {
        Book.belongsTo(User)
      }
    }
  })
  return Book
}
