/*globals $:false , jQuery:false*/
// Client-side code/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
$(document).ready(function () {

    var auth = {};
    var currSongName;
    var socket = io("http://localhost:3000/");

    // $("#CurrSong").prop('disabled', true);


    var element = $("#chat_win");
    element.scrollTop = element.scrollHeight;

    auth.getToken = function () {

        return localStorage.getItem("savTrack-token");
    }


    auth.isLoggedIn = function () {
        var token = auth.getToken();

        if (token) {
            var payload = JSON.parse(window.atob(token.split('.')[1]));
            //console.log(payload.exp > Date.now() / 1000);
            return payload.exp > Date.now() / 1000;
        } else {
            return false;
        }
    }

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



    var url = window.location.href;
    var roomNo = url.split("/")[4];
    var flag = "false";

    $.ajax({
        url: "/getUserRoom",
        type: "GET",
        dataType: "json",
        data: {
            "roomNo": roomNo
        },
        async: false,
        contentType: 'application/json',
        success: function (result) {

            var usr;
            result.forEach(function (index) {
                console.log(index.username);

                if (index.username === auth.currentUser()) {
                    flag = "true";
                    saveSuccess(flag);

                } else {
                    flag = "false";
                    saveSuccess(flag);
                }
            });
        },
        error: function (status) {
            window.alert(status);
        }
    });

    var ifMatchedUser;

    function saveSuccess(data) {
        ifMatchedUser = data

        if (ifMatchedUser === "false") {
            $("#top-15").hide();
            $("#upload").hide();
            $
        }

        if (ifMatchedUser === "true") {
            $("#CurrSong").hide();
        }
    }


    socket.on("currentPausePlayResult", function (data) {

        var vid = document.getElementById("audio_src");
        $("#CurrSong").val(data.currSongSrc.split(".")[0]);
        $('#currentSong').html(data.currSongSrc.split(".")[0]);

        if (data.currentPausePlay === "true") {
            if (vid.paused) {
                var sgName = "/audio/" + data.currSongSrc;
                $("#audio_src").attr("src", sgName);

                vid.currentTime = data.currTime;
                vid.play();
            }
        } else if (data.currentPausePlay === "false") {
            if (vid.played) {
                var sgName = "/audio/" + data.currSongSrc;
                $("#audio_src").attr("src", sgName);

                vid.currentTime = data.currTime;
                vid.pause();
            }
        }
    });

    $(document).on('click', '.song', function () {
        console.log("clicked");

        currSongName = $(this).attr("value");

        var sgName = "/audio/" + currSongName;

        $("#audio_src").attr("src", sgName);

        if (ifMatchedUser === "true") {

            socket.emit('sktEvent', {
                "currentPausePlay": "false",
                "currSongSrc": currSongName,
                "currTime": 0
            });
        }

    });

    if (auth.isLoggedIn()) {
        var url = window.location.href;
        var roomNo = url.split("/")[4];

        var sourceUrl = "/audio/FifthHarmony.mp3";
        $("#audio_src").attr("src", sourceUrl);


        $("video").on("play", function () {
            if (ifMatchedUser === "true") {
                currentPausePlay = "true";
                var currSongSrc = document.getElementById("audio_src").src;
                var str = currSongSrc.split("/");
                currSongSrc = str[4];

                var vid = document.getElementById("audio_src");
                var currTime = vid.currentTime;

                socket.emit('sktEvent', {
                    "currentPausePlay": "true",
                    "currSongSrc": currSongSrc,
                    "currTime": currTime
                });

            }
        });

        $("video").on("pause", function () {

            if (ifMatchedUser === "true") {
                currentPausePlay = "false";
                var currSongSrc = document.getElementById("audio_src").src;
                var str = currSongSrc.split("/");
                currSongSrc = str[4];

                var vid = document.getElementById("audio_src");
                var currTime = vid.currentTime;

                socket.emit('sktEvent', {
                    "currentPausePlay": "false",
                    "currSongSrc": currSongSrc,
                    "currTime": currTime
                });
            }
        });


        //chat beginning

        var data = [];

        $('form').submit(function () {
            socket.emit('chat message', {
                "message": $('#m').val(),
                "username": auth.currentUser()
            });
            $('#m').val('');
            return false;
        });

        $.get("/chats", function (element) {
            //console.log(element);  
            data.push(element);
            element.forEach(function (index) {
                // console.log(index);
                //console.log("current username" + auth.currentUser());


                $('#messages').append($('<li>').text((index.username).toUpperCase() + ":   " + index.msg));

            });

        });

        socket.on('chat message', function (msg) {
            console.log("user" + auth.currentUser());
            $('#messages').append($('<li>').text((msg.username).toUpperCase() + ":   " + msg.message));
        });

        // chat ending


        $("#logoutTopNav").click(function (event) {
            localStorage.removeItem("savTrack-token");
            var url = "http://localhost:3000/";
            window.location.replace(url);
        });

    } else {
        var url = "http://localhost:3000/";
        window.location.replace(url);
    }
});