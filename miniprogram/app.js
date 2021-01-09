import utils from './utils/utils';

App({
  async onLaunch(options) {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        // env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        // 此处请填入环境 ID, 环境 ID 可打开云控制台查看
        // 如不填则使用默认环境（第一个创建的环境）
        env: 'room-escape-beta-1fhboek7f90829a', // 测试环境
        // env: 'room-escape-prod-3qdhj', // 生产环境
        traceUser: true,
      })
    }

    /**
      sysInfo: object,
      isIpx: boolean
      openGId: string,
      shop_list: array,
      openid: string,
      userInfo: object,
      extra_user_info: object
    */
    this.globalData = this.globalData ? this.globalData : {};
    this.globalData.sysInfo = wx.getSystemInfoSync();
    this.globalData.isIpx = this.globalData.sysInfo.model.indexOf('iPhone X') != -1;
  },

  onShow(options) {
    this.shareTicket = options.shareTicket;
  },

  async init() {
    // 用户授权
    if (!this.globalData.userInfo || Object.keys(this.globalData.userInfo).length <= 0) {
      // 授权
      wx.showLoading();
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
      wx.hideLoading();
      if (settingRes && settingRes.authSetting && settingRes.authSetting['scope.userInfo']) {
        // 用户信息
        wx.showLoading();
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
        wx.hideLoading();
        if (userRes && userRes.userInfo) {
          this.globalData.userInfo = userRes.userInfo;
        }
      }
    }

    // 用户登录
    if (!this.globalData.openid) {
      wx.showLoading();
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
      wx.hideLoading();
      if (loginRes && loginRes.result && loginRes.result.openid) {
        this.globalData.openid = loginRes.result.openid;
        this.globalData.extra_user_info = loginRes.result.user_info;
      }
    } else {
      wx.showLoading();
      const userRes = await new Promise(resolve => {
        wx.cloud.callFunction({
          name: 'getUser',
          data: {
            openid: this.globalData.openid
          },
          success: res => {
            resolve(res);
          },
          fail: err => {
            resolve(err);
          }
        });
      });
      wx.hideLoading();
      if (userRes && userRes.result) {
        this.globalData.extra_user_info = userRes.result;
      }
    }
  },

  async initShopList() {
    // 分享流量隔离
    this.globalData.openGId = null;
    this.globalData.shop_list = null;
    if (this.shareTicket) {
      wx.showLoading();
      const shareInfoRes = await new Promise(resolve => {
        wx.getShareInfo({
          shareTicket: this.shareTicket,
          success: (res) => {
            resolve(res);
          },
          fail: (err) => {
            resolve(err)
          }
        });
      });
      wx.hideLoading();

      if (shareInfoRes && shareInfoRes.cloudID) {
        wx.showLoading();
        const groupInfoRes = await new Promise(resolve => {
          wx.cloud.callFunction({
            name: 'getGroupInfo',
            data: {
              groupData: wx.cloud.CloudID(shareInfoRes.cloudID)
            },
            success(res) {
              resolve(res);
            },
            error(err) {
              resolve(err);
            }
          });
        });
        wx.hideLoading();

        if (groupInfoRes && groupInfoRes.result) {
          this.globalData.openGId = groupInfoRes.result.openGId;
          this.globalData.shop_list = groupInfoRes.result.shop_list;
        }
      }
    }
  },

  rpxToPx(rpx) {
    let ratio = 750 / this.globalData.sysInfo.screenWidth;
    return rpx / ratio;
  }
})
