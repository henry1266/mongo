const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');
const io = require('socket.io-client');  // 引入 Socket.IO 客户端库
// 连接到 Socket.IO 服务
const socket = io.connect('http://localhost:4000'); // 连接到 app.js

// 监控的目录路径
const directoryPath = 'X:\\VITAL';
const outputDir = 'W:\\jvm'; // 修改为你想要保存的目标目录
const delay = 1000; // 延迟时间（毫秒），用于等待文件释放

// test
socket.emit('refreshData', { test: 'testing' });

// 检查目录是否存在
if (!fs.existsSync(directoryPath)) {
    console.error(`目录 ${directoryPath} 不存在`);
    process.exit(1);
}

// 使用 fs.watch 监控目录
fs.watch(directoryPath, (eventType, filename) => {
    if (eventType === 'rename' && filename) {
        // 检查是否是 .txt 文件
        const filePath = path.join(directoryPath, filename);
        if (path.extname(filename).toLowerCase() === '.txt' && fs.existsSync(filePath)) {
            // 在检测到新文件时，延迟执行文件处理，以确保文件已完全写入
            setTimeout(() => {
                processFile(filePath);
            }, delay);
        }
    }
});

// 基礎三天
let count1 = 3;
let acday; // 定义 acday
// 函数：处理每个文件的内容
function processFile(filePath) {
    fs.readFile(filePath, (err, data) => {
        
		if (err) {
            console.error('Error reading the file:', err);
            return;
        }
		
        // 使用 ANSI 编码解码文件内容
        const decodedData = iconv.decode(data, 'big5'); // 替换 'big5' 为适合的编码，取决于实际编码格式
		
		// 从文件中提取日期 (假设文件中日期格式为 'YYYYMMDD')
        
        const matches = [...decodedData.matchAll(/(202\d{5})\s+\d{2}:\d{2}\s+(202\d{5})\s+\d{2}:\d{2}/g)];
        // 提取倒數第一組
        let lastMatch;
        if (matches.length > 0) {
            lastMatch = matches[matches.length - 1];
            const formattedCurrentDate = lastMatch[1]; // 文件中的第一个日期
            let formattedFutureDate = lastMatch[2]; // 文件中的第二个日期

        	//const acday = dateMatches[1]-dateMatches[0]+1;
			// Function to convert YYYYMMDD string to Date object
        function parseYYYYMMDD(dateString) {
            let year = parseInt(dateString.substring(0, 4), 10); // Get the year (first 4 digits)
            let month = parseInt(dateString.substring(4, 6), 10) - 1; // Get the month (next 2 digits, 0-indexed)
            let day = parseInt(dateString.substring(6, 8), 10); // Get the day (last 2 digits)
            return new Date(year, month, day); // Create and return the Date object
        }
  
        // Convert dateMatches[0] and dateMatches[1] into Date objects
        let date0 = parseYYYYMMDD(lastMatch[1]);
        let date1 = parseYYYYMMDD(lastMatch[2]);
              // Calculate the time difference in milliseconds
  
        let timeDifference = date1 - date0; // This gives the difference in milliseconds
  
        // Convert the time difference from milliseconds to days
        let daysDifference = timeDifference / (1000 * 60 * 60 * 24); // 1 day = 24 hours * 60 minutes * 60 seconds * 1000 milliseconds
  
        acday  = daysDifference + 1;
        console.log(acday);
              
        // 检查是否包含 +1 到 +7
        const match = decodedData.match(/\+([1-7])/);
        if (match) {
  
                  // 根据匹配到的 +1 到 +7 计算新的目标日期
                  const increment = parseInt(match[1], 10); // 获取 +1, +2 等中的数字部分
                  const adjustedDate = new Date(
                      parseInt(formattedFutureDate.slice(0, 4)), // 年
                      parseInt(formattedFutureDate.slice(4, 6)) - 1, // 月，注意 JavaScript 中的月份是从 0 开始的
                      parseInt(formattedFutureDate.slice(6, 8)) // 日
                  );
                  adjustedDate.setDate(adjustedDate.getDate() + increment); // 增加指定的天数
  
                  
                  // 根據 increment 值決定朗讀的天數
                  switch (increment) {
                      case 1:
                      runPSScript(1);
                      count1 = 4;
                      break;
                  case 2:
                      runPSScript(2);
                      count1 = 5;
                      break;
                  case 3:
                      runPSScript(3);
                      count1 = 6;
                      break;
                  case 4:
                      runPSScript(4);
                      count1 = 7;
                      break;
                  case 5:
                      runPSScript(5);
                      count1 = 8;
                      break;
                  case 6:
                      runPSScript(6);
                      count1 = 9;
                      break;
                  case 7:
                      runPSScript(7);
                      count1 = 10;
                      break;
                  default:
                    console.log("Unexpected increment value");
                      break;
                  }
                  
                  // 格式化调整后的日期为 YYYYMMDD 格式
                  const newFormattedFutureDate = adjustedDate.getFullYear().toString() +
                      (adjustedDate.getMonth() + 1).toString().padStart(2, '0') +
                      adjustedDate.getDate().toString().padStart(2, '0');
                  
  
                  // 进行替换，将文件中所有的旧的未来日期替换为新的未来日期
                  const updatedData = decodedData.replace(new RegExp(formattedFutureDate, 'g'), newFormattedFutureDate);
                  saveAndDeleteOriginal(filePath, updatedData);
              } else {
                    
                    count1 = acday;
                  // 进行替换，不做日期调整，直接保存原内容
                  saveAndDeleteOriginal(filePath, decodedData);
              }
        
        } else {
            console.log('沒有匹配到任何日期');
        }
		runPSScript2("處方");
		//2024100415:13H124268717 19710306 王xx
		const regex2 = /(\d{8})(\d{2}:\d{2})([A-Z]\d{9})\s+(\d{8})\s+([a-zA-Z_\u4e00-\u9fa5]+)/;
		const match2 = decodedData.match(regex2);

		if (match2) {
			const predate = match2[1]; // 202xxxxx
			const presec = match2[2]; // 202xxxxx
			const pid = match2[3]; // Hxxx268717
			const birthDate = match2[4]; // 1995xxxx
			const name = match2[5]; // 王xx
			console.log(`就醫日: ${predate},身分證: ${pid}, 姓名: ${name}`);
		
			findOrCreatePatient(pid, name, birthDate).catch(console.error);
			//藥品
			const regex = /T([A-Za-z0-9]{10})\s+(?=.*[A-Z])(?=.*[\u4E00-\u9FFF])(.+?)\s+(BID|TID|TIDPC|TIDAC|PRN|HS|QD|QN|QID)\s+(\d+)\s+(\d+)\s+(0?\.\d{1,3}|[1-9]\d{0,2}(?:\.\d{1,3})?)\s+(\d+)/gu;

			let match;
			const results = [];

			// 使用正則表達式的 exec 方法迭代所有匹配，並提取捕獲的部分
			while ((match = regex.exec(decodedData)) !== null) {
				const code = match[1];       // T 后面的 10 个英数字符
				const medicine = match[2];   // 药品名称，包含中文和英文
				const frequency = match[3];  // 频率
                let count00;
                const specialSymbols = /[☆★□■∵⊕↗→↘ⅡⅢ▲▼△◇◆]/;
				if (specialSymbols.test(medicine) ||  frequency === 'PRN' ||  medicine.includes("(管")) {
				    count00 = match[7] * 1;
				}    else if (match[3] === 'TID' || frequency === 'TIDPC' || frequency === 'TIDAC') {
					count00 = count1 * 3;
				}	else if (match[3] === 'QID') {
					count00 = count1 * 4;
				}	else if (match[3] === 'HS' || frequency === 'QD' || frequency === 'QN') {
					count00 = count1 * 1;
				}   else  {
					count00 = count1 * 1;
				}
				results.push({
					'dname': medicine.trim(),
					'dinsuranceCode': code,
					'df': frequency,
					'dcount': count00
				});
				

                if (medicine.includes("☆")) {
                    runPSScript2("藥膏");
                } else if (medicine.includes("□")) {
                    runPSScript2("口服");
                } else if (medicine.includes("XXX")) {
                    runPSScript2("錯誤");
                }


			}

            if (acday > 4) {
                pretype = "04";
                runPSScript2("慢");
            } else if (decodedData.includes("⊕")) {
                pretype = "02"; // 小孩藥水
            } else  {
                pretype = "01";
            }
		    // 調用插入函數
		    insertPrescription(pid, presec, predate, results, pretype).catch(console.error);
		    socket.emit('refreshData', { pid, name,pretype,results });
            socket.emit('toggle_floating_area', false);


		    if (results.length > 0) {
			    results.forEach(result => {
			    //console.log(result);
			});
		    } else {
		        console.log("No results found.");
		    }
		
		} else {
			console.log("No match2 found");
		}

	});
}

// 函数：保存文件到指定目录并删除原文件
function saveAndDeleteOriginal(originalPath, content) {
    // 编码回 ANSI 格式
    const encodedData = iconv.encode(content, 'big5');

    // 生成目标文件路径，保持原文件名
    const outputFilePath = path.join(outputDir, path.basename(originalPath));

    // 将替换后的内容写入目标目录
    fs.writeFile(outputFilePath, encodedData, (err) => {
        if (err) {
            console.error('Error writing to the new location:', err);
            return;
        }

        console.log(`File saved successfully to ${outputFilePath}`);

        // 删除原始文件
        fs.unlink(originalPath, (err) => {
            if (err) {
                console.error('Error deleting the original file:', err);
                return;
            }
        });
    });
}

// 朗讀特殊天數
function runPSScript(dayCount) {
    // 從 'child_process' 模組中引入 spawn 函數，用來執行外部程式或命令
	const { spawn } = require('child_process');
	const psScriptTemplate = `
        $voice = New-Object -ComObject Sapi.spvoice
        $voice.rate = 3  # 設定語速為 3（加快速度）
        $voice.speak("加${dayCount}天")  # 朗讀中文文字
    `;
    const ps = spawn('powershell.exe', ['-Command', psScriptTemplate]);
}

// 朗讀特殊藥品
function runPSScript2(dtype) {
    // 從 'child_process' 模組中引入 spawn 函數，用來執行外部程式或命令
	const { spawn } = require('child_process');
	const psScriptTemplate = `
        $voice = New-Object -ComObject Sapi.spvoice
        $voice.rate = 3  # 設定語速為 3（加快速度）
        $voice.speak("${dtype}")  # 朗讀中文文字
    `;
    const ps = spawn('powershell.exe', ['-Command', psScriptTemplate]);
}

async function insertPrescription(pid, presec , predate, drugs ,pretype) {
  
  
    // MongoDB 連接 URI
  
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    // 連接到 MongoDB
    await client.connect();

    // 選擇數據庫和集合
    const db = client.db("pharmacy");
    const prescriptionsCollection = db.collection("prescriptions");
const newPrescription = {
      "pid": pid,
	  "presec": presec,
      "predate": predate,
	  "pretype": pretype,
	  "drug": drugs // 這裡使用從正則表達式提取出的藥品資料
    };
    
	// 插入處方資料
    const result = await prescriptionsCollection.insertOne(newPrescription);

    console.log("插入成功，文檔ID為:", result.insertedId);
	
	 // 当数据库发生变化时，向服务器发送 `refreshData` 事件

     //socket.emit('refreshData', { pid: pid, status: 'new_prescription_added' });
  } catch (e) {
    console.error("插入資料時出錯:", e);
  } finally {
    // 關閉連接
    await client.close();
  }
}


async function findOrCreatePatient(pid, name, birthDate) {
  // MongoDB 連接 URI
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);

  try {
    // 連接到 MongoDB
    await client.connect();

    // 選擇數據庫和集合
    const db = client.db("pharmacy");
    const patientsCollection = db.collection("patients");

	// 查詢該 pid 是否已經存在於 patients 集合中
	const existingPatient = await patientsCollection.findOne({ pid: pid });
	

    if (!existingPatient) {
    // 如果病人不存在，則創建一個新的病人記錄
    const newPatient = {
      pname: name,
      pid: pid,
      pdate: birthDate,
      pphone: "0912345678", // 預設電話號碼
	  pvip: "no" // 預設電話號碼
    };

    // 插入新的病人記錄
    const result = await patientsCollection.insertOne(newPatient);
    console.log(`新病人已插入，ID 為: ${result.insertedId}`);
	} else {
    console.log(`病人 ${name} 已經存在於資料庫中`);
	}
  } catch (e) {
    console.error("插入資料時出錯:", e);
  } finally {
    // 關閉連接
    await client.close();
  }
}


