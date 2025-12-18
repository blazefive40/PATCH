const axios = require('axios');
const { User } = require('../models');

/**
 * Service layer for User operations
 * Contains business logic and ORM interactions
 */

const userService = {
  /**
   * Populate database with random users from randomuser.me API
   * @returns {Promise<Array>} Created users
   */
  async populateUsers() {
    const response = await axios.get('https://randomuser.me/api/?results=3');
    const users = response.data.results;

    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create({
        firstName: userData.name.first,
        lastName: userData.name.last,
        email: userData.email,
        age: userData.dob.age
      });
      createdUsers.push(user);
    }

    return createdUsers;
  },

  /**
   * Get all users from database
   * @returns {Promise<Array>} List of users
   */
  async getAllUsers() {
    return await User.findAll({
      attributes: ['id', 'firstName', 'lastName']
    });
  },

  /**
   * Get user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async getUserById(userId) {
    return await User.findByPk(userId);
  }
};

module.exports = userService;
