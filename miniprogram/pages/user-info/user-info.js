import wxCharts from '../../utils/wxcharts/wxcharts.js';
import scriptTypesEnum from '../../common/enums/script-types';

const app = getApp();
Page({
  data: {
    openid: '',
    isMe: false,
    avatarUrl: './user-unlogin.png',
    nickName: '',
    genderIcon: '',
    wechat: '',
    city: '',
    createTeamList: [],
    joinTeamList: [],
    profile: {}
  },

  async onLoad(options) {
    await app.init();

    const openid = options.openid ? options.openid : app.globalData.openid

    if (openid) {
      this.setData({
        openid,
        isMe: app.globalData.openid === openid
      });
      wx.showLoading();
      wx.cloud.callFunction({
        name: 'getUserInfo',
        data: {
          openid
        },
        success: res => {
          const { result } = res;
          if (result) {
            this.setData({
              avatarUrl: result.avatarUrl,
              nickName: result.nickName,
              genderIcon: result.gender === 1 ? '/images/male.png' : result.gender === 2 ? '/images/female.png' : '',
              wechat: result.wechat,
              city: result.city,
              createTeamList: result.create_team_list,
              joinTeamList: result.join_team_list,
              profile: result.profile
            });
            this.renderRadar();
          }
          wx.hideLoading();
        },
        fail: err => {
          console.log(err);
          wx.hideLoading();
        }
      });
    }
  },

  onEditUserInfo() {
    wx.navigateTo({
      url: '../coe-user/coe-user'
    });
  },

  copyWechat() {
    wx.setClipboardData({
      data: this.data.wechat
    });
  },

  onTeamItemTap(event) {
    const { teamId } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `../team-info/team-info?scene=${teamId}`
    });
  },

  renderRadar() {
    let windowWidth = 320;
    try {
      const res = wx.getSystemInfoSync();
      windowWidth = res.windowWidth;
    } catch (e) {
      console.error('getSystemInfoSync failed!');
    }

    const scriptTypesProfile = {
      '0': 30,
      '1': 30,
      '2': 30,
      '3': 30,
      '4': 30,
    }
    if (this.data.profile && this.data.profile.script_types) {
      for (const key in this.data.profile.script_types) {
        scriptTypesProfile[key] += this.data.profile.script_types[key];
      }
    }

    const radarChart = new wxCharts({
      canvasId: 'radarCanvas',
      type: 'radar',
      categories: scriptTypesEnum.map(item => item.name),
      series: [{
        name: '类型偏向',
        color: '#712525',
        data: [
          scriptTypesProfile['0'],
          scriptTypesProfile['1'],
          scriptTypesProfile['2'],
          scriptTypesProfile['3'],
          scriptTypesProfile['4']
        ]
      }],
      width: windowWidth - app.rpxToPx(72),
      height: 200,
      extra: {
        radar: {
          max: 100,
          labelColor: '#712525',
          gridColor: '#9c9c9c'
        }
      }
    });
  }
})
