Page({
  data: {
    error: '',

    shopName: '',
    topicName: '',
    date: '',
    time: '',
    needMemberAmount: 0,
    maleFriendAmount: 0,
    femaleFriendAmount: 0,

    formData: {
      shopName: '',
      topicName: '',
      date: '',
      time: '',
      needMemberAmount: 0
    },

    rules: [{
      name: 'shopName',
      rules: {
        required: true,
        message: '店名为必填项'
      },
    }, {
      name: 'topicName',
      rules: {
        required: true,
        message: '主题名为必填项'
      },
    }, {
      name: 'date',
      rules: {
        required: true,
        message: '日期为必填项'
      },
    }, {
      name: 'time',
      rules: {
        required: true,
        message: '场次为必填项'
      },
    }, {
      name: 'needMemberAmount',
      rules: {
        required: true,
        message: '发车人数为必填项'
      },
    }]
  },

  onLoad: function(options) {

  },

  bindShopChange(e) {
    this.setData({
      shopName: e.detail.value,
      [`formData.shopName`]: e.detail.value
    });
  },

  bindTopicChange(e) {
    this.setData({
      topicName: e.detail.value,
      [`formData.topicName`]: e.detail.value
    });
  },

  bindDateChange(e) {
    this.setData({
      date: e.detail.value,
      [`formData.date`]: e.detail.value
    });
  },

  bindTimeChange(e) {
    this.setData({
      time: e.detail.value,
      [`formData.time`]: e.detail.value
    });
  },

  bindNeedMemberAmountChange(e) {
    this.setData({
      needMemberAmount: e.detail.value,
      [`formData.needMemberAmount`]: e.detail.value
    });
  },

  bindMaleFriendAmountChange(e) {
    this.setData({
      maleFriendAmount: e.detail.value,
      [`formData.maleFriendAmount`]: e.detail.value
    });
  },

  bindFemaleFriendAmountChange(e) {
    this.setData({
      femaleFriendAmount: e.detail.value,
      [`formData.femaleFriendAmount`]: e.detail.value
    });
  },

  async onCreateTeam() {
    this.selectComponent('#form').validate(async (valid, errors) => {
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
          name: 'createTeam',
          data: {
            shop_name: this.data.shopName,
            topic_name: this.data.topicName,
            date: this.data.date,
            time: this.data.time,
            need_member_amount: this.data.needMemberAmount,
            male_friend_amount: this.data.maleFriendAmount ? this.data.maleFriendAmount : 0,
            female_friend_amount: this.data.femaleFriendAmount ? this.data.femaleFriendAmount : 0
          },
          success: res => {
            console.log('创建车队成功');
            wx.redirectTo({
              url: '../index/index'
            });
            wx.hideLoading();
          },
          fail: err => {
            console.error('创建车队失败', err);
            wx.hideLoading();
          }
        });
      }
    });
  }
})