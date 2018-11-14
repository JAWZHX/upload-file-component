const Busboy = require('busboy');
const path = require('path');
const fs = require('fs');

function upload(ctx) {
  const req = ctx.req;
  const res = ctx.res;
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