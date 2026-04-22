const UserModel = require('../models/usermodel');
const UserDto = require('../dtos/userdto');

const UserController = {

  async getMe(req, res) {

    const user = await UserModel.findById(req.params.userId);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(UserDto.responseUser(user));
  },

  async getActiveOwners(req, res) {
    const activeOwners = await UserModel.getActiveOwners();
    res.json(UserDto.responseUsers(activeOwners));
  },

  async createUser(req, res){

    const { name, email, password, job } = req.body ?? {};

    const errors = [];
    const validJobs = ['student', 'teacher', 'ta'];
    
    if (typeof name !== 'string' || !name.trim()) errors.push('name is required');
    if (typeof password !== 'string' || password.length < 5) errors.push('password is required (min 5 chars)');
    
    if (!validJobs.includes(job.toLowerCase())) {
      errors.push('job must be "student", "teacher", or "ta"');
    }
    
    let assignedRole = null;
    const trimmedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (trimmedEmail.endsWith('@mcgill.ca')) {
      assignedRole = 'owner';
    } else if (trimmedEmail.endsWith('@mail.mcgill.ca')) {
      assignedRole = 'user';
    } else {
      errors.push('Email must be a valid @mcgill.ca or @mail.mcgill.ca address');
    }

    if (errors.length) return res.status(400).json({ errors });

    const existingUser = await UserModel.findByEmail(trimmedEmail);
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const user = await UserModel.createUser({
      name: name.trim(),
      email: trimmedEmail,
      password, // TODO: hash password for safety?
      job: job,
      role: assignedRole,
    });

    return res.status(201).json(UserDto.responseUser(user));

  },
}

module.exports = UserController;
