const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
	const db = cloud.database();
  const $ = db.command.aggregate;
  const wxContext = cloud.getWXContext();
 	await db.collection('team').add({
    // data 字段表示需新增的 JSON 数据
    data: {
      owner: wxContext.OPENID,
      shop_name: event.shop_name,
      topic_name: event.topic_name,
      date: event.date,
      time: event.time,
      datetime: new Date(`${event.date} ${event.time}`).getTime(),
      need_member_amount: event.need_member_amount,
      member_list: [{
        openid: wxContext.OPENID,
        male_friend_amount: event.male_friend_amount,
        female_friend_amount: event.female_friend_amount
      }]
    }
  });

  return true;
}