// miniprogram/pages/coe-team/coe-team.js
Page({
  data: {
    shopList: [{
      name: '1221深度体验密室'
    }, {
      name: '关你鬼室'
    }, {
      name: '你敢脱吗'
    }],
    shopIndex: -1,

    topicList: [{
      name: '精神病怨',
    }, {
      name: '洗剪吹'
    }, {
      name: '监禁'
    }],
    topicIndex: -1,

    date: '',

    time: ''
  },

  onLoad: function(options) {
    
  },

  bindShopChange(e) {
    this.setData({
      shopIndex: e.detail.value
    });
  },

  bindTopicChange(e) {
    this.setData({
      topicIndex: e.detail.value
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
  }
})