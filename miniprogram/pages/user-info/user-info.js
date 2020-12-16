//index.js
const app = getApp()
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    nickName: ''
  },

  async onLoad(options) {
    const { openid } = options;
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'getUser',
      data: {
        openid
      },
      success: res => {
        const { result } = res;
        if (result) {
          this.setData({
            avatarUrl: result.avatarUrl,
            nickName: result.nickName
          });
        }
        wx.hideLoading();
      }
    });
  }
})
