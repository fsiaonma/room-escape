const app = getApp();
const { rpxToPx } = app;

const wxml = (obj = {}) => {
  return `
    <view class="container">
      <image src="https://726f-room-escape-beta-1fhboek7f90829a-1303996393.tcb.qcloud.la/qr/eeeeeeeeeee.jpg?sign=5777d0d86bab88955a08c7ab0b66e7ff&t=1608317592" class="banner"></image>
      <view class="baseInfoItem">
        <text class="itemTopic">《${obj.topic ? obj.topic : '待定'}》</text>
        <text class="itemType">类型：${obj.scriptTypes ? obj.scriptTypes : '待定'}</text>
        <text class="itemTime">时间：${obj.date} ${obj.time}</text>
        <text class="itemMember">人数：${(() => {
          let str = '';
          str += obj.memberDetail.is_empty ? '（空车）' : '';
          str += obj.memberDetail.current_male_amount > 0 ? obj.memberDetail.current_male_amount + '男' : '';
          str += obj.memberDetail.current_female_amount > 0 ? obj.memberDetail.current_female_amount + '女' : '';
          str += obj.memberDetail.is_full ? '（封车）' : ' = ';
          str += !obj.memberDetail.is_full && obj.memberDetail.wait_for_male_amount > 0 ? obj.memberDetail.wait_for_male_amount + '男' : '';
          str += !obj.memberDetail.is_full && obj.memberDetail.wait_for_female_amount > 0 ? obj.memberDetail.wait_for_female_amount + '女' : '';
          return str;
        })()}</text>
        <view class="memberList">
          <text class="memberTitle">成员：</text>
        </view>
      </view>
      <view class="qrCodeItem">
        <image src="${obj.wxQRCode}" class="qrCodeImage"></image>
      </view>
      <view class="footer">
        <text class="itemPrice">价格：${obj.price} / 位</text>
        <text class="itemShop">店铺：${obj.shop}</text>
      </view>
    </view>
  `;
};

const style = {
  container: {
    marginTop: rpxToPx(50),
    marginLeft: rpxToPx(750 / 2 - 300),
    paddingBottom: rpxToPx(30),
    width: rpxToPx(600),
    backgroundColor: '#fff',
  },

  banner: {
    width: rpxToPx(600),
    height: rpxToPx(300)
  },

  baseInfoItem: {
    wdith: rpxToPx(200),
    height: rpxToPx(200),
    marginBottom: rpxToPx(50),
    paddingLeft: rpxToPx(20),
    paddingRight: rpxToPx(20),
    paddingTop: rpxToPx(40),
    paddingBottom: rpxToPx(30)
  },

  itemTopic: {
    wdith: rpxToPx(200),
    height: rpxToPx(70),
    marginLeft: rpxToPx(15),
    fontSize: rpxToPx(40),
    fontWeight: rpxToPx(500)
  },

  itemType: {
    marginTop: rpxToPx(20),
    wdith: rpxToPx(200),
    height: rpxToPx(60),
    marginLeft: rpxToPx(15),
    marginLeft: rpxToPx(15),
  },

  itemTime: {
    wdith: rpxToPx(200),
    height: rpxToPx(60),
    marginLeft: rpxToPx(15),
    marginLeft: rpxToPx(15),
  },

  itemMember: {
    wdith: rpxToPx(200),
    height: rpxToPx(60),
    marginLeft: rpxToPx(15),
    marginLeft: rpxToPx(15),
  },

  memberList: {
    wdith: rpxToPx(200),
    height: rpxToPx(200),
    flexDirection: 'row'
  },

  memberTitle: {
    wdith: rpxToPx(200),
    height: rpxToPx(70),
    marginLeft: rpxToPx(15),
    fontSize: rpxToPx(36)
  },

  merberAvatar: {
    wdith: rpxToPx(70),
    height: rpxToPx(70),
  },

  qrCodeItem: {
    width: rpxToPx(600),
    height: rpxToPx(200),
    alignItems: 'right',
  },

  qrCodeImage: {
    width: rpxToPx(180),
    height: rpxToPx(180),
    marginTop: rpxToPx(30),
    marginRight: rpxToPx(30)
  },

  footer: {
    wdith: rpxToPx(200),
    height: rpxToPx(60),
    marginTop: rpxToPx(50),
    paddingLeft: rpxToPx(15),
  },

  itemPrice: {
    wdith: rpxToPx(200),
    height: rpxToPx(30),
    marginLeft: rpxToPx(15),
    fontSize: rpxToPx(20)
  },

  itemShop: {
    wdith: rpxToPx(200),
    height: rpxToPx(30),
    marginLeft: rpxToPx(15),
    fontSize: rpxToPx(20),
  }
}


module.exports.wxml = wxml;
module.exports.style = style;