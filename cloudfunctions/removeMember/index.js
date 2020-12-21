const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  const db = cloud.database();
  const _ = db.command;

  const wxContext = cloud.getWXContext();

  if (!event.team_doc_id || !event.openid) {
    return;
  }

  const res = await db.collection('team').doc(event.team_doc_id).update({
    data: {
      member_list: _.pull({
        openid: _.eq(event.openid)
      })
    }
  });

  return res;
}