// old pass eye
function handleOldEyeSlash(){
    document.getElementById("old").type = "text";

    document.getElementById("eye-slash").classList.add("hide");

    document.getElementById("eye").classList.remove("hide");
}

function handleOldEye(){
    document.getElementById("old").type = "password";

    document.getElementById("eye-slash").classList.remove("hide");

    document.getElementById("eye").classList.add("hide");
}

// new pass eye
function handleNewEyeSlash(){
    document.getElementById("new").type = "text";

    document.getElementById("eye-slash-2").classList.add("hide");

    document.getElementById("eye-2").classList.remove("hide");
}

function handleNewEye(){
    document.getElementById("new").type = "password";

    document.getElementById("eye-slash-2").classList.remove("hide");

    document.getElementById("eye-2").classList.add("hide");
}

// confirm pass eye
function handleConfirmEyeSlash(){
    document.getElementById("confirm").type = "text";

    document.getElementById("eye-slash-3").classList.add("hide");

    document.getElementById("eye-3").classList.remove("hide");
}

function handleConfirmEye(){
    document.getElementById("confirm").type = "password";

    document.getElementById("eye-slash-3").classList.remove("hide");

    document.getElementById("eye-3").classList.add("hide");
}

// login pass eye
function handleLoginEyeSlash(){
    document.getElementById("login-pass").type = "text";

    document.getElementById("eye-slash-login").classList.add("hide");

    document.getElementById("eye-login").classList.remove("hide");
}

function handleLoginEye(){
    document.getElementById("login-pass").type = "password";

    document.getElementById("eye-slash-login").classList.remove("hide");

    document.getElementById("eye-login").classList.add("hide");
}
