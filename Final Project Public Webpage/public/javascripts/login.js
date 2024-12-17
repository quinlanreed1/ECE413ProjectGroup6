// public/javasciprts/login.js
function login() { //allows the user to log in
    let txdata = { //initializes data to be sent to customers.js
        email: $('#email').val(),
        password: $('#password').val()
    };
    $.ajax({ //sends txdata to customers.js using the POST method in JSON forma
        url: '/customers/logIn',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) { //if the POST method succeeds, add the user's token to localStorage and send the user to account.html
        localStorage.setItem("token", data.token);
        window.location.replace("account.html");
    })
    .fail(function (jqXHR, textStatus, errorThrown) { //if the POST method fails, display the JSON response
        $('#rxData').html(JSON.stringify(jqXHR, null, 2));
    });
}

$(function () {
    $('#btnLogIn').click(login); //if the user clicks the "log in" button, go to the LogIn function
});