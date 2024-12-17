// public/javasciprts/signup.js

function signup() {
     // data validation
     let re1 = /[a-z]/; //regexs to ensure password is strong enough
     let re2 = /[A-Z]/;
     let re3 = /[0-9]/;
     let re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,5}$/; //regex to ensure email is correctly formatted
     let fName = document.getElementById("fullName");//initializes elements for use in the function
     let email = document.getElementById("email");
     let password = document.getElementById("password");
     let passCheck = document.getElementById("passwordConfirm");
     let device = document.getElementById("device")
     let err = document.getElementById("formErrors");
     let list = document.getElementById("list");
     fName.style.borderBottom = "1px solid #aaa";//ensures that correctly filled out fields are not still highlighted
     email.style.borderBottom = "1px solid #aaa";
     password.style.borderBottom = "1px solid #aaa";
     passCheck.style.borderBottom = "1px solid #aaa";
     device.style.borderBottom = "1px solid #aaa";
     while(list.firstChild) { //clears any mistake messages from last submission, prepares for any new mistake messages
         list.removeChild(list.lastChild);
     }
     let counter = 0; //starts mistake counter
     if(fName.value.length < 1) { //verifies that name is filled correctly
         fName.style.borderBottom = "2px solid red"; //highlights field if incorrect
         err.style.display = "block"; //turns on the error section of the webpage if it is not yet on
         newElement = document.createElement("li");
         textNode = document.createTextNode("Missing full name.");
         newElement.appendChild(textNode);
         list.appendChild(newElement); //adds mistake message to list
         counter++; //marks number of mistakes, must be 0 to finish function
     } 
     if((email.value.length < 1) || (!re.test(email.value))) { //verifies that email is filled correctly
         email.style.borderBottom = "2px solid red"; //highlights field if incorrect
         err.style.display = "block"; //turns on the error section of the webpage if it is not yet on
         newElement = document.createElement("li");
         textNode = document.createTextNode("Invalid or missing email address.");
         newElement.appendChild(textNode);
         list.appendChild(newElement); //adds mistake message to list
         counter++; //marks number of mistakes, must be 0 to finish function
     }
     if((password.value.length < 10) || (password.value.length > 20) || (!re1.test(password.value)) || (!re2.test(password.value)) || (!re3.test(password.value))) { //verifies that password is filled correctly
         password.style.borderBottom = "2px solid red"; //highlights field if incorrect
         err.style.display = "block"; //turns on the error section of the webpage if it is not yet on
         counter++; //marks number of mistakes, must be 0 to finish function
         if((password.value.length < 10) || (password.value.length > 20)) { //if password length is incorrect
             newElement = document.createElement("li");
             textNode = document.createTextNode("Password must be between 10 and 20 characters.");
             newElement.appendChild(textNode);
             list.appendChild(newElement); //adds mistake message to list
         }
         if(!re1.test(password.value)) { //if password has no lowecase characters
             newElement = document.createElement("li");
             textNode = document.createTextNode("Password must contain at least one lowercase character.");
             newElement.appendChild(textNode);
             list.appendChild(newElement); //adds mistake message to list
         }
         if(!re2.test(password.value)) { //if password has no uppercase characters
             newElement = document.createElement("li");
             textNode = document.createTextNode("Password must contain at least one uppercase character.");
             newElement.appendChild(textNode);
             list.appendChild(newElement); //adds mistake message to list
         }
         if(!re3.test(password.value)) { //if password has no digits
             newElement = document.createElement("li");
             textNode = document.createTextNode("Password must contain at least one digit.");
             newElement.appendChild(textNode);
             list.appendChild(newElement); //adds mistake message to list
         }
     }
     if(!(passCheck.value === password.value)) { //if confirm password field does not perfectly match password field
         passCheck.style.borderBottom = "2px solid red"; //highlights field if incorrect
         err.style.display = "block"; //turns on the error section of the webpage if it is not yet on
         newElement = document.createElement("li");
         textNode = document.createTextNode("Password and confirmation password don't match.");
         newElement.appendChild(textNode);
         list.appendChild(newElement); //adds mistake message to list
         counter++; //marks number of mistakes, must be 0 to finish function
     } 
     if(device.value.length < 1) { //verifies that device ID is filled correctly
        device.style.borderBottom = "2px solid red"; //highlights if field is incorrect
        err.style.display = "block"; //turns on the error section of the webpage if it is not yet on
        newElement = document.createElement("li");
        textNode = document.createTextNode("Missing device ID.");
        newElement.appendChild(textNode);
        list.appendChild(newElement); //adds mistake message to list
        counter++; //marks number of mistakes, must be zero to finish function
    }
    if(counter == 0) { //no mistakes caught
        err.style.display = "none"; //ensure error section is turned off
        fName.style.borderBottom = "1px solid #aaa"; //ensures any highlighted fields are turned off
        email.style.borderBottom = "1px solid #aaa";
        password.style.borderBottom = "1px solid #aaa";
        passCheck.style.borderBottom = "1px solid #aaa";
        device.style.borderBottom = "1px solid #aaa";
        let txdata = { //initializes data to be send to customers.js
            name: $('#fullName').val(),
            email: $('#email').val(),
            password: $('#password').val(),
            device: $('#device').val()
        };
        $.ajax({ //sends txdata to customers.js using the POST method in JSON format
            url: '/customers/signUp',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(txdata),
            dataType: 'json'
        })
        .done(function (data, textStatus, jqXHR) { //if the function finishes, output the JSON response
            $('#rxData').html(JSON.stringify(data, null, 2));
            if (data.success) {
                // after 1 second, move to "login.html"
                setTimeout(function(){
                    window.location = "login.html";
                }, 1000);
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) { //if the function does not succeed
            if (jqXHR.status == 404) { //if the server cannot be found
                $('#rxData').html("Server could not be reached!!!");    
            }
            else $('#rxData').html(JSON.stringify(jqXHR, null, 2)); //if the server can be found but still fails, output the JSON response
        });
    }
    counter = 0;
}

$(function () {
    $('#btnSignUp').click(signup); //when the user clicks "sign up", do the signup function
});