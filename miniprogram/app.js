//app.js
App({
  async onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'room-escape-beta-1fhboek7f90829a', // 测试环境
        env: 'room-escape-prod-3qdhj', // 生产环境
        traceUser: true,
      })
    }
  },

  async init() {
    this.globalData = {}

    wx.showLoading();

    // 授权
    const settingRes = await new Promise(resolve => {
      wx.getSetting({
        success: res => {
          resolve(res);
        },
        fail: err => {
          resolve(err);
        }
      });
    });
    if (!settingRes || !settingRes.authSetting || !settingRes.authSetting['scope.userInfo']) {
      wx.hideLoading();
      return;
    }

    // 用户信息
    const userRes = await new Promise(resolve => {
      wx.getUserInfo({
        success: res => {
          resolve(res);
        },
        fail: err => {
          resolve(err);
        }
      });
    });
    if (!userRes || !userRes.userInfo) {
      wx.hideLoading();
      return;
    }
    this.globalData.userInfo = userRes.userInfo;

    // 用户登录
    const loginRes = await new Promise(resolve => {
      wx.cloud.callFunction({
        name: 'login',
        data: {
          user_info: this.globalData.userInfo
        },
        success: res => {
          resolve(res);
        },
        fail: err => {
          resolve(err);
        }
      });
    });
    if (!loginRes || !loginRes.result || !loginRes.result.openid) {
      wx.hideLoading();
      return;
    }
    this.globalData.openid = loginRes.result.openid;

    wx.hideLoading();

    if (loginRes.result.is_new_user) {
      wx.redirectTo({
        url: '../coe-user/coe-user'
      });
    }
  }
})
