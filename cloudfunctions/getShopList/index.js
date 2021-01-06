// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const db = cloud.database();

    const shopListRes = await db.collection('shop').aggregate().end();
    const shopList = shopListRes.list;

    return shopList;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}