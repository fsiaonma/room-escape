const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    error: '',

    wechat: '',
    tagList: [
      { name: '情感', value: '0' },
      { name: '恐怖', value: '1' },
      { name: '硬核', value: '2' },
      { name: '机制', value: '3' },
      { name: '欢乐', value: '4' },
      { name: '喝酒', value: '5' }
    ],

    formData: {
      wechat: '',
      tagList: []
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
          tagList: (() => {
            const tagList = this.data.tagList;
            const values = result.tag_list;
            tagList.forEach(item => item.checked = false);
            for (var i = 0; i < tagList.length; ++i) {
              if (values && values.find(item => Number(item) === i)) {
                tagList[i].checked = true;
              }
            }
            return tagList;
          })(),
          formData: {
            wechat: result.wechat,
            tagList: result.tag_list
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

  checkboxChange: function (e) {
    const tagList = this.data.tagList;
    const values = e.detail.value;
    tagList.forEach(item => item.checked = false);
    for (var i = 0; i < tagList.length; ++i) {
      if (values.find(item => Number(item) === i)) {
        tagList[i].checked = true;
      }
    }
    this.setData({
      tagList: tagList,
      [`formData.tagList`]: e.detail.value
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
            wechat: this.data.formData.wechat,
            tag_list: this.data.formData.tagList,
            user_info: app.globalData.userInfo
          },
          success: res => {
            wx.hideLoading();
            wx.showToast({
              title: '保存成功',
              icon: 'success',
              duration: 2000
            });
            wx.switchTab({
              url: '../index/index'
            });
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