const app = getApp();

Page({
  data: {
    shopName: '',
    topicName: '',
    date: '',
    time: '',
    minPeopleAmount: 0,
    maxPeopleAmount: 0,
    wechatNo: ''
  },

  onLoad: function(options) {

  },

  bindShopChange(e) {
    this.setData({
      shopName: e.detail.value
    });
  },

  bindTopicChange(e) {
    this.setData({
      topicName: e.detail.value
    });
  },

  bindDateChange(e) {
    this.setData({
      date: e.detail.value
    });
  },

  bindTimeChange(e) {
    this.setData({
      time: e.detail.value
    });
  },

  bindMinPeopleAmountChange(e) {
    this.setData({
      minPeopleAmount: e.detail.value
    });
  },

  bindMaxPeopleAmountChange(e) {
    this.setData({
      maxPeopleAmount: e.detail.value
    });
  },

  async onCreateTeam() {
    const userInfoRes = await wx.getUserInfo();
    wx.cloud.callFunction({
      name: 'createTeam',
      data: {
        user_info: userInfoRes.userInfo,
        shop_name: this.data.shopName,
        topic_name: this.data.topicName,
        date: this.data.date,
        time: this.data.time,
        min_people_amount: this.data.minPeopleAmount,
        max_people_amount: this.data.maxPeopleAmount
      },
      success: res => {
        console.log('创建车队成功');
      },
      fail: err => {
        console.error('创建车队失败', err)
      }
    });
  }
})