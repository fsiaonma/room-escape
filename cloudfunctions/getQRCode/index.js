const cloud = require('wx-server-sdk');

// 初始化 cloud
cloud.init({
  // API 调用都保持和云函数当前所在环境一致
  env: cloud.DYNAMIC_CURRENT_ENV
});

exports.main = async (event, context) => {
  try {
    const {
      page,
      scene
    } = event;

    const wxacodeResult = await cloud.openapi.wxacode.getUnlimited({
      page,
      scene,
      width: 240
    });

    if (wxacodeResult.errCode !== 0) {
      return wxacodeResult;
    }
 
    // 上传到云存储
    const uploadResult = await cloud.uploadFile({
      cloudPath: `qr/${scene}.jpg`,
      fileContent: wxacodeResult.buffer
    });

    if (!uploadResult.fileID) {
      return uploadResult;
    }
 
    // 获取图片临时路径
    const getURLReault = await cloud.getTempFileURL({
      fileList: [ uploadResult.fileID ]
    });
    fileObj = getURLReault.fileList[0];
    fileObj.fromCache = false;
 
    return fileObj;
  } catch (err) {
    return err
  }
}