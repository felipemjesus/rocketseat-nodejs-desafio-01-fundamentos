import fs from 'node:fs';
import { parse } from 'csv-parse';

const __dirname = new URL('.', import.meta.url).pathname;

const processFile = async () => {
    const records = [];
    const parser = fs.createReadStream(`${__dirname}/tasks.csv`)
        .pipe(parse({
            delimiter: ',',
        }));
  
    let aux = 0;
    for await (const record of parser) {
        if (aux === 0) {
            aux++;
            continue;
        }
        
        fetch('http://localhost:3333/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: record[0],
                description: record[1]
            })
        }).catch(err => console.error(err));
        
        records.push(record);
    }

    return records;
};

(async () => {
  const records = await processFile();
  console.info(records);
})();
