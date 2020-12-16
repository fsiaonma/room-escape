import scriptTypesEnum from '../../common/enums/script-types';

const app = getApp();

Page({
  data: {
    teamId: null,
    btnType: null,
    teamDocId: null,
    owner: null,
    scriptTypes: '',
    topic: '',
    shop: '',
    date: '',
    time: '',
    price: '',
    remark: '',
    people: '',
    itemBackground: '',
    memberList: [],
  },

  async onLoad(options) {
    await app.init();
    wx.showShareMenu();
    const { team_id: teamId } = options;
    this.setData({ teamId });
    this.getTeam(teamId);
  },

  onShareAppMessage() {
    return {
      title: `${this.data.topic} ${this.data.date} ${this.dataf.time}`,
      path: `/pages/team-info/team-info?team_id=${this.data.teamId}`
    };
  },

  copyWechat() {
    wx.setClipboardData({
      data: this.data.wechat
    });
  },

  getTeam(teamId) {
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'getTeam',
      data: {
        team_id: teamId
      },
      success: res => {
        const { result } = res;

        this.setData({
          teamDocId: result._id,
          owner: result.owner,
          btnType: (() => {
            if (result.member_list.length > 0) {
              if (result.owner === app.globalData.openid) {
                return 'edit';
              } else if (result.member_list.find(item => app.globalData && app.globalData.openid && item.openid === app.globalData.openid)) {
                return 'left';
              } else if (result.member_list.length < Number(result.male_amount) + Number(result.female_amount)) {
                return 'join';
              }
            }
          })(),
          topic: result.topic,
          scriptTypes: (() => {
            const scriptTypes = [];

            if (result.script_types && result.script_types.length > 0) {
              result.script_types.forEach(typeValue => {
                const enumItem = scriptTypesEnum.find(item => item.value === typeValue);
                scriptTypes.push(enumItem.name);
              });
            }

            return scriptTypes.join(',');
          })(),
          shop: result.shop,
          address: result.address,
          wechat: result.wechat,
          date: (() => {
            const date = new Date(result.datetime);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}-${month}-${day}`;
          })(),
          time: (() => {
            const date = new Date(result.datetime);
            const hours = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
            const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
            const seconds = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
            return `${hours}:${minutes}:${seconds}`;
          })(),
          price: result.price,
          remark: result.remark,
          memberList: (() => {
            const resList = [];

            const memberList = result.member_list;
            for (let i = 0; i < memberList.length; ++i) {
              resList.push(memberList[i]);
            }

            for (let i = 0; i < Number(result.male_amount) + Number(result.female_amount) - memberList.length; ++i) {
              resList.push({});
            }

            return resList;
          })()
        });

        wx.hideLoading();
      }
    });
  },

  onUserItemTap(event) {
    // const { openid } = event.currentTarget.dataset;
    // wx.redirectTo({
    //   url: `../user-info/user-info?openid=${openid}`
    // });
  },

  onEditTeam() {
    wx.redirectTo({
      url: `../coe-team/coe-team?team_id=${this.data.teamId}`
    });
  },

  async onJoinTeam() {
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'joinTeam',
      data: {
        team_doc_id: this.data.teamDocId
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '上车成功',
          icon: 'success',
          duration: 2000
        });
        this.onLoad({
          team_id: this.data.teamId
        });
      }
    });
  },

  async onLeftTeam() {
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'leftTeam',
      data: {
        team_doc_id: this.data.teamDocId
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '下车成功',
          icon: 'success',
          duration: 2000
        });
        this.onLoad({
          team_id: this.data.teamId
        });
      }
    });
  },

  gotoIndex() {
    wx.redirectTo({
      url: '../index/index'
    });
  }
})