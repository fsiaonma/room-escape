// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    const db = cloud.database();
    const _ = db.command;

    const { openGId } = event.groupData.data;

    const shopListRes = await db.collection('shop').aggregate().match({
      group_list: _.elemMatch(_.eq(openGId))
    }).end();

    return {
      openGId,
      shop_list: shopListRes && shopListRes.list ? shopListRes.list : null
    };
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}