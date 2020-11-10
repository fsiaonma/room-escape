const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const db = cloud.database();
  const wxContext = cloud.getWXContext(); 
  return await db.collection('user').where({
    openid: wxContext.OPENID
  }).update({
    data: {
      wechat_no: event.wechat_no,
      tag_list: event.tag_list      
    }
  });
}