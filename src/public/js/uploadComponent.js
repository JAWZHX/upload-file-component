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