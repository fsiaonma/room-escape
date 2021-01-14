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
    const _ = db.command;

    const shopListRes = await db.collection('shop').aggregate().limit(200).end();
    let shopList = shopListRes.list;

    shopList.forEach(item => {
      item.team_amount = 0;
    });

    // 获取车队列表
    const teamListRes = await db.collection('team').aggregate().match({
      datetime: _.gte(Date.now()),
      shop: _.in(shopList.map(item => item.name))
    }).limit(200).end();
    if (teamListRes && teamListRes.list && teamListRes.list.length > 0) {
      for (let i = 0; i < teamListRes.list.length; ++i) {
        const { shop: teamShop } = teamListRes.list[i];
        for (let j = 0; j < shopList.length; ++j) {
          if (teamShop === shopList[j].name) {
            ++shopList[j].team_amount;
          }
        }
      }
    }

    // 商家排序
    for (let i = 0; i < shopList.length; ++i) {
      for (let j = i; j < shopList.length; ++j) {
        if (shopList[i].team_amount < shopList[j].team_amount) {
          const temp = shopList[i];
          shopList[i] = shopList[j];
          shopList[j] = temp;
        }
      }
    }

    return shopList;
  } catch (e) {
    return {
      success: false,
      detail: e.message
    }
  }
}