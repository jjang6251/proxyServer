const express = require('express');
const httpProxy = require('express-http-proxy');
const bodyParser = require('body-parser');

const app = express();
const PORT = '3000';
const SPRING_BACKEND_URL = 'http://localhost:8080';

// JSON 파싱 미들웨어 등록
app.use(bodyParser.json());

// API Gateway 설정
app.use('/hi', httpProxy(SPRING_BACKEND_URL, {
  proxyReqPathResolver: function (req) {
    // 클라이언트로부터 받은 요청 URL을 Spring 백엔드로 전달할 URL로 변환
    return '/hi';
  },
  proxyErrorHandler: function (err, res, next) {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    // Spring 백엔드로부터 받은 응답 데이터를 클라이언트에게 전달하기 전에 가공
    let data = JSON.parse(proxyResData.toString('utf8'));  
    // 응답 데이터 가공 작업
    return JSON.stringify(data);
  }
}));

app.use('/bye', httpProxy(SPRING_BACKEND_URL, {
  proxyReqPathResolver: function (req) {
    // 클라이언트로부터 받은 요청 URL을 Spring 백엔드로 전달할 URL로 변환
    return '/bye';
  },
  proxyErrorHandler: function (err, res, next) {
    console.error('Proxy Error:', err);
    res.status(500).send('Proxy Error');
  },
  userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
    // Spring 백엔드로부터 받은 응답 데이터를 클라이언트에게 전달하기 전에 가공
    let data = JSON.parse(proxyResData.toString('utf8'));
    // 응답 데이터 가공 작업
    return JSON.stringify(data);
  }
}));

// Express 서버 시작
app.listen(PORT, () => {
  console.log(`Express API Gateway is running on port ${PORT}`);
});
