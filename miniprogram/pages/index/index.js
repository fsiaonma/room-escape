import scriptTypesEnum from '../../common/enums/script-types';

const app = getApp()
Page({
  data: {
    logged: false,
    avatarUrl: '',
    nickName: '',
    teamLoading: false,
    teamList: [],
    takeSession: false,
    requestResult: ''
  },

  async onLoad(options) {
    await app.init();

    wx.showShareMenu({
      withShareTicket: true
    });

    const { userInfo } = app.globalData;
    if (userInfo) {
      this.setData({
        logged: true,
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
    }
  },

  async onShow(options) {
    await this.loadTeamList();
  },

  onShareAppMessage() {
    return {
      title: `【拼团】最新车队列表`,
      path: '/pages/index/index'
    };
  },

  async onPullDownRefresh() {
    await this.loadTeamList();
    wx.stopPullDownRefresh();
  },

  async loadTeamList() {
    this.setData({
      teamLoading: true
    });

    wx.cloud.callFunction({
      name: 'getTeamList',
      data: {},
      success: res => {
        const teamList = res.result;

        let resTeamList = [];
        if (teamList && teamList.length > 0) {
          const dtoTeamList = teamList.map(item => {
            return {
              team_id: item._id,
              owner: item.owner,
              shop: item.shop,
              topic: item.topic,
              script_types: (() => {
                const scriptTypeList = [];

                if (item.script_types && item.script_types.length > 0) {
                  item.script_types.forEach(typeValue => {
                    const enumItem = scriptTypesEnum.find(item => item.value === typeValue);
                    if (enumItem) {
                      scriptTypeList.push(enumItem.name);
                    }
                  });
                }

                return scriptTypeList.join(',');
              })(),
              address: item.address,
              date: (() => {
                const date = new Date(item.datetime);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;
                const day = date.getDate();
                return `${year}-${month}-${day}`;
              })(),
              time: (() => {
                const date = new Date(item.datetime);
                const hours = date.getHours() >= 10 ? date.getHours() : `0${date.getHours()}`;
                const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
                const seconds = date.getSeconds() >= 10 ? date.getSeconds() : `0${date.getSeconds()}`;
                return `${hours}:${minutes}:${seconds}`;
              })(),
              price: item.price,
              remark: item.remark,
              member_detail: item.member_detail,
              member_list: (() => {
                const result = [];

                const memberList = item.member_list ? item.member_list : [];

                let friendAmount = 1;
                for (let i = 0; i < memberList.length; ++i) {
                  const jMemberItem = memberList[i];
                  if (jMemberItem.type === 'friend') {
                    ++friendAmount;
                  }
                }

                // 处理车主朋友逻辑
                const ownerMember = memberList.find(mItem => mItem.openid === item.owner);
                if (ownerMember) { // 亲自上车
                  result.push({
                    openid: ownerMember.openid,
                    avatar: ownerMember.avatarUrl,
                    nick_name: ownerMember.nickName,
                    member_amount: friendAmount > 1 ? friendAmount : null
                  });
                } else { // 替人发车
                  if (memberList[0]) {
                    result.push({
                      openid: memberList[0].openid,
                      nick_name: item.leader_nick_name ? item.leader_nick_name : memberList[0].nickName, // TODO：过渡之后可以把这里兼容逻辑去掉
                      member_amount: friendAmount > 1 ? (item.leader_nick_name ? friendAmount - 1 : friendAmount) : null // TODO：过渡之后可以把这里兼容逻辑去掉
                    });
                  }
                }

                for (let i = 0; i < memberList.length; ++i) {
                  const memberItem = memberList[i];
                  if (memberItem.type !== 'friend' && !result.find(item => item.openid === memberItem.openid)) {
                    result.push({
                      openid: memberItem.openid,
                      avatar: memberItem.avatarUrl,
                      nick_name: memberItem.nickName
                    });
                  }
                }

                return result;
              })()
            }
          });

          for (let i = 0; i < dtoTeamList.length; ++i) {
            const { date: teamDate } = dtoTeamList[i];

            if (!resTeamList.find(item => item.key === teamDate)) {
              resTeamList.push({
                key: teamDate,
                list: []
              })
            }

            const targetItem = resTeamList.find(item => item.key === teamDate);
            targetItem.list.push(dtoTeamList[i]);
          }
        }

        this.setData({
          teamList: resTeamList,
          teamLoading: false
        });
      },
      fail: err => {
        console.error('[云函数] [getTeamList] 调用失败', err);
        this.setData({
          teamLoading: false
        });
      }
    });
  },

  async onGetUserInfo(e) {
    if (!this.data.logged) {
      this.setData({
        logged: true
      });
      await this.onLoad();
    }
  },

  async onAvatarTap() {
    wx.navigateTo({
      url: `../user-info/user-info?openid=${app.globalData.openid}`
    });
  },

  async onCreateTeamClick(e) {
    if (!this.data.logged) {
      this.setData({
        logged: true
      });
      await this.onLoad();
    } else {
      wx.navigateTo({
        url: '../coe-team/coe-team'
      });
    }
  },

  onTeamItemTap(event) {
    const { teamId } = event.currentTarget.dataset;
    wx.navigateTo({
      url: `../team-info/team-info?scene=${teamId}`
    });
  }
})
