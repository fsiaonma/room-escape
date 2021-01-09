const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    error: '',

    wechat: '',

    formData: {
      wechat: ''
    },

    rules: [{
      name: 'wechat',
      rules: {
        required: true,
        message: '微信号为必填项'
      },
    }]
  },

  onLoad(options) {
    this.getUser();
  },

  getUser() {
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'getUser',
      data: {
        openid: app.globalData.openid
      },
      success: res => {
        if (!res || !res.result) { return; }
        const { result } = res;
        this.setData({
          wechat: result.wechat,
          formData: {
            wechat: result.wechat
          }
        });
        wx.hideLoading();
      }
    });
  },

  bindWeChangeNoChange(e) {
    this.setData({
      wechat: e.detail.value,
      [`formData.wechat`]: e.detail.value
    });
  },

  async onSaveInfo(e) {
    this.selectComponent('#form').validate((valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      } else {
        wx.showLoading();
        wx.cloud.callFunction({
          name: 'updateUser',
          data: {
            openid: app.globalData.openid,
            wechat: this.data.formData.wechat
          },
          success: async res => {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
            await app.init(); // 强制刷新当前用户信息
            wx.navigateBack();
          },
          fail: err => {
            wx.hideLoading();
            wx.showToast({
              title: '保存失败',
              icon: 'none',
              duration: 2000
            });
            console.error('更新用户失败', err)
          }
        });
      }
    });
  } 
})