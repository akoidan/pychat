var loginForm;
var registerForm;
var recoverForm;
var showLoginEl;
var showRegisterEl;
var auth2;
var googleToken;
var FBApiLoaded = false;
var googleApiLoaded = false;
var captchaState = 0; // 0 - not inited, 1 - initializing, 2 - loaded

var RegisterValidator = function () {
	var self = this;
	self.init = function() {
		self.fields = [self.username, self.email, self.repeatPassword, self.password, self.gender];
		for (var i =0; i < self.fields.length; i++) {
			var element = self.fields[i];
			var parentNode = element.input.parentNode;
			element.required = CssUtils.hasClass(parentNode, 'required');
			element.icon = parentNode.children[0];
			if (element.input.getAttribute('type') === 'password') {
				element.input.onkeyup = element.validate;
				element.input.addEventListener('blur',  element.validate);
			} else {
				element.input.onchange = element.validate;
			}
			element.slider =  parentNode.children[parentNode.children.length-1];
			(function(element){
				if (element.input.id != 'id_sex') {
					element.slider.textContent = element.text;
				}
				element.input.onfocus = function() {
					CssUtils.removeClass(element.slider, 'closed');
				};
				/*FF doesn't support focusout*/
				element.input.addEventListener('blur', function() {
					CssUtils.addClass(element.slider, 'closed');
				});
			})(element);
		}
	};
	self.errorCls = 'error';
	self.successCls = 'success';
	self.warnCls = 'warn';
	self.allCls = [self.successCls, self.warnCls, self.errorCls];
	self.username = {
		input: $("rusername"),
		text: "Please select username",
		badUsernameText: "Username can only contain latin letters, numbers, dashes or underscore",
		validText: "Username is fine",
		validate: function () {
			var input = self.username.input;
			input.value = input.value.trim();
			var username = input.value;
			if (username === "") {
				self.setError(self.username, self.username.text);
			} else if (!USER_REGEX.test(username)) {
				self.setError(self.username, self.username.badUsernameText);
			} else {
				doPost('/validate_user', {username: username}, function (data) {
					if (data === RESPONSE_SUCCESS) {
						self.setSuccess(self.username);
					} else {
						self.setError(self.username, data);
					}
				}, null);
			}
		}
	};
	self.password = {
		input: $("rpassword"),
		text: "Come up with password",
		warnText: "Password is weak! Good one contains at least 5 characters, one big letter small letter and a digit",
		validText: "Password is good!",
		shortText: "Password is too short",
		passRegex : /^\S.+\S$/,
		passGoodRegex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{5,}$/,
		validate: function() {
			var el = self.password;
			var pswd = el.input.value;
			if (pswd.length === 0) {
				self.setError(el, el.text);
			} else if (!el.passRegex.test(pswd)) {
				self.setError(el, el.shortText);
			} else if (!el.passGoodRegex.test(pswd) && pswd.length < 11) {
				self.setWarn(el);
			} else {
				self.setSuccess(el);
			}
			self.repeatPassword.validate();
		}
	};
	self.repeatPassword = {
		input: $("repeatpassword"),
		validText: "Passwords match",
		notMatchText: "Passwords don't match",
		text: "Repeat your password",
		validate: function () {
			var el = self.repeatPassword;
			var value = el.input.value;
			if (value == "") {
				self.setError(el, el.text);
			} else if (value !== self.password.input.value) {
				self.setError(el, el.notMatchText);
			} else {
				self.setSuccess(el);
			}
		}
	};
	self.gender = {
		input: $('id_sex'),
		validate : function() {
			CssUtils.addClass(self.gender.icon, self.successCls);
			self.gender.input.style.color ='#C7C7C7'
		}
	};
	self.email = {
		input: $("email"),
		validText: "Email is fine",
		text: "Specify your email. Though email is not required it will give you a lot of privileges!",
		validate: function () {
			var input = self.email.input;
			var element = self.email;
			var mail = input.value;
			input.setCustomValidity("");
			if (mail.trim() == ''){
				CssUtils.removeClass(element.icon, self.errorCls);
				CssUtils.removeClass(element.icon, self.successCls);
				element.input.setCustomValidity("");
				element.slider.textContent = element.text;
			} else if (!input.checkValidity()) {
				self.setError(self.email, input.validationMessage);
			} else {
				doPost('/validate_email', {'email': mail}, function (data) {
					if (data === RESPONSE_SUCCESS) {
						self.setSuccess(self.email);
					} else {
						self.setError(self.email, data);
					}
				}, null);
			}
		}
	};
	self.setError = function (element, errorText) {
		CssUtils.setOnOf(element.icon, self.errorCls, self.allCls);
		element.slider.textContent = errorText;
		element.input.setCustomValidity(errorText);
	};
	self.setWarn = function (element) {
		CssUtils.setOnOf(element.icon, self.warnCls, self.allCls);
		element.slider.textContent = element.warnText;
		element.input.setCustomValidity("");
	};
	self.setSuccess = function (element) {
		CssUtils.setOnOf(element.icon, self.successCls, self.allCls);
		element.input.setCustomValidity("");
		element.slider.textContent = element.validText;
	};
};

function showRegister() {
	CssUtils.showElement(registerForm);
	CssUtils.hideElement(loginForm);
	CssUtils.hideElement(recoverForm);
	CssUtils.removeClass(showRegisterEl, 'disabled');
	CssUtils.addClass(showLoginEl, 'disabled');
	setUrlParam('type', 'register');
}

function showLogin() {
	CssUtils.hideElement(registerForm);
	CssUtils.showElement(loginForm);
	CssUtils.hideElement(recoverForm);
	CssUtils.removeClass(showLoginEl, 'disabled');
	CssUtils.addClass(showRegisterEl, 'disabled');
	setUrlParam('type', 'login');
}

function showForgotPassword() {
	CssUtils.hideElement(registerForm);
	CssUtils.hideElement(loginForm);
	CssUtils.showElement(recoverForm);
	CssUtils.addClass(showLoginEl, 'disabled');
	CssUtils.addClass(showRegisterEl, 'disabled');
	setUrlParam('type', 'forgot');
	if (typeof CAPTCHA_URL != 'undefined' && captchaState == 0) {
		captchaState = 1;
		doGet(CAPTCHA_URL, function() {
			captchaState = 2;
		});
	}
}

function redirectToNextPage(response) {
	ajaxHide();
	if (response === RESPONSE_SUCCESS) {
		var nextUrl = getUrlParam('next');
		if (nextUrl == null) {
			nextUrl = '/';
		}
		window.location.href = nextUrl;
	} else {
		growlError(response);
	}
}

function login(event) {
	event.preventDefault();
	ajaxShow();
	doPost('/auth', null, redirectToNextPage, loginForm);
}

function initRegisterPage() {
	loginForm = $('regLoginForm');
	registerForm = $('register-form');
	recoverForm = $('recoverForm');
	showLoginEl = $('showLogin');
	showRegisterEl = $('showRegister');
	var registerValidator = new RegisterValidator();
	registerValidator.init();
	showRegisterEl.onclick = showRegister;
	showLoginEl.onclick = showLogin;
	$('recoverPassword').onclick = showForgotPassword;
	var initType = getUrlParam('type');
	if (initType == 'login') {
		showLogin();
	} else if (initType == 'register') {
		showRegister();
	} else if (initType == 'forgot') {
		showForgotPassword();
	}
}

function register(event) {
	event.preventDefault();
	ajaxShow();
	doPost('/register', null, redirectToNextPage, registerForm);
}


function restorePassword(event) {
	event.preventDefault();
	if (typeof CAPTCHA_URL != 'undefined' && captchaState != 2) {
		return; // wait for captcha to load
	}
	var form = recoverForm;
	var callback = function (data) {
		ajaxHide();
		// if captcha is turned off
		if (typeof grecaptcha != 'undefined') {
			grecaptcha.reset();
		}
		//ajaxHide();
		if (data === RESPONSE_SUCCESS) {
			alert("Check your email. The verification password has been sent");
		} else {
			growlError(data);
		}
	};
	ajaxShow();
	doPost('/send_restore_password', null, callback, form);
}


function sendGoogleTokenToServer(token) {
	growlInfo("Successfully logged into google successfully, proceeding...");
	doPost('/google-auth', {
		token: token
	}, redirectToNextPage);
}


function onGoogleSignIn() {
	var googleUser = auth2.currentUser.get();
	var profile = googleUser.getBasicProfile();
	console.log(getDebugMessage("Signed as {} with id {} and email {}  ",
			profile.getName(), profile.getId(), profile.getEmail()));
	googleToken = googleUser.getAuthResponse().id_token;
	sendGoogleTokenToServer(googleToken);
}


function googleLogin(event) {
	event.preventDefault(); // somehow button triggers sumbit
	// Load the API client and auth library
	ajaxShow();
	if (googleToken) {
		sendGoogleTokenToServer(googleToken)
	} else if (!googleApiLoaded) {
		growlInfo("Trying to log in via Google");
		doGet(G_OAUTH_URL, function () {
			gapi.load('client:auth2', function () {
			  //gapi.client.setApiKey(apiKey);
				console.log(getDebugMessage("Initing google sdk"));
				gapi.auth2.init().then(function () {
					auth2 = gapi.auth2.getAuthInstance();
					auth2.isSignedIn.listen(function (isSignedIn) {
						if (isSignedIn) {
							onGoogleSignIn();
						} else {
							console.warn(getDebugMessage("Skipping sending token because not signed in into google"));
						}
					});
					if (auth2.isSignedIn.get()) {
						onGoogleSignIn();
					} else {
						auth2.signIn();
					}
				});
			});
		});
	} else {
		auth2.signIn();
	}
	googleApiLoaded = true;
}

function facebookLogin(event) {
	if (event) event.preventDefault();
	ajaxShow();
	growlInfo("Trying to log in via Facebook");
	if (!FBApiLoaded) {
		doGet(FACEBOOK_JS_URL);
		FBApiLoaded = true;
	} else {
		FB.getLoginStatus(fbStatusChange);
	}
}

window.fbAsyncInit = function () {
	console.log(getDebugMessage("Initing facebook sdk..."));
	FB.init({
		appId: FACEBOOK_APP_ID,
		xfbml: true,
		version: 'v2.7'
	});
	FB.getLoginStatus(fbStatusChange);
};

function fbStatusChangeIfReAuth(response) {
	if (response.status === 'connected') {
		// Logged into your app and Facebook.
		growlInfo("Successfully logged in into facebook, proceeding...");
		doPost('/facebook-auth', {
			token: response.authResponse.accessToken
		}, redirectToNextPage);
	} else {
		ajaxHide();
		if (response.status === 'not_authorized') {
			growlInfo("Allow facebook application to use your data");
		} else {
			return true;
		}
	}
}

function fbStatusChange(response) {
	console.log(response);
	if (fbStatusChangeIfReAuth(response)) {
		FB.login(fbStatusChangeIfReAuth, {auth_type: 'reauthenticate'});
	}
}