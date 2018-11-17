import fs from 'fs';


fs.readFile('./experiment/files/1002.tap', 'utf8', (e, data) => {
    if (e) {
        throw e;
    }

    let lines = data.split('\n');
    lines = lines.filter((e) => {
        return e.startsWith('G') || e.startsWith('X') || e.startsWith('Y') || e.startsWith('Z') || e.startsWith('A') ||
            e.startsWith('B') || e.startsWith('C');
    });
    console.log(lines.length);

    let results = [];
    for (let line of lines) {
        let obj = {};
        let flag = false;
        let tokens = line.split(' ');
        for (let token of tokens) {
            if (token) {
                let key = token[0];
                if (!key.startsWith('G')) {
                    let value = parseFloat(token.substring(1));
                    obj[key] = value;
                    flag = true;
                }
            }
        }
        if (flag) {
            results.push(obj);
        }
    }

    console.log(results.length);
    console.log(results[0]);
    console.log(results[1]);

    fs.writeFile('./output/web/images/_cache/1001.json', JSON.stringify(results, null, '\t'), 'utf8', (e) => {
        if (e) {
            throw e;
        }
    });
});

