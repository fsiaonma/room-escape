const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
	const db = cloud.database();
  const _ = db.command

 	const res = await db.collection('team').where({
    date: _.gte(Date.now())
  }).get();

  return res.data;
}