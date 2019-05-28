// JavaScript General App

var userWS = '69BA4B9D76B7C3452E2A48B7BF9790FE';
var pdwWS  = '0BAD6CE456FCFBEF59544697D43E06D1';
var vFlagTracking = false;
var vTimerGPS; // = 30000;
var vIdFormulario ='XO';
var vLat = 0;
var vLng = 0;
//var ws_url = 'http://localhost/ws_so/service_so.php'; 
//var ws_url = 'https://190.4.63.207/ws_so/service_so.php';
var ws_url = 'https://gpsboc.tigo.com.hn/ws_so/service_so.php'

var vDatosUsuario ={"user":"", "login":"", "name":"", "phone":0, "email":"na", "job":"na", "id_dms":0, "perfil":0};
var vTitle ="SO - Horus";
var map1;
var mapDash;
var pgActual = 0;
var pgBack = 0;


var vIntersept = true;
var vIntervalGeo;
var vInteDash;
var bgGeo;
var vFormData = {};
var vFormsPendientes = [];
var vFileG;  //Variable para foto del usuario
var markerDash = [];
var markIni;
var markFin;
var markHorus;
var infoW;
var infoW2;
var recorridoPath = [];
var recorridoDash;
var vGindicadorMap = 0;
var vGtipomap = 0;

var lat1, lng1;
var vDistance = 0;
var vFechIniHorus;

//var webSvrListener =  setInterval(function(){ consultSVR()}, 59000);
var pagRoot = [{id:0, back:0},
                {id:1, back:0},
                {id:2, back:0},
                {id:3, back:0},
                {id:100, back:3},
                {id:101, back:3}];
var app = {
    
    //alert(getParams('user'));
    
    initialize: function() {        
        document.addEventListener("deviceready", this.onDeviceReady, false);
        
 
    },
    
    onDeviceReady: function() {

        //shownot('Hello World');
        //window.plugins.toast.show('Back Bloq..', 1000, 'bottom');
        // Initialize the map view  
 
        //cordova.plugins.backgroundMode.setEnabled(true);  
        cordova.plugins.backgroundMode.overrideBackButton(); 
        cordova.plugins.backgroundMode.setDefaults({title:'SO - Horus', text: 'Tracking..', resume:false, hidden:true}); 
       
        cordova.plugins.backgroundMode.on('activate',function(){
            if(vFlagTracking == true){
                cordova.plugins.backgroundMode.disableWebViewOptimizations();
        //        console.log('..'); 
                //vInteDash = setInterval(function(){navigator.vibrate(25);}, vTimerGPS); 
            }         
        });

        window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, 
            function (fs) {
                fs.getDirectory('resources', { create: true }, function (fs2){
                    //console.log('Directorio - ' + fs2.name);
                    /*fs2.getFile('log.txt', {create: true, exclusive: false}, 
                        function(fileEntry) {
                            alert('File creation successfull!');
                        });*/
                });
            }, 
            function(e){ alert(e.toString); }
        );

        document.addEventListener('resume', function(e){
            //window.plugins.toast.show('Resume', 1000, 'bottom');
        });

        document.addEventListener('pause', function(e){
            //tracking();
            //clearInterval(vIntervalGeo);
            //vInteDash = setInterval(function(){ getMapLocation(); }, vTimerGPS); 
        });

        document.addEventListener('backbutton', function(e){
            console.log('..');
            backButton();
       //     //window.plugins.toast.show('Back Bloq..', 1000, 'bottom');          
        });
        
        
    }

}

$(document).ready(function(e){
    setTimeout(function(){initMaps(14.618086,-86.959082); getMap(14.618086,-86.959082);}, 2000);
    hide_pags();   
    var img = new Image();
    //img.src = 'img/salesman.png';
    //saveImgtoDB(img); 

    $("#dvHorus").show();
    $('#lbl_title').html('SO - Horus');            
    $("#dvHead").show();
    $("#horusSuper").hide();
    //map = plugin.google.maps.Map.getMap($("#dvMain")); 

    if (vFlagTracking==false){
        $("#startGPS").show();
        $("#stopGPS").hide();
    }else{
        $("#startGPS").hide();
        $("#stopGPS").show();        
    }


    function validaLogin(){
        var tempLogin = getParams();
        vLogin = tempLogin.login;
        vDateLicense = getYMD(0);

        vDatosUsuario.user = tempLogin.user;
        vDatosUsuario.login = vLogin;

        if(parseInt(vLogin) != 1){ 
            db.transaction(function(cmd){   
                cmd.executeSql("SELECT * FROM users where login = ? ", [1], function (cmd, results) {
                    var len = results.rows.length, i;                    
                    i = 0;

                    if(len > 0 && vDateLicense > results.rows.item(0).license){
                        //console.log('Licencia Vencida');
                        console.log(results.rows.item(i).id);
                        $.ajax( {type:'POST',
                                url: ws_url,
                                dataType:'json',
                                data: {m:100,vx:userWS, vy:pdwWS, ui:results.rows.item(i).id, pw:results.rows.item(i).pwd},
                                success: function(data){ 
                                    if(data[0].flag == 'false'){
                                        console.log('Log OK');
                                        vQuery = 'DELETE FROM users WHERE id = \'' + results.rows.item(i).id + '\'';
                                        ejecutaSQL(vQuery, 0);
                                        setTimeout(function(){window.location.replace('login.html');}, 800);
                                    }else{

                                        if(vDateLicense>data[0].vdatos[0].license){
                                            setTimeout(function(){window.location.replace('login.html');}, 800);
                                        }

                                        vQuery = 'UPDATE users SET license = '+ data[0].vdatos[0].license +' WHERE id = \'' + results.rows.item(i).id + '\'';
                                        ejecutaSQL(vQuery, 0);
                                        //console.log(results.rows.item(i).name);
                                        vDatosUsuario.user = results.rows.item(i).id;
                                        vDatosUsuario.login = 1;
                                        vDatosUsuario.perfil = results.rows.item(i).type;
                                        show_datos_user(vDatosUsuario.user);
                                        logInOut(vDatosUsuario.user, 1);      
                                        
                                        $("#page").show();
                                        $("#dvMain").show();
                                        $("#bg_login").hide();
                                        $("#dvUserName").html(vDatosUsuario.user);
                                        if(vDatosUsuario.perfil==201){
                                            $("#horusSuper").show();
                                        }else{
                                            $("#horusSuper").hide();
                                        }
                                    }
                                },
                                error: function(data){
                                    alert('Error consultando el servidor..');
                                    setTimeout(function(){window.location.replace('login.html');}, 800);
                                }
                        });                        	                                           
                    }else if (len > 0){   
                        //window.location.replace('login.html');                         
                        console.log('Loged In');
                        vDatosUsuario.user = results.rows.item(i).id;
                        vDatosUsuario.perfil = results.rows.item(i).type;
                        vDatosUsuario.login = 1;
                        show_datos_user(vDatosUsuario.user);
                        logInOut(vDatosUsuario.user, 1);      
                        
                        $("#page").show();
                        $("#dvMain").show();
                        $("#bg_login").hide();
                        $("#dvUserName").html(vDatosUsuario.user);

                        if(vDatosUsuario.perfil==201){
                            $("#horusSuper").show();
                        }else{
                            $("#horusSuper").hide();
                        }

                        setTimeout(function(){
                            var strUrl = '';
                            var arrFile = [];
                            db.transaction(function(cmd2){
                                cmd2.executeSql("SELECT * FROM tbl_files where id_file = ? order by correl asc", [vDatosUsuario.user], function (cmd2, results) {
                                    var len = results.rows.length;
                                    for(i=0;i<len; i++){
                                        strUrl += results.rows.item(i).strdtos;
                                        arrFile.push({id_file:results.rows.item(i).id_file, nombre:results.rows.item(i).name, tipo:results.rows.item(i).type, corel:results.rows.item(i).correl, dtos:results.rows.item(i).strdtos});
                                    }
                                    //console.log(strUrl);
                                    //console.log('Img Loaded');
                                    //sendFileToServer(arrFile);
                                    if(strUrl.length<=10){
                                        getFileToServer(vDatosUsuario.user);
                                    }else{
                                        displayImage(strUrl);
                                    }
                                });
                            });
                        }, 500);

                    }else{
                        window.location.replace('login.html'); 
                    }
                    //leeSMSs(); 
                });
            });
        }else{ 

            show_datos_user(vDatosUsuario.user);
            $("#page").show();
        	$("#dvMain").show(); 
        	$("#bg_login").hide(); 
            logInOut(tempLogin.user, 1); 	            
            $("#dvUserName").html(vDatosUsuario.user);
            //sleep(400);
            setTimeout(function(){
                var strUrl = '';
                var arrFile = [];   

                db.transaction(function(cmd){   
                    cmd.executeSql("SELECT * FROM users where login = ? ", [1], function (cmd, results) {                        
                        vDatosUsuario.perfil = results.rows.item(0).type;
                        if(vDatosUsuario.perfil==201){
                            $("#horusSuper").show();
                        }else{
                            $("#horusSuper").hide();
                        }
                    });
                });             

                db.transaction(function(cmd2){
                    cmd2.executeSql("SELECT * FROM tbl_files where id_file = ? order by correl asc", [vDatosUsuario.user], function (cmd2, results) {
                        var len = results.rows.length;

                        for(i=0;i<len; i++){
                            strUrl += results.rows.item(i).strdtos;
                            arrFile.push({id_file:results.rows.item(i).id_file, nombre:results.rows.item(i).name, tipo:results.rows.item(i).type, corel:results.rows.item(i).correl, dtos:results.rows.item(i).strdtos});          
                        }
                        //console.log(strUrl);                        
                        //console.log('Img Loaded');
                        //sendFileToServer(arrFile);                        
                        if(strUrl.length<=10){
                            getFileToServer(vDatosUsuario.user);
                        }else{
                            displayImage(strUrl);
                        }
                    });
                });
            }, 500);
        }
    }
    setTimeout( function(){ validaLogin();}, 100); 

    $("#imgUser").dblclick(function(){
        takePicture();
    });

    setTimeout(function(){
        db.transaction(function(cmd2){
            cmd2.executeSql("SELECT * FROM params where id = 1", [], function (cmd2, results) {
                var len = results.rows.length;
                if(len>0){
                    vTimerGPS = results.rows.item(0).dvalue;
                }
            });
        });
    }, 1000);

    $('[type=radio').on('change', function(event){
        var id_input = event.target.id.toString();
        var str_simbols = '';
        //console.log(id_input);
        if(id_input == "rdMap1" || id_input == 'rdMap2'){
            //console.log('Tipo map ' + event.target.value);
            vGindicadorMap = parseInt(event.target.value);          

        }else if(id_input == "rdMap3" || id_input == 'rdMap4'){
            if(id_input == "rdMap4"){
                $("#vUsuariosHorus").show();
            }else{
                $("#vUsuariosHorus").hide();
            }
            //console.log('Tacking ' + event.target.value);
            vGtipomap = parseInt(event.target.value);
        }
        setTimeout(function(){getMapDashOffline();}, 100);
    });

    $('#flip_online').on('change', function(event){
        if(event.target.value=='on'){
            getMapDash();
            vInteDash = setInterval(function(){ getMapDash(); }, 360000);
        }else{
            clearInterval(vInteDash);
        }
    });

});


function fchangUsr(){
    //console.log($("#vSelUsers").val());
    setTimeout(function(){getMapDashOffline();}, 100);
}
function show_datos_user(vUser){
    db.transaction(function(cmd2){
        cmd2.executeSql("SELECT * FROM users where id = ?", [vUser], function (cmd2, results) {
            var len = results.rows.length;
            if(len>0){
                vDatosUsuario.user = results.rows.item(0).id;
                vDatosUsuario.name = results.rows.item(0).name;
                vDatosUsuario.email = results.rows.item(0).email;
                vDatosUsuario.job = results.rows.item(0).job_title;
                vDatosUsuario.id_dms = results.rows.item(0).id_dms;
                vDatosUsuario.phone = results.rows.item(0).phone;


                $("#id_dms_user").html(vDatosUsuario.id_dms);
                $("#num_tel").html(vDatosUsuario.phone);
                $("#uid_user").html(vDatosUsuario.user.toLowerCase());
                $("#name_user").html(vDatosUsuario.name);
                $("#email_user").html(vDatosUsuario.email);
                $("#job_user").html(vDatosUsuario.job); 
            }
        });
    });
}



function hide_pags(){

    //$("#dvMain").hide();
    $("#dvtitle").html(vTitle); 
    $("#dvHorus").hide();
    $("#dvHsuper").hide();
    $("#vUsuariosHorus").hide();
}


function takePicture(){
    navigator.camera.getPicture(onSuccess, onFail, { quality: 50, sourceType:Camera.PictureSourceType.CAMERA, correctOrientation:true,
            cameraDirection: Camera.Direction.FRONT, allowEdit: true});

    function onSuccess(imageURI) {        
        var img = new Image();
        img.src = imageURI;
        saveImgtoDB(img);
    }

    function onFail(message) {
        alert('Failed because: ' + message);
    }
}

function displayImage(imgUri) {
    $("#imgUser").attr('src', imgUri);
}


function saveImgtoDB(imgFile){
    var cant_rows = 0;
    var arrImg = [];
    var strUrl = '';
    var arrStrUrl = [];
    var arrFile = [];
    img = imgFile;

    setTimeout(function(){   
                imgW = img.width;
                imgH = img.height;
                ratio = (imgH/imgW).toFixed(2);

                var wid = 640;
                var hei = wid*ratio;            

                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                canvas.width=wid;
                canvas.height=hei;
                ctx.drawImage(img, 0, 0, wid, hei);
                var dataurl = canvas.toDataURL("image/jpeg");
                cant = (dataurl.length/4000).toFixed(2);
                //console.log(cant);
                arr_decimal = cant.split('.');
                if(parseInt(arr_decimal[1])>0){
                    cant_rows = parseInt(arr_decimal[0]) + 1;
                }else{
                    cant_rows = parseInt(arr_decimal[0]);
                }
                //console.log(cant_rows);

                for(i=1; i<=cant_rows; i++){
                    //console.log('From:' + (i-1)*4000 + ' To:'+ ((i*4000)-1));
                    //console.log(i +','+ vFile.name + ',' + dataurl.substring((i-1)*4000, ((i*4000)-1)));
                    arrImg.push(dataurl.substring((i-1)*4000, (i*4000)));
                }
                //console.log(arrImg);
                for(j=0;j<arrImg.length; j++){
                    strUrl += arrImg[j].replace('"', '');
                    arrStrUrl.push({user:vDatosUsuario.user, num:j, name:'imgUser', type:'jpeg', dtos:arrImg[j].replace('"', '')});
                    arrFile.push({id_file:vDatosUsuario.user, nombre:'imgUser', tipo:'jpeg', corel:j, dtos:arrImg[j].replace('"', '')});                              
                }

                //console.log(strUrl.length +'-'+ dataurl.length);
                //console.log(strUrl);
                ejecutaSQL('DELETE FROM tbl_files where id_file=\'' + arrStrUrl[0].user + '\'', 0)
                setTimeout(function(){
                    for(i=0;i<arrStrUrl.length; i++){
                        vQry = 'INSERT INTO tbl_files (id_file, correl, name, type, strdtos) VALUES(';
                        vQry += '\'' + arrStrUrl[i].user + '\',' + arrStrUrl[i].num + ',\''  + arrStrUrl[i].name + '\',\'' + arrStrUrl[i].type + '\',\'' + arrStrUrl[i].dtos + '\')';                
                        //console.log(vQry);
                        ejecutaSQL(vQry, 0); 
                    }
                    sendFileToServer(arrFile);

                }, 1000);

                displayImage(strUrl);
            }, 500);     
}

function backButton(){

    if(parseInt(pgActual) != 0){        
        for(i=0; i<pagRoot.length; i++){
            if(parseInt(pagRoot[i].id) == parseInt(pgActual)){
                //console.log(pgActual);
                switchMenu(pagRoot[i].id, pagRoot[i].back);
            }
        }
    } 
}

function switchMenu(vIdFrom, vIdTo){
    pgActual = vIdTo;
    pgBack = vIdFrom;
    //console.log('A-' + pgActual + '/B-' + pgBack);

    switch(vIdTo)
    {
        case 0:
            hide_pags();            
            $('#lbl_title').html('SO - Horus');            
            $("#dvHead").show();
            $("#dvHorus").show();
            show_datos_user(vDatosUsuario.user);                                

        break;
        case 1:            
            hide_pags();
            getMapDash(14.618086,-86.959082);
            $('#lbl_title').html('SO - Horus');            
            $("#dvHead").show();
            $("#dvHsuper").show();
            
        break;
        case 3:
            hide_pags();
            $("#pagDMS_forms").show();
            $("#forms_list").show();
            $("#forms_enviados").hide();
            $("#forms_pendientes").hide();

            $('#lbl_title').html('DOCUMENTOS DMS');
            $("#dvHead").show();
            show_Forms();
            vfechini = getYMD(0);
            vfechfin = getYMD(0);
            $("#fechIniForm").val(vfechini.substr(0,4) + '-' + vfechini.substr(4,2) + '-' + vfechini.substr(6,2));
            $("#fechFinForm").val(vfechfin.substr(0,4) + '-' + vfechfin.substr(4,2) + '-' + vfechfin.substr(6,2));

        break;
        case 100:
            hide_pags();
            $("#dv_forms_template").show();
            $('#lbl_title').html('DOCUMENTOS DMS');
            $("#dvHead").show();
        break
    }
    $("#dvMenu").panel('close');
}

function saveGPS(vFecha, vLat, vLng, vUser){
    //navigator.vibrate(25); 
    $.ajax({
        type: 'POST',
        data: {m:201,vx:userWS, vy:pdwWS, f:vFecha, lat:vLat, lng:vLng, ui:vUser},        
        dataType:'text',
        url: ws_url,
        success: function(data){
            //alert(data);
            console.log('Sucess Save on Server');
        },
        error: function(data){
            console.log(data);
            //alert(data);
        }
    });
}

function getMapLocation() { 
    navigator.geolocation.getCurrentPosition(onSuccess, onErrorF, { enableHighAccuracy: true });
}

function onSuccess(position){
    var vD = 0;
    d = new Date();
    h = '00';
    m = '00';
    sc = '00';

    if(d.getHours() < 10){
        h = '0' + d.getHours();
    }else{
        h = d.getHours();
    }

    if(d.getMinutes() < 10){
        m = '0' + d.getMinutes();
    }else{
        m = d.getMinutes();
    }

    if(d.getSeconds() < 10){
        sc = '0' + d.getSeconds();
    }else{
        sc = d.getSeconds();
    }

    //console.log(h +'+'+m);
    vLat = position.coords.latitude;
    vLng = position.coords.longitude;


    saveGPS(getYMD(0) + h + m + sc, position.coords.latitude, position.coords.longitude, vDatosUsuario.user); 

    //vQre = 'INSERT INTO records (fecha, lat, lng, user) VALUES(\'' + getYMD(0) + h + m + sc + '\',';
    //vQre += position.coords.latitude + ',' + position.coords.longitude + ',\''+ vDatosUsuario.user + '\')';
    vQre = 'DELETE FROM tbl_kmtrs';
    ejecutaSQL(vQre, 0);

    setTimeout(function(){

        if(lat1 != 0 && lng1 !=0){
            vD = getDistanceFromLatLonInKm(lat1, lng1, vLat,vLng);
            console.log(vD);
            vDistance += parseFloat(vD);
        }else{
            vDistance = 0;
        }
        
        vQre = 'insert into tbl_kmtrs (user, fech, lat1, lng1, kmtr) ';
        vQre += 'values (\''+ vDatosUsuario.user +'\',' + (getYMD(0) + ''+ getHMS()) +',' + vLat +',' + vLng +','+ vDistance +')';
        ejecutaSQL(vQre, 0);

        lat1 = vLat;
        lng1 = vLng;

        getMap(position.coords.latitude, position.coords.longitude);
        if(vFechIniHorus != 0){
            $("#dvHoraini").html('<b>Hora Inicio</b><br/>' + getFechFormated(vFechIniHorus));
        }else{
            $("#dvHoraini").html('<b>Hora Inicio</b><br/>-');
        }        
        $("#kmts_num").html('<h2>' + vDistance.toFixed(2) + ' Kmts.</h2>');

    }, 100);   
    
    
    //$("#test").append(d.getHours() +':'+ d.getMinutes() + '<br />' + position.coords.latitude + '/' + position.coords.longitude + '<br />');
    //navigator.vibrate(100);
}
function onErrorF(error){
    window.plugins.toast.show(error, 1000, 'bottom'); 
    console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}


function tracking(){

    if(vFlagTracking ==  false){
        db.transaction(function(cmd2){
            cmd2.executeSql("SELECT * FROM tbl_kmtrs", [], function (cmd2, results) {
                var len = results.rows.length;
                if(len>0){
                    lat1 = results.rows.item(0).lat1;
                    lng1 = results.rows.item(0).lng1;
                    vDistance = results.rows.item(0).kmtr;
                    vFechIniHorus = results.rows.item(0).fech;
                }else{
                    lat1 = 0;
                    lng1 = 0;
                    vDistance = 0;
                    vFechIniHorus = getYMD(0) +''+ getHMS();
                }
            });
        });

        cordova.plugins.backgroundMode.setEnabled(true); 
        clearInterval(vIntervalGeo);
        console.log('starting..');
        $("#startGPS").hide();
        $("#stopGPS").show();

        vFlagTracking = true;
        getMapLocation();
        vIntervalGeo = setInterval(function(){ getMapLocation(); }, vTimerGPS);

    }else{
        $("#startGPS").show();
        $("#stopGPS").hide();
        clearInterval(vIntervalGeo);
        vFlagTracking = false;
        cordova.plugins.backgroundMode.setEnabled(false); 
        vQre = 'DELETE FROM tbl_kmtrs';
        ejecutaSQL(vQre, 0);
    }
}

function logout(){
    //console.log(vDatosUsuario.user);
    logInOut(vDatosUsuario.user, 0);
    setTimeout(function(){ window.location.replace('index.html?user=0&login=0'); }, 800);
}


function getParams(param) {
    var vars = {};
    window.location.href.replace( location.hash, '' ).replace( 
        /[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
        function( m, key, value ) { // callback
            vars[key] = value !== undefined ? value : '';
        }
    );

    if ( param ) {
        return vars[param] ? vars[param] : null;    
    }
    return vars;
}

function getYearMoth(vM){
    var vResult = '';
    var year = 0;
    var mes = 0;
    year = parseInt(getYMD(0).substring(0,4));
    mes = parseInt(getYMD(0).substring(4,6));

    mes = mes + vM
    if(mes < 1){
        mes = 12 + mes;
        year = year - 1
    }
    if(mes <10){
        vResult = year + "0" + mes;
    }else{
        vResult = year + "" + mes;
    }

    return vResult;
}

function getYMD(vDays){
    var vToday = new Date();
    var time = vToday.getTime();
    var milsecs = parseInt(vDays*24*60*60*1000);
    vToday.setTime(time + milsecs);

    var strDate = '';
    strDate = vToday.getFullYear();

    if(parseInt(vToday.getMonth() + 1) < 10 ){
        strDate += '0' + (vToday.getMonth()+1);
    }else{
        strDate += '' + (vToday.getMonth()+1);
    }
    if(parseInt(vToday.getDate()) < 10 ){
        strDate += '0' + vToday.getDate();
    }else{
        strDate += '' + vToday.getDate();
    }
    return strDate;
}

function getHMS(){
    var vToday = new Date();
    var time = vToday.getTime();
    //var milsecs = parseInt(vDays*24*60*60*1000);
    vToday.setTime(time);
    var strDate = '';

    if(parseInt(vToday.getHours()) < 10 ){
        strDate += '0' + (vToday.getHours());
    }else{
        strDate += '' + (vToday.getHours());
    }
    if(parseInt(vToday.getMinutes()) < 10 ){
        strDate += '0' + vToday.getMinutes();
    }else{
        strDate += '' + vToday.getMinutes();
    }
    if(parseInt(vToday.getSeconds()) < 10 ){
        strDate += '0' + vToday.getSeconds();
    }else{
        strDate += '' + vToday.getSeconds();
    }

    return strDate;
}


function getMonthName(vMonth){
    var ArrNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul','Ago','Sep','Oct', 'Nov', 'Dic'];
    return ArrNames[parseInt(vMonth)-1];
}
  

//Decodificador de datos
function hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}


//Codificador de datos
function str2Hex(strVar) {
    var hex = '';//force conversion
    var str = '';
    for (var i = 0; i < strVar.length; i ++)
        hex += '' + strVar.charCodeAt(i).toString(16); //  String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return hex;
}

//Decodificador Base64
function b64_to_str(vStr){
	return decodeURIComponent(escape(window.atob(vStr)));
}

function initMaps(lat, lng){
    var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 10,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map1 = new google.maps.Map(document.getElementById("mapHorus"), mapOptions);
    mapDash = new google.maps.Map(document.getElementById("dvMapDash"), mapOptions);  

    infoW = new google.maps.InfoWindow({ content: '-'});
    infoW2 = new google.maps.InfoWindow({ content: '-'});

    recorridoDash = new google.maps.Polyline({
                    path:[{lat:0, lng:0}],
                    geodesic: true,
                    strokeColor: '#FF0000'
                });

    var latLong = new google.maps.LatLng(0, 0);
    markIni = new google.maps.Marker({
        position: latLong
    });
    markFin = new google.maps.Marker({
        position: latLong
    });

    latLong = new google.maps.LatLng(lat, lng);
    markHorus = new google.maps.Marker({
        position: latLong
    });

}


function getMap(latitude, longitude) {

    var latLong = new google.maps.LatLng(latitude, longitude);
    markHorus.setPosition(latLong);

    markHorus.setMap(map1);
    map1.setZoom(10);
    map1.setCenter(markHorus.getPosition());
}

function setMarkGPS(lat, lng){
    var latLong = new google.maps.LatLng(lat, lng);
    marker.setMap(null);

    marker = new google.maps.Marker({
        position: latLong
    });

    marker.setMap(map);
    map.setCenter(marker.getPosition());
}


function getBase64(file) {
   var reader = new FileReader();
   reader.readAsDataURL(file);
   reader.onload = function () {
     //console.log(reader.result);
   };
   reader.onerror = function (error) {
     //console.log('Error: ', error);
   };
}


function resize_img(){
    setTimeout(function(){ 
        wuser = $("#imgUser").width()*1.02; 
        //console.log('Resizin img - ' + wuser);
        $("#imgUser").css('height', 
        wuser); }, 
    200);
}




function validaCampo(vDato, vTipo){
    var result;

    switch(vTipo){
        //Numerico
        case 0:
            if (/^\s*$/.test(vDato)){
                result = 0;
            }else{
                if(/[0-9]/.test(vDato)){
                    result = vDato;
                }else{
                    result = 0;
                }
            }
        break;
        //Alfanumerico
        case 1:
            if (/^\s*$/.test(vDato)){
                result ='-';
            }else{
                result = vDato;                
            }
        break;
        default:
            result = 0;
        break;
    }
    return result;
}


function sendFileToServer(vArrFile){
    $.ajax({
        url:ws_url,
        type:'POST',
        data:{m:303,vx:userWS, vy:pdwWS, arrFile:vArrFile},        
        dataType:'text',
        success: function(data){
            console.log(data);
        }, 
        error: function(error){
            console.log(error);
        }
    });  
}

function getFileToServer(vFileId){

    var result;
    var strImg = '';
    $.ajax({
        url:ws_url,
        type:'POST',
        data:{m:304,vx:userWS, vy:pdwWS, idFile:vFileId},        
        dataType:'text',
        success: function(data){
            result = eval(data);
            //console.log(result);
            ejecutaSQL('DELETE FROM tbl_files where id_file=\'' + result[0].id_file + '\'', 0)
            setTimeout(function(){
                for(i=0;i<result.length; i++){
                    strImg += result[i].dtos;
                    vQry = 'INSERT INTO tbl_files (id_file, correl, name, type, strdtos) VALUES(';
                    vQry += '\'' + result[i].id_file + '\',' + result[i].corel + ',\''  + result[i].name + '\',\'' + result[i].tipo + '\',\'' + result[i].dtos + '\')';                
                    //console.log(vQry);
                    ejecutaSQL(vQry, 0); 
                }
                //console.log('Img Saved Done');
                if(strImg.length>=10){
                    displayImage(strImg);                    
                }else{
                    displayImage('img/salesman.png');
                }
            }, 1000);
        }, 
        error: function(error){
            console.log(error);
        }
    });  
}

/* calcular distancia entre 2 coordenadas en Kmts*/
function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deltaphi
  var dLon = deg2rad(lon2-lon1);  // deltalambda

  var phi1 = deg2rad(lat1);
  var phi2 = deg2rad(lat2)
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(phi1) * Math.cos(phi2) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 

  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km

  return d.toFixed(2);
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


function getMapDash() {
    var latLong;
    var urlImg;
    var vFlag = 0;
    var str_simbols = '';
    var countRed = 0;
    var countYel = 0;
    var countGre = 0;
    var countGra = 0;

    /*Limpia marcas del mapa*/
    for(i=0; i<markerDash.length; i++){
        markerDash[i].setMap(null);     
    }
    markerDash = [];
    recorridoDash.setMap(null);
    recorridoPath = [];
    markIni.setMap(null);
    markFin.setMap(null);

    $.mobile.loading('show');
    $.ajax({
        url:ws_url,
        type:'POST',
        data:{m:103,vx:userWS, vy:pdwWS, ui:vDatosUsuario.user},        
        dataType:'text',
        success: function(data){
            result = eval('(' + data + ')');
            //console.log(result);
            if(vGtipomap==0){
                $("#vSelUsers").empty();
                for(j=0;j<result.gps.length; j++){
                    if (j==0){
                        $('#vSelUsers').append('<option value="' + result.gps[j].user + '" selected="selected">'+ result.gps[j].user +'</option>');
                    }else{
                        $('#vSelUsers').append('<option value="' + result.gps[j].user + '">'+ result.gps[j].user +'</option>');
                    }
                }
                $('#vSelUsers').selectmenu("refresh");                
            }

            //Insert nuevas GPS obtenidas del WS
            if(result.gps.length>0){              

                ejecutaSQL('DELETE FROM gps_actual');
                setTimeout(function(){
                    for(i=0;i<result.gps.length; i++){
                        vQry = 'INSERT INTO gps_actual (user, fecha, lat, lng, flag_ini, flag_plan) VALUES(';
                        vQry += '\'' + result.gps[i].user + '\',' + result.gps[i].fech + ','  + result.gps[i].lat.toString().replace(",", ".") + ',' + result.gps[i].lng.toString().replace(",", ".") + ',' + result.gps[i].flag_ini + ',' + result.gps[i].flag_plan + ')';                
                        
                        ejecutaSQL(vQry, 0); 
                    }
                    
                }, 500);
            }

            if(result.recorridos.length>0){
                ejecutaSQL('DELETE FROM gps_recorridos');
                setTimeout(function(){
                    for(i=0;i<result.recorridos.length; i++){
                        vQry = 'INSERT INTO gps_recorridos (user, fecha, lat, lng) VALUES(';
                        vQry += '\'' + result.recorridos[i].user + '\',' + result.recorridos[i].fech + ','  + result.recorridos[i].lat.toString().replace(",", ".") + ',' + result.recorridos[i].lng.toString().replace(",", ".") +  ')';                
                        
                        ejecutaSQL(vQry, 0); 
                    }
                }, 1000);
            }

            for(i=0;i<result.gps.length; i++){

                if(vGindicadorMap==0){
                    vFlag = parseInt(result.gps[i].flag_ini);
                }else{
                    vFlag = parseInt(result.gps[i].flag_plan);
                }

                switch(vFlag)
                {
                    case 1:
                        urlImg = 'img/p_red.png';
                        countRed ++;
                    break;
                    case 2:
                        urlImg = 'img/p_yellow.png';
                        countYel ++;
                    break;
                    case 3:
                        urlImg = 'img/p_green.png';
                        countGre ++;
                    break;
                    default:
                        urlImg = 'img/p_gray.png';
                        countGra ++;
                    break;

                }

                latLong = new google.maps.LatLng(result.gps[i].lat.replace(",", "."), result.gps[i].lng.replace(",", "."));
                var jsn1 = {user:result.gps[i].user, fech:getFechFormated(result.gps[i].fech)};
                var vTbl;
                vTbl =  '<table border="0" cellspacing="1">';
                vTbl += '<tr><td><b>'+ jsn1.user +'</b></td></tr>';
                vTbl += '<tr><td>'+ jsn1.fech +'</tr>';
                vTbl += '</table>';

                drawMark(latLong, result.gps[i].user, vTbl, urlImg, mapDash)

            }
            

            if(vGtipomap==1){
                var userRec = $("#vSelUsers").val();
                //console.log(userRec);
                for(i=0;i<result.recorridos.length; i++){
                    if(result.recorridos[i].user.toUpperCase() == userRec.toUpperCase()){
                        recorridoPath.push({lat: parseFloat(result.recorridos[i].lat.toString().replace(",", ".")), lng:parseFloat(result.recorridos[i].lng.toString().replace(",", "."))});    
                    }
                    
                }
                //console.log(recorridoPath);
                recorridoDash = new google.maps.Polyline({
                    path:recorridoPath,
                    geodesic: true,
                    strokeOpacity:0.8,
                    strokeColor: '#FF0000'
                });

                var latLong = new google.maps.LatLng(recorridoPath[0].lat, recorridoPath[0].lng);
                var vTbl;
                vTbl =  '<table border="0" cellspacing="1">';
                vTbl += '<tr><td><b>Inicio</b></td></tr>';
                vTbl += '<tr><td><b>'+ userRec +'</b></td></tr>';
                vTbl += '<tr><td>'+ getFechFormated(result.recorridos[0].fech) +'</tr>';
                vTbl += '</table>';

                markIni = new google.maps.Marker({
                    position: latLong,
                    icon: 'img/markini.png'
                });
                markIni.addListener('click', function(){
                    showInforW(markIni, vTbl, mapDash);
                });

                latLong = new google.maps.LatLng(recorridoPath[recorridoPath.length-1].lat, recorridoPath[recorridoPath.length-1].lng);
                setTimeout(function(){
                    var vTbl =  '<table border="0" cellspacing="1">';
                    vTbl += '<tr><td><b>Fin</b></td></tr>';
                    vTbl += '<tr><td><b>'+ userRec +'</b></td></tr>';
                    vTbl += '<tr><td>'+ getFechFormated(result.recorridos[result.recorridos.length-1].fech)  +'</tr>';
                    vTbl += '</table>';
                    markFin = new google.maps.Marker({
                        position: latLong,
                        icon: 'img/markfin2.png'
                    });
                    markFin.addListener('click', function(){
                        showInforW2(markFin, vTbl, mapDash);
                    });

                    markIni.setMap(mapDash);
                    markFin.setMap(mapDash);
                    recorridoDash.setMap(mapDash);
                    mapDash.setCenter(latLong);
                },100);              
            }else{
                for(i=0; i<markerDash.length; i++){                       
                    markerDash[i].setMap(mapDash); 
                }
                latLong = new google.maps.LatLng(14.618086, -86.959082);
                mapDash.setCenter(latLong);
                mapDash.setZoom(7); 
            }

            if(vGindicadorMap == 0){
                str_simbols +='<div class=\"ui-grid-c\">';
                str_simbols +='            <div class=\"ui-block-a\">';
                str_simbols +='                <center><img src=\"img/map-marker-gray.png\" width=\"30px\" />';
                str_simbols +='                    <label style=\"font-size:0.8em\">No Marca</label><label style=\"font-size:0.8em\">'+ countGra +'</label>';
                str_simbols +='            </div>';
                str_simbols +='            <div class=\"ui-block-b\">';
                str_simbols +='                <center><img src=\"img/map-marker-red.png\" width=\"30px\" />';
                str_simbols +='                    <label style=\"font-size:0.8em\">Mrc Fuera</label><label style=\"font-size:0.8em\">'+ countRed +'</label>';
                str_simbols +='            </div>';
                str_simbols +='            <div class=\"ui-block-c\">';
                str_simbols +='                <center><img src=\"img/map-marker-yellow.png\" width=\"30px\" />';
                str_simbols +='                    <label style=\"font-size:0.8em\">Mrc Tarde</label><label style=\"font-size:0.8em\">'+ countYel +'</label>';
                str_simbols +='            </div>';
                str_simbols +='            <div class=\"ui-block-d\">';
                str_simbols +='                <center><img src=\"img/map-marker-green.png\" width=\"30px\" />';
                str_simbols +='                    <label style=\"font-size:0.8em\">Mrc a Tiempo</label><label style=\"font-size:0.8em\">'+ countGre +'</label>';
                str_simbols +='           </div>';
                str_simbols +='       </div>';
            }else{
                str_simbols +='<div class=\"ui-grid-b\">';
                str_simbols +='           <div class=\"ui-block-b\">';
                str_simbols +='               <center><img src=\"img/map-marker-red.png\" width=\"30px\" />';
                str_simbols +='                   <label style=\"font-size:0.8em\">No Prsp. No Mov.</label><label style=\"font-size:0.8em\">'+ countRed +'</label>';
                str_simbols +='            </div>';
                str_simbols +='           <div class=\"ui-block-c\">';
                str_simbols +='               <center><img src=\"img/map-marker-yellow.png\" width=\"30px\" />';
                str_simbols +='                    <label style=\"font-size:0.8em\">Mov. no Prsp.</label><label style=\"font-size:0.8em\">'+ countYel +'</label>';
                str_simbols +='           </div>';
                str_simbols +='          <div class=\"ui-block-d\">';
                str_simbols +='              <center><img src=\"img/map-marker-green.png\" width=\"30px\" />';
                str_simbols +='                   <label style=\"font-size:0.8em\">Mov. y/o Prsp.</label><label style=\"font-size:0.8em\">'+ countGre +'</label>';
                str_simbols +='           </div>';
                str_simbols +='      </div>';
            }
            
            $("#mapSimbologia").html(str_simbols);   
            $("#mapSimbologia").trigger('refresh'); 
            $.mobile.loading('hide');           
        }, 
        error: function(error){
            console.log(error);
            $.mobile.loading('hide');
        }
    });  
    //map.setCenter(marker[0].getPosition());
}

function drawMark(vLatLng, vTitle, vjsn, vImg, vmap){
    var Tmarker = new google.maps.Marker({
            position: vLatLng,
            title: vTitle,
            icon:vImg
        });

        Tmarker.addListener('click', function(){
            showInforW(Tmarker, vjsn, vmap);
        });
        markerDash.push(Tmarker); 
}

function getMapDashOffline() {
    var latLong;
    var urlImg;
    var vFlag = 0;
    var str_simbols = '';
    var countRed = 0;
    var countYel = 0;
    var countGre = 0;
    var countGra = 0;

    var gps = [];
    var recorridos = [];

    /*Limpia marcas del mapa*/
    for(i=0; i<markerDash.length; i++){
        markerDash[i].setMap(null);     
    }
    markerDash = [];
    recorridoDash.setMap(null);
    recorridoPath = [];
    markIni.setMap(null);
    markFin.setMap(null);


    $.mobile.loading('show');

    if(vGtipomap == 0){
        db.transaction(function(cmd2){
            cmd2.executeSql("SELECT * FROM gps_actual", [], function (cmd2, results) {
                var len = results.rows.length;
                for(i=0;i<len; i++){
                    gps.push({user:results.rows.item(i).user, lat:results.rows.item(i).lat, lng:results.rows.item(i).lng, fech:results.rows.item(i).fecha, flag_ini:results.rows.item(i).flag_ini, flag_plan:results.rows.item(i).flag_plan});
                }
                $("#vSelUsers").empty();
                for(j=0;j<gps.length; j++){
                    if (j==0){
                        $('#vSelUsers').append('<option value="' + gps[j].user + '" selected="selected">'+ gps[j].user +'</option>');
                    }else{
                        $('#vSelUsers').append('<option value="' + gps[j].user + '">'+ gps[j].user +'</option>');
                    }
                }
                $('#vSelUsers').selectmenu("refresh");  


                for(i=0;i<gps.length; i++){

                    if(vGindicadorMap==0){
                        vFlag = parseInt(gps[i].flag_ini);
                    }else{
                        vFlag = parseInt(gps[i].flag_plan);
                    }

                    switch(vFlag)
                    {
                        case 1:
                            urlImg = 'img/p_red.png';
                            countRed ++;
                        break;
                        case 2:
                            urlImg = 'img/p_yellow.png';
                            countYel ++;
                        break;
                        case 3:
                            urlImg = 'img/p_green.png';
                            countGre ++;
                        break;
                        default:
                            urlImg = 'img/p_gray.png';
                            countGra ++;
                        break;

                    }
                    latLong = new google.maps.LatLng(gps[i].lat, gps[i].lng);
                    /*var Tmarker = new google.maps.Marker({
                        position: latLong,
                        title: gps[i].user,
                        icon:urlImg
                    });
                    markerDash.push(Tmarker);*/
                    var jsn1 = {user:gps[i].user, fech:getFechFormated(gps[i].fech)} ;
                    var vTbl;
                    vTbl =  '<table border="0" cellspacing="1">';
                    vTbl += '<tr><td><b>'+ jsn1.user +'</b></td></tr>';
                    vTbl += '<tr><td>'+ jsn1.fech +'</tr>';
                    vTbl += '</table>';
                    drawMark(latLong, gps[i].user, vTbl, urlImg, mapDash)
                }

                for(i=0; i<markerDash.length; i++){
                    markerDash[i].setMap(mapDash);     
                }
                latLong = new google.maps.LatLng(14.618086, -86.959082);
                mapDash.setCenter(latLong);

                if(vGindicadorMap == 0){
                    str_simbols +='<div class=\"ui-grid-c\">';
                    str_simbols +='            <div class=\"ui-block-a\">';
                    str_simbols +='                <center><img src=\"img/map-marker-gray.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">No Marca</label><label style=\"font-size:0.8em\">'+ countGra +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='            <div class=\"ui-block-b\">';
                    str_simbols +='                <center><img src=\"img/map-marker-red.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mrc Fuera</label><label style=\"font-size:0.8em\">'+ countRed +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='            <div class=\"ui-block-c\">';
                    str_simbols +='                <center><img src=\"img/map-marker-yellow.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mrc Tarde</label><label style=\"font-size:0.8em\">'+ countYel +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='            <div class=\"ui-block-d\">';
                    str_simbols +='                <center><img src=\"img/map-marker-green.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mrc a Tiempo</label><label style=\"font-size:0.8em\">'+ countGre +'</label>';
                    str_simbols +='           </div>';
                    str_simbols +='       </div>';
                }else{
                    str_simbols +='<div class=\"ui-grid-b\">';
                    str_simbols +='           <div class=\"ui-block-b\">';
                    str_simbols +='               <center><img src=\"img/map-marker-red.png\" width=\"30px\" />';
                    str_simbols +='                   <label style=\"font-size:0.8em\">No Prsp. No Mov.</label><label style=\"font-size:0.8em\">'+ countRed +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='           <div class=\"ui-block-c\">';
                    str_simbols +='               <center><img src=\"img/map-marker-yellow.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mov. no Prsp.</label><label style=\"font-size:0.8em\">'+ countYel +'</label>';
                    str_simbols +='           </div>';
                    str_simbols +='          <div class=\"ui-block-d\">';
                    str_simbols +='              <center><img src=\"img/map-marker-green.png\" width=\"30px\" />';
                    str_simbols +='                   <label style=\"font-size:0.8em\">Mov. y/o Prsp.</label><label style=\"font-size:0.8em\">'+ countGre +'</label>';
                    str_simbols +='           </div>';
                    str_simbols +='      </div>';
                }

                $("#mapSimbologia").html(str_simbols);   
                $("#mapSimbologia").trigger('refresh'); 

                $.mobile.loading('hide');

            });
        });

    }else if(vGtipomap==1){
        var userRec = $("#vSelUsers").val();

        db.transaction(function(cmd2){
            cmd2.executeSql("SELECT * FROM gps_recorridos where user = ? order by fecha", [userRec], function (cmd2, results) {
                var len = results.rows.length;
                for(i=0;i<len; i++){
                    recorridos.push({user:results.rows.item(i).user, lat:results.rows.item(i).lat, lng:results.rows.item(i).lng});
                }

                //console.log(userRec);
                for(i=0;i<recorridos.length; i++){
                    if(recorridos[i].user.toUpperCase() == userRec.toUpperCase()){
                        recorridoPath.push({lat: parseFloat(recorridos[i].lat), lng:parseFloat(recorridos[i].lng)});    
                    }                    
                }
                //console.log(recorridoPath);
                recorridoDash = new google.maps.Polyline({
                    path:recorridoPath,
                    geodesic: true,
                    strokeOpacity:0.8,
                    strokeColor: '#FF0000'
                });

                var latLong = new google.maps.LatLng(recorridoPath[0].lat, recorridoPath[0].lng);
                var vTbl;
                    vTbl =  '<table border="0" cellspacing="1">';
                    vTbl += '<tr><td><b>Inicio</b></td></tr>';
                    vTbl += '<tr><td><b>'+ userRec +'</b></td></tr>';
                    vTbl += '<tr><td>'+ getFechFormated(results.rows.item(0).fecha) +'</tr>';
                    vTbl += '</table>';

                markIni = new google.maps.Marker({
                    position: latLong,
                    icon: 'img/markini.png'
                });
                markIni.addListener('click', function(){
                    showInforW(markIni, vTbl, mapDash);
                });

                latLong = new google.maps.LatLng(recorridoPath[recorridoPath.length-1].lat, recorridoPath[recorridoPath.length-1].lng);
                setTimeout(function(){
                    var vTbl =  '<table border="0" cellspacing="1">';
                    vTbl += '<tr><td><b>Fin</b></td></tr>';
                    vTbl += '<tr><td><b>'+ userRec +'</b></td></tr>';
                    vTbl += '<tr><td>'+ getFechFormated(results.rows.item(len-1).fecha)  +'</tr>';
                    vTbl += '</table>';
                    markFin = new google.maps.Marker({
                        position: latLong,
                        icon: 'img/markfin2.png'
                    });
                    markFin.addListener('click', function(){
                        showInforW2(markFin, vTbl, mapDash);
                    });

                    markIni.setMap(mapDash);
                    markFin.setMap(mapDash);
                    recorridoDash.setMap(mapDash);
                    mapDash.setCenter(latLong);
                }, 100);     
                /*vTbl =  '<table border="0" cellspacing="1">';
                    vTbl += '<tr><td><b>Fin</b></td></tr>';
                    vTbl += '<tr><td><b>'+ userRec +'</b></td></tr>';
                    vTbl += '<tr><td>'+ getFechFormated(results.rows.item(len-1).fecha) +'</tr>';
                    vTbl += '</table>';
                markFin = new google.maps.Marker({
                    position: latLong,
                    icon: 'img/markfin2.png'
                });
                markFin.addListener('click', function(){
                    showInforW2(markFin, vTbl, mapDash);
                });

                markIni.setMap(mapDash);
                markFin.setMap(mapDash);
                recorridoDash.setMap(mapDash);
                mapDash.setCenter(latLong);*/

                if(vGindicadorMap == 0){
                    str_simbols +='<div class=\"ui-grid-c\">';
                    str_simbols +='            <div class=\"ui-block-a\">';
                    str_simbols +='                <center><img src=\"img/map-marker-gray.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">No Marca</label><label style=\"font-size:0.8em\">'+ countGra +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='            <div class=\"ui-block-b\">';
                    str_simbols +='                <center><img src=\"img/map-marker-red.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mrc Fuera</label><label style=\"font-size:0.8em\">'+ countRed +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='            <div class=\"ui-block-c\">';
                    str_simbols +='                <center><img src=\"img/map-marker-yellow.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mrc Tarde</label><label style=\"font-size:0.8em\">'+ countYel +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='            <div class=\"ui-block-d\">';
                    str_simbols +='                <center><img src=\"img/map-marker-green.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mrc a Tiempo</label><label style=\"font-size:0.8em\">'+ countGre +'</label>';
                    str_simbols +='           </div>';
                    str_simbols +='       </div>';
                }else{
                    str_simbols +='<div class=\"ui-grid-b\">';
                    str_simbols +='           <div class=\"ui-block-b\">';
                    str_simbols +='               <center><img src=\"img/map-marker-red.png\" width=\"30px\" />';
                    str_simbols +='                   <label style=\"font-size:0.8em\">No Prsp. No Mov.</label><label style=\"font-size:0.8em\">'+ countRed +'</label>';
                    str_simbols +='            </div>';
                    str_simbols +='           <div class=\"ui-block-c\">';
                    str_simbols +='               <center><img src=\"img/map-marker-yellow.png\" width=\"30px\" />';
                    str_simbols +='                    <label style=\"font-size:0.8em\">Mov. no Prsp.</label><label style=\"font-size:0.8em\">'+ countYel +'</label>';
                    str_simbols +='           </div>';
                    str_simbols +='          <div class=\"ui-block-d\">';
                    str_simbols +='              <center><img src=\"img/map-marker-green.png\" width=\"30px\" />';
                    str_simbols +='                   <label style=\"font-size:0.8em\">Mov. y/o Prsp.</label><label style=\"font-size:0.8em\">'+ countGre +'</label>';
                    str_simbols +='           </div>';
                    str_simbols +='      </div>';
                }

                $("#mapSimbologia").html(str_simbols);   
                $("#mapSimbologia").trigger('refresh'); 
                $.mobile.loading('hide');

            });
        });
        
    }    
}

function showInforW(vMark, vHtml, vMapx){

    infoW.setContent(vHtml);
    infoW.open(vMapx, vMark); 
}

function showInforW2(vMark, vDatosHTML, vMapx){
    infoW2.setContent(vDatosHTML);
    infoW2.open(vMapx, vMark); 
}

function getFechFormated(vNumFech){
    var vReturn;
    var vAnio = vNumFech.toString().substr(0,4);
    var vMesNum = vNumFech.toString().substr(4,2);
    var vDia = vNumFech.toString().substr(6,2);
    var vHh = vNumFech.toString().substr(8,2);
    var vMn = vNumFech.toString().substr(10,2);

    vStrMes = getMonthName(parseInt(vMesNum));

    vReturn = vAnio + '-' + vStrMes + '-'+ vDia + ' ' + vHh +':'+ vMn;

    return  vReturn;
}