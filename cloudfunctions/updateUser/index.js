const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const {
    wechat,
    tag_list: tagList
  } = event;

  const db = cloud.database();
  const wxContext = cloud.getWXContext();

  const updateData = {};
  if (wechat) {
    updateData.wechat = wechat;
  }

  return await db.collection('user').where({
    openid: wxContext.OPENID
  }).update({
    data: updateData
  });
}