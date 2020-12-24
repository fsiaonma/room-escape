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
  },

  async onShow() {
    await this.loadTeamList();
  },

  onShareAppMessage() {
    return {
      title: `【拼团】最新车队列表`,
      path: '/pages/index/index'
    };
  },

  async onPullDownRefresh() {
    await this.loadTeamList();
    wx.stopPullDownRefresh();
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

        let resTeamList = [];
        if (teamList && teamList.length > 0) {
          const dtoTeamList = teamList.map(item => {
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

                  let friendAmount;
                  if (i === 0) {
                    friendAmount = 1;
                    for (let j = 0; j < memberList.length; ++j) {
                      const jMemberItem = memberList[j];
                      if (jMemberItem.type === 'friend') {
                        ++friendAmount;
                      }
                    }
                  }

                  if (memberItem.type !== 'friend') {
                    result.push({
                      avatar: memberItem.avatarUrl,
                      nick_name: memberItem.nickName,
                      member_amount: friendAmount > 1 ? friendAmount : null
                    });
                  }
                }

                return result;
              })()
            }
          });

          for (let i = 0; i < dtoTeamList.length; ++i) {
            const { date: teamDate } = dtoTeamList[i];

            if (!resTeamList.find(item => item.key === teamDate)) {
              resTeamList.push({
                key: teamDate,
                list: []
              })
            }

            const targetItem = resTeamList.find(item => item.key === teamDate);
            targetItem.list.push(dtoTeamList[i]);
          }
        }

        this.setData({
          teamList: resTeamList,
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
    wx.navigateTo({
      url: `../user-info/user-info?openid=${app.globalData.openid}`
    });
  },

  async onCreateTeamClick(e) {
    if (!this.data.logged) {
      this.setData({
        logged: true
      });
      await this.onLoad();
    } else {
      wx.navigateTo({
        url: '../coe-team/coe-team'
      });
    }
  },

  onTeamItemTap(event) {
    const { teamId } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `../team-info/team-info?scene=${teamId}`
    });
  }
})
