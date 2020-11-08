const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
	const db = cloud.database();
  const $ = db.command.aggregate;

 	await db.collection('team').add({
    // data 字段表示需新增的 JSON 数据
    data: {
      owner: event.open_id,
      shop_name: event.shop_name,
      topic_name: event.topic_name,
      date: new Date(`${event.date} ${event.time}`).getTime(),
      min_people_amount: event.min_people_amount,
      max_people_amount: event.max_people_amount,
      people_list: [{
      	open_id: event.user_info
      }]
    }
  });

  return true;
}