/**
 * The Notification Class
 */

class PushNotification {

    constructor() {
        // Get Users Permission to show notification
        this.askForNotificationPermission()
    }

    /**
     * Ask to permissions to show notifications
     */
    askForNotificationPermission() {
        if ('Notification' in window) {
            Notification.requestPermission(function (result) {
                if (result == 'granted') {
                    console.log('Permission has been granted! :)')
                }
            })
        }
    }
    /**
     * Display the push notification to the user
     * @param {string} body 
     */
    displayPushNotification(body) {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .ready
                .then(function (register) {
                    var options = {
                        icon: '/src/images/icons/icon-144x144.png',
                        body: body
                    }
                    register.showNotification('From Service Worker', options)
                })
        }
    }
}

var noty = new PushNotification()