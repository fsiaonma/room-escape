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
              console.log(res);
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
        console.log(res);
        this.setData({
          teamList: res.result.team_list
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
  }
})
