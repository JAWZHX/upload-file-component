var wzhxuploadFileComponent = require('./uploadComponent');
var uploadComponent = document.querySelector('.upload-component');
// 生成上传组件模板
uploadComponent.innerHTML = wzhxuploadFileComponent.template;
// 初始化上传组件
wzhxuploadFileComponent.init();