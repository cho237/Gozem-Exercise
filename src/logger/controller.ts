import * as fs from 'fs';

interface LogObject {
    method: string;
    action: string;
    id: string;
    code: number;
    level: string;
    message: string;
    timestamp: string;
}

// Read the file and store data in an array
const readAndStoreData = (filePath: string): LogObject[] => {
    const dataArray: LogObject[] = [];
    const fileData: string = fs.readFileSync(filePath, 'utf8');
    const logs: string[] = fileData.trim().split('\n');

    logs.forEach((log) => {
        const parsedLog: LogObject = JSON.parse(log);
        dataArray.push(parsedLog);
    });

    return dataArray;
};

const filePath: string = 'yourfile.txt'; // Replace with your actual file path
const logData: LogObject[] = readAndStoreData(filePath);
