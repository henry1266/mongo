const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 5000;

// 設置 EJS 作為模板引擎
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// MongoDB 連接 URI
const url = 'mongodb://localhost:27017';
const dbName = 'pharmacy';
let db, patientsCollection, familyRelationshipsCollection;

// 初始化 MongoDB 連接
async function initializeMongoDB() {
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log('Connected to MongoDB');

        // 選擇資料庫和集合
        db = client.db(dbName);
        patientsCollection = db.collection('patients');
        familyRelationshipsCollection = db.collection('family_relationships');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
}

// 使用立即執行的異步函數來初始化和啟動伺服器
(async () => {
    await initializeMongoDB();
    
    // 解析 URL-encoded 表單數據
    app.use(express.urlencoded({ extended: true }));

    // 主頁顯示輸入框
    app.get('/', (req, res) => {
        res.render('index1');
    });

    // 查詢病人資料和家庭關係並顯示結果
    app.post('/search', async (req, res) => {
        const pid = req.body.pid;
        try {
            // 查詢病人資料
            const patient = await patientsCollection.findOne({ pid: pid });
            
            if (!patient) {
                return res.render('relationships', { pid, patient: null, relationships: [], error: '找不到該病人' });
            }

            // 查詢病人的家庭關係
            const relationships = await familyRelationshipsCollection.find({
                $or: [
                    { pair_code: new RegExp(`^${pid}-`) }, // PID 是 pair_code 的第一部分
                    { pair_code: new RegExp(`-${pid}-`) }  // PID 是 pair_code 的第二部分
                ]
            }).toArray();

            res.render('relationships', { pid, patient, relationships, error: null });
        } catch (error) {
            console.error('Error fetching data:', error);
            res.status(500).send('Error retrieving data');
        }
    });

    // 啟動伺服器
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
})();
