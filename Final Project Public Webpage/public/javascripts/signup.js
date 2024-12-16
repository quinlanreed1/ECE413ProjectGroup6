// public/javasciprts/signup.js

function signup() {
    // data validation
    let fName = document.getElementById("fullName");
    let email = document.getElementById("email");
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    let re1 = /[a-z]/;
    let re2 = /[A-Z]/;
    let re3 = /[0-9]/;
    let password = document.getElementById("password");
    let passCheck = document.getElementById("passwordConfirm");
    let device = document.getElementById("device");
    let err = document.getElementById("formErrors");
    let list = document.getElementById("list");
    fName.style.borderBottom = "1px solid #aaa";
    email.style.borderBottom = "1px solid #aaa";
    password.style.borderBottom = "1px solid #aaa";
    passCheck.style.borderBottom = "1px solid #aaa";
    device.style.borderBottom = "1px solid #aaa";
    while(list.firstChild) {
        list.removeChild(list.lastChild);
    }
    let counter = 0;
    if(fName.value.length < 1) {
        fName.style.borderBottom = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Missing full name.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    } 
    if((email.value.length < 1) || (!re.test(email.value))) {
        email.style.borderBottom = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Invalid or missing email address.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    }
    if((password.value.length < 10) || (password.value.length > 20) || (!re1.test(password.value)) || (!re2.test(password.value)) || (!re3.test(password.value))) {
        password.style.borderBottom = "2px solid red";
        err.style.display = "block";
        counter++;
        if((password.value.length < 10) || (password.value.length > 20)) {
            newElement = document.createElement("li");
            textNode = document.createTextNode("Password must be between 10 and 20 characters.");
            newElement.appendChild(textNode);
            list.appendChild(newElement);
        }
        if(!re1.test(password.value)) {
            newElement = document.createElement("li");
            textNode = document.createTextNode("Password must contain at least one lowercase character.");
            newElement.appendChild(textNode);
            list.appendChild(newElement);
        }
        if(!re2.test(password.value)) {
            newElement = document.createElement("li");
            textNode = document.createTextNode("Password must contain at least one uppercase character.");
            newElement.appendChild(textNode);
            list.appendChild(newElement);
        }
        if(!re3.test(password.value)) {
            newElement = document.createElement("li");
            textNode = document.createTextNode("Password must contain at least one digit.");
            newElement.appendChild(textNode);
            list.appendChild(newElement);
        }
    }
    if(!(passCheck.value === password.value)) {
        passCheck.style.borderBottom = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Password and confirmation password don't match.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    } 
    if(device.value.length < 1) {
        device.style.borderBottom = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Missing device ID.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    } 
    if(counter == 0) {
        err.style.display = "none";
        fName.style.borderBottom = "1px solid #aaa";
        email.style.borderBottom = "1px solid #aaa";
        password.style.borderBottom = "1px solid #aaa";
        passCheck.style.borderBottom = "1px solid #aaa";
        device.style.borderBottom = "1px solid #aaa";
        let txdata = {
            name: $('#fullName').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            device: $('#device').val()
        };
        $.ajax({
            url: '/customers/signUp',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(txdata),
            dataType: 'json'
        })
        .done(function (data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
            if (data.success) {
                // after 1 second, move to "login.html"
                setTimeout(function(){
                    window.location = "login.html";
                }, 1000);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status == 404) {
                $('#rxData').html("Server could not be reached!!!");    
            }
            else $('#rxData').html(JSON.stringify(jqXHR, null, 2));
        });
    }
    counter = 0;
}

$(function () {
    $('#btnSignUp').click(signup);
});