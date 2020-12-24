// 云函数入口文件
const uuid = require('uuid/v4');
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
      team_id: teamId
    } = event;

    const db = cloud.database();
    const $ = db.command.aggregate;

    const teamRes = await db.collection('team').doc(teamId).get();
    const teamData = teamRes.data;
    const memberList = teamData.member_list;

    for (let i = memberList.length; i < Number(teamData.male_amount) + Number(teamData.female_amount); ++i) {
      memberList.push({
        openid: uuid().replace(/-/g, ''),
        type: 'friend',
        nickName: '【封车占位】'
      });
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