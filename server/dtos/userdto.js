// Author: Christina Vuong
// Student ID: 260929195
class UserDto {

    constructor(dbUser) {
    this.name   = dbUser.name;
    this.email  = dbUser.email;
    this.job   = dbUser.job;

    if(dbUser.publicId!=null){
        this.publicId = dbUser.publicId;
    }
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
