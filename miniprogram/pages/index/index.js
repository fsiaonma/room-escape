import scriptTypesEnum from '../../common/enums/script-types';
import utils from '../../utils/utils';
import { CityList } from '../../common/pca.js';

const app = getApp()
Page({
  data: {
    loaded: false,
    logged: false,

    avatarUrl: '',
    nickName: '',

    shop: '',
    shopEnumIndex: 0,
    shopEnums: [],

    date: '',
    dateEnumIndex: 0,
    dateEnums: [],

    codes: [],
    city: '广州',
    citylist: CityList,

    currentDate: '',

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

    await this.initShopList();
    await this.initDateList();

    const shopId = options && options.scene ? options.scene : null;
    this.setData({
      shopEnumIndex: (() => {
        let shopEnumIndex = 0;
        for (let i = 0; i < this.data.shopEnums.length; ++i) {
          if (this.data.shopEnums[i]._id === shopId) {
            shopEnumIndex = i;
            break;
          }
        }
        return shopEnumIndex;
      })(),
      shop: (() => {
        let shop = this.data.shopEnums[0].name;
        const targetShopItem = this.data.shopEnums.find(item => item._id === shopId);
        if (targetShopItem) {
          shop = targetShopItem.name;
        }
        return shop;
      })()
    });

    this.setData({ loaded: true });

    await this.loadTeamList();
  },

  async onShow(options) {
    if (this.data.loaded) {
      await this.initShopList();
      await this.initDateList();
      await this.loadTeamList();
    }
  },

  onShareAppMessage() {
    let title = '【剧本杀拼团】车队列表';
    let path = '/pages/index/index';
    let imageUrl = 'https://726f-room-escape-prod-3qdhj-1303996393.tcb.qcloud.la/share_images/all.png?sign=9ca46e25e21e6b0c72d2cfecfa4daf51&t=1609951429';

    const shopItem = this.data.shopEnums.find(item => item.name === this.data.shop);
    if (shopItem && shopItem.name !== '所有店铺') {
      title = `【${shopItem.name}】车队列表`
      path = `/pages/index/index?scene=${shopItem._id}`;
      imageUrl = shopItem.share_image;
    }

    return {
      title,
      path,
      imageUrl
    }
  },

  async onPullDownRefresh() {
    await this.loadTeamList();
    wx.stopPullDownRefresh();
  },

  onCitySelect(e) {
    this.setData({
      codes: e.detail.code,
      city: e.detail.value
    })
  },

  async initShopList() {
    await app.initShopList();

    let shopEnums = [];
    if (app.globalData.shop_list && app.globalData.shop_list.length > 0) {
      shopEnums = app.globalData.shop_list;
    } else {
      shopEnums = await this.getShopList();
    }
    
    shopEnums.forEach(item => {
      item.label = item.name;
      if (item.team_amount && item.team_amount > 0) {
        item.label = `${item.name} - ${item.team_amount}车`
      }
    });

    this.setData({ shopEnums });
  },

  async getShopList() {
    return new Promise(reslove => {
      wx.cloud.callFunction({
        name: 'getShopList',
        success: res => {
          const { result } = res;
          const shopEnums = [];
          shopEnums.push({
            _id: 'all',
            name: '所有店铺'
          });
          if (result && result.length > 0) {
            for (let i = 0; i < result.length; ++i) {
              shopEnums.push(result[i]);
            }
          }
          reslove(shopEnums);
        }
      });
    });
  },

  bindShopChange(e) {
    const index = e.detail.value;
    const shopItem = this.data.shopEnums[index];
    this.setData({
      shop: shopItem.name,
      shopEnumIndex: index
    });
    this.loadTeamList();
  },

  async initDateList() {
    return new Promise(reslove => {
      wx.cloud.callFunction({
        name: 'getDateList',
        success: res => {
          const { result } = res;
          const dateEnums = [ '所有时间' ];
          if (result && result.length > 0) {
            for (let i = 0; i < result.length; ++i) {
              dateEnums.push(result[i]);
            }
          }
          this.setData({
            date: dateEnums[0],
            dateEnumIndex: 0,
            dateEnums
          });
          reslove(true);
        }
      });
    });
  },

  bindDateChange(e) {
    const index = e.detail.value;
    const dateItem = this.data.dateEnums[index];
    this.setData({
      date: dateItem,
      dateEnumIndex: index
    });
    this.loadTeamList();
  },

  async loadTeamList() {
    this.setData({
      teamLoading: true
    });

    const queryData = {};
    if (this.data.shop !== '所有店铺') {
      queryData.shop = this.data.shop;
    }
    if (this.data.date !== '所有时间') {
      queryData.date = this.data.date;
    }

    wx.cloud.callFunction({
      name: 'getTeamList',
      data: queryData,
      success: res => {
        const teamList = res.result;

        let dtoTeamList = [];
        if (teamList && teamList.length > 0) {
          dtoTeamList = teamList.map(item => {
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
              date: utils.formatDateTime(item.datetime, 'date'),
              time: utils.formatDateTime(item.datetime, 'time'),
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
                    avatar: ownerMember.avatarUrl ? ownerMember.avatarUrl : (ownerMember.gender === 2 ? './asserts/female.png' : './asserts/male.png'),
                    nick_name: ownerMember.nickName,
                    member_amount: friendAmount > 1 ? friendAmount : null
                  });
                } else { // 替人发车
                  if (memberList[0]) {
                    result.push({
                      openid: memberList[0].openid,
                      avatar: './asserts/friend-avatar.png',
                      nick_name: item.leader_nick_name ? item.leader_nick_name : memberList[0].nickName, // TODO：过渡之后可以把这里兼容逻辑去掉
                      member_amount: friendAmount > 1 ? (item.leader_nick_name ? friendAmount - 1 : friendAmount) : null // TODO：过渡之后可以把这里兼容逻辑去掉
                    });
                  }
                }

                // 处理其他成员
                for (let i = 0; i < memberList.length; ++i) {
                  const memberItem = memberList[i];
                  if (memberItem.type !== 'friend' && !result.find(item => item.openid === memberItem.openid)) {
                    result.push({
                      openid: memberItem.openid,
                      avatar: memberItem.avatarUrl ? memberItem.avatarUrl : (memberItem.gender === 2 ? './asserts/female.png' : './asserts/male.png'),
                      nick_name: memberItem.nickName
                    });
                  }
                }

                return result;
              })()
            }
          });

          // for (let i = 0; i < dtoTeamList.length; ++i) {
          //   const { date: teamDate } = dtoTeamList[i];

          //   if (!resTeamList.find(item => item.key === teamDate)) {
          //     resTeamList.push({
          //       key: teamDate,
          //       list: []
          //     })
          //   }

          //   const targetItem = resTeamList.find(item => item.key === teamDate);
          //   targetItem.list.push(dtoTeamList[i]);
          // }
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
