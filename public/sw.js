self.addEventListener('install', event => event.waitUntil(
	caches.open('inter-view')
		.then(cache => cache.addAll([
			// '/offline.html',
			'/css/style.min.css',
			// '/js/client.js'
		]))
		.then(self.skipWaiting())
		
));

self.addEventListener('fetch', (event) => {
	const req = event.request;
	console.log(req);
	event.respondWith(
		fetch(req)
			.catch((err) => {
				console.log(err);
				fetchOfflinePage()
			})
	);
});

function fetchOfflinePage() {
	return caches.open('inter-view')
		.then(cache => cache.match('/offline.html'));
}

// function fetchCoreFile(url) {
// 	return caches.open('bs-v1-core')
// 		.then(cache => cache.match(url))
// 		.then(response => response ? response : Promise.reject());
// }

// function getCachedPage(request) {
// 	return caches.open('bs-v1-pages')
// 		.then(cache => cache.match(request))
// 		.then(response => response ? response : Promise.reject());
// }

// function cachePage(request, response) {
// 	const clonedResponse = response.clone();
// 	caches.open('bs-v1-pages')
// 		.then(cache => cache.put(request, clonedResponse));
// 	return response;
// }