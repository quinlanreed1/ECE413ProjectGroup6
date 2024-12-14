// public/javascripts/account.js
function addDevice() { //Add a new device to user's account
    // data validation
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    let email = document.getElementById("email");
    let device = document.getElementById("device");
    let err = document.getElementById("formErrors");
    let list = document.getElementById("list");
    email.style.border = "1px solid #aaa";
    device.style.border = "1px solid #aaa";
    while(list.firstChild) {
        list.removeChild(list.lastChild);
    }
    let counter = 0;
    if((email.value.length < 1) || (!re.test(email.value))) {
        email.style.border = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Invalid or missing email address.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    }
    if(device.value.length < 1) {
        device.style.border = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Missing device ID.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    }
    if(counter == 0) {
        err.style.display = "none";
        email.style.border = "1px solid #aaa";
        device.style.border = "1px solid #aaa";
        let txdata = {
            email: $('#email').val(),
            device: $('#device').val()
        };
        $.ajax({
            url: '/customers/addDevice',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(txdata),
            dataType: 'json'
        })
        .done(function (data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        });
    }
    counter = 0;
}

function readStudent() {
    // data validation
    if ($('#name').val() === "") {
        window.alert("invalid name!");
        return;
    }
    let txdata = {
        name: $('#name').val()
    };
    $.ajax({
        url: '/students/read',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        $('#rxData').html(JSON.stringify(jqXHR, null, 2));
    });
}

function updateAccount() { //updates the user's account based on the given email, fails if email is not in system
    // data validation
    let re1 = /[a-z]/;
    let re2 = /[A-Z]/;
    let re3 = /[0-9]/;
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    let fName = document.getElementById("fullName");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    let passCheck = document.getElementById("passwordConfirm");
    let err = document.getElementById("formErrors");
    let list = document.getElementById("list");
    fName.style.border = "1px solid #aaa";
    email.style.border = "1px solid #aaa";
    password.style.border = "1px solid #aaa";
    passCheck.style.border = "1px solid #aaa";
    while(list.firstChild) {
        list.removeChild(list.lastChild);
    }
    let counter = 0;
    if(fName.value.length < 1) {
        fName.style.border = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Missing full name.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    } 
    if((email.value.length < 1) || (!re.test(email.value))) {
        email.style.border = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Invalid or missing email address.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    }
    if((password.value.length < 10) || (password.value.length > 20) || (!re1.test(password.value)) || (!re2.test(password.value)) || (!re3.test(password.value))) {
        password.style.border = "2px solid red";
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
        passCheck.style.border = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Password and confirmation password don't match.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    } 
    if(counter == 0) {
        err.style.display = "none";
        fName.style.border = "1px solid #aaa";
        email.style.border = "1px solid #aaa";
        password.style.border = "1px solid #aaa";
        passCheck.style.border = "1px solid #aaa";
        let txdata = {
            name: $('#fullName').val(),
            email: $('#email').val(),
            password: $('#password').val()
        };
        $.ajax({
            url: '/customers/update',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(txdata),
            dataType: 'json'
        })
        .done(function (data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        });
    }
    counter = 0;
}

function removeDevice() { //Remove a device from the user's account
    // data validation
    let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/;
    let email = document.getElementById("email");
    let device = document.getElementById("device");
    let err = document.getElementById("formErrors");
    let list = document.getElementById("list");
    email.style.border = "1px solid #aaa";
    device.style.border = "1px solid #aaa";
    while(list.firstChild) {
        list.removeChild(list.lastChild);
    }
    let counter = 0;
    if((email.value.length < 1) || (!re.test(email.value))) {
        email.style.border = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Invalid or missing email address.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    }
    if(device.value.length < 1) {
        device.style.border = "2px solid red";
        err.style.display = "block";
        newElement = document.createElement("li");
        textNode = document.createTextNode("Missing device ID.");
        newElement.appendChild(textNode);
        list.appendChild(newElement);
        counter++;
    }
    if(counter == 0) {
        err.style.display = "none";
        email.style.border = "1px solid #aaa";
        device.style.border = "1px solid #aaa";
        let txdata = {
            email: $('#email').val(),
            device: $('#device').val()
        };
        $.ajax({
            url: '/customers/removeDevice',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(txdata),
            dataType: 'json'
        })
        .done(function (data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        })
        .fail(function (data, textStatus, jqXHR) {
            $('#rxData').html(JSON.stringify(data, null, 2));
        });
    }
    counter = 0;
}

function getCount() {
    $.ajax({
        url: '/students/count',
        method: 'GET'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    })
    .fail(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    });
}

function readAll() {
    $.ajax({
        url: '/students/readAll',
        method: 'GET'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    })
    .fail(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    });
}

function searchStudent() {
    // data validation
    if ($('#gpa').val() === "") {
        window.alert("invalid gpa!");
        return;
    }
    let txdata = {
        gpa: Number($('#gpa').val())
    };
    $.ajax({
        url: '/students/search',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(txdata),
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    })
    .fail(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    });
}

$(function (){
    $('#btnAdd').click(addDevice);
    $('#btnRemove').click(removeDevice);
    $('#btnRead').click(readStudent);
    $('#btnUpdate').click(updateAccount);
    $('#btnCount').click(getCount);
    $('#btnReadAll').click(readAll);
    $('#btnSearch').click(searchStudent);
    $('#btnLogOut').click(logout);

    $.ajax({
        url: '/customers/status',
        method: 'GET',
        headers: { 'x-auth' : window.localStorage.getItem("token") },
        dataType: 'json'
    })
    .done(function (data, textStatus, jqXHR) {
        $('#rxData').html(JSON.stringify(data, null, 2));
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
        window.location.replace("display.html");
    });
});

function logout() {
    localStorage.removeItem("token");
    window.location.replace("index.html");
}
