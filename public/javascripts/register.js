/*globals $:false , jQuery:false*/
// Client-side code/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
$(document).ready(function () {

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

    auth.saveToken = function (token) {
        localStorage.setItem("savTrack-token", token);
        var url = "http://localhost:3000/home.html";
        window.location.replace(url);

    };

    if (auth.isLoggedIn()) {
        var url = "http://localhost:3000/home.html";
        window.location.replace(url);

    }


    $('#divMess').hide();

    $("#username").keydown(function () {
        $('#divMess').hide();
    });

    $("#password").keydown(function () {
        $('#divMess').hide();
    });

    $('#submit').click(function (event) {

        event.preventDefault();

        var username = $('#username').val();
        var password = $('#password').val();


        if (username === "" || password === "") {
            $('#divMess').show();
            $('#message').html("username and password can't be blank");
        } else {

            var parameters = {
                username: username,
                password: password
            };

            $.ajax({
                url: "/register",
                data: parameters,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.message === "User already present") {
                        $('#divMess').show();
                        $('#message').html("User already present");
                    } else {
                        auth.saveToken(data.token);
                    }
                }
            });


        }

    });

});