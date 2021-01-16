export default {
  /**
   * 根据复合key提取对象字段内容
   * @param  {[object]} obj 对象
   * @param  {[string]} complexKey 复合键值
   */
  fetchObjValue(obj, complexKey) {
    if (!complexKey) {
      return;
    }

    const keys = complexKey.split('.');

    let value = obj;
    keys.forEach((key) => {
      if (!value) {
        return;
      }
      if (Object.prototype.toString.call(value) === '[object Array]') { // 处理数组
        value = value.map(item => this.fetchObjValue(item, key));
      } else {
        value = value[key];
      }
    });

    return value;
  },

  /**
   * 判断对象
   * @param {[type]} value
   */
  isObject(value) {
    return Object.prototype.toString.call(value) === '[object Object]';
  },

  /**
   * 判断是否空对象
   * @param {[type]} obj
   */
  isEmptyObject(obj) {
    return obj && Object.keys(obj).length <= 0;
  },

  /**
   * 合并对象，后者覆盖前者。
   */
  mergeObject(obj1, obj2) {
    let target;

    if (Object.prototype.toString.call(obj1) === '[object Object]') {
      target = JSON.parse(JSON.stringify(obj1));
    } else {
      target = {};
    }

    for (const key in obj2) {
      if (Object.prototype.toString.call(obj2[key]) === '[object Object]') {
        target[key] = this.mergeObject(target[key], obj2[key]);
      } else {
        target[key] = obj2[key];
      }
    }

    return target;
  },

  /**
   * 判断数据
   * @param {[type]} value
   */
  isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
  },

  /**
   * 日期时间 转换为 日期时间对象
   * @param value
   * @param timeFormat
   */
  datetimeToTimeObj(value, timeFormat) {
    const dateObj = new Date(value);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    const second = dateObj.getSeconds();
    if (timeFormat === 'datetime') {
      value = { year, month, day, hour, minute, second };
    } else if (timeFormat === 'date') {
      value = { year, month, day };
    } else if (timeFormat === 'time') {
      value = { hour, minute, second };
    }
    return value;
  },

  /**
   * 日期时间对象 转换为 日期时间
   * @param datatimeObj
   * @param timeFormat
   */
  timeObjToDatetime(datetimeObj, timeFormat) {
    if (!datetimeObj) {
      return;
    }

    const {
      year,
      month,
      day,
      hour,
      minute,
      second,
    } = datetimeObj;

    let value;
    if (timeFormat === 'datetime') {
      const dateObj = new Date();
      dateObj.setFullYear(year);
      dateObj.setMonth(month - 1);
      dateObj.setDate(day);
      dateObj.setHours(hour);
      dateObj.setMinutes(minute);
      dateObj.setSeconds(second);
      value = dateObj.getTime();
    } else if (timeFormat === 'date') {
      const dateObj = new Date();
      dateObj.setFullYear(year);
      dateObj.setMonth(month - 1);
      dateObj.setDate(day);
      value = dateObj.getTime();
    } else if (timeFormat === 'time') {
      const dateObj = new Date();
      dateObj.setHours(hour);
      dateObj.setMinutes(minute);
      dateObj.setSeconds(second);
      value = dateObj.getTime();
    }

    return value;
  },

  formatDateTime(datetime, timeFormat) {
    if (!datetime) { return; }

    const dateObj = new Date(datetime);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const day = dateObj.getDate();
    const hour = dateObj.getHours();
    const minute = dateObj.getMinutes();
    const second = dateObj.getSeconds();

    if (timeFormat === 'datetime') {
      return `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hour >= 10 ? hour : '0' + hour}:${minute >= 10 ? minute : '0' + minute}:${second >= 10 ? second : '0' + second}`
    } else if (timeFormat === 'date') {
      return `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`;
    } else if (timeFormat === 'time') {
      return `${hour >= 10 ? hour : '0' + hour}:${minute >= 10 ? minute : '0' + minute}:${second >= 10 ? second : '0' + second}`;
    }
  },

  /**
   * 对象深度复制
   * @param obj 复制的对象
   * @return Object 返回深度复制的对象
   * */
  deepCopy(obj) {
    // 对常见的“非”值，直接返回原来值
    if ([null, undefined, NaN, false].includes(obj)) return obj;
    if (typeof obj !== 'object' && typeof obj !== 'function') {
      // 原始类型直接返回
      return obj;
    }
    const o = Object.prototype.toString.call(obj) === '[object Array]' ? [] : {};
    for (const i in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, i)) {
        o[i] = typeof obj[i] === 'object' ? this.deepCopy(obj[i]) : obj[i];
      }
    }
    return o;
  },


  /**
   * 函数节流 时间间隔内执行函数，防止频繁调用
   * @param {Function} func 要执行的回调函数
   * @param {Number} wait 延时的时间
   * @param {Boolean} immediate 是否立即执行
   * @return null
   */
  throttle(func, wait = 500, immediate = true) {
    let flag;
    if (immediate) {
      if (!flag) {
        flag = true;
        // 如果是立即执行，则在wait毫秒内开始时执行
        typeof func === 'function' && func();
        setTimeout(() => {
          flag = false;
        }, wait);
      }
    } else {
      if (!flag) {
        flag = true;
        // 如果是非立即执行，则在wait毫秒内的结束处执行
        setTimeout(() => {
          flag = false;
          typeof func === 'function' && func();
        }, wait);
      }
    }
  },

  /**
   * 函数防抖 函数执行有一定的等待时间
   * @param {Function} func 要执行的回调函数
   * @param {Number} wait 延时的时间
   * @return null
   */
  debounce(func, wait = 500) {
    let timer = null;
    return function () {
      if (timer !== null) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        typeof func === 'function' && func();
      }, wait);
    };
  }
};
