const express = require('express');
const httpProxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");


const app = express();
const PORT = '3000';
const SPRING_BACKEND_URL = 'http://localhost:8080';

// JSON 파싱 미들웨어 등록
app.use(bodyParser.json());
app.use(cookieParser());

function verifyToken(req, res, next) {
  // 쿠키에서 토큰 추출
  const token = req.cookies['accessToken']; // 'token_name'에는 실제 토큰이 저장된 쿠키 이름을 입력하세요

  console.log(token);

  if (!token) {
    return res.status(403).json('notoken');
  } else {
    const secretKey = "accesstoken";

    // 토큰 검증
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.clearCookie('accessToken', { path: '/', expires: new Date(0) });
        return res.status(401).json({ message: 'TokenFail' });
      }
    });
  }

  

    // 요청에서 추출된 정보 활용 (예: 유저 아이디)
    // req.cookie_id = decoded.id;
    // req.cookie_name = decoded.name;
    next();
}

// API Gateway 설정
app.use('/hi', verifyToken, httpProxy(SPRING_BACKEND_URL, {
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
