const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const db = cloud.database();
  const wxContext = cloud.getWXContext();

  const {
    initial_male_amount: initialMaleAmount,
    initial_female_amount: initialFemaleAmount,
    team_type: teamType,
    wechat
  } = event;

  let baseMemberInfo = {};
  let leaderNickName;
  let leaderGender;

  if (teamType === '0') { // 自己发车
    const userRes = await db.collection('user').where({
      openid: wxContext.OPENID
    }).limit(1).get();
    const userInfo = userRes.data[0];

    baseMemberInfo = {
      openid: wxContext.OPENID,
      avatarUrl: userInfo.avatarUrl
    };
    leaderNickName = userInfo.nickName;
    leaderGender = userInfo.gender;
  } else if (teamType === '1') { // 替人发车
    leaderNickName = event.leader_nick_name ? event.leader_nick_name : event.wechat;
    leaderGender = event.leader_gender ? event.leader_gender : 1;
  }

  const teamRes = await db.collection('team').where({
    _id: event.team_doc_id
  }).get();
  const teamInfo = teamRes.data[0];

  const { member_list: memberList } = teamInfo;
  const filterMemberList = memberList.filter(item => item.type !== 'friend');

  if (initialMaleAmount > 0) {
    const maleMemberAmount = leaderGender === 1 ? initialMaleAmount - 1 : initialMaleAmount;
    for (let i = 0; i < maleMemberAmount; ++i) {
      filterMemberList.push({
        ...baseMemberInfo,
        type: 'friend',
        nickName: `${leaderNickName} 朋友`,
        gender: 1
      });
    }
  }

  if (initialFemaleAmount > 0) {
    const femaleMemberAmount = leaderGender === 2 ? initialFemaleAmount - 1 : initialFemaleAmount;
    for (let i = 0; i < femaleMemberAmount; ++i) {
      filterMemberList.push({
        ...baseMemberInfo,
        type: 'friend',
        nickName: `${leaderNickName} 朋友`,
        gender: 2
      });
    }
  }

  return await db.collection('team').where({
    _id: event.team_doc_id
  }).update({
    data: {
      topic: event.topic,
      shop: event.shop,
      address: event.address,
      date: event.date,
      time: event.time,
      datetime: event.datetime ? event.datetime : new Date(`${event.date} ${event.time}`).getTime(),
      wechat: event.wechat,
      price: event.price,
      remark: event.remark,
      team_type: event.team_type,
      leader_gender: event.leader_gender,
      male_amount: event.male_amount,
      female_amount: event.female_amount,
      initial_male_amount: initialMaleAmount,
      initial_female_amount: initialFemaleAmount,
      script_types: event.script_types,
      member_list: filterMemberList
    }
  });
}