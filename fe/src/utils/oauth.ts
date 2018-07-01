import {GOOGLE_OAUTH_2_CLIENT_ID} from './consts';
import {api} from './singletons';
import store from '../store';
import loggerFactory from './loggerFactory';

let logger = loggerFactory.getLoggerColor('oauth', '#007a70');

declare const gapi: any;
let googleApiLoaded = false;

function onsdkError(message) {
  return function (e) {
    // ajaxHide();
    let error = e.details || e.error || e;
    logger.error('sdk error message {}, {}', message, error)();
    store.dispatch('growlError', message + error);
  };
}

export const initGoogle = function() {
  if (GOOGLE_OAUTH_2_CLIENT_ID) {
    logger.log('Initializing google sdk')();
    api.loadGoogle(() => {
      gapi.load('client:auth2', function () {
        logger.log('gapi 2 is ready')();
        gapi.auth2.init({client_id: GOOGLE_OAUTH_2_CLIENT_ID}).then(function () {
          logger.log('gauth 2 is ready')();
          googleApiLoaded = true;
        }).catch(onsdkError('Unable to init gauth2 sdk: '));
      });
    });
  }
};

export const googleLogin = (function () {

  function sendGoogleTokenToServer(token, redirectToNextPage) {
    store.dispatch('growlInfo', 'Successfully logged into google successfully, proceeding...');
    api.googleAuth(token, redirectToNextPage);
  }


  let googleToken;

  return function (resolve) {
    if (!googleApiLoaded) {
      resolve('Google authorizer is still initializing, wait a second...');
      return;
    }
    // ajaxShow();
    let auth2 = gapi.auth2.getAuthInstance();

    function onGoogleSignIn() {
      let googleUser = auth2.currentUser.get();
      let profile = googleUser.getBasicProfile();
      logger.log('Signed as {} with id {} and email {}  ',
          profile.getName(), profile.getId(), profile.getEmail())();
      googleToken = googleUser.getAuthResponse().id_token;
      sendGoogleTokenToServer(googleToken, resolve);
    }

    auth2.isSignedIn.listen(function (isSignedIn) {
      if (isSignedIn) {
        onGoogleSignIn();
      } else {
        logger.warn('Skipping sending token because not signed in into google')();
      }
    });
    if (auth2.isSignedIn.get()) {
      onGoogleSignIn();
    } else {
      auth2.signIn().catch(resolve('Unable to signin with google: '));
    }
  };
})();