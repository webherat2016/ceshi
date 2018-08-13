const express = require("express"),
  bodyParser = require("body-parser"),
  nodemailer = require("nodemailer"),
  smtpTransport = require("nodemailer-smtp-transport"),
  URL = require("url"),
  path = require('path'),
  fs = require('fs'),
  https = require('https')

// 根据项目的路径导入生成的证书文件
const privateKey = fs.readFileSync(path.join(__dirname, './ssl/ssl.key'), 'utf8')
const certificate = fs.readFileSync(path.join(__dirname, './ssl/ssl.crt'), 'utf8')
const credentials = {
  key: privateKey,
  cert: certificate,
}

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// 开启一个 SMTP 连接池
const transport = nodemailer.createTransport(
  smtpTransport({
    host: "smtp.qq.com", // 主机
    secure: true, // 使用 SSL
    secureConnection: true, // 使用 SSL
    port: 465, // SMTP 端口
    auth: {
      user: "google404@qq.com", // 账号
      pass: "iuvxxrepweupeaad" // 授权码
    }
  })
);

app.all("*", function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

var isSame = "";
app.post("/leavaWord", (req, res) => {
  const req_host = URL.parse(req.headers.referer);
  if (
    req.body.username &&
    (req.body.tel || req.body.email) &&
    (req.body.course || req.body.project || req.body.con || req.body.qq || req.body.age || req.body.addr)
  ) {
    if (req.body.username !== isSame) {
      // 设置邮件内容
      var temp_before =
        'This email comes from <span style="color:green;font-size:25px;">';
      var temp_middle = '<span style="color:red;font-size:25px;">';
      var temp_after =
        '</span><br/>客服请及时联系咨询人员<br/>----------------------------------<br/><img src="http://www.zhiyou100.com/img/logo.png"> 请勿回复！';
      var html;
      var flags = parseInt(req.body.flags);
      switch (flags) {
        case 1:
          html = `${temp_before}实习生</span></br>姓名：
                    ${req.body.username}<br/>电话：
                    ${temp_middle + req.body.tel}</span><br/>孩子年龄：${temp_middle +
            req.body.age}</span><br/>客服请及时联系咨询人员<br/>----------------------------------<br/>米德教育，请勿回复！`;
          break;
          case 2:
          html = `${temp_before}米德加盟申请</span></br>姓名：
                    ${req.body.username}<br/>电话：
                    ${temp_middle + req.body.tel}</span><br/>加盟地址：${temp_middle +
            req.body.addr}</span><br/>客服请及时联系咨询人员<br/>----------------------------------<br/>米德教育，请勿回复！`;
          break;
        default:
          html = `这封邮件${temp_middle}没有匹配到来源地址</span>-----> 勿理`;
      }
      // zhiyou100@qq.com,1131285954@qq.com,903122641@qq.com
      const mailOptions = {
        from: "米德教育<google404@qq.com>", // 发件地址
        to: "zhiyou100@qq.com,1131285954@qq.com,370924668@qq.com", // 收件列表
        subject: "叮咚~您有新的留言", // 标题
        //   text:data,
        html: html // html 内容
      };
      // 发送邮件
      transport.sendMail(mailOptions, function(error, response) {
        if (error) {
          console.error(error);
        } else {
          console.log(response);
        }
        transport.close(); // 如果没用，关闭连接池
      });

      isSame = req.body.username;
    } else {
      return res.json({
        //防止重复设置响应头报错
        status: "error",
        message: "您已提交过信息，稍后与您联系"
      });
    }
    res.json({
      status: "success",
      message: "提交成功! 感谢您的来访，稍后会联系您，请保持手机/Email/QQ畅通"
    });
  } else {
    return res.json({
      status: "error",
      message: "不合法的提交，请检查并填写必要的信息"
    });
  }
});

app.use(function(err, req, res, next) {
  console.error(err.stack);
  next(err);
});

// 创建https服务器实例
const httpsServer = https.createServer(credentials, app)

httpsServer.listen(3000, () => {
  console.log("滴~滴~滴~ The mail service is running...")
})
