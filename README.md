# 上传文件组件
> 前端关键：FormData、XHR

> 后端关键：Koa2、Koa-static、Koa-router、busboy、controller模块的实现

# 界面概览
## 初始化状态
![初始化状态](https://i.imgur.com/rrHq906.png)
## 选择文件状态
![选择文件状态](https://i.imgur.com/Npq2XPA.png)
## 上传完成状态
![上传完成状态](https://i.imgur.com/pzKC3dm.png)

# 前端关键代码 (前期没配webpack与babel，所以没用ES6，本来想发个npm包才配的，ε=(´ο｀*)))唉算了)
## 关键JavaScript代码（index.js）
```javascript
var wzhxUploadFileComponent = {
  template: `<div class="upload">
  <div class="upload-container">
    <button id="upload-btn">上传文件</button>
    <div class="clear"></div>
    <input type="file" name="file-upload" id="file-upload" multiple style="display:none;">
    <div class="tip-box">
      <span class="iconfont icon-select-file"></span>
      <p>请点击选择文件</p>
    </div>
    <div class="file-box">

    </div>
    <div class="success-box">
      <span>ヽ(✿ﾟ▽ﾟ)ノ上传成功啦！！！</span><br>
      <button>继续上传</button>
    </div>
    <div class="line"></div>
    <div id="progress">
      <div class="progress-bg">
        <div class="progress-active" data-percent="0%"></div>
      </div>
    </div>
  </div>
</div>`,
  init: function init() {
    // 初始化fileList
    var fileList = [];
    // 获取上传元素
    var uploadEl = document.getElementById('file-upload');
    // 获取上传按钮
    var uploadBtn = document.getElementById('upload-btn');
    // 获取触发选择文件的元素
    var selectFileEl = document.querySelector('.tip-box');
    // 获取文件盒子容器file-box
    var fileBoxEl = document.querySelector('.file-box');
    // 获取进度条元素
    var progressEl = document.querySelector('.progress-active');
    // 获取成功提示元素
    var successBoxEl = document.querySelector('.success-box');
    // 触发继续上传的按钮元素
    var continueUploadBtn = successBoxEl.querySelector('button');

    // 监听继续上传按钮事件
    continueUploadBtn.addEventListener('click', function (event) {
      // 隐藏成功提示框
      successBoxEl.style.display = 'none';
      // 显示选择文件筐
      selectFileEl.style.display = 'block';
      // progressEl (UI变化===>归零)
      progressEl.style.width = 0;
      progressEl.setAttribute('data-percent', '0%');
    }, false);

    // 文件显示图片映射
    var imgMap = {
      pdf: { icon: 'icon-pdf', color: 'red' },
      jpeg: { icon: 'icon-jpg', color: '#D4237A' },
      json: { icon: 'icon-json', color: '#26E8ED' },
      plain: { icon: 'icon-txt', color: '#78AFF3' },
      png: { icon: 'icon-png', color: '#1E7345' },
      file: { icon: 'icon-file', color: '#1AFA29' },
      gif: { icon: 'icon-gif', color: '#25C28F' }
    }

    // 构造 file
    function createFileEl(fileTypeOfImg, fileName, iconColor, index) {
      var fileEl = document.createElement('div');
      fileEl.className = 'file';
      var fileImg = document.createElement('span');
      fileImg.classList.add('file-img');
      fileImg.classList.add('iconfont');
      fileImg.classList.add(fileTypeOfImg);
      fileImg.style.color = iconColor;
      var deleteBtn = document.createElement('span');
      deleteBtn.classList.add('iconfont');
      deleteBtn.classList.add('icon-delete');
      fileImg.appendChild(deleteBtn);
      var fileNameEl = document.createElement('span');
      fileNameEl.className = 'file-name';
      fileNameEl.innerText = fileName;
      fileEl.appendChild(fileImg);
      fileEl.appendChild(fileNameEl);
      fileEl.setAttribute('data-name', fileName);
      // 将 fileEl 添加到 file-box
      fileBoxEl.appendChild(fileEl);
    }

    // 监听 selectFileEl 的点击事件
    selectFileEl.addEventListener('click', function (event) {
      // 触发 uploadEl 的 点击事件
      uploadEl.click();
    }, false);

    // 监听 uploadEl 的 change 事件
    uploadEl.addEventListener('change', function (event) {
      fileList = uploadEl.files;
      // 显示 file-box
      fileBoxEl.style.display = "block";
      // 隐藏 selectFileEl
      selectFileEl.style.display = "none";
      // 循环添加 fileEl
      for (var i = 0; i < fileList.length; i++) {
        var fileName = fileList[i].name;
        var fileType = fileList[i].type.split('/')[1];
        var fileTypeOfImg = imgMap['file']['icon'];
        var iconColor = imgMap['file']['color'];
        if (Object.keys(imgMap).indexOf(fileType) !== -1) {
          fileTypeOfImg = imgMap[fileType]['icon'];
          iconColor = imgMap[fileType]['color'];
        }

        createFileEl(fileTypeOfImg, fileName, iconColor, i);
      }
    }, false);

    // 监听 uploadBtn 的点击事件
    uploadBtn.addEventListener('click', function (event) {
      // 获取 formData
      var formData = new FormData();
      // formData.append('字段名', 'value', '文件名') 添加上传内容
      for (var i = 0; i < fileList.length; i++) {
        formData.append('file' + i, fileList[i], fileList[i].name);
      }
      // (load)回调监听
      function loadListener(event) {
        // 清空 uploadEl
        uploadEl.value = "";
        // 清空fileList
        fileList = [];
        // 清空 fileBoxEl 并 隐藏
        fileBoxEl.innerHTML = "";
        fileBoxEl.style.display = 'none';
        // 成功提示
        successBoxEl.style.display = 'block';
      }
      // (progress)回调监听
      function progressListener(event) {
        if (event.lengthComputable) {
          var percentComplete = Math.round(event.loaded / event.total * 100) + '%';
          // progressEl (UI变化)
          progressEl.style.width = percentComplete;
          progressEl.setAttribute('data-percent', percentComplete);
        }
      }
      // (abort)回调监听
      function abortListener(event) {
        console.log('abort');
        console.log(event);
      }
      // (error) 回调监听
      function errorListener(event) {
        console.log('error');
        console.log(event);
      }
      // 使用 XHR 进行文件上传
      var XHR = new XMLHttpRequest();
      XHR.upload.addEventListener('load', loadListener, false);
      XHR.upload.addEventListener('progress', progressListener, false);
      XHR.upload.addEventListener('abort', abortListener, false);
      XHR.upload.addEventListener('error', errorListener, false);
      XHR.open('post', '/uploadFile', true);
      XHR.send(formData);
    }, false)

    // 使用事件委托处理删除事件
    fileBoxEl.onclick = function (event) {
      if (Array.prototype.slice.call(event.target.classList).indexOf('icon-delete') !== -1) {
        var childNode = (event.target.parentNode.parentNode);
        var name = childNode.getAttribute('data-name');
        this.removeChild(childNode);
        fileList = Array.prototype.slice.call(fileList);
        for (var i = 0; i < fileList.length; i++) {
          if (fileList[i]['name'] === name) {
            fileList.splice(parseInt(i), 1)
          }
        }
      }
    }
  }
}

module.exports = wzhxUploadFileComponent;
```
## css样式
```css
* {
  padding: 0;
  margin: 0;
}
.clear {
  clear: both;
  height: 0;
  line-height: 0;
  font-size: 0;
}
.upload {
  background-color: #3E66BE;
  padding: 65px 70px;
}
.upload-container {
  background-color: #FFFFFF;
  border-radius: 8px;
  padding: 20px 30px;
}
#upload-btn {
  float: right;
  padding: 5px;
  border-radius: 4px;
  background-color: #5587F8;
  border: 1px solid #5587F8;
  color: white;
  cursor: pointer;
  box-shadow: 1px 8px 10px #CDD8ED;
}
.tip-box {
  border: 1px dashed #5072C1;
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 25px;
  text-align: center;
  cursor: pointer;
  color: #5072C1;
}
.line {
  height: 10px;
  margin: 0 -28px;
  box-shadow: 0 6px 10px #E4E9F6;
}
#progress {
  padding: 30px 0 10px 0;
}
.progress-bg {
  height: 2px;
  background-color: #E5E7EB;
}

.progress-active {
  width: 0;
  height: 2px;
  background-color: #3C65BD;
  position: relative;
}

.progress-active::after {
  display: block;
  content: attr(data-percent);
  position: absolute;
  right: -20px;
}
.file-box {
  border: 1px dashed #5072C1;
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 25px;
  max-height: 250px;
  overflow-y: auto;
  display: none;
}
.file-box .file {
  width: 90px;
  height: 75px;
  display: inline-block;
  vertical-align: bottom;
  position: relative;
  text-align: center;
  margin-bottom: 15px;
}
.file-box .file .file-img {
  font-size: 50px;
  color: red;
  position: absolute;
  top: 0;
  bottom: 20px;
  left: 0;
  right: 0;
}
.file-box .file .file-img .icon-delete {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: black;
  font-size: 0;
  cursor: pointer;
}
.file-box .file .file-img:hover .icon-delete{
  font-size: 20px;
}
.file-box .file .file-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 12px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.success-box {
  border: 1px dashed #5072C1;
  margin-top: 30px;
  margin-bottom: 30px;
  padding: 25px;
  color: #5072C1;
  text-align: center;
  display: none;
}
.success-box button {
  padding: 5px;
  background-color: #5587F8;
  border: 1px solid #5587f8;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  margin-top: 10px;
}
```

# 后端关键代码
## controller模块的实现
```javascript
const _ = require('lodash');
const fs = require('fs');
const path = require('path');

/**
 * 映射该(d)文件夹下的文件为模块
 * @param d String 文件目录
 */
const mapDir = d => {
  const tree = {};

  // 获取当前所有文件夹下的所有文件夹和文件
  const [dirs, files] = _(fs.readdirSync(d)).partition(p => fs.statSync(path.join(d, p)).isDirectory());

  // 映射文件夹(递归映射子文件夹下的文件)
  dirs.forEach(dir => {
    tree[dir] = mapDir(path.join(d, dir));
  });

  // 映射文件
  files.forEach(file => {
    if (path.extname(file) === '.js') {
      tree[path.basename(file, '.js')] = require(path.join(d, file));
    }
  });

  return tree;
}

// 默认导出当前文件夹下的文件映射
module.exports = mapDir(path.join(__dirname));
```
## 上传文件controller实现
```javascript
const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');

function upload(ctx) {
  const req = ctx.req;
  const busboy = new Busboy({ headers: req.headers });

  let data = {
    code: 0,
    msg: ''
  };

  return new Promise((resolve, reject) => {
    // 监听文件解析事件
    busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      data.msg = '上传文件成功';
      let fileName = Math.random().toString(16).substring(2) + '.' + filename;
      let extnameArr = filename.split('.');
      let extname = extnameArr[extnameArr.length - 1];
      let uploadFilePath = path.resolve(__dirname, '../../public/upload', extname);
      
      if (!fs.existsSync(uploadFilePath)) {
        fs.mkdirSync(uploadFilePath);
      }
      let saveTo = path.join(uploadFilePath, fileName);
      console.log('File [' + fieldname + ']: filename: ' + filename);

      // 将文件保存到指定的路径
      file.pipe(fs.createWriteStream(saveTo));

      file.on('data', function(data) {
          console.log('File [' + fieldname + '] got ' + data.length + ' bytes');
      });
      // 监听文件写入结束事件
      file.on('end', function() {
        console.log('File [' + fieldname + '] Finished');
      })
    });

    // 解析结束事件
    busboy.on('finish', function () {
      console.log('文件上传结束');
      resolve(data);
    });

    // 解析错误事件
    busboy.on('error', function (err) {
      console.log('文件上传出错');
      data.code = 1;
      data.msg = '文件上传失败';
      reject(data);
    });

    req.pipe(busboy);
  });
}

module.exports = async (ctx, next) => {
  console.log('上传文件接口');
  try {
    ctx.body = await upload(ctx);
  } catch (error) {
    console.log('upload函数报错')
  }
  next();
}
```