// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const {
      team_id: teamId,
      member_id: memberId,
      member_nick_name: memberNickName,
      member_gender: memberGender
    } = event;

    const db = cloud.database();
    const $ = db.command.aggregate;

    const teamRes = await db.collection('team').doc(teamId).get();
    const teamData = teamRes.data;
    const memberList = teamData.member_list;

    for (let i = 0; i < memberList.length; ++i) {
      if (memberList[i].openid === memberId) {
        memberList[i].nickName = memberNickName;
        memberList[i].gender = memberGender;
      }
    }

    await db.collection('team').where({
      _id: teamId
    }).update({
      data: {
        member_list: memberList
      }
    }); 

    return true;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}