/*globals $:false , jQuery:false*/
// Client-side code
/* jshint browser: true, jquery: true, curly: true, eqeqeq: true, forin: true, immed: true, indent: 4, latedef: true, newcap: true, nonew: true, quotmark: double, undef: true, unused: true, strict: true, trailing: true */
var main = function () {
    var auth = {};
    $("#logoutTopNav").hide();
    $(".postnews").hide();

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

    auth.saveToken = function (token, username) {
        localStorage.setItem("savTrack-token", token);
        $('#modal2').closeModal();
        $("#user").text("Welcome, " + auth.currentUser()); //adding the username to the header nav bar.
        $(".postnews").show();
        $("#logoutTopNav").show();
        $("#loginTopNav").hide();
        $("#signUp").hide();

    };



    function postFunction() {
        // $("#logoutTopNav").hide();
        //  $("#loginTopNav").show();
        $("#mySavedPosts").hide();
        $.get("/posts", function (getData) {
            $("div.container-room-list").empty();
            getData.forEach(function (reddit) {
                var imgId = reddit.roomId;
                var postsList = "<section id=" + imgId + " class ='room-item'>" +
                    "<figure class = 'roomImage'>" +
                    "<img  id=" + imgId + " src='image/room.jpg'>" +
                    "<a  class ='join' href=" + reddit.room_link + "/" + imgId + ">" +
                    "</a>" +
                    "</figure>" +
                    "<header id = 'head_Section'>" + "<div class='description'>" + "<span class='name'>" + (reddit.roomname).toUpperCase() + "</span>" +
                    "</div>" + "<div style='display: block;' class='user-info'>" + "<div class='room-user'>" + "hosted by" + "<a href='' class='navigate'>" + (reddit.username).toUpperCase() + "</a>" +
                    "</div>" + "</div>" + "</header>" +
                    "</section>";
                $(postsList).appendTo('div #container-room-list');
                $("#postform")[0].reset();
                $("ul.pagination").empty();
            }); //end of foreach function
            //session storage variable
            $(".button-collapse").sideNav();
            $('.modal-trigger').leanModal();
            $('.tooltipped').tooltip({
                delay: 50
            });

        }); //end of $.get function

    } //end of my function


    if (auth.isLoggedIn()) {
        $("#user").text("Welcome, " + auth.currentUser()); //adding the username to the header nav bar.
        // $("#mySavedPosts").show();
        $("#logoutTopNav").show();
        $("#loginTopNav").hide();
        $("#signUp").hide();
        $(".postnews").show();

    }



    $('#submit').click(function (event) {
        event.preventDefault();

        var username = $('#username').val();
        var password = $('#password').val();


        if (username === "" || password === "") {
            alert("Oops its empty");

        } else {

            var parameters = {
                username: username,
                password: password
            };

            $.ajax({
                url: "/login",
                data: parameters,
                type: "POST",
                dataType: "json",
                success: function (data) {
                    if (data.message === "No such user present") {
                        alert("no such user");
                    } else {
                        //currUserName = username;
                        //alert("o");
                        auth.saveToken(data.token, username);

                    }
                }
            });

            $('#modal2').closeModal();

        }

    });


    //creating the room


    $("#createbutton").click(function () {

        var room_name = $("#room_name").val();
        console.log(room_name);

        $.ajax({
            url: "get_info",
            type: "GET",
            dataType: "json",
            contentType: 'application/json',
            success: function (result) {
                console.log("inside success");
                var t = result.length;
                t++;
                $.ajax({
                    type: "POST",
                    url: "room_info",
                    data: JSON.stringify({
                        "_id": t,
                        "roomname": $("#room_name").val(),
                        "username": auth.currentUser()
                    }),
                    dataType: "json",
                    contentType: "application/json",
                    success: function (data) {
                        console.log(data);
                        console.log("upload success");
                        $("#modal1").closeModal();
                        location.reload(true);

                    },
                    error: function (status) {
                        window.alert(status);
                    }
                });
            },
            error: function (status) {
                window.alert(status);
            }
        });



    });


    $('#Register').click(function (event) {
        event.preventDefault();

        var username = $('#reguser').val();
        var password = $('#regpass').val();
        var confirm = $("#confirmpass").val();


        if (username === "" || password === "" || confirm === "") {
            alert("Oops its empty");

        } else if (password !== confirm) {
            alert("Sorry passwords doesnt match");
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
                        alert("already present");
                    } else {
                        //currUserName = username;
                        //alert("o");
                        auth.saveToken(data.token, username);

                    }
                }
            });

            $('#modal3').closeModal();

        }

    });


    //dynamic search function
    function search() {
        $("#search").keyup(function () {

            // Retrieve the input field text and reset the count to zero
            var filter = $(this).val(),
                count = 0;
            console.log("....." + filter);
            // Loop through the comment list
            $('.room-item').each(function () {

                // If the list item does not contain the text phrase fade it out
                if ($(this).text().search(new RegExp(filter, "i")) < 0) {
                    $(this).fadeOut();

                    // Show the list item if the phrase matches and increase the count by 1
                } else {

                    $(this).show();
                    count++;
                }
                $("ul.pagination").empty();


            });

            /*if (filter === "") {
                $('.postsContainer').empty();
                postFunction();
            }*/
        });

    } //end of search function



    jQuery.validator.setDefaults({
        ignore: ".ignore",
        debug: true,
        success: "valid"

    });
    $("#postform").validate({
        rules: {
            field: {
                required: false,
                url: true
            }
        }

    });

    //logout function
    $("#logoutTopNav").on("click", function () {

        localStorage.removeItem("savTrack-token");
        var url = "http://localhost:3000/";
        window.location.replace(url);

    });

    $("#homepage").on("click", function () {

        postFunction();
    });
    search();
    //login();


    postFunction();
}; //end of main function


$(document).ready(main);