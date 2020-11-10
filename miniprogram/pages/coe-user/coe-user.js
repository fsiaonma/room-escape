const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    error: '',

    wechatNo: '',
    tagList: [
      { name: '强T', value: 0 },
      { name: '怂T', value: 1 },
      { name: '气氛组', value: 2 },
      { name: '小白', value: 3 }
    ],

    formData: {
      wechatNo: '',
      tagList: []
    },

    rules: [{
      name: 'wechatNo',
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
    wx.cloud.callFunction({
      name: 'getUser',
      success: res => {
        const { result } = res;
        console.log(res);
        this.setData({
          wechatNo: result.wechat_no,
          tagList: (() => {
            const tagList = this.data.tagList;
            const values = result.tag_list;
            tagList.forEach(item => item.checked = false);
            for (var i = 0; i < tagList.length; ++i) {
              if (values.find(item => Number(item) === i)) {
                tagList[i].checked = true;
              }
            }
            return tagList;
          })(),
          formData: {
            wechatNo: result.wechat_no,
            tagList: result.tag_list
          }
        });
      }
    });
  },

  bindWeChangeNoChange(e) {
    this.setData({
      wechatNo: e.detail.value,
      [`formData.wechatNo`]: e.detail.value
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
        wx.cloud.callFunction({
          name: 'updateUser',
          data: {
            openid: app.globalData.openid,
            wechat_no: this.data.formData.wechatNo,
            tag_list: this.data.formData.tagList
          },
          success: res => {
            wx.redirectTo({
              url: '../index/index'
            });
          },
          fail: err => {
            console.error('更新用户失败', err)
          }
        });
      }
    });
  } 
})