function consoleCheck() {
    let headroom = 10
    let before = new Date().getTime();

    ////////////////////////////////////

    // Upon closing this console your //
    // session will be terminated.    //

    ////////////////////////////////////

    debugger;
    let after = new Date().getTime();
    if (after-before>headroom) {
        console.log(before-after)
        document.body.outerHTML=""
        socket.emit('boot','user disconnected due to console access.')
        setTimeout(()=>{socket.close()},100)
    }
    setTimeout(()=>{consoleCheck()},100)
}
consoleCheck()
let reload = false
let user = {username:null}
function formSubmit(form) {
    let credentials = {
        username:form.childNodes[1].value,
        password:form.childNodes[5].value
    }
    if(credentials.username==""||credentials.password==""){location.reload()}
    else socket.emit('login',credentials)
}
function messageValid(str) {
    if(str.length<=215&&str.trim().length!=0)
    return true
    else return false
}
function inputSubmit(input) {
    let packet = {
        message:input.childNodes[3].value,
        name:user.username
    }
    if(messageValid(packet.message)){
        socket.emit("messageServer",packet)
        input.childNodes[3].value=""
    }
}
let socket = io()
socket.on('updatebody', packet => {
    document.title = packet.name
    document.body.innerHTML = packet.body
    if(packet.username!=null) {
        user.username=packet.username
    }
})
socket.on('messageRecieved', packet => {
    let element = document.createElement("p")
    element.innerHTML=`${packet.name} : ${packet.message}`
    document.getElementById("log").appendChild(element)
    document.getElementById("input").scrollIntoView()
})
socket.on('serverrestarted', () => {
    socket.close()
    setTimeout(()=>{location.reload()},1000)
})