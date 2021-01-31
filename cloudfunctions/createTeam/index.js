const uuid = require('uuid').v4;
const cloud = require('wx-server-sdk');

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    await cloud.openapi.security.msgSecCheck({
      content: JSON.stringify(event)
    });
  } catch (err) {
    console.log(err);
    return false;
  }
  
	const db = cloud.database();
  const wxContext = cloud.getWXContext();

  const {
    initial_male_amount: initialMaleAmount,
    initial_female_amount: initialFemaleAmount,
    team_type: teamType,
    wechat
  } = event;

  let baseMemberInfo = {};
  let leaderOpenId;
  let leaderNickName;
  let leaderGender;

  const memberList = [];

  if (teamType === '0') { // 亲自上车
    const userRes = await db.collection('user').where({
      openid: wxContext.OPENID
    }).limit(1).get();
    const userInfo = userRes.data[0];

    baseMemberInfo = {
      avatarUrl: userInfo.avatarUrl
    };
    leaderOpenId = wxContext.OPENID;
    leaderNickName = event.leader_nick_name ? event.leader_nick_name : userInfo.nickName;
    leaderGender = userInfo.gender;

    // 自己发车需要自己上车
    memberList.push({
      ...baseMemberInfo,
      openid: leaderOpenId,
      nickName: leaderNickName,
      gender: leaderGender
    });
  } else if (teamType === '1') { // 替人发车
    leaderOpenId = uuid().replace(/-/g, '');
    leaderNickName = event.leader_nick_name ? event.leader_nick_name : event.wechat;
  }

  if (initialMaleAmount > 0) {
    const maleMemberAmount = teamType === '0' && leaderGender === 1 ? initialMaleAmount - 1 : initialMaleAmount;
    for (let i = 0; i < maleMemberAmount; ++i) {
      memberList.push({
        ...baseMemberInfo,
        openid: uuid().replace(/-/g, ''),
        type: 'friend',
        nickName: `${leaderNickName} 的朋友`,
        gender: 1
      });
    }
  }

  if (initialFemaleAmount > 0) {
    const femaleMemberAmount = teamType === '0' && leaderGender === 2 ? initialFemaleAmount - 1 : initialFemaleAmount;
    for (let i = 0; i < femaleMemberAmount; ++i) {
      memberList.push({
        ...baseMemberInfo,
        openid: uuid().replace(/-/g, ''),
        type: 'friend',
        nickName: `${leaderNickName} 的朋友`,
        gender: 2
      });
    }
  }

 	await db.collection('team').add({
    data: {
      owner: wxContext.OPENID,
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
      leader_nick_name: leaderNickName,
      male_amount: event.male_amount,
      female_amount: event.female_amount,
      initial_male_amount: initialMaleAmount,
      initial_female_amount: initialFemaleAmount,
      script_types: event.script_types,
      member_list: memberList
    }
  });

  return true;
}