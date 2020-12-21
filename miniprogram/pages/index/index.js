import scriptTypesEnum from '../../common/enums/script-types';

const app = getApp()
Page({
  data: {
    logged: false,
    avatarUrl: '',
    nickName: '',
    teamLoading: false,
    teamList: [],
    takeSession: false,
    requestResult: ''
  },

  async onLoad(options) {
    await app.init();

    wx.showShareMenu();

    const { userInfo } = app.globalData;
    if (userInfo) {
      this.setData({
        logged: true,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
    }

    await this.loadTeamList();
  },

  async onPullDownRefresh() {
    await this.loadTeamList();
  },

  async loadTeamList() {
    this.setData({
      teamLoading: true
    });

    wx.cloud.callFunction({
      name: 'getTeamList',
      data: {},
      success: res => {
        const teamList = res.result;

        let dtoTeamList = [];
        if (teamList && teamList.length > 0) {
          dtoTeamList = teamList.map(item => {
            return {
              team_id: item._id,
              owner: item.owner,
              shop: item.shop,
              topic: item.topic,
              script_types: (() => {
                const scriptTypeList = [];

                if (item.script_types && item.script_types.length > 0) {
                  item.script_types.forEach(typeValue => {
                    const enumItem = scriptTypesEnum.find(item => item.value === typeValue);
                    if (enumItem) {
                      scriptTypeList.push(enumItem.name);
                    }
                  });
                }

                return scriptTypeList.join(',');
              })(),
              address: item.address,
              date: (() => {
                const date = new Date(item.datetime);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}-${month}-${day}`;
              })(),
              time: (() => {
                const date = new Date(item.datetime);
                const hours = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
                const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
                const seconds = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
                return `${hours}:${minutes}:${seconds}`;
              })(),
              price: item.price,
              remark: item.remark,
              member_detail: item.member_detail,
              member_list: (() => {
                const result = [];

                const memberList = item.member_list ? item.member_list : [];
                for (let i = 0; i < memberList.length; ++i) {
                  const memberItem = memberList[i];

                  let memberAmount = 1;
                  for (let j = 0; j < memberList.length; ++j) {
                    const jMemberItem = memberList[j];
                    if (memberItem.type !== 'friend' && jMemberItem.type === 'friend' && (jMemberItem.openid === memberItem.openid || jMemberItem.nickName === memberItem.nickName)) {
                      ++memberAmount; 
                    }
                  }

                  if (memberItem.type !== 'friend') {
                    result.push({
                      avatar: memberItem.avatarUrl,
                      nick_name: memberItem.nickName,
                      member_amount: memberAmount > 1 ? memberAmount : null
                    });
                  }
                }

                return result;
              })()
            }
          });
        }

        this.setData({
          teamList: dtoTeamList,
          teamLoading: false
        });
      },
      fail: err => {
        console.error('[云函数] [getTeamList] 调用失败', err);
        this.setData({
          teamLoading: false
        });
      }
    });
  },

  async onGetUserInfo(e) {
    if (!this.data.logged) {
      this.setData({
        logged: true
      });
      await this.onLoad();
    }
  },

  async onAvatarTap() {
    wx.redirectTo({
      url: '../coe-user/coe-user'
    });
  },

  async onCreateTeamClick(e) {
    if (!this.data.logged) {
      this.setData({
        logged: true
      });
      await this.onLoad();
    } else {
      wx.redirectTo({
        url: '../coe-team/coe-team'
      });
    }
  },

  onTeamItemTap(event) {
    const { teamId } = event.currentTarget.dataset;
    wx.redirectTo({
      url: `../team-info/team-info?scene=${teamId}`
    });
  }
})
