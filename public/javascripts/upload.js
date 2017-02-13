/*globals $:false , jQuery:false*/
// Client-side code/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
window.addEventListener("load", ready);
var auth = {};

auth.getToken = function () {
    return localStorage.getItem("savTrack-token");
}

auth.isLoggedIn = function () {
    var token = auth.getToken();

    if (token) {
        var payload = JSON.parse(window.atob(token.split('.')[1]));
        return payload.exp > Date.now() / 1000;
    } else {
        return false;
    }

};

auth.currentUser = function () {

    if (auth.isLoggedIn()) {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            return payload.username;
        } else {
            return false;
        }

    }

}

function ready() {

    $("#uploadmodal").leanModal();
    if (window.File && window.FileReader) {
        document.getElementById('filebox').addEventListener('change', fileChosen);
        document.getElementById('uploadbutton').addEventListener('click', startUpLoad);
        document.getElementById('closebutton').addEventListener('click', closeModal);
    } else {
        document.getElementById('uploadarea').innerHTML = "Browser not supported";
    }
}

var selectedFile;

function fileChosen(event) {
    selectedFile = event.target.files[0];
    document.getElementById('namebox').value = selectedFile.name;
}

var fReader;
var name;
var desc;
var socket = io();
var songName;

function startUpLoad() {
    if (document.getElementById('filebox').value != "") {
        fReader = new FileReader();
        name = document.getElementById('namebox').value;
        songName = name;
        var content = "<span id ='namearea'>Uploading " + name + "</span>";
        content += "<div id='progresscontainer'><div id='progressbar'></div></div><span id='percent'>0%</span>";
        content += "<span id='uploaded'>---<span id='MB'>0</span>/" + Math.round(selectedFile.size / 1048576) + "MB</span>";
        document.getElementById('uploadarea').innerHTML = content;
        fReader.onload = function (evnt) {
            socket.emit('Upload', {
                'Name': name,
                Data: evnt.target.result
            });
        }
        socket.emit('Start', {
            'Name': name,
            'Size': selectedFile.size
        });

    } else {
        alert("please select a file");
    }
}

socket.on('MoreData', function (data) {
    UpdateBar(data['Percent']);
    var place = data['Place'] * 524288;
    var NewFile;
    if (selectedFile.webkitSlice)
        NewFile = selectedFile.webkitSlice(place, place + Math.min(524288, (selectedFile.size - place)));
    else
        NewFile = selectedFile.slice(place, place + Math.min(524288, (selectedFile.size - place)));
    fReader.readAsBinaryString(NewFile);
});

function UpdateBar(percent) {
    document.getElementById('progressbar').style.width = percent + '%';
    document.getElementById('percent').innerHTML = (Math.round(percent * 100) / 100) + '%';
    var mbDone = Math.round(((percent / 100.0) * selectedFile.size) / 1048576);
    document.getElementById('MB').innerHTML = mbDone;
}

var path = "http://localhost:3000";
socket.on('Done', function (data) {
    console.log("success");

    videoDet(songName);
    var content = "<div class='success'><img id='thumb' src='/image/success.png' alt='" + name + "'><br>";
    content += "<button  type='button' value='' id='close' class='waves-effect waves-light btn'>Close</button></div>";
    document.getElementById('uploadarea').innerHTML = content;
    document.getElementById('close').addEventListener('click', refresh);
});

function refresh() {
    location.reload(true);
}
getVidData();

function videoDet(name) {
    $.ajax({
        type: "POST",
        url: 'http://localhost:3000/vdetails',
        data: {
            name: name,
            username: auth.currentUser
        },
        success: function (data) {
            console.log('post successful!');
        },
        error: function () {
            console.log('post error!');
        }
    });
}

function getVidData() {
    $.ajax({
        url: 'http://localhost:3000/details',
        type: 'GET',
        data: {
            username: auth.currentUser
        },
        success: function (data) {
            console.log("its here" + data);
            data.forEach(function (details) {
                if (details.name != "") {
                    var vidName = details.name;
                    console.log(vidName);
                    createImage(vidName);
                } else {
                    console.log("error fetch details");
                }
            });
        },
        error: function (error) {
            console.log("Error fetching getVidData!!");
        }
    });
}


function createImage(vidName) {
    var $content = "<li>" + "<input id = '1' type = 'button' class='song' value = '" + vidName + "'>" + "</li>";
    $($content).appendTo('#list');
}


function closeModal() {
    $('.modal').closeModal();
}