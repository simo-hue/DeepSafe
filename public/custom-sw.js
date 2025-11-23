/**
 * Custom Service Worker for Push Notifications
 * 
 * This worker listens for 'push' events sent from the server and displays them.
 * It also handles 'notificationclick' events to open the app when a user clicks a notification.
 */

self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json();

        // Customize the notification options
        const options = {
            body: data.body,
            icon: '/icon.svg', // Path to your app icon
            badge: '/icon.svg', // Small monochrome icon for the status bar
            vibrate: [100, 50, 100], // Vibration pattern
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.url || '/' // URL to open on click
            },
        };

        // Show the notification
        event.waitUntil(self.registration.showNotification(data.title, options));
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.');

    // Close the notification
    event.notification.close();

    // Open the URL specified in the notification data
    event.waitUntil(
        clients.openWindow(event.notification.data.url)
    );
});
