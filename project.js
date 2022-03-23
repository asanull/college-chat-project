//#region project setup 
const fs=require('fs')
const moment=require('moment')
const express=require('express')
const app=express()
const http=require('http')
const nodeserver=http.createServer(app)
const socketio=require('socket.io')
const ioserver=socketio(nodeserver)
app.set('view-engine', 'ejs')
const path=require('path')
let project = {
    name:`"project"`,
    port:1025,
    file:`project.js`,
    url:`http://localhost:1025`,
    shorturl:`localhost:1025`,
    start:new Date().getTime(),
    uptime:0
}
function uptime() {
    project.uptime=(new Date().getTime()-project.start)/1000
    setTimeout(()=>{uptime()},1000)
}
uptime()
//#endregion
//#region fs functions 
function findFile(name, type){return path.join(__dirname,`./public/${type}`,`${name}.${type}`)}
//#endregion
//#region server paths 
app.get('/', async (req, res) => { res.redirect(`/index`) })

app.get('/index', (req, res) => {res.render('index.ejs')})
app.get('/register', (req, res) => {res.render('register.ejs')})
app.get('/style.css', (req, res) => { res.sendFile(findFile('style','css')) })
app.get('/javascript.js', (req, res) => { res.sendFile(findFile('javascript','js')) })
app.get('/register.js', (req, res) => { res.sendFile(findFile('javascript','js')) })
app.get('*', function(req, res) {
    res.redirect('/')
});
//#endregion
//#region private storage 
let users = {
    filepath: "./private/users.json",
    json: []
}
function loadUsers() {
    if (fs.existsSync(users.filepath)) {
        console.log()
        log('folder', 'users.json loaded')
        fs.readFile(users.filepath, (err, json) => {
            if (err) throw err;
            else {
                try {
                    if(JSON.parse(json).default==null)
                    {
                        log('notif', 'users.json incorrectly formatted')
                        fs.unlink(users.filepath, () => {
                            log('bin', 'deleted users.json')
                            setTimeout(()=>{loadUsers()},1000)
                        })
                    }
                    else {
                        log('paper', 'loaded users into process memory')
                        users.json = JSON.parse(json).users
                        console.log(users.json)
                    }
                } catch (e) {
                    log('notif', 'users.json incorrectly formatted')
                    fs.unlink(users.filepath, () => {
                            log('bin', 'deleted users.json')
                        setTimeout(()=>{loadUsers()},1000)
                    })
                }
            }
        });
    }
    else {
        log('paper', 'writing files...')
        var json = {
            default: {name:null,username:null,password:null},
            users: []
        }
        fs.writeFile(users.filepath, JSON.stringify(json), err => {
            if (err) throw err
            else {
                log('check', 'created users.json')
                setTimeout(()=>{loadUsers()},1000)
            }
        })
    }
}
//#endregion
async function log(type, message)
{
  switch (type) {
    case 'tick':
      type = "👍"
    break
    case 'cross':
      type = "😵" 
    break
    case 'notif':
      type = "❗"
    break
    case 'check':
      type = "✅"
    break
    case 'wave':
      type = "🤗"
    break
    case 'woo':
      type = "🥳"
    break
    case 'parcel':
      type = "📦"
    break
    case 'cam':
      type = "📷"
    break
    case 'snap':
      type = "📸"
    break
    case 'bug':
      type = "🪲"
    break
    case 'file':
      type = "📁"
    break
    case 'folder':
      type = "📂"
    break
    case 'paper':
      type = "📄"
    break
    case 'bin':
      type = "🗑️ "
    break
    case 'bye':
      type = "👋"
    break
    }
  console.log(`${type} ${moment().format('hh:mm:ss')} ${message}`)
  fs.appendFileSync(`${project.file}.log`, `[${project.name.toUpperCase()}] ${message} [${moment().format('DD/MM/YYYY][hh:mm')}]\r\n`);
}
nodeserver.listen(project.port, () => {
    process.stdout.write("\u001b[2J\u001b[0;0H")
    log('tick', `NodeJS running under Nodemon`)
    loadUsers()
    console.log()
    log('woo', `${project.name} server on port ${project.port}.`)
    console.log()
})
let login = {
    name: `login`,
    body: `
    <h3>
        login
    </h3>
    <form id="form"  onsubmit="formSubmit(this);return false">
        username : <input>
        <br>
        password : <input class="psw">
        <br>
        <br>
        [ <a href="/register">register</a> ]
        <br>
        [ <input class="btn" type="submit"> ]
    </form>`
}
let register = {
    name: `register`,
    body: `
    <h3>
        register
    </h3>
    <form id="form" onsubmit="formSubmit(this);return false">
        new username : <input>
        <br>
        new password : <input class="psw">
        <br>
        <br>
        [ ⠀<a href="/index">login</a>⠀ ]
        <br>
        [ <input class="btn" type="submit"> ]
    </form>`
}
let boot = {
    name: '😕',
    body: `
        <h3>You're not allowed to do that 😕</h3>
        [ <a href="/">Sorry</a> ]
        `
}
let wait = {
    name: '🔑',
    body: `<h3>wait...</h3>`
}
let acceptingConnections = true
ioserver.on('connection', io =>
{
    if(acceptingConnections){
        if(project.uptime<1) {
            io.emit('updatebody', wait)
            io.emit('serverrestarted')
        }
        else {
            if(io.handshake.headers.referer==(project.url+"/index")||io.handshake.headers.referer==("http://10.132.5.239:1025/index")) {
            io.emit('updatebody', login)
            }
            if(io.handshake.headers.referer==(project.url+"/register")) {
                io.emit('updatebody', register)
            }
        }
    }
    io.on('boot', () => {
        io.emit('updatebody', boot)
    })
    io.on('login', credentials => {
        io.emit('updatebody', wait)
        let shouldSkip = false
        users.json.forEach(user => {
            if (shouldSkip) return
            if (credentials.username==user.username&&credentials.password==user.password)
            {
                shouldSkip=true
                let packet = {
                    name: 'Room',
                    body: `
                        <h3>Room</h3>
                        
                        <div id="log"></div>

                        <form id="input" onsubmit="inputSubmit(this);return false">
                            <span class="user">${user.username}</span> > <input>
                        </form>
                        
                        
                        <details>
                            <summary>
                                <span class="material-icons cmd">
                                    more_vert
                                </span>
                            </summary>
                            <div class="modal" style="padding: 24px">
                                <div class="one">
                                    <div>upload image</div>
                                </div>
                                <div class="two">
                                    settings<br>
                                    --------<br>
                                    font-family: Consolas<br>
                                    bg-color: #000<br>
                                    first-color: #ccc<br>
                                    second-color: #999<br>
                                    third-color: #ccc
                                </div>
                                <span><span class="user">${user.username}</span> ></span>
                            </div>
                        </details>
                        
                        <span class="material-icons upld">
                            add_circle
                        </span>
                        
                        
                        `,
                    username:credentials.username
                }
                io.emit('updatebody', packet)
                io.join("default")
            }
            else io.emit('updatebody', login)
        })
    })
    io.on('register', credentials => {

    })
    io.on('messageServer', packet => {
        let checkedPackage = {
            message:packet.message,
            name:packet.name
        }
        if(checkedPackage.message==null||checkedPackage.name==null)
        console.log('error')
        else ioserver.to("default").emit("messageRecieved", checkedPackage)        
    })
    let onevent = io.onevent;
    io.onevent = function (packet) {
      let args = packet.data || []
      onevent.call (this, packet)
      packet.data = ["*"].concat(args)
      onevent.call(this, packet)
    }
    io.on("*",function(event,data) {
        log('parcel', `io event`)
        console.log(data)
        console.log()
    })
})