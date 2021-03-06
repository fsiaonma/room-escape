const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const {
      shop,
      date,
      page = 1,
      size = 100
    } = event;

  	const db = cloud.database();
    const _ = db.command;
    const $ = db.command.aggregate;

    const matchData = {
      datetime: _.gte(Date.now())
    };
    if (shop) { matchData.shop = _.eq(shop); }
    if (date) { matchData.date = _.eq(date); }

    let query = db.collection('team').aggregate().match(matchData).sort({
      datetime: 1
    });

    if (page !== undefined && size !== undefined) {
      const offset = (page - 1) * size;
      query = query.skip(offset).limit(size);
    }
    
    const teamListRes = await query.end();

    const teamList = teamListRes.list;

    let openidList = [];
    teamList.forEach(teamItem => {
      openidList = openidList.concat(teamItem.member_list.map(item => item.openid));
    });
    const memberInfoListRes = await db.collection('user').where({
      openid: $.in(openidList)
    }).get();
    const memberInfoList = memberInfoListRes.data;

    for (let i = 0; i < teamList.length; ++i) {
      // 整理朋友非朋友数据
      const { member_list: memberList } = teamList[i];
      for (let j = 0; j < memberList.length; ++j) {
        if (memberList[j].type !== 'friend') {
          const memberInfo = memberInfoList.find(item => item.openid === memberList[j].openid);
          memberList[j] = {
            ...memberInfo,
            ...memberList[j]
          };
        }
      }

      // 整理等待情况
      let currentMaleAmount = 0;
      let currentFemaleAmount = 0;
      memberList.forEach(item => {
        item.gender === 2 ? (++currentFemaleAmount) : (++currentMaleAmount);
      });

      const totalMaleAmount = Number(teamList[i].male_amount);
      const totalFemaleAmount = Number(teamList[i].female_amount);

      const needTotal = Math.max((totalMaleAmount + totalFemaleAmount) - (currentMaleAmount + currentFemaleAmount), 0);

      teamList[i].member_detail = {
        is_empty: currentMaleAmount <= 0 && currentFemaleAmount <= 0,
        is_full: needTotal === 0,
        current_male_amount: currentMaleAmount,
        current_female_amount: currentFemaleAmount,
        wait_for_male_amount: Math.max(Math.min(totalMaleAmount - currentMaleAmount, needTotal), 0),
        wait_for_female_amount: Math.max(Math.min(totalFemaleAmount - currentFemaleAmount, needTotal), 0)
      };  
    }

    return teamList;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}