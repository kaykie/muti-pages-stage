/**
 * Created by wadeforever on 2017/5/5.
 */
export default class Util {
    static isUndefined(value) {
        return typeof value === 'undefined';
    }

    static isDefined(value) {
        return typeof value !== 'undefined';
    }

    static isObject(value) {
        // http://jsperf.com/isobject4
        return value !== null && typeof value === 'object';
    }

    static isString(value) {
        return typeof value === 'string';
    }

    static isNumber(value) {
        return typeof value === 'number';
    }

    static isDate(value) {
        return toString.call(value) === '[object Date]';
    }

    static isFunction(value) {
        return typeof value === 'function';
    }

    static isRegExp(value) {
        return toString.call(value) === '[object RegExp]';
    }

    static isBoolean(value) {
        return typeof value === 'boolean';
    }

    static isElement(node) {
        return !!(node &&
            (node.nodeName // we are a direct element
                ||
                (node.prop && node.attr && node.find))); // we have an on and find method part of jQuery API
    }

    static isArray = Array.isArray

    /**
     * 数字转字符串
     */
    static numToString(num) {
        if (Util.isNumber(num)) {
            return num + '';
        } else {
            return num;
        }
    }

    /*
     * 图片转为base64格式
     * file:
     * file.url 图片路径
     * file.raw.type 图片格式
     * callback 回调
     */
    static getImgBase64(file, callback) {
        let canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
        let img = new Image;
        img.crossOrigin = 'Anonymous';
        img.src = URL.createObjectURL(file.raw);
        img.onload = function () {
            let res = {
                imgW: 0,
                imgH: 0,
                dataURL: ""
            }
            canvas.width = this.width;
            canvas.height = this.height;
            res.imgW = img.width;
            res.imgH = img.height;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            res.dataURL = canvas.toDataURL("image/jpeg", 0.4);
            callback.call(this, res);
            canvas = null;
        };
    }

    /* 
     * 时间格式化
     */
    static formatDate(date, fmt) {
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds(),
            "q+": Math.floor((date.getMonth() + 3) / 3), //quarter
            "S": date.getMilliseconds()
        }
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length));
            }
        }
        return fmt;
    }

    /*
    * 图片截取
    */
    static imgClipHandle(location, url, datawrap) {
        let newImgSize = 100, //新图片大小
            canvas = document.createElement("canvas"),
            img = new Image();
        img.src = url;
        img.onload = function () {
            let imgw = location.width + 100,
                imgH = location.height + 100;
            let ctx = canvas.getContext("2d");
            console.log(location)
            canvas.width = newImgSize;
            canvas.height = newImgSize;
            // 避免图片变形
            if (location.width < location.height) {
                imgw = location.width + 100;
                imgH = location.height + 100 - (location.height - location.width);
                console.log(imgw + ":" + imgH)
            } else {
                imgw = location.width + 100 - (location.width - location.height);
                imgH = location.height + 100;
                console.log(imgw + ":" + imgH)
            }
            // 这种情况不存在，本身加了100px，无论如何图片截取部分都大于100px
            let differW = newImgSize - (location.width + 100);
            let differH = newImgSize - (location.height + 100);
            if (differW > 0) {
                imgw = location.width + 100 + differW;
            }
            if (differH > 0) {
                imgH = location.height + 100 + differH;
            }
            ctx.drawImage(
                img,
                location.x - 50,
                location.y - 50,
                imgw,
                imgH,
                0,
                0,
                newImgSize,
                newImgSize
            );
            document.getElementById(datawrap).appendChild(canvas);
        };
    }
}