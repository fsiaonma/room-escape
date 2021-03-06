const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const { openid } = event;
  const db = cloud.database();
  const res = await db.collection('user').where({ openid }).limit(1).get();
  return res.data[0];
}