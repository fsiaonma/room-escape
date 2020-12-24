// miniprogram/pages/coe-member/coe-member.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnDisabled: false,

    teamId: null,
    memberId: null,

    memberNickName: '',

    memberGenderLabel: '小哥哥',
    memberGenderValue: 1,
    memberGenderEnmus: [{
      label: '小哥哥',
      value: 1
    }, {
      label: '小姐姐',
      value: 2
    }, {
      label: '未知',
      value: 3
    }],

    formData: {
      memberNickName: '',
      memberGenderValue: 1
    },

    rules: [{
      name: 'memberNickName',
      rules: {
        required: true,
        message: '队友昵称必填'
      }
    }, {
      name: 'memberGenderValue',
      rules: {
        required: true,
        message: '性别必选'
      }
    }]
  },

  async onLoad(options) {
    const {
      team_id: teamId,
      member_id: memberId
    } = options;

    if (teamId) {
      this.setData({ teamId });
    }

    if (memberId) {
      this.setData({ memberId });
    }

    if (teamId && memberId) {
      await this.getMemberInfo();
    }
  },

  async getMemberInfo() {
    this.setData({ btnDisabled: true });
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'getMember',
      data: {
        team_id: this.data.teamId,
        member_id: this.data.memberId
      },
      success: res => {
        if (res.result) {
          const memberGenderItem = this.data.memberGenderEnmus.find(item => item.value === res.result.gender);
          this.setData({
            memberNickName: res.result.nickName,
            [`formData.memberNickName`]: res.result.nickName,
            memberGenderLabel: memberGenderItem ? memberGenderItem.label : '未知',
            memberGenderValue: memberGenderItem ? memberGenderItem.value : 3,
            [`formData.memberGenderValue`]: memberGenderItem ? memberGenderItem.value : 3
          });
        }
        wx.hideLoading();
        this.setData({ btnDisabled: false });
      },
      fail: err => {
        wx.showToast({
          title: '获取信息失败',
          icon: 'none',
          duration: 2000
        });
        wx.hideLoading();
        this.setData({ btnDisabled: false });
      }
    });
  },

  bindMemberNickNameChange(e) {
    this.setData({
      memberNickName: e.detail.value,
      [`formData.memberNickName`]: e.detail.value
    });
  },

  bindMemberGenderChange(e) {
    const index = e.detail.value;
    const memberGenderItem = this.data.memberGenderEnmus[index];
    this.setData({
      memberGenderLabel: memberGenderItem.label,
      memberGenderValue: memberGenderItem.value,
      [`formData.memberGenderValue`]: memberGenderItem.value
    });
  },

  onCreateMember() {
    this.selectComponent('#form').validate(async (valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          wx.showToast({
            title: `添加失败：${errors[firstError[0]].message}`,
            icon: 'none',
            duration: 2000
          });
        }
      } else {
        this.setData({ btnDisabled: true });
        wx.showLoading();
        wx.cloud.callFunction({
          name: 'addMember',
          data: {
            team_id: this.data.teamId,
            member_nick_name: this.data.formData.memberNickName,
            member_gender: this.data.formData.memberGenderValue,
          },
          success: res => {
            wx.showToast({
              title: '添加成功',
              icon: 'success',
              duration: 2000
            });
            wx.hideLoading();
            this.setData({ btnDisabled: false });
            wx.navigateBack();
          },
          fail: err => {
            wx.showToast({
              title: '添加失败',
              icon: 'none',
              duration: 2000
            });
            console.error('添加队员失败', err);
            wx.hideLoading();
            this.setData({ btnDisabled: false });
          }
        });
      }
    });
  },

  onUpdateMember() {
    this.selectComponent('#form').validate(async (valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          wx.showToast({
            title: `更新失败：${errors[firstError[0]].message}`,
            icon: 'none',
            duration: 2000
          });
        }
      } else {
        this.setData({ btnDisabled: true });
        wx.showLoading();
        wx.cloud.callFunction({
          name: 'updateMember',
          data: {
            team_id: this.data.teamId,
            member_id: this.data.memberId,
            member_nick_name: this.data.formData.memberNickName,
            member_gender: this.data.formData.memberGenderValue,
          },
          success: res => {
            wx.showToast({
              title: '更新成功',
              icon: 'success',
              duration: 2000
            });
            wx.hideLoading();
            this.setData({ btnDisabled: false });
            wx.navigateBack();
          },
          fail: err => {
            wx.showToast({
              title: '更新失败',
              icon: 'none',
              duration: 2000
            });
            console.error('添加队员失败', err);
            wx.hideLoading();
            this.setData({ btnDisabled: false });
          }
        });
      }
    });
  }
})