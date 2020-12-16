const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const { team_id: teamId } = event;  
    const db = cloud.database();
    const $ = db.command.aggregate;

    const teamRes = await db.collection('team').doc(teamId).get();
    const teamData = teamRes.data;
    const memberList = teamData.member_list;

    const openidList = memberList.map(item => item.openid);
    const memberInfoListRes = await db.collection('user').where({
      openid: $.in(openidList)
    }).get();
    const memberInfoList = memberInfoListRes.data;

    for (let i = 0; i < memberList.length; ++i) {
      if (memberList[i].type !== 'friend') {
        const memberInfo = memberInfoList.find(item => item.openid === memberList[i].openid);
        memberList[i] = {
          ...memberList[i],
          ...memberInfo
        }
      }
    }

    return teamData;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}