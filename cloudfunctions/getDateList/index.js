// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext();

  const db = cloud.database();
  const _ = db.command;
  const $ = db.command.aggregate;

  const dateRes = await db.collection('team').aggregate().match({
    datetime: _.gte(Date.now())
  }).group({
    _id: null,
    dateList: $.addToSet('$date')
  }).end();

  let dateList = [];
  if (dateRes && dateRes.list && dateRes.list[0]) {
    dateList = dateRes.list[0].dateList;
    for (let i = 0; i < dateList.length; ++i) {
      for (let j = i; j < dateList.length; ++j) {
        if (dateList[i] > dateList[j]) {
          const temp = dateList[i];
          dateList[i] = dateList[j];
          dateList[j] = temp;
        }
      }
    }
  }

  return dateList;
}