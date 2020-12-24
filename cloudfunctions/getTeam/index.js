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
          ...memberInfo,
          ...memberList[i]
        }
      }
    }

    // 整理等待情况
    let currentMaleAmount = 0;
    let currentFemaleAmount = 0;
    memberList.forEach(item => {
      item.gender === 2 ? (++currentFemaleAmount) : (++currentMaleAmount);
    });

    const totalMaleAmount = Number(teamData.male_amount);
    const totalFemaleAmount = Number(teamData.female_amount);

    const needTotal = Math.max((totalMaleAmount + totalFemaleAmount) - (currentMaleAmount + currentFemaleAmount), 0);

    teamData.member_detail = {
      is_full: needTotal === 0,
      current_male_amount: currentMaleAmount,
      current_female_amount: currentFemaleAmount,
      wait_for_male_amount: Math.max(Math.min(totalMaleAmount - currentMaleAmount, needTotal), 0),
      wait_for_female_amount: Math.max(Math.min(totalFemaleAmount - currentFemaleAmount, needTotal), 0)
    };

    teamData.leader_nick_name = memberList[0].nickName;
    teamData.leader_gender = memberList[0].gender;

    return teamData;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}