const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
  	const db = cloud.database();
    const _ = db.command;
    const $ = db.command.aggregate;

   	const teamListRes = await db.collection('team').where({
      datetime: _.gte(Date.now())
    }).get();
    const teamList = teamListRes.data;

    let openidList = [];
    teamList.forEach(teamItem => {
      openidList = openidList.concat(teamItem.member_list.map(item => item.openid));
    });
    const memberInfoListRes = await db.collection('user').where({
      openid: $.in(openidList)
    }).get();
    const memberInfoList = memberInfoListRes.data;

    for (let i = 0; i < teamList.length; ++i) {
      const { member_list: memberList } = teamList[i];
      for (let j = 0; j < memberList.length; ++j) {
        const memberInfo = memberInfoList.find(item => item.openid === memberList[j].openid);
        memberList[i] = {
          ...memberList[i],
          ...memberInfo
        };
      }
    }

    return teamList;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}