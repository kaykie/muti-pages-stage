export default {
  required: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('不能为空'));
    }
  },
  requiredSelect: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('请选择'));
    }
  },
  checkName: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('不能为空'));
    }
    if (value.length < 2 || value.length > 16) {
      callback(new Error('只能输入2到16个字符'));
    } else {
      callback();
    }
  },
  checkValue: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('不能为空'));
    }
    if (!Number.isInteger(value * 1)) {
      callback(new Error('请输入数字值'));
    } else {
      if (value < 1 || value > 10) {
        callback(new Error('阀值必须介于1到10之间'));
      } else {
        callback();
      }
    }
  },
  range: (rule, value, callback) => {
    if (!value) {
      return callback(new Error('不能为空'));
    }
    if (!Number.isInteger(value * 1)) {
      callback(new Error('请输入数字值'));
    } else {
      if (value < 1 || value > 480) {
        callback(new Error('介于1到480之间'));
      } else {
        callback();
      }
    }
  }
}
;
