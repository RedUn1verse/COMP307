const { getDB } = require('../db');
const genId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const UserModel = {

  // =================== HELPER FUNCTIONS =======================
  async findById(userId) {
    const db = getDB();
    return await db.collection('users').findOne({ userId });
  },

  async findByEmail(email) {
    const db = getDB();
    if (typeof email !== 'string') return null;
    const needle = email.trim().toLowerCase();
    return db.collection('users').findOne({email: needle});
  },

  async findOwnerByPublicId(public_id) {
    const db = getDB();

    const ownerRecord = await db.collection('owners')
      .findOne({ public_id });

    if (!ownerRecord) return null;

    return await db.collection('users')
      .findOne({ userId: ownerRecord.userId, role: 'owner' }) ?? null;
  },

  async enrichOwnerName(request){
    if (!request) return null;
    console.log(request)
    owner = await UserModel.findById(request.ownerId);
  
    const ownerName = owner.name;
    return {
      ...request,
      ownerName: ownerName
    };
  },

  async enrichUserName(request){
    if (!request) return null;
    user = await UserModel.findById(request.userId);
    const userName = user.name;
    return {
      ...request,
      userName: userName
    };
  },

  async enrichListOwnerName(list) {
    
    if (!list) return null;
    enrichedList = await Promise.all(list.map(UserModel.enrichOwnerName));
    return enrichedList;
  },

  async enrishListUserName(list) {
    if (!list) return null;
    enrichedList = await Promise.all(list.map(UserModel.enrichUserName));
    return enrichedList;
  },

  async addMeeting(userId, meetingId){
    const db = getDB();
    const update = await db.collection('users').updateOne(
    { userId:  userId}, 
    { $addToSet: { requestMeetingIds: meetingId} }
    )
  },

  async enrichUserEmail(request){
    user = await UserModel.findById(request.userId);
    return {
      ...request, userEmail: user.email
    }
  },
  // =================== MAIN FUNCTIONS =======================
  async getActiveOwners(){
    const db = getDB();

    const activeOwnerRecords = await db.collection('owners')
      .find({"activeSlots.0":{ $exists: true }})
      .toArray();

    const combinedActiveOwners = [];

    for (const owner of activeOwnerRecords) {
      const userDetails = await db.collection('users')
        .findOne({ userId: owner.userId });

      if (userDetails) {
        combinedActiveOwners.push({
          ...userDetails,
          publicId: owner.publicId
        });
      }
    }
    return combinedActiveOwners;
  },

  async createUser({ name, email, password, job, role}) {
    const db = getDB();
    const userId = genId();
    const newUser = {
      userId,
      name,
      email,
      pwd: password,
      role,
      job,
      bookingsIds: [],
      requestMeetingIds: [],
    };
    
    await db.collection('users').insertOne(newUser);

    if (role === 'owner') {
      const ownerRecord = {
        userId,
        publicId: genId(),
        activeSlots: [],
        privateSlots: [],
      };
      await db.collection('owners').insertOne(ownerRecord);
    }

    return newUser;
  },

};

module.exports = UserModel;
