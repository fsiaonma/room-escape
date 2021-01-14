const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const { openid } = event;

    const db = cloud.database();
    const _ = db.command;
    
    const userRes = await db.collection('user').where({ openid }).limit(1).get();
    const userData = userRes.data[0];

    const teamListRes = await db.collection('team').aggregate().match(
      _.or([{
        owner: _.eq(openid)
      }, {
        member_list: _.elemMatch({
          openid: _.eq(openid)
        })
      }])
    ).sort({
      datetime: 1
    }).skip(0).limit(35).end();

    console.log(openid, teamListRes)

    if (teamListRes && teamListRes.list && teamListRes.list.length > 0) {
      const teamList = teamListRes.list;

      const createTeamList = [];
      const joinTeamList = [];
      const scriptTypesProfile = {
        '0': 0,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0
      };

      // 分派车队
      teamList.forEach(item => {
        if (item.owner === openid) {
          createTeamList.push(item);
        } else if (item.member_list.find(memberItem => memberItem.openid === openid)) {
          joinTeamList.push(item);
        }

        if (item.script_types && item.script_types.length > 0) {
          console.log(item.script_types);
          item.script_types.forEach(typeItem => {
            scriptTypesProfile[typeItem] = scriptTypesProfile[typeItem] !== undefined ? scriptTypesProfile[typeItem] + 2 : '';
          });
        }
      });

      userData.create_team_list = createTeamList;
      userData.join_team_list = joinTeamList;
      userData.profile = {
        script_types: scriptTypesProfile
      };
    }

    return userData;
  } catch(e) {
    return {
      success: false,
      detail: e.message
    }
  }
  
}