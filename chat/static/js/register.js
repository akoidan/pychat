var loginForm;

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
			} else {
				element.input.onchange = element.validate;
			}
		}
	};
	self.username = {
		input: $("rusername"),
		validate: function () {
			var input = self.username.input;
			input.value = input.value.trim();
			var username = input.value;
			if (username === "") {
				self.setError(self.username, "Username cannot be blank!");
			} else if (!USER_REGEX.test(username)) {
				self.setError(self.username, "Username can only contain latin letters, numbers, dashes or underscore");
			} else {
				doPost('/validate_user', {username: username}, function (data) {
					if (data === RESPONSE_SUCCESS) {
						self.setSuccess(self.username);
					} else {
						self.setError(self.username, data);
						growlError(data);
					}
				}, null);
			}
		}
	};
	self.password = {
		input: $("rpassword"),
		passRegex : /^\S.+\S$/,
		validate: function() {
			var pswd = self.password.input.value;
			if (pswd.length === 0) {
				self.setError(self.password, "Password can't be empty");
			} else if (!self.password.passRegex.test(pswd)) {
				self.setError(self.password, "Password should be at least 3 character length without whitespaces");
			} else {
				self.setSuccess(self.password);
			}
			self.repeatPassword.validate();
		}
	};
	self.repeatPassword = {
		input: $("repeatpassword"),
		validate: function () {
			if (self.password.input.value !== self.repeatPassword.input.value) {
				self.setError(self.repeatPassword, "Passwords don't match");
			} else {
				self.setSuccess(self.repeatPassword);
			}
		}
	};
	self.gender = {
		input: $('id_sex'),
		validate : function() {
			self.setSuccess(self.gender);
			self.gender.input.style.color ='#C7C7C7'
		}
	};
	self.email = {
		input: $("email"),
		validate: function () {
			var input = self.email.input;
			var mail = input.value;
			input.setCustomValidity("");
			if (mail.trim() == ''){
				CssUtils.removeClass(self.email.icon, 'error');
				CssUtils.removeClass(self.email.icon, 'success');
			} else if (!input.checkValidity()) {
				self.setError(self.email, null, true);
			} else {
				doPost('/validate_email', {'email': mail}, function (data) {
					if (data === RESPONSE_SUCCESS) {
						self.setSuccess(self.email);
					} else {
						self.setError(self.email, data);
						growlError(data);
					}
				}, null);
			}
		}
	};
	self.setError = function (element, errorText, skipValidity) {
		CssUtils.removeClass(element.icon, 'success');
		CssUtils.addClass(element.icon, 'error');
		if (!skipValidity) {
			element.input.setCustomValidity(errorText);
		}
	};
	self.setSuccess = function (element) {
		CssUtils.removeClass(element.icon, 'error');
		CssUtils.addClass(element.icon, 'success');
		element.input.setCustomValidity("");
	};
};

onDocLoad(function () {
	var registerValidator = new RegisterValidator();
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