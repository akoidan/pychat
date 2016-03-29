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
			element.slider =  parentNode.children[parentNode.children.length-1];
			(function(element){
				if (element.input.id == 'id_sex') return;
				element.slider.textContent = element.text;
				element.input.onfocus = function() {
					CssUtils.removeClass(element.slider, 'closed');
				};
				/*FF doesn't support focusout*/
				element.input.onblur=  function() {
					CssUtils.addClass(element.slider, 'closed');
				};
			})(element);
		}
	};
	self.username = {
		input: $("rusername"),
		text: "Please select username",
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
					}
				}, null);
			}
		}
	};
	self.password = {
		input: $("rpassword"),
		text: "Come up with password",
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
		text: "Repeat your password",
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
			CssUtils.addClass(self.gender.icon, 'success');
			self.gender.input.style.color ='#C7C7C7'
		}
	};
	self.email = {
		input: $("email"),
		text: "Specify your email",
		validate: function () {
			var input = self.email.input;
			var mail = input.value;
			input.setCustomValidity("");
			if (mail.trim() == ''){
				self.setSuccess(self.email);
			} else if (!input.checkValidity()) {
				self.setError(self.email, input.validationMessage, true);
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
	self.setError = function (element, errorText, skipValidity) {
		CssUtils.removeClass(element.icon, 'success');
		CssUtils.addClass(element.icon, 'error');
		element.slider.textContent = errorText;
		if (!skipValidity) {
			element.input.setCustomValidity(errorText);
		}
	};
	self.setSuccess = function (element) {
		CssUtils.removeClass(element.icon, 'error');
		CssUtils.addClass(element.icon, 'success');
		element.input.setCustomValidity("");
		element.slider.textContent = element.text;
	};
};

onDocLoad(function () {
	var registerValidator = new RegisterValidator();
	registerValidator.init();
	loginForm = $('loginForm');
	$('showRegister').onclick = function() {
		CssUtils.showElement($('register-form'));
		CssUtils.hideElement($('loginForm'));
		CssUtils.removeClass($('showRegister'), 'disabled');
		CssUtils.addClass($('showLogin'), 'disabled');

	};
	$('showLogin').onclick = function() {
		CssUtils.hideElement($('register-form'));
		CssUtils.showElement($('loginForm'));
		CssUtils.removeClass($('showLogin'), 'disabled');
		CssUtils.addClass($('showRegister'), 'disabled');
	};
});

function register(event) {
	event.preventDefault();
	var form = $('register-form');
	var callback = function (data) {
		if (data === RESPONSE_SUCCESS) {
			window.location.href = '/';
		} else {
			growlError(data);
		}
	};
	doPost('/register', null, callback, form);
}