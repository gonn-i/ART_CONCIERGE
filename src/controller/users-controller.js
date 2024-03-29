const userService = require("../services/users-service");

//회원정보 조회
async function getUser(req, res, next) {
  try {
    const user_Id = req.user;
    const user = await userService.searchOne(user_Id);
    res.json(user);
  } catch (error) {
    res.json(error)
  }
}

//회원정보 수정
async function putUser(req, res, next) {
  try {
    const user_Id = req.user;
    const {name, password, phone, userAddress, detailAddress } = req.body;
    await userService.putOneUser({
      name, 
      password, 
      phone, 
      userAddress, 
      detailAddress },
      user_Id
    );

    res.json("수정완료");
  } catch (error) {
    res.json(err)
  }
}

//회원 탈퇴
async function deleteUser(req, res, next) {
  const user_Id = req.user;

  try {
    const removeUser = await userService.deleteOneUser(user_Id);
    res.cookie('token', null, {
      maxAge: 0,
   })
  console.log('회원탈퇴 성공!')
  res.status(204).send()
  } catch (error) {
    res.json(err)
  }
}

module.exports = { getUser, putUser, deleteUser };
