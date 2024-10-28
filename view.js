// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const http = require('http');
const { Server } = require('socket.io');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// MongoDB 連接 URL
const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

async function run() {
  try {
    // 設定 EJS 作為模板引擎
    app.set('view engine', 'ejs');

    // 連接到 MongoDB
    await client.connect();
    console.log('Connected to MongoDB');

    // 選擇資料庫和集合
    const database = client.db('pharmacy');
    const collection = database.collection('prescriptions');
    const lastUpdateCollection = database.collection('last_update'); // 新增一個集合來存儲最新的資料

    // 指定 public 資料夾用來存放靜態檔案
    app.use(express.static(path.join(__dirname, 'public')));


    // 渲染主頁面
    app.get('/', async (req, res) => {
      // 取得最新的資料
      const lastUpdate = await lastUpdateCollection.findOne({}, { sort: { _id: -1 } });
      res.render('index', { lastUpdate: lastUpdate ? lastUpdate.data : null }); // 將最新的資料傳給前端
    });

    // Socket.IO 連線事件
    io.on('connection', async (socket) => {
      console.log('a user connected');

      // 當新用戶連線時，發送最新的資料
      const lastUpdate = await lastUpdateCollection.findOne({}, { sort: { _id: -1 } });
      if (lastUpdate) {
        socket.emit('data_update', lastUpdate.data);
      }
      
      // 監聽 `refreshData` 事件
      socket.on('refreshData', async (data) => {
        // 將最新的資料儲存到 last_update 集合
        await lastUpdateCollection.updateOne(
          {},
          { $set: { data: data } },
          { upsert: true }
        );

        // 廣播給所有客戶端
        io.emit('data_update', data);
      });

      socket.on('disconnect', () => {
        console.log('user disconnected');
      });
      
    });


    // 定義 /play-sound 路由
app.get('/play-sound', (req, res) => {
  const dtype = req.query.dtype || "特殊藥品";
  const psScriptTemplate = `
      $voice = New-Object -ComObject Sapi.spvoice
      $voice.rate = 3  # 語速
      $voice.speak("${dtype}")  # 朗讀內容
  `;
  
  // 執行 PowerShell 語音程式
  const ps = spawn('powershell.exe', ['-Command', psScriptTemplate]);

  // 檢查執行結果
  ps.on('close', (code) => {
      if (code === 0) {
          res.send('語音朗讀成功');
      } else {
          res.status(500).send('語音朗讀失敗');
      }
  });
});

    // 啟動伺服器
    server.listen(4000, () => {
      console.log('Listening on *:4000');
    });

  } catch (err) {
    console.error(err);
  }
}

run().catch(console.dir);
