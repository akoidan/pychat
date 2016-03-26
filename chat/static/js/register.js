var passRegex = /^\S.+\S$/;
var loginForm;
var registerValidator;


var RegisterValidator = function () {
	var self = this;
	self.init = function() {
		self.fields = [self.username, self.email, self.password, self.repeatPassword];
		for (var i =0; i < self.fields.length; i++) {
			var element = self.fields[i];
			if (element.validate) {
					element.input.onchange = element.validate;
			}
		}
	};
	self.username = {
		input: $("rusername"),
		validate: function () {
			doPost('/validate_user', {username: self.username.input.value}, function (data) {
				if (data === RESPONSE_SUCCESS) {
					self.setSuccess(self.username.input);
				} else {
					self.setError(self.username.input, data)
				}
			}, null);
		}
	};
	self.password = {
		input: $("rpassword")
	};
	self.repeatPassword = {
		input: $("repeatpassword"),
		validate: function () {
			if (self.password.input.value !== self.repeatPassword.input.value) {
				self.setError(self.repeatPassword.input, "Passwords don't match");
			} else {
				self.setSuccess(self.repeatPassword.input);
			}
		}
	};
	self.email = {
		input: $("email"),
		validate: function () {
			var mail = email.value;
			doPost('/validate_email', {'email': mail}, function (data) {
				if (data === RESPONSE_SUCCESS) {
					self.setSuccess(self.email.input);
				} else {
					self.setError(self.email.input, data);
				}
			}, null);
		}
	};
	self.setError = function (element, errorText) {
		CssUtils.removeClass(element, 'success');
		CssUtils.addClass(element, 'error');
		element.setCustomValidity(errorText);
	};
	self.setSuccess = function (element) {
		CssUtils.removeClass(element, 'error');
		CssUtils.addClass(element, 'success');
		element.setCustomValidity("");
	};
};

onDocLoad(function () {
	registerValidator = new RegisterValidator();
	registerValidator.init();
	loginForm = $('loginForm');
});

function register(event) {
	event.preventDefault();
	var form = $('register-form');
	var callback = function (data) {
		if (data === RESPONSE_SUCCESS) {
			window.location.href = '/profile';
		} else {
			growlError(data);
		}
	};
	doPost('/register', null, callback, form);
}

function login(event) {
	event.preventDefault();
	var callback = function (data) {
		if (data === RESPONSE_SUCCESS) {
			window.location.href = '/';
		} else {
			growlError(data);
		}
	};
	doPost('/auth', null, callback, loginForm);
}
