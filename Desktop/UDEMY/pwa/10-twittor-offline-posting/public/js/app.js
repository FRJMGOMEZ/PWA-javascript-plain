


var url = window.location.href;
var swLocation = '/twittor/sw.js';
let swReg;

if (navigator.serviceWorker) {
    if (url.includes('localhost')) {
        swLocation = '/sw.js';
    }
    window.addEventListener('load',()=>{
        navigator.serviceWorker.register(swLocation).then((reg)=>{
            swReg = reg;
            swReg.pushManager.getSubscription().then(verifySubscription)
        })
    })  
}


// Referencias de jQuery

var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var avatarSel = $('#seleccion');
var timeline = $('#timeline');

var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns = $('.seleccion-avatar');
var txtMensaje = $('#txtMensaje');

var notifActive = $('#notification-active')
var notifUnactive = $('#notification-unactive')
// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;




// ===== Codigo de la aplicaciÃ³n

function crearMensajeHTML(mensaje, personaje) {

    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();

}



// Globals
function logIn(ingreso) {

    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.text('Seleccione Personaje');

    }

}


// Seleccion de personaje
avatarBtns.on('click', function () {

    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);

});

// Boton de salir
salirBtn.on('click', function () {

    logIn(false);

});

// Boton de nuevo mensaje
nuevoBtn.on('click', function () {

    modal.removeClass('oculto');
    modal.animate({
        marginTop: '-=1000px',
        opacity: 1
    }, 200);

});

// Boton de cancelar mensaje
cancelarBtn.on('click', function () {
    if (!modal.hasClass('oculto')) {
        modal.animate({
            marginTop: '+=1000px',
            opacity: 0
        }, 200, function () {
            modal.addClass('oculto');
            txtMensaje.val('');
        });
    }
});

// Boton de enviar mensaje
postBtn.on('click', function () {

    var mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    let message = {
        user: usuario,
        message: txtMensaje.val()
    }
    fetch('api', { method:'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(message) })
    .then(res=>res.json())
    .then((res) => { console.log({res}); res.message ? crearMensajeHTML(res.message.message, res.message.user):null;})
    .catch((err)=>{ console.error(err)})
});

/// get messages from server ///

const getMessages = () => {
    fetch('api').then(res => res.json()).then((posts) => {
        posts.reverse().forEach((post) => {
            crearMensajeHTML(post.message, post.user)
        })

    })
}

const verifySubscription = (active) => {
    console.log({active})
    if (active) {
        notifActive.removeClass('oculto')
        notifUnactive.addClass('oculto')
        //
    } else {
        notifActive.addClass('oculto')
        notifUnactive.removeClass('oculto')
        //
    }
}

const getPublicKey = ()=>{
   return fetch('api/key').then(res=> res.arrayBuffer()).then(key=>new Uint8Array(key))
}

const notifiyMe = ()=>{
    if(!window.Notification){
        console.log('This browser do not support notifications');
        return
    }

   if(Notification.permission === 'granted'){
      sendNotification();
   }else if(Notification.permission != 'denied' || Notification.permission === 'default'){
    Notification.requestPermission((permision)=>{
        if(permision === 'granted'){
            new Notification('Hi fellows - from question')
        } else{
        }
    })
   }
}

const sendNotification = ()=>{
    const notificationsOpt = {
        body:'notification body',
        icon:'img/icons/icon-72x72.png'
    }
   const n = new Notification('hi buddies',notificationsOpt)
   n.onclick= ()=>{
       console.log('click')
   }
}


const cancelSubs = ()=>{
    swReg.pushManager.getSubscription().then((subs)=>{
        subs.unsubscribe().then(()=>{
            verifySubscription(false)
        })
    })
}

notifUnactive.on('click', () => {
    if (!swReg) {
        return console.log('There are no registers')
    }
    getPublicKey().then((key) => {
        swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: key
        })
            .then(res => res.toJSON())
            .then((subscription) => {
                fetch('api/subscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(subscription)
                })
                    .then(verifySubscription)
                    .catch(cancelSubs)
            })
    })
})

notifActive.on('click',()=>{
    cancelSubs();
})


//// detecting conexión service /////


const isOnline = ()=>{
    if(navigator.onLine){
        console.log('online')
    }else{
        console.log('offline')
    }
}

window.addEventListener('online',isOnline)
window.addEventListener('offline', isOnline)

isOnline()

getPublicKey()

notifiyMe()

getMessages()


