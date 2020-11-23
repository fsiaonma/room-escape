const app = getApp();

Page({
  data: {
    teamId: null,
    btnType: null,
    teamDocId: null,
    owner: null,
    shopName: '',
    topicName: '',
    date: '',
    time: '',
    needMemberAmount: '',
    memberList: []
  },

  onLoad: function (options) {
    wx.showShareMenu();
    const { team_id: teamId } = options;
    this.setData({ teamId });
    this.getTeam(teamId);
  },

  onShareAppMessage() {
    return {
      title: `${this.data.topicName} ${this.data.date} ${this.dataf.time}`,
      path: `/pages/team-info/team-info?team_id=${this.data.teamId}`
    };
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

        const memberList = result.member_list ? result.member_list : [];
        let maleAmount = 0;
        let femaleAmount = 0;
        for (let i = 0; i < memberList.length; ++i) {
          const {
            gender,
            male_friend_amount: maleFriendAmount,
            female_friend_amount: femaleFriendAmount
          } = memberList[i];

          if (gender === 1) {
            ++maleAmount;
          } else {
            ++femaleAmount;
          }
          if (maleFriendAmount) { maleAmount += Number(maleFriendAmount); }
          if (femaleFriendAmount) { femaleAmount += Number(femaleFriendAmount); }
        }

        this.setData({
          teamDocId: result._id,
          owner: result.owner,
          btnType: (() => {
            if (result.member_list.length > 0) {
              if (result.member_list.find(item => app.globalData && app.globalData.openid && item.openid === app.globalData.openid)) {
                  return 'left';
              } else {
                const currentMembersAmount = result.member_list.reduce((current, nextItem) => {
                  const femaleAmount = nextItem.female_friend_amount ? Number(nextItem.female_friend_amount) : 0;
                  const maleAmount = nextItem.male_friend_amount ? Number(nextItem.male_friend_amount) : 0;
                  return current + 1 + femaleAmount + maleAmount;
                }, 0);

                if (currentMembersAmount >= Number(result.need_member_amount)) {
                  return null
                } else {
                  return 'join';
                }
              }
            }
          })(),
          shopName: result.shop_name,
          topicName: result.topic_name,
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
          needMemberAmount: result.need_member_amount,
          memberList: result.member_list
        });

        wx.hideLoading();
      }
    });
  },

  onUserItemTap(event) {
    const { openid } = event.currentTarget.dataset;
    wx.redirectTo({
      url: `../user-info/user-info?openid=${openid}`
    });
  },

  async onJoinTeam() {
    wx.cloud.callFunction({
      name: 'joinTeam',
      data: {
        team_doc_id: this.data.teamDocId
      },
      success: res => {
        console.log('加入车队成功');
        this.onLoad({
          team_id: this.data.teamId
        });
      }
    });
  },

  async onLeftTeam() {
    wx.cloud.callFunction({
      name: 'leftTeam',
      data: {
        team_doc_id: this.data.teamDocId
      },
      success: res => {
        console.log('退出车队成功');
        this.onLoad({
          team_id: this.data.teamId
        });
      }
    });
  }
})