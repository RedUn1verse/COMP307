const UserModel = require('../models/usermodel');
const UserDto = require('../dtos/userdto');

const UserController = {

  async getMe(req, res) {

    const userId = UserDto.validateUserId(req.user.userId);

    if (!userId) return res.status(400).json({error: "Bad User Id"});
    const user = await UserModel.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(UserDto.responseUser(user));
  },

  async getActiveOwners(req, res) {
    const activeOwners = await UserModel.getActiveOwners();
    res.json(UserDto.responseUsers(activeOwners))
  }

};

module.exports = UserController;
