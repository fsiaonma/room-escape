const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const {
      team_id: teamId,
      member_id: memberId
    } = event; 

    const db = cloud.database();

    const teamRes = await db.collection('team').doc(teamId).get();
    const teamData = teamRes.data;
    const memberList = teamData.member_list;

    const memberInfo = memberList.find(item => item.openid === memberId);

    return memberInfo;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}