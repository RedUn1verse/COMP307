class UserDto {

    constructor(dbUser) {
    this.name   = dbUser.name;
    this.email  = dbUser.email;
    this.role   = dbUser.role;

    if(dbUser.public_id!=null){
        this.public_id = dbUser.public_id;
    }
  }

  static validateUserId(userId){
    // TODO: implement validation
    return userId;
  }

  static responseUser(dbUser){
    if (!dbUser) return null;
    return new UserDto(dbUser);
}
 
  static responseUsers(dbUsers) {
    return dbUsers.map(UserDto.responseUser);
  }
}
 
module.exports = UserDto;
