const http = require('http');
const { v4: uuidv4 } = require('uuid');
const errorHandle = require('./errorHandle');

const todos = [
    {
        "title": "今天要刷牙",
        "id": uuidv4()
    },
    {
        "title": "今天要洗臉",
        "id": uuidv4()
    }
];

const requestListener = (req, res) => {
    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
        'Content-Type': 'application/json'
    }

    /*     console.log(req.url);
        console.log(req.method); */

    let body = "";
    //let num = 0;
    req.on('data', chunk => {
        //console.log(chunk);
        body += chunk;
        //num += 1;
        //console.log(num);
    })

    if (req.url == "/todos" && req.method == "GET") {
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
        }));
        res.end();
    } else if (req.url == "/todos" && req.method == "POST") {
        //POST 需要 body 資料, 要等 body 資料, req.on
        req.on('end', () => {
            try {
                const title = JSON.parse(body).title; // (1) body:{ 會出問題， (2) "qq": "今天要運動" 會回傳undefined
                //console.log(title)
                if (title !== undefined) {
                    const todo = {
                        "title": title,
                        "id": uuidv4()
                    }
                    todos.push(todo)

                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos,
                    }));
                    res.end();
                } else {
                    errorHandle(res);
                }
            } catch (error) {
                errorHandle(res);
            }
        })
    } else if (req.url == "/todos" && req.method == "DELETE") {
        todos.length = 0; //刪除所有
        res.writeHead(200, headers);
        res.write(JSON.stringify({
            "status": "success",
            "data": todos,
            "delete": "yes"
        }));
        res.end();

    } else if (req.url.startsWith("/todos/") && req.method == "DELETE") {
        //startsWith start 後面有 s, req.url.split('/')[-1]寫法是錯的
        const id = req.url.split('/').pop();
        //element.id 要加 id
        const index = todos.findIndex(element => element.id == id);
        /*         console.log(id)
                console.log(index) */
        if (index !== -1) {
            todos.splice(index, 1);
            res.writeHead(200, headers);
            res.write(JSON.stringify({
                "status": "success",
                "data": todos,
                "delete": "yes"
            }));
            res.end();
        } else {
            errorHandle(res);
        }


    } else if (req.url.startsWith("/todos/") && req.method == "PATCH") {
        req.on('end', () => {
            try {
                const title = JSON.parse(body).title;
                const id = req.url.split('/').pop();
                const index = todos.findIndex(element => element.id == id)
                if (title !== undefined && index !== -1) {
                    todos[index].title = title;
                    res.writeHead(200, headers);
                    res.write(JSON.stringify({
                        "status": "success",
                        "data": todos
                    }))
                    res.end();
                } else {
                    errorHandle(res);
                }
            } catch {
                errorHandle(res);
            }
        })
    } else if (req.method == "OPTIONS") {
        res.writeHead(200, headers);
        res.end();
    } else {
        res.writeHead(404, headers);
        res.write(JSON.stringify({
            "status": "false",
            "message": "無此網站路由"
        }));
        res.end();
    }
}

const server = http.createServer(requestListener);
server.listen(process.env.PORT || 3005);


