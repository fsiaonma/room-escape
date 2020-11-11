//index.js
const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    teamList: [],
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  async onLoad() {
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              this.setData({
                avatarUrl: res.userInfo.avatarUrl,
                userInfo: res.userInfo
              });
            }
          })
        } else {
          // 调用云函数
          wx.cloud.callFunction({
            name: 'login',
            data: {},
            success: res => {
              console.log('[云函数] [login] user openid: ', res.result.openid)
              app.globalData.openid = res.result.openid
            },
            fail: err => {
              console.error('[云函数] [login] 调用失败', err)
            }
          });
        }
      }
    });

    await this.loadTeamList();
  },

  async loadTeamList() {
    wx.cloud.callFunction({
      name: 'getTeamList',
      data: {},
      success: res => {
        const teamList = res.result;

        console.log(teamList);

        let dtoTeamList = [];
        if (teamList && teamList.length > 0) {
          dtoTeamList = teamList.map(item => {
            return {
              shop_name: item.shop_name,
              topic_name: item.topic_name,
              people: {
                current: item.people_list ? item.people_list.length : 0,
                min: item.min_people_amount,
                max: item.max_people_amount
              },
              date: (() => {
                const date = new Date(item.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                const hours = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
                const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
                const seconds = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
              })()
            }
          });
        }

        console.log(dtoTeamList);

        this.setData({
          teamList: dtoTeamList
        });
      },
      fail: err => {
        console.error('[云函数] [getTeamList] 调用失败', err)
      }
    });
  },

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onCreateTeamClick() {
    wx.redirectTo({
      url: '../coe-team/coe-team'
    });
  },

  onShowTeam() {
    console.log(123123123);
  }
})
