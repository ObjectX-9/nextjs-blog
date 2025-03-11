// 导入http模块
const http = require('http');

// 创建一个HTTP服务器
const server = http.createServer((req, res) => {
  // 设置响应头
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // 发送响应数据
  res.end('Hello, World!\n');
});

// 监听80端口
server.listen(80, () => {
  console.log('Server is listening on port 80');
});