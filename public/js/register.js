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
function formSubmit(form) {
    let credentials = {
        username:form.childNodes[1].value,
        password:form.childNodes[5].value
    }
    if(credentials.username!=""||credentials.password!="")
    socket.emit('register', credentials)
    //keeps emitting login?
}
let socket = io()
socket.on('updatebody', packet => {
    document.title = packet.name
    document.body.innerHTML = packet.body
    if(packet.username!=null) {
        user.username=packet.username
    }
})