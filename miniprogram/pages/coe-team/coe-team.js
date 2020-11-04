// miniprogram/pages/coe-team/coe-team.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomTitle: '123123'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  doSetData(e, key) {
    console.log(e.detail.value);
  }
})