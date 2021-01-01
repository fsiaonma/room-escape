// 云函数入口文件
const uuid = require('uuid').v4;
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
      member_nick_name: memberNickName,
      member_gender: memberGender
    } = event;

    const db = cloud.database();
    const _ = db.command;

    await db.collection('team').doc(teamId).update({
      data: {
        member_list: _.push({
          openid: uuid().replace(/-/g, ''),
          type: 'friend',
          nickName: memberNickName,
          gender: memberGender
        })
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