const CACHE_NAME = 'v{{app_version}}';
const urlsToCache = [
  'ide',
  'static/style.css',
  'static/media/icons.svg',
  {% for item in imports -%}
  'static/libs/{{ item }}.js',
  {% endfor %}
  {% for item in explicit_imports -%}
  'static/{{ item }}.js',
  {% endfor %}
  {% for plugin in lang_imports -%}
  'static/{{ plugin }}',
  {% endfor %}
  {% for img in static_images -%}
  'static/{{ img }}',
  {% endfor %}
];

prefix = '/3/'

urlsToCacheAbsolute = urlsToCache.map(s => prefix + s)

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCacheAbsolute))
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches
      .keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      return (
        fetch(event.request)
          .then(response => caches.open(CACHE_NAME))
          .then(cache => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(response => {
            console.log('Fetch failed, sorry.');
          })
      );
    })
  );
});