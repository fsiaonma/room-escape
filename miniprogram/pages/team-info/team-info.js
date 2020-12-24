import scriptTypesEnum from '../../common/enums/script-types';

import { wxml, style } from './postcard.js'

const app = getApp();

Page({
  data: {
    btnDisabled: false,

    teamId: null,
    btnType: null,
    teamDocId: null,
    owner: '',
    isOwner: null,
    scriptTypes: '',
    topic: '',
    shop: '',
    date: '',
    time: '',
    price: '',
    remark: '',
    memberDetail: '',
    memberList: [],

    showPostCard: false,
    wxQRCode: ''
  },

  async onLoad(options) {
    await app.init();
    wx.showShareMenu();
    const teamId = options.scene ? options.scene : null;
    if (teamId) {
      this.setData({ teamId });
      this.getTeam(teamId);
    }
  },

  onShareAppMessage() {
    const { memberDetail } = this.data;

    let memberDetailStr = '';
    memberDetailStr += memberDetail.current_male_amount > 0 ? memberDetail.current_male_amount + '男' : '';
    memberDetailStr += memberDetail.current_female_amount > 0 ? memberDetail.current_female_amount + '女' : '';
    memberDetailStr += memberDetail.is_full ? '（封车）' : '=';
    memberDetailStr += !memberDetail.is_full && memberDetail.wait_for_male_amount > 0 ? memberDetail.wait_for_male_amount + '男' : '';
    memberDetailStr += !memberDetail.is_full && memberDetail.wait_for_female_amount > 0 ? memberDetail.wait_for_female_amount + '女' : '';

    return {
      title: `【${memberDetailStr}】`,
      path: `/pages/team-info/team-info?scene=${this.data.teamId}`
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
          isOwner: result.owner === app.globalData.openid,
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
          memberDetail: result.member_detail,
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
    const {
      openid,
      type
    } = event.currentTarget.dataset;

    if (this.data.isOwner && type === 'friend') {
      wx.navigateTo({
        url: `../coe-member/coe-member?team_id=${this.data.teamId}&member_id=${openid}`
      });
    }
  },

  addMember() {
    if (this.data.isOwner) {
      wx.navigateTo({
        url: `../coe-member/coe-member?team_id=${this.data.teamId}`
      });
    }
  },

  removeMember(event) {
    const { openid: memberOpenid } = event.currentTarget.dataset;
    this.setData({ btnDisabled: true });
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'removeMember',
      data: {
        team_doc_id: this.data.teamDocId,
        openid: memberOpenid
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '踢下车成功',
          icon: 'success',
          duration: 2000
        });
        this.onLoad({
          scene: this.data.teamId
        });
        this.setData({ btnDisabled: false });
      },
      fail: err => {
        wx.showToast({
          title: '踢下车失败',
          icon: 'none',
          duration: 2000
        });
        console.error('踢下车失败', err);
        wx.hideLoading();
        this.setData({ btnDisabled: false });
      }
    });
  },

  onEditTeam() {
    wx.navigateTo({
      url: `../coe-team/coe-team?team_id=${this.data.teamId}`
    });
  },

  async onJoinTeam() {
    this.setData({ btnDisabled: true });
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
          scene: this.data.teamId
        });
        this.setData({ btnDisabled: false });
      },
      fail: err => {
        wx.showToast({
          title: '上车失败',
          icon: 'none',
          duration: 2000
        });
        console.error('上车失败', err);
        wx.hideLoading();
        this.setData({ btnDisabled: false });
      }
    });
  },

  async onLeftTeam() {
    this.setData({ btnDisabled: true });
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
          scene: this.data.teamId
        });
        this.setData({ btnDisabled: false });
      },
      fail: err => {
        wx.showToast({
          title: '下车失败',
          icon: 'none',
          duration: 2000
        });
        console.error('下车失败', err);
        wx.hideLoading();
        this.setData({ btnDisabled: false });
      }
    });
  },

  gotoIndex() {
    wx.redirectTo({
      url: '../index/index'
    });
  },

  lockTeam() {
    this.setData({ btnDisabled: true });
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'lockTeam',
      data: {
        team_id: this.data.teamId
      },
      success: res => {
        wx.hideLoading();
        wx.showToast({
          title: '封车成功',
          icon: 'success',
          duration: 2000
        });
        this.onLoad({
          scene: this.data.teamId
        });
        this.setData({ btnDisabled: false });
      },
      fail: err => {
        wx.showToast({
          title: '封车失败',
          icon: 'none',
          duration: 2000
        });
        console.error('封车失败', err);
        wx.hideLoading();
        this.setData({ btnDisabled: false });
      }
    });
  },

  async getPostCard() {
    const self = this;
    this.setData({
      showPostCard: true
    });
    this.setData({ btnDisabled: true });
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'getQRCode',
      data: {
        scene: this.data.teamId,
        page: 'pages/team-info/team-info'
      },
      success(res) {
        wx.hideLoading();
        self.setData({
          wxQRCode: res.result.tempFileURL
        });
        self.widget = self.selectComponent('.widget');
        self.widget.renderToCanvas({
          wxml: wxml({
            topic: self.data.topic,
            shop: self.data.shop,
            price: self.data.price,
            scriptTypes: self.data.scriptTypes,
            memberList: self.data.memberList,
            date: self.data.date,
            time: self.data.time,
            memberDetail: self.data.memberDetail,
            wxQRCode: res.result.tempFileURL
          }), 
          style
        });
        self.setData({ btnDisabled: false });
      }
    });    
  },

  downLoadPostCard() {
    const self = this;
    this.widget.canvasToTempFilePath().then(res => {
      wx.saveImageToPhotosAlbum({
        filePath: res.tempFilePath,
        success(res) {
          wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 2000
          });
          self.setData({
            showPostCard: false
          });
        }
      });
    })
  },

  hidePostcard() {
    this.setData({
      showPostCard: false,
      btnDisabled: false
    });
  }
})