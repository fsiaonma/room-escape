//index.js
const app = getApp()
Page({
  data: {
    avatarUrl: '',
    nickName: '',
    teamLoading: false,
    teamList: [],
    logged: false,
    takeSession: false,
    requestResult: ''
  },

  async onLoad() {
    await app.init();

    const { userInfo } = app.globalData;
    if (userInfo) {
      this.setData({
        avatarUrl: userInfo.avatarUrl,
        nickName: userInfo.nickName
      });
    }

    await this.loadTeamList();
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

        let dtoTeamList = [];
        if (teamList && teamList.length > 0) {
          dtoTeamList = teamList.map(item => {
            const memberList = item.member_list ? item.member_list : [];

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

            return {
              team_id: item._id,
              shop_name: item.shop_name,
              topic_name: item.topic_name,
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
              people: {
                current: memberList.length,
                need: item.need_member_amount,
                male_amount: maleAmount,
                female_amount: femaleAmount,
                wait_for_amount: Math.max(item.need_member_amount - maleAmount - femaleAmount, 0)
              },
              avatar_list: (() => {
                const result = [];
                for (let i = 0; i < memberList.length; ++i) {
                  const memberItem = memberList[i];
                  const memberAmount = 1 + Number(memberItem.male_friend_amount) + Number(memberItem.female_friend_amount);
                  result.push({
                    avatar: memberItem.avatarUrl,
                    member_amount: memberAmount > 1 ? memberAmount : ''
                  })
                }
                return result;
              })()
            }
          });
        }

        this.setData({
          teamList: dtoTeamList,
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
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      })
    }
  },

  async onAvatarTap() {
    wx.redirectTo({
      url: `../user-info/user-info?openid=${app.globalData.openid}`
    });
  },

  onCreateTeamClick() {
    wx.redirectTo({
      url: '../coe-team/coe-team'
    });
  },

  onShowTeam(event) {
    const { teamId } = event.currentTarget.dataset;
    wx.redirectTo({
      url: `../team-info/team-info?team_id=${teamId}`
    });
  }
})
