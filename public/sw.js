const cacheName = 'iview';
const reqFiles = [
	'/',
	'/css/style.css',
	'/js/bundle.min.js',
	'/js/source/Recordtools/recorder.js',
	'/img/logo.svg',
	'/manifest.json'
];

self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(cacheName)
			.then((cache) => {
				return cache.addAll(reqFiles);
			})
			.then(() => {
				return self.skipWaiting();
			})
	);
});

self.addEventListener('fetch', (e) => {
	e.respondWith(
		caches.match(e.request)
			.then((response) => {
				if (response) {
					console.log('Got response: ' + e.request.url);
					return response;
				}
				console.log('From server: ' + e.request.url);
				return fetch(e.request);
			})
	);
});

self.addEventListener('activate', (e) => {
	console.log('activating SW');
	e.waitUntil(self.clients.claim());
});