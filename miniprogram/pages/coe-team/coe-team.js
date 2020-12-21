import scriptTypesEnum from '../../common/enums/script-types';

Page({
  data: {
    btnDisabled: false,
    error: '',

    teamId: '',
    teamDocId: '',

    topic: '',
    shop: '',
    address: '',
    date: '',
    time: '',
    wechat: '',
    price: '',
    remark: '',

    teamTypeLabel: '我是车主',
    teamTypeValue: '0',
    teamTypeEnums: [{
      label: '我是车主',
      value: '0'
    }, {
      label: '替人发车',
      value: '1'
    }],

    leaderNickName: '',

    leaderGenderLabel: '小哥哥',
    leaderGenderValue: 1,
    leaderGenderEnmus: [{
      label: '小哥哥',
      value: 1
    }, {
      label: '小姐姐',
      value: 2
    }],

    maleAmount: '',
    femaleAmount: '',
    initialMaleAmount: '',
    initialFeMaleAmount: '',
    scriptTypeItems: [],

    formData: {
      topic: '',
      shop: '',
      date: '',
      time: '',
      wechat: '',
      price: '',
      remark: '',
      teamTypeValue: '0',
      leaderNickName: '',
      leaderGenderValue: 1,
      maleAmount: '',
      femaleAmount: '',
      initialMaleAmount: '',
      initialFeMaleAmount: '',
      scriptTypes: []
    },

    rules: [{
      name: 'topic',
      rules: {
        required: false
      },
    }, {
      name: 'shop',
      rules: {
        required: false
      }
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
      name: 'wechat',
      rules: {
        required: true,
        message: '车主微信为必填项'
      },
    }, {
      name: 'price',
      rules: {
        required: false
      },
    }, {
      name: 'remark',
      rules: {
        required: false
      },
    }, {
      name: 'teamTypeValue',
      rules: {
        required: true
      },
    }, {
      name: 'leaderNickName',
      rules: {
        required: false
      },
    }, {
      name: 'leaderGenderValue',
      rules: {
        required: false
      },
    }, {
      name: 'maleAmount',
      rules: {
        required: true,
        message: '男玩家人数为必填项'
      },
    }, {
      name: 'femaleAmount',
      rules: {
        required: true,
        message: '女玩家人数为必填项'
      },
    }, {
      name: 'initialMaleAmount',
      rules: {
        required: false
      },
    }, {
      name: 'initialFeMaleAmount',
      rules: {
        required: false
      },
    }, {
      name: 'scriptTypes',
      rules: {
        required: false
      },
    }]
  },

  onLoad(options) {
    this.setData({
      scriptTypeItems: (() => {
        return scriptTypesEnum.map(item => {
          item.checked = false;
          return item;
        });
      })()
    });

    const { team_id: teamId } = options;
    if (teamId) {
      this.setData({ teamId });
      this.getTeam(teamId);
    }
  },

  bindTopicChange(e) {
    this.setData({
      topic: e.detail.value,
      [`formData.topic`]: e.detail.value
    });
  },

  bindShopTap(e) {
    wx.chooseLocation({
      success: (res) => {
        this.setData({
          shop: res.name,
          address: res.address,
          [`formData.shop`]: res.name
        });
      }
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

  bindWechatChange(e) {
    this.setData({
      wechat: e.detail.value,
      [`formData.wechat`]: e.detail.value
    });
  },

  bindPriceChange(e) {
    this.setData({
      price: e.detail.value,
      [`formData.price`]: e.detail.value
    });
  },

  bindRemarkChange(e) {
    this.setData({
      remark: e.detail.value,
      [`formData.remark`]: e.detail.value
    });
  },

  bindTeamTypeChange(e) {
    const index = e.detail.value;
    const teamTypeItem = this.data.teamTypeEnums[index];
    this.setData({
      teamTypeLabel: teamTypeItem.label,
      teamTypeValue: teamTypeItem.value,
      [`formData.teamTypeValue`]: teamTypeItem.value
    });
  },

  bindLeaderNickNameChange(e) {
    this.setData({
      leaderNickName: e.detail.value,
      [`formData.leaderNickName`]: e.detail.value
    });
  },

  bindLeaderGenderChange(e) {
    const index = e.detail.value;
    const leaderGenderIteam = this.data.leaderGenderEnmus[index];
    this.setData({
      leaderGenderLabel: leaderGenderIteam.label,
      leaderGenderValue: leaderGenderIteam.value,
      [`formData.leaderGenderValue`]: leaderGenderIteam.value
    });
  },

  bindMaleAmountChange(e) {
    this.setData({
      maleAmount: e.detail.value,
      [`formData.maleAmount`]: e.detail.value
    });
  },

  bindFemaleAmountChange(e) {
    this.setData({
      femaleAmount: e.detail.value,
      [`formData.femaleAmount`]: e.detail.value
    });
  },

  bindInitialMaleAmountChange(e) {
    this.setData({
      initialMaleAmount: e.detail.value,
      [`formData.initialMaleAmount`]: e.detail.value
    });
  },

  bindInitialFemaleAmountChange(e) {
    this.setData({
      initialFeMaleAmount: e.detail.value,
      [`formData.initialFeMaleAmount`]: e.detail.value
    });
  },

  bindScriptTypesChange(e) {
    const scriptTypeItems = this.data.scriptTypeItems;
    const values = e.detail.value;
    if (values && values.length > 0) {
      for (let i = 0; i < scriptTypeItems.length; ++i) {
        scriptTypeItems[i].checked = false;

        for (let j = 0; j < values.length; ++j) {
          if(scriptTypeItems[i].value == values[j]){
            scriptTypeItems[i].checked = true;
            break;
          }
        }
      }
    }

    this.setData({
      scriptTypeItems,
      [`formData.scriptTypes`]: e.detail.value
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
          topic: result.topic,
          [`formData.topic`]: result.topic,
          shop: result.shop,
          [`formData.shop`]: result.shop,
          address: result.address,
          [`formData.address`]: result.address,
          date: (() => {
            const date = new Date(result.datetime);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            return `${year}-${month}-${day}`;
          })(),
          [`formData.date`]: (() => {
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
          wechat: result.wechat,
          [`formData.wechat`]: result.wechat,
          [`formData.time`]: (() => {
            const date = new Date(result.datetime);
            const hours = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
            const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
            const seconds = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
            return `${hours}:${minutes}:${seconds}`;
          })(),
          price: result.price,
          [`formData.price`]: result.price,
          remark: result.remark,
          [`formData.remark`]: result.remark,
          teamTypeLabel: (() => {
            const teamItem = this.data.teamTypeEnums.find(tItem => tItem.value === result.team_type);
            return teamItem ? teamItem.label : '';
          })(),
          teamTypeValue: result.team_type,
          [`formData.teamTypeValue`]: result.team_type,
          leaderNickName: result.leader_nick_name,
          [`formData.leaderNickName`]: result.leader_nick_name,
          leaderGenderLabel: (() => {
            const leaderGenderItem = this.data.leaderGenderEnmus.find(tItem => tItem.value === result.leader_gender);
            return leaderGenderItem ? leaderGenderItem.label : '';
          })(),
          leaderGenderValue: result.leader_gender,
          [`formData.leaderGenderValue`]: result.leader_gender,
          maleAmount: result.male_amount,
          [`formData.maleAmount`]: result.male_amount,
          femaleAmount: result.female_amount,
          [`formData.femaleAmount`]: result.female_amount,
          initialMaleAmount: result.initial_male_amount,
          [`formData.initialMaleAmount`]: result.initial_male_amount,
          initialFeMaleAmount: result.initial_female_amount,
          [`formData.initialFeMaleAmount`]: result.initial_female_amount
        });


        const scriptTypeItems = this.data.scriptTypeItems;
        const values = result.script_types;
        if (values && values.length > 0) {
          for (let i = 0; i < scriptTypeItems.length; ++i) {
            scriptTypeItems[i].checked = false;
            for (let j = 0; j < values.length; ++j) {
              if(scriptTypeItems[i].value == values[j]){
                scriptTypeItems[i].checked = true;
                break;
              }
            }
          }
        }

        this.setData({
          scriptTypeItems: scriptTypeItems,
          [`formData.scriptTypes`]: values
        });

        wx.hideLoading();
      }
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
        this.setData({ btnDisabled: true });
        wx.showLoading();
        wx.cloud.callFunction({
          name: 'createTeam',
          data: {
            topic: this.data.formData.topic,
            shop: this.data.formData.shop,
            address: this.data.address,
            date: this.data.formData.date,
            time: this.data.formData.time,
            datetime: (() => {
              const dateStr = `${this.data.formData.date} ${this.data.formData.time}`;
              const datetime = dateStr.replace(/\-/g, "/") ;
              return new Date(datetime).getTime();
            })(),
            wechat: this.data.formData.wechat,
            price: this.data.formData.price,
            remark: this.data.formData.remark,
            team_type: this.data.formData.teamTypeValue,
            leader_nick_name: this.data.formData.leaderNickName,
            leader_gender: this.data.formData.leaderGenderValue,
            male_amount: this.data.formData.maleAmount ? this.data.formData.maleAmount : 0,
            female_amount: this.data.formData.femaleAmount ? this.data.formData.femaleAmount : 0,
            initial_male_amount: this.data.formData.initialMaleAmount ? this.data.formData.initialMaleAmount : 0,
            initial_female_amount: this.data.formData.initialFeMaleAmount ? this.data.formData.initialFeMaleAmount : 0, 
            script_types: this.data.formData.scriptTypes,
          },
          success: res => {
            wx.showToast({
              title: '创建成功',
              icon: 'success',
              duration: 2000
            });
            wx.redirectTo({
              url: '../index/index'
            });
            wx.hideLoading();
            this.setData({ btnDisabled: false });
          },
          fail: err => {
            wx.showToast({
              title: '创建失败',
              icon: 'none',
              duration: 2000
            });
            console.error('创建车队失败', err);
            wx.hideLoading();
            this.setData({ btnDisabled: false });
          }
        });
      }
    });
  },

  async onUpdateTeam() {
    this.selectComponent('#form').validate(async (valid, errors) => {
      if (!valid) {
        const firstError = Object.keys(errors)
        if (firstError.length) {
          this.setData({
            error: errors[firstError[0]].message
          })
        }
      } else {
        this.setData({ btnDisabled: true });
        wx.showLoading();
        wx.cloud.callFunction({
          name: 'updateTeam',
          data: {
            team_doc_id: this.data.teamDocId,
            topic: this.data.formData.topic,
            shop: this.data.formData.shop,
            address: this.data.address,
            date: this.data.formData.date,
            time: this.data.formData.time,
            datetime: (() => {
              const dateStr = `${this.data.formData.date} ${this.data.formData.time}`;
              const datetime = dateStr.replace(/\-/g, "/");
              return new Date(datetime).getTime()
            })(),
            wechat: this.data.formData.wechat,
            price: this.data.formData.price,
            remark: this.data.formData.remark,
            team_type: this.data.formData.teamTypeValue,
            leader_nick_name: this.data.formData.leaderNickName,
            leader_gender: this.data.formData.leaderGenderValue,
            male_amount: this.data.formData.maleAmount ? this.data.formData.maleAmount : 0,
            female_amount: this.data.formData.femaleAmount ? this.data.formData.femaleAmount : 0,
            initial_male_amount: this.data.formData.initialMaleAmount ? this.data.formData.initialMaleAmount : 0,
            initial_female_amount: this.data.formData.initialFeMaleAmount ? this.data.formData.initialFeMaleAmount : 0, 
            script_types: this.data.formData.scriptTypes
          },
          success: res => {
            wx.showToast({
              title: '更新成功',
              icon: 'success',
              duration: 2000
            });
            wx.redirectTo({
              url: '../index/index'
            });
            wx.hideLoading();
            this.setData({ btnDisabled: false });
          },
          fail: err => {
            wx.showToast({
              title: '更新失败',
              icon: 'none',
              duration: 2000
            });
            console.error('更新车队失败', err);
            wx.hideLoading();
            this.setData({ btnDisabled: false });
          }
        });
      }
    });
  },

  async onDestroyTeam() {
    wx.showLoading();
    wx.cloud.callFunction({
      name: 'destroyTeam',
      data: {
        team_doc_id: this.data.teamDocId,
      },
      success: res => {
        wx.showToast({
          title: '解散成功',
          icon: 'success',
          duration: 2000
        });
        wx.redirectTo({
          url: '../index/index'
        });
        wx.hideLoading();
      },
      fail: err => {
        wx.showToast({
          title: '解散失败',
          icon: 'none',
          duration: 2000
        });
        console.error('解散车队失败', err);
        wx.hideLoading();
      }
    });
  }
})